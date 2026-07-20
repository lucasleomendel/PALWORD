import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ELEMENT_MAP = {
  T_Icon_element_s_00: 'Neutral', T_Icon_element_s_01: 'Fire',
  T_Icon_element_s_02: 'Water',   T_Icon_element_s_03: 'Electric',
  T_Icon_element_s_04: 'Grass',   T_Icon_element_s_05: 'Dark',
  T_Icon_element_s_06: 'Dragon',  T_Icon_element_s_07: 'Ground',
  T_Icon_element_s_08: 'Ice',
};

const RARITY_MAP = { Comum: 'Common', Raro: 'Rare', 'Épico': 'Epic', 'Lendário': 'Legendary' };

class AIDataFetcher {
  constructor() {
    this.lastDailySync = null;
    this.dailySyncInterval = 86400000; // 24 horas
    this.retryAttempts = 3;
    this.retryDelay = 5000; // 5 segundos
  }

  async initialize() {
    console.log('📡 Inicializando AI Data Fetcher...');
    this.startDailySync();
  }

  startDailySync() {
    console.log('⏰ Agendando sincronização diária de dados...');
    
    // Executar primeira sincronização imediatamente
    this.performDailyDataUpdate();
    
    // Agendar sincronizações futuras a cada 24 horas
    setInterval(async () => {
      await this.performDailyDataUpdate();
    }, this.dailySyncInterval);
  }

  async performDailyDataUpdate() {
    console.log('\n🔄 ========================================');
    console.log('   SINCRONIZAÇÃO DIÁRIA DE DADOS');
    console.log('   ' + new Date().toLocaleString('pt-BR'));
    console.log('========================================');

    this.lastDailySync = new Date().toISOString();

    try {
      const results = {
        pals: await this.fetchAndUpdatePals(),
        partnerSkills: await this.fetchAndUpdatePartnerSkills(),
        passiveSkills: await this.fetchAndUpdatePassiveSkills(),
        activeSkills: await this.fetchAndUpdateActiveSkills(),
        technologies: await this.fetchAndUpdateTechnologies(),
        breedingData: await this.fetchAndUpdateBreedingData(),
        mapData: await this.fetchAndUpdateMapData()
      };

      const totalItems = Object.values(results).reduce((sum, val) => sum + (val || 0), 0);

      await this.logDailySync('success', results, totalItems);

      console.log('\n✅ SINCRONIZAÇÃO DIÁRIA CONCLUÍDA');
      console.log(`📊 Total de itens sincronizados: ${totalItems}`);
      console.log('========================================\n');

      return results;
    } catch (error) {
      console.error('\n❌ ERRO NA SINCRONIZAÇÃO DIÁRIA:', error.message);
      await this.logDailySync('failed', { error: error.message }, 0);
      throw error;
    }
  }

  async fetchAndUpdatePals() {
    console.log('\n📥 Buscando Pals...');
    try {
      const pals = await this.fetchPalsWithRetry();
      
      if (pals.length === 0) {
        console.log('⚠️  Nenhum Pal encontrado');
        return 0;
      }

      const { error } = await supabase
        .from('pals')
        .upsert(pals, { onConflict: 'dex_number', ignoreDuplicates: false });

      if (error) throw error;

      console.log(`✅ ${pals.length} Pals sincronizados`);
      return pals.length;
    } catch (error) {
      console.error('❌ Erro ao buscar Pals:', error.message);
      return 0;
    }
  }

  async fetchPalsWithRetry() {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const res = await fetch('https://palworld.gg/pt-BR/pals');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
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
              updated_at: new Date().toISOString()
            });
          }
        });

        return pals;
      } catch (error) {
        console.log(`⚠️  Tentativa ${attempt}/${this.retryAttempts} falhou: ${error.message}`);
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay);
        } else {
          throw error;
        }
      }
    }
  }

  async fetchAndUpdatePartnerSkills() {
    console.log('\n⚔️ Buscando Partner Skills...');
    try {
      const skills = await this.fetchPartnerSkillsWithRetry();
      
      if (skills.length === 0) {
        console.log('⚠️  Nenhuma Partner Skill encontrada');
        return 0;
      }

      const { error } = await supabase
        .from('partner_skills')
        .upsert(skills, { onConflict: 'id', ignoreDuplicates: false });

      if (error) throw error;

      console.log(`✅ ${skills.length} Partner Skills sincronizadas`);
      return skills.length;
    } catch (error) {
      console.error('❌ Erro ao buscar Partner Skills:', error.message);
      return 0;
    }
  }

  async fetchPartnerSkillsWithRetry() {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const res = await fetch('https://palworld.gg/pt-BR/partner-skills');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const $ = cheerio.load(await res.text());
        const skills = [];

        $('[class*="partner-skill"], [class*="skill"], .skill-item, .skill-card').each((_, el) => {
          const $el = $(el);
          const skillName = $el.find('.skill-name, .name, strong, [class*="title"]').first().text()?.trim();
          const description = $el.find('.skill-desc, .description, p, [class*="desc"]').first().text()?.trim();
          const palName = $el.find('.pal-name, [data-pal], [class*="pal"]').text()?.trim();
          const cooldownText = $el.find('.cooldown, [class*="cooldown"], [class*="cd"]').text()?.trim();
          const cooldown = cooldownText ? parseInt(cooldownText.match(/\d+/)?.[0] || 0) : null;

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
              updated_at: new Date().toISOString()
            });
          }
        });

        return skills;
      } catch (error) {
        console.log(`⚠️  Tentativa ${attempt}/${this.retryAttempts} falhou: ${error.message}`);
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay);
        } else {
          throw error;
        }
      }
    }
  }

  async fetchAndUpdatePassiveSkills() {
    console.log('\n🛡️ Buscando Passive Skills...');
    try {
      const skills = await this.fetchPassiveSkillsWithRetry();
      
      if (skills.length === 0) {
        console.log('⚠️  Nenhuma Passive Skill encontrada');
        return 0;
      }

      const { error } = await supabase
        .from('passive_skills')
        .upsert(skills, { onConflict: 'id', ignoreDuplicates: false });

      if (error) throw error;

      console.log(`✅ ${skills.length} Passive Skills sincronizadas`);
      return skills.length;
    } catch (error) {
      console.error('❌ Erro ao buscar Passive Skills:', error.message);
      return 0;
    }
  }

  async fetchPassiveSkillsWithRetry() {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const res = await fetch('https://palworld.gg/pt-BR/passive-skills');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const $ = cheerio.load(await res.text());
        const skills = [];

        $('[class*="passive-skill"], [class*="passive"], .ability-item, .passive-card').each((_, el) => {
          const $el = $(el);
          const skillName = $el.find('.skill-name, .name, strong, [class*="title"]').first().text()?.trim();
          const description = $el.find('.skill-desc, .description, p, [class*="desc"]').first().text()?.trim();
          const rarity = $el.find('[class*="rarity"]').text()?.trim();
          const icon = $el.find('img[alt]').first().attr('alt') || $el.find('[class*="icon"]').attr('class');

          if (skillName) {
            skills.push({
              name: skillName,
              description: description || null,
              rarity: rarity || null,
              icon: icon || null,
              updated_at: new Date().toISOString()
            });
          }
        });

        return skills;
      } catch (error) {
        console.log(`⚠️  Tentativa ${attempt}/${this.retryAttempts} falhou: ${error.message}`);
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay);
        } else {
          throw error;
        }
      }
    }
  }

  async fetchAndUpdateActiveSkills() {
    console.log('\n⚡ Buscando Active Skills...');
    try {
      const skills = await this.fetchActiveSkillsWithRetry();
      
      if (skills.length === 0) {
        console.log('⚠️  Nenhuma Active Skill encontrada');
        return 0;
      }

      const { error } = await supabase
        .from('active_skills')
        .upsert(skills, { onConflict: 'id', ignoreDuplicates: false });

      if (error) throw error;

      console.log(`✅ ${skills.length} Active Skills sincronizadas`);
      return skills.length;
    } catch (error) {
      console.error('❌ Erro ao buscar Active Skills:', error.message);
      return 0;
    }
  }

  async fetchActiveSkillsWithRetry() {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const res = await fetch('https://palworld.gg/pt-BR/active-skills');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const $ = cheerio.load(await res.text());
        const skills = [];

        $('[class*="active-skill"], [class*="active"], .ability-item, .skill-card').each((_, el) => {
          const $el = $(el);
          const skillName = $el.find('.skill-name, .name, strong, [class*="title"]').first().text()?.trim();
          const description = $el.find('.skill-desc, .description, p, [class*="desc"]').first().text()?.trim();
          const powerText = $el.find('.power, [class*="power"], [class*="damage"]').text()?.trim();
          const cooldownText = $el.find('.cooldown, [class*="cooldown"]').text()?.trim();
          const power = powerText ? parseInt(powerText.match(/\d+/)?.[0] || 0) : null;
          const cooldown = cooldownText ? parseInt(cooldownText.match(/\d+/)?.[0] || 0) : null;

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
              element,
              power,
              cooldown,
              updated_at: new Date().toISOString()
            });
          }
        });

        return skills;
      } catch (error) {
        console.log(`⚠️  Tentativa ${attempt}/${this.retryAttempts} falhou: ${error.message}`);
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay);
        } else {
          throw error;
        }
      }
    }
  }

  async fetchAndUpdateTechnologies() {
    console.log('\n🌳 Buscando Technology Tree...');
    try {
      const techs = await this.fetchTechnologiesWithRetry();
      
      if (techs.length === 0) {
        console.log('⚠️  Nenhuma Technology encontrada');
        return 0;
      }

      const { error } = await supabase
        .from('technologies')
        .upsert(techs, { onConflict: 'id', ignoreDuplicates: false });

      if (error) throw error;

      console.log(`✅ ${techs.length} Tecnologias sincronizadas`);
      return techs.length;
    } catch (error) {
      console.error('❌ Erro ao buscar Technologies:', error.message);
      return 0;
    }
  }

  async fetchTechnologiesWithRetry() {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const res = await fetch('https://palworld.gg/pt-BR/technology-tree');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const $ = cheerio.load(await res.text());
        const techs = [];

        $('[class*="tech"], [class*="technology"], .tech-item, .technology-node').each((_, el) => {
          const $el = $(el);
          const name = $el.find('.tech-name, .name, [class*="title"]').text()?.trim();
          const description = $el.find('.tech-desc, .description, [class*="desc"]').text()?.trim();
          const costText = $el.find('.cost, [class*="cost"]').text()?.trim();
          const cost = costText ? parseInt(costText.match(/\d+/)?.[0] || 0) : 0;

          if (name) {
            techs.push({
              name,
              description: description || null,
              cost,
              updated_at: new Date().toISOString()
            });
          }
        });

        return techs;
      } catch (error) {
        console.log(`⚠️  Tentativa ${attempt}/${this.retryAttempts} falhou: ${error.message}`);
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay);
        } else {
          throw error;
        }
      }
    }
  }

  async fetchAndUpdateBreedingData() {
    console.log('\n🥚 Buscando Breeding Data...');
    try {
      const pairs = await this.fetchBreedingDataWithRetry();
      
      if (pairs.length === 0) {
        console.log('⚠️  Nenhum Breeding Pair encontrado');
        return 0;
      }

      const { error } = await supabase
        .from('breeding_pairs')
        .upsert(pairs, { onConflict: 'id', ignoreDuplicates: false });

      if (error) throw error;

      console.log(`✅ ${pairs.length} Pares de reprodução sincronizados`);
      return pairs.length;
    } catch (error) {
      console.error('❌ Erro ao buscar Breeding Data:', error.message);
      return 0;
    }
  }

  async fetchBreedingDataWithRetry() {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const res = await fetch('https://palworld.gg/pt-BR/breeding-calculator');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const $ = cheerio.load(await res.text());
        const pairs = [];

        $('[class*="breeding"], [class*="pair"], .breeding-pair, .breed-row, tr[data-parent1]').each((_, el) => {
          const $el = $(el);
          const parent1 = $el.find('td:nth-child(1), [data-parent1], [class*="parent1"]').first().text()?.trim() || $el.attr('data-parent1');
          const parent2 = $el.find('td:nth-child(2), [data-parent2], [class*="parent2"]').first().text()?.trim() || $el.attr('data-parent2');
          const offspring = $el.find('td:nth-child(3), [data-offspring], [class*="offspring"]').first().text()?.trim() || $el.attr('data-offspring');

          if (parent1 && parent2 && offspring) {
            pairs.push({
              parent1,
              parent2,
              offspring,
              updated_at: new Date().toISOString()
            });
          }
        });

        return pairs;
      } catch (error) {
        console.log(`⚠️  Tentativa ${attempt}/${this.retryAttempts} falhou: ${error.message}`);
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay);
        } else {
          throw error;
        }
      }
    }
  }

  async fetchAndUpdateMapData() {
    console.log('\n🗺️ Buscando Map Data...');
    try {
      const locations = await this.fetchMapDataWithRetry();
      
      if (locations.length === 0) {
        console.log('⚠️  Nenhuma localização do mapa encontrada');
        return 0;
      }

      const { error } = await supabase
        .from('map_locations')
        .upsert(locations, { onConflict: 'id', ignoreDuplicates: false });

      if (error) throw error;

      console.log(`✅ ${locations.length} Locais do mapa sincronizados`);
      return locations.length;
    } catch (error) {
      console.error('❌ Erro ao buscar Map Data:', error.message);
      return 0;
    }
  }

  async fetchMapDataWithRetry() {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const res = await fetch('https://palworld.gg/pt-BR/map');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const $ = cheerio.load(await res.text());
        const locations = [];

        $('[class*="map-marker"], [class*="location"], [class*="spawn"], .location-item, [data-location]').each((_, el) => {
          const $el = $(el);
          const locationName = $el.find('.location-name, .name, strong, [class*="title"]').first().text()?.trim() || $el.attr('data-location-name') || $el.attr('title');
          const description = $el.find('.location-desc, .description, p, [class*="desc"]').first().text()?.trim();

          if (locationName) {
            locations.push({
              name: locationName,
              description: description || null,
              updated_at: new Date().toISOString()
            });
          }
        });

        return locations;
      } catch (error) {
        console.log(`⚠️  Tentativa ${attempt}/${this.retryAttempts} falhou: ${error.message}`);
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay);
        } else {
          throw error;
        }
      }
    }
  }

  async logDailySync(status, results, totalItems) {
    try {
      await supabase.from('ai_sync_logs').insert({
        event: 'daily_sync',
        status,
        timestamp: new Date().toISOString(),
        details: JSON.stringify({
          results,
          totalItems,
          timestamp: new Date().toLocaleString('pt-BR')
        })
      });
    } catch (error) {
      console.error('❌ Erro ao registrar sincronização diária:', error.message);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getLastDailySync() {
    return this.lastDailySync;
  }
}

export default AIDataFetcher;
