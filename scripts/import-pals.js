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

async function logSync(event, status, details) {
  await supabase.from('ai_sync_logs').insert({ event, status, details });
}

async function run() {
  await logSync('patch_scan', 'running', 'Iniciando sincronização de Pals via GitHub Actions');

  try {
    const res = await fetch('https://palworld.gg/pt-BR/pals');
    if (!res.ok) throw new Error(`Falha ao buscar listagem: HTTP ${res.status}`);
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

      // Pals sem dex válido (ex: variantes de evento "#-1") são pulados por segurança
      if (name && dex_number !== null && dex_number > 0) {
        pals.push({
          dex_number,
          name,
          rarity: RARITY_MAP[rarityPt] ?? null,
          elements: elements.length ? elements : ['Neutral'],
        });
      }
    });

    if (pals.length === 0) {
      throw new Error('Nenhum Pal encontrado — provável mudança na estrutura do site de origem');
    }

    const { error } = await supabase
      .from('pals')
      .upsert(pals, { onConflict: 'dex_number', ignoreDuplicates: false });

    if (error) throw error;

    await logSync('patch_scan', 'success', `${pals.length} pals sincronizados`);
    console.log(`OK — ${pals.length} pals sincronizados`);
  } catch (err) {
    await logSync('patch_scan', 'failed', err.message);
    console.error(err);
    process.exit(1);
  }
}

run();
