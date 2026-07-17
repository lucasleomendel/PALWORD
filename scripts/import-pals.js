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
  // TODO: Implementar parsing conforme estrutura do site
  // Adicionar lógica para extrair tecnologias, custos e dependências

  return technologies;
}

async function fetchPartnerSkills() {
  const res = await fetch('https://palworld.gg/pt-BR/partner-skills');
  if (!res.ok) throw new Error(`Falha ao buscar Partner Skills: HTTP ${res.status}`);
  const $ = cheerio.load(await res.text());

  const skills = [];
  // TODO: Implementar parsing conforme estrutura do site
  // Adicionar lógica para extrair habilidades de parceria

  return skills;
}

async function fetchPassiveSkills() {
  const res = await fetch('https://palworld.gg/pt-BR/passive-skills');
  if (!res.ok) throw new Error(`Falha ao buscar Passive Skills: HTTP ${res.status}`);
  const $ = cheerio.load(await res.text());

  const passiveSkills = [];
  // TODO: Implementar parsing conforme estrutura do site
  // Adicionar lógica para extrair habilidades passivas

  return passiveSkills;
}

async function fetchActiveSkills() {
  const res = await fetch('https://palworld.gg/pt-BR/active-skills');
  if (!res.ok) throw new Error(`Falha ao buscar Active Skills: HTTP ${res.status}`);
  const $ = cheerio.load(await res.text());

  const activeSkills = [];
  // TODO: Implementar parsing conforme estrutura do site
  // Adicionar lógica para extrair habilidades ativas

  return activeSkills;
}

async function fetchBreedingData() {
  const res = await fetch('https://palworld.gg/pt-BR/breeding-calculator');
  if (!res.ok) throw new Error(`Falha ao buscar Breeding Data: HTTP ${res.status}`);
  const $ = cheerio.load(await res.text());

  const breedingPairs = [];
  // TODO: Implementar parsing conforme estrutura do site
  // Adicionar lógica para extrair pares de reprodução e descendentes

  return breedingPairs;
}

async function fetchMapData() {
  const res = await fetch('https://palworld.gg/pt-BR/map');
  if (!res.ok) throw new Error(`Falha ao buscar Map Data: HTTP ${res.status}`);
  const $ = cheerio.load(await res.text());

  const mapLocations = [];
  // TODO: Implementar parsing conforme estrutura do site
  // Adicionar lógica para extrair locais, estruturas e spawns

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
