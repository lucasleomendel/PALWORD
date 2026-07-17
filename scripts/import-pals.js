import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Faltam SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY nas env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const ELEMENT_MAP = {
  T_Icon_element_s_00: 'Neutral', T_Icon_element_s_01: 'Fire',
  T_Icon_element_s_02: 'Water',   T_Icon_element_s_03: 'Electric',
  T_Icon_element_s_04: 'Grass',   T_Icon_element_s_05: 'Dark',
  T_Icon_element_s_06: 'Dragon',  T_Icon_element_s_07: 'Ground',
  T_Icon_element_s_08: 'Ice',
};

const RARITY_MAP = { Comum: 'Common', Raro: 'Rare', 'Épico': 'Epic', 'Lendário': 'Legendary' };

const DATA_SOURCES = [
  { name: 'pals', url: 'https://palworld.gg/pt-BR/pals' },
  { name: 'breeding', url: 'https://palworld.gg/pt-BR/breeding-calculator' },
  { name: 'technology', url: 'https://palworld.gg/pt-BR/technology-tree' },
  { name: 'partner-skills', url: 'https://palworld.gg/pt-BR/partner-skills' },
  { name: 'passive-skills', url: 'https://palworld.gg/pt-BR/passive-skills' },
  { name: 'active-skills', url: 'https://palworld.gg/pt-BR/active-skills' },
  { name: 'map', url: 'https://palworld.gg/pt-BR/map' },
];

async function logSync(event, status, details) {
  await supabase.from('ai_sync_logs').insert({ event, status, details });
}

async function fetchAndParsePals() {
  const res = await fetch('https://palworld.gg/pt-BR/pals');
  if (!res.ok) throw new Error(`Falha ao buscar listagem de Pals: HTTP ${res.status}`);
  const $ = cheerio.load(await res.text());

  const pals = [];
  $('a[href^="/pt-BR/pal/"]').each((_, el) => {
    const $el = $(el);
    const name = $el.find('img[alt]').last().attr('alt');
    const dexMatch = $el.text().match(/#(-?\d+)/);
    const dex_number = dexMatch ? parseInt(dexMatch[1], 10) : null;
    const rarityPt = $el.text().match(/Comum|Raro|Épico|Lendário/)?.[0];

    const elements = [];
    $el.find('img[src*="T_Icon_element_s_"]').each((_, img) => {
      const m = $(img).attr('src').match(/T_Icon_element_s_\d\d/);
      if (m && ELEMENT_MAP[m[0]]) elements.push(ELEMENT_MAP[m[0]]);
    });

    if (name && dex_number !== null && dex_number > 0) {
      pals.push({
        dex_number,
        name,
        rarity: RARITY_MAP[rarityPt] ?? null,
        elements: elements.length ? elements : ['Neutral'],
      });
    }
  });

  return pals;
}

async function fetchTechnologyTree() {
  const res = await fetch('https://palworld.gg/pt-BR/technology-tree');
  if (!res.ok) throw new Error(`Falha ao buscar Technology Tree: HTTP ${res.status}`);
  const $ = cheerio.load(await res.text());

  const technologies = [];
  
  // Busca por elementos com classe que contenha tecnologia ou item da árvore tecnológica
  $('[class*="tech"], [class*="technology"], .tech-item, .technology-node').each((_, el) => {
    const $el = $(el);
    const name = $el.find('.tech-name, .name, [class*="title"]').text()?.trim();
    const description = $el.find('.tech-desc, .description, [class*="desc"]').text()?.trim();
    const costText = $el.find('.cost, [class*="cost"]').text()?.trim();
    
    // Extrai custo numérico (ex: "100 pts" -> 100)
    const cost = costText ? parseInt(costText.match(/\d+/)?.[0] || 0) : 0;
    
    // Extrai dependências se existirem
    const dependencies = [];
    $el.find('[class*="depend"], .prerequisite').each((__, dep) => {
      const depName = $(dep).text()?.trim();
      if (depName) dependencies.push(depName);
    });

    if (name) {
      technologies.push({
        name,
        description: description || null,
        cost,
        dependencies: dependencies.length ? dependencies : null,
      });
    }
  });

  // Se não encontrou com classes, tenta parseamento alternativo por estrutura HTML
  if (technologies.length === 0) {
    $('div[data-tech-id], li[data-tech-id], .tech-tree-item').each((_, el) => {
      const $el = $(el);
      const name = $el.attr('data-tech-name') || $el.find('strong').first().text()?.trim();
      const cost = parseInt($el.attr('data-cost') || $el.find('[class*="cost"]').first().text().match(/\d+/)?.[0] || 0);
      
      if (name) {
        technologies.push({
          name,
          description: null,
          cost,
          dependencies: null,
        });
      }
    });
  }

  return technologies;
}

async function fetchPartnerSkills() {
  const res = await fetch('https://palworld.gg/pt-BR/partner-skills');
  if (!res.ok) throw new Error(`Falha ao buscar Partner Skills: HTTP ${res.status}`);
  const $ = cheerio.load(await res.text());

  const skills = [];
  
  // Busca por elementos contendo habilidades de parceria
  $('[class*="partner-skill"], [class*="skill"], .skill-item, .skill-card').each((_, el) => {
    const $el = $(el);
    const skillName = $el.find('.skill-name, .name, strong, [class*="title"]').first().text()?.trim();
    const description = $el.find('.skill-desc, .description, p, [class*="desc"]').first().text()?.trim();
    const palName = $el.find('.pal-name, [data-pal], [class*="pal"]').text()?.trim();
    const cooldownText = $el.find('.cooldown, [class*="cooldown"], [class*="cd"]').text()?.trim();
    
    // Extrai cooldown em segundos
    const cooldown = cooldownText ? parseInt(cooldownText.match(/\d+/)?.[0] || 0) : null;
    
    // Tenta extrair tipo de elemento
    const elementImg = $el.find('img[src*="T_Icon_element_s_"]').attr('src');
    let element = 'Neutral';
    if (elementImg) {
      const match = elementImg.match(/T_Icon_element_s_\d\d/);
      if (match && ELEMENT_MAP[match[0]]) element = ELEMENT_MAP[match[0]];
    }

    if (skillName) {
      skills.push({
        name: skillName,
        description: description || null,
        pal_name: palName || null,
        element,
        cooldown,
      });
    }
  });

  return skills;
}

async function fetchPassiveSkills() {
  const res = await fetch('https://palworld.gg/pt-BR/passive-skills');
  if (!res.ok) throw new Error(`Falha ao buscar Passive Skills: HTTP ${res.status}`);
  const $ = cheerio.load(await res.text());

  const passiveSkills = [];
  
  // Busca por elementos contendo habilidades passivas
  $('[class*="passive-skill"], [class*="passive"], .ability-item, .passive-card').each((_, el) => {
    const $el = $(el);
    const skillName = $el.find('.skill-name, .name, strong, [class*="title"]').first().text()?.trim();
    const description = $el.find('.skill-desc, .description, p, [class*="desc"]').first().text()?.trim();
    const rarity = $el.find('[class*="rarity"]').text()?.trim();
    
    // Tenta extrair ícone ou categoria
    const icon = $el.find('img[alt]').first().attr('alt') || $el.find('[class*="icon"]').attr('class');

    if (skillName) {
      passiveSkills.push({
        name: skillName,
        description: description || null,
        rarity: rarity || null,
        icon: icon || null,
      });
    }
  });

  return passiveSkills;
}

async function fetchActiveSkills() {
  const res = await fetch('https://palworld.gg/pt-BR/active-skills');
  if (!res.ok) throw new Error(`Falha ao buscar Active Skills: HTTP ${res.status}`);
  const $ = cheerio.load(await res.text());

  const activeSkills = [];
  
  // Busca por elementos contendo habilidades ativas
  $('[class*="active-skill"], [class*="active"], .ability-item, .skill-card').each((_, el) => {
    const $el = $(el);
    const skillName = $el.find('.skill-name, .name, strong, [class*="title"]').first().text()?.trim();
    const description = $el.find('.skill-desc, .description, p, [class*="desc"]').first().text()?.trim();
    const powerText = $el.find('.power, [class*="power"], [class*="damage"]').text()?.trim();
    const cooldownText = $el.find('.cooldown, [class*="cooldown"]').text()?.trim();
    
    // Extrai valores numéricos
    const power = powerText ? parseInt(powerText.match(/\d+/)?.[0] || 0) : null;
    const cooldown = cooldownText ? parseInt(cooldownText.match(/\d+/)?.[0] || 0) : null;
    
    // Tenta extrair tipo de elemento
    const elementImg = $el.find('img[src*="T_Icon_element_s_"]').attr('src');
    let element = 'Neutral';
    if (elementImg) {
      const match = elementImg.match(/T_Icon_element_s_\d\d/);
      if (match && ELEMENT_MAP[match[0]]) element = ELEMENT_MAP[match[0]];
    }

    if (skillName) {
      activeSkills.push({
        name: skillName,
        description: description || null,
        element,
        power,
        cooldown,
      });
    }
  });

  return activeSkills;
}

async function fetchBreedingData() {
  const res = await fetch('https://palworld.gg/pt-BR/breeding-calculator');
  if (!res.ok) throw new Error(`Falha ao buscar Breeding Data: HTTP ${res.status}`);
  const $ = cheerio.load(await res.text());

  const breedingPairs = [];
  
  // Busca por linhas ou cards de pares de reprodução
  $('[class*="breeding"], [class*="pair"], .breeding-pair, .breed-row, tr[data-parent1]').each((_, el) => {
    const $el = $(el);
    
    // Tenta diferentes formas de extrair nomes dos pais
    const parent1 = $el.find('td:nth-child(1), [data-parent1], [class*="parent1"]').first().text()?.trim() || 
                    $el.attr('data-parent1');
    const parent2 = $el.find('td:nth-child(2), [data-parent2], [class*="parent2"]').first().text()?.trim() || 
                    $el.attr('data-parent2');
    const offspring = $el.find('td:nth-child(3), [data-offspring], [class*="offspring"]').first().text()?.trim() || 
                      $el.attr('data-offspring');
    
    // Alternativa: busca por imagens de Pals
    let palParent1 = parent1;
    let palParent2 = parent2;
    let palOffspring = offspring;
    
    if (!palParent1) {
      const img1 = $el.find('img').eq(0).attr('alt');
      if (img1) palParent1 = img1;
    }
    if (!palParent2) {
      const img2 = $el.find('img').eq(1).attr('alt');
      if (img2) palParent2 = img2;
    }
    if (!palOffspring) {
      const img3 = $el.find('img').eq(2).attr('alt');
      if (img3) palOffspring = img3;
    }

    if (palParent1 && palParent2 && palOffspring) {
      breedingPairs.push({
        parent1: palParent1,
        parent2: palParent2,
        offspring: palOffspring,
      });
    }
  });

  return breedingPairs;
}

async function fetchMapData() {
  const res = await fetch('https://palworld.gg/pt-BR/map');
  if (!res.ok) throw new Error(`Falha ao buscar Map Data: HTTP ${res.status}`);
  const $ = cheerio.load(await res.text());

  const mapLocations = [];
  
  // Busca por markers, pinos ou locais no mapa
  $('[class*="map-marker"], [class*="location"], [class*="spawn"], .location-item, [data-location]').each((_, el) => {
    const $el = $(el);
    
    const locationName = $el.find('.location-name, .name, strong, [class*="title"]').first().text()?.trim() ||
                         $el.attr('data-location-name') ||
                         $el.attr('title');
    const description = $el.find('.location-desc, .description, p, [class*="desc"]').first().text()?.trim();
    
    // Tenta extrair coordenadas
    const coordText = $el.find('[class*="coord"], [class*="position"]').text()?.trim();
    const coords = coordText ? coordText.match(/[\d.]+/g) : null;
    let x = null, y = null;
    if (coords && coords.length >= 2) {
      x = parseFloat(coords[0]);
      y = parseFloat(coords[1]);
    }
    
    // Extrai dados do atributo data
    if (!x && $el.attr('data-x')) x = parseFloat($el.attr('data-x'));
    if (!y && $el.attr('data-y')) y = parseFloat($el.attr('data-y'));
    
    // Tenta extrair tipo de local
    const type = $el.find('[class*="type"], [class*="category"]').text()?.trim() || 
                 $el.attr('data-type');
    
    // Tenta extrair Pals que aparecem neste local
    const palsInLocation = [];
    $el.find('[class*="pal"], img[alt*="Pal"], [class*="spawn-pal"]').each((__, palEl) => {
      const palName = $(palEl).attr('alt') || $(palEl).text()?.trim();
      if (palName && !palsInLocation.includes(palName)) {
        palsInLocation.push(palName);
      }
    });

    if (locationName) {
      mapLocations.push({
        name: locationName,
        description: description || null,
        type: type || null,
        coordinates_x: x,
        coordinates_y: y,
        pals: palsInLocation.length ? palsInLocation : null,
      });
    }
  });

  return mapLocations;
}

async function run() {
  await logSync('patch_scan', 'running', 'Iniciando sincronização completa de dados Palworld via GitHub Actions');

  try {
    console.log('📥 Buscando Pals...');
    const pals = await fetchAndParsePals();

    if (pals.length === 0) {
      throw new Error('Nenhum Pal encontrado — provável mudança na estrutura do site de origem');
    }

    console.log(`✅ ${pals.length} Pals encontrados`);
    console.log('💾 Sincronizando Pals no Supabase...');
    const { error: palsError } = await supabase
      .from('pals')
      .upsert(pals, { onConflict: 'dex_number', ignoreDuplicates: false });

    if (palsError) throw palsError;

    // Partner Skills
    console.log('⚔️ Buscando Partner Skills...');
    const partnerSkills = await fetchPartnerSkills();
    if (partnerSkills.length > 0) {
      const { error: skillsError } = await supabase
        .from('partner_skills')
        .upsert(partnerSkills, { onConflict: 'id', ignoreDuplicates: false });
      if (skillsError) throw skillsError;
      console.log(`✅ ${partnerSkills.length} Partner Skills sincronizadas`);
    }

    // Passive Skills
    console.log('🛡️ Buscando Passive Skills...');
    const passiveSkills = await fetchPassiveSkills();
    if (passiveSkills.length > 0) {
      const { error: passiveError } = await supabase
        .from('passive_skills')
        .upsert(passiveSkills, { onConflict: 'id', ignoreDuplicates: false });
      if (passiveError) throw passiveError;
      console.log(`✅ ${passiveSkills.length} Passive Skills sincronizadas`);
    }

    // Active Skills
    console.log('⚡ Buscando Active Skills...');
    const activeSkills = await fetchActiveSkills();
    if (activeSkills.length > 0) {
      const { error: activeError } = await supabase
        .from('active_skills')
        .upsert(activeSkills, { onConflict: 'id', ignoreDuplicates: false });
      if (activeError) throw activeError;
      console.log(`✅ ${activeSkills.length} Active Skills sincronizadas`);
    }

    // Technology Tree
    console.log('🌳 Buscando Technology Tree...');
    const technologies = await fetchTechnologyTree();
    if (technologies.length > 0) {
      const { error: techError } = await supabase
        .from('technologies')
        .upsert(technologies, { onConflict: 'id', ignoreDuplicates: false });
      if (techError) throw techError;
      console.log(`✅ ${technologies.length} Tecnologias sincronizadas`);
    }

    // Breeding Data
    console.log('🥚 Buscando Breeding Data...');
    const breedingData = await fetchBreedingData();
    if (breedingData.length > 0) {
      const { error: breedError } = await supabase
        .from('breeding_pairs')
        .upsert(breedingData, { onConflict: 'id', ignoreDuplicates: false });
      if (breedError) throw breedError;
      console.log(`✅ ${breedingData.length} Pares de reprodução sincronizados`);
    }

    // Map Data
    console.log('🗺️ Buscando Map Data...');
    const mapData = await fetchMapData();
    if (mapData.length > 0) {
      const { error: mapError } = await supabase
        .from('map_locations')
        .upsert(mapData, { onConflict: 'id', ignoreDuplicates: false });
      if (mapError) throw mapError;
      console.log(`✅ ${mapData.length} Locais do mapa sincronizados`);
    }

    const totalSynced = pals.length + partnerSkills.length + passiveSkills.length + activeSkills.length + technologies.length + breedingData.length + mapData.length;
    await logSync('patch_scan', 'success', `${totalSynced} itens sincronizados com sucesso`);
    console.log(`\n✅ SUCESSO — ${totalSynced} itens sincronizados no total`);
  } catch (err) {
    await logSync('patch_scan', 'failed', err.message);
    console.error('❌ ERRO:', err.message);
    process.exit(1);
  }
}

run();
