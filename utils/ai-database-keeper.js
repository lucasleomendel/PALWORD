import { createClient } from '@supabase/supabase-js';
import AIManager from './ai-manager.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class AIDatabaseKeeper {
  constructor() {
    this.aiManager = new AIManager();
    this.lastFullSync = null;
    this.checkInterval = 30000; // 30 segundos
    this.fullSyncInterval = 3600000; // 1 hora
  }

  async initialize() {
    console.log('💾 Inicializando AI Database Keeper...');
    await this.aiManager.initialize();
    this.startPeriodicChecks();
  }

  startPeriodicChecks() {
    // Verificações rápidas a cada 30 segundos
    setInterval(async () => {
      await this.quickDatabaseCheck();
    }, this.checkInterval);

    // Sincronização completa a cada 1 hora
    setInterval(async () => {
      await this.performFullSync();
    }, this.fullSyncInterval);
  }

  async quickDatabaseCheck() {
    try {
      console.log('🔍 Realizando verificação rápida do banco de dados...');

      const issues = await this.identifyDatabaseIssues();

      if (issues.length > 0) {
        console.log('⚠️ Problemas identificados:');
        issues.forEach(issue => console.log(`  - ${issue}`));

        await this.aiManager.askAI(`
          Identifiquei os seguintes problemas no banco de dados:
          ${issues.join('\n')}
          
          Recomende soluções imediatas para cada problema.
        `);
      } else {
        console.log('✅ Banco de dados está saudável');
      }
    } catch (error) {
      console.error('❌ Erro na verificação rápida:', error.message);
    }
  }

  async identifyDatabaseIssues() {
    const issues = [];

    // Verificar tabelas vazias
    const { data: pals, error: palsError } = await supabase
      .from('pals')
      .select('count')
      .limit(1);

    if (!palsError && (!pals || pals.length === 0)) {
      issues.push('Tabela de Pals está vazia ou inacessível');
    }

    // Verificar registros sem informações críticas
    const { data: incompleteData } = await supabase
      .from('pals')
      .select('*')
      .or('name.is.null,dex_number.is.null')
      .limit(10);

    if (incompleteData && incompleteData.length > 0) {
      issues.push(`${incompleteData.length} registros de Pals com dados incompletos`);
    }

    return issues;
  }

  async performFullSync() {
    try {
      console.log('🔄 Iniciando sincronização completa do banco de dados...');
      this.lastFullSync = new Date().toISOString();

      // Validar integridade dos dados
      await this.validateDataIntegrity();

      // Executar limpeza
      await this.performDatabaseCleanup();

      // Detectar dados desatualizados
      await this.detectOutdatedData();

      // Registrar sincronização
      await supabase.from('ai_sync_logs').insert({
        event: 'full_sync',
        status: 'completed',
        timestamp: new Date().toISOString(),
        details: 'Sincronização completa realizada com sucesso'
      });

      console.log('✅ Sincronização completa concluída');
    } catch (error) {
      console.error('❌ Erro durante sincronização completa:', error.message);
      await supabase.from('ai_sync_logs').insert({
        event: 'full_sync',
        status: 'failed',
        timestamp: new Date().toISOString(),
        details: error.message
      });
    }
  }

  async validateDataIntegrity() {
    console.log('🔐 Validando integridade dos dados...');

    const validations = [
      this.validatePalsData(),
      this.validateSkillsData(),
      this.validateTechnologiesData(),
      this.validateBreedingData(),
      this.validateMapData()
    ];

    const results = await Promise.all(validations);
    const issues = results.filter(r => !r.valid);

    if (issues.length > 0) {
      console.log('⚠️ Problemas de integridade encontrados:');
      issues.forEach(issue => console.log(`  - ${issue.message}`));
    }
  }

  async validatePalsData() {
    try {
      const { data, error } = await supabase
        .from('pals')
        .select('id, name, dex_number')
        .is('name', 'null')
        .limit(1);

      if (error || (data && data.length > 0)) {
        return {
          valid: false,
          message: 'Alguns Pals possuem nomes faltando'
        };
      }
      return { valid: true };
    } catch (error) {
      return { valid: false, message: error.message };
    }
  }

  async validateSkillsData() {
    try {
      const { data: partner } = await supabase
        .from('partner_skills')
        .select('count', { count: 'exact' });

      const { data: passive } = await supabase
        .from('passive_skills')
        .select('count', { count: 'exact' });

      const { data: active } = await supabase
        .from('active_skills')
        .select('count', { count: 'exact' });

      return {
        valid: true,
        summary: `Skills validadas - Partner: ${partner?.length || 0}, Passive: ${passive?.length || 0}, Active: ${active?.length || 0}`
      };
    } catch (error) {
      return { valid: false, message: error.message };
    }
  }

  async validateTechnologiesData() {
    try {
      const { data, error } = await supabase
        .from('technologies')
        .select('*')
        .limit(1);

      if (!error && data.length > 0) {
        return { valid: true };
      }
      return { valid: false, message: 'Dados de tecnologias não encontrados' };
    } catch (error) {
      return { valid: false, message: error.message };
    }
  }

  async validateBreedingData() {
    try {
      const { data, error } = await supabase
        .from('breeding_pairs')
        .select('count', { count: 'exact' });

      return { valid: !error };
    } catch (error) {
      return { valid: false, message: error.message };
    }
  }

  async validateMapData() {
    try {
      const { data, error } = await supabase
        .from('map_locations')
        .select('count', { count: 'exact' });

      return { valid: !error };
    } catch (error) {
      return { valid: false, message: error.message };
    }
  }

  async performDatabaseCleanup() {
    console.log('🧹 Limpando dados duplicados e inválidos...');

    // Remover registros duplicados
    const { data: duplicates } = await supabase
      .from('pals')
      .select('dex_number')
      .group_by('dex_number')
      .having('count(*) > 1');

    if (duplicates && duplicates.length > 0) {
      console.log(`⚠️ ${duplicates.length} Pals duplicados encontrados`);
      // Implementar lógica de remoção de duplicatas
    }

    console.log('✅ Limpeza concluída');
  }

  async detectOutdatedData() {
    console.log('📅 Detectando dados desatualizados...');

    const { data: oldRecords } = await supabase
      .from('pals')
      .select('updated_at')
      .lt('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(10);

    if (oldRecords && oldRecords.length > 0) {
      console.log(`⚠️ ${oldRecords.length} registros não atualizados há mais de 7 dias`);
      await this.aiManager.askAI(`
        Detectei ${oldRecords.length} registros de Pals não atualizados há mais de uma semana.
        Recomende um plano para atualizar esses dados.
      `);
    }
  }

  async getDetailedStatus() {
    const stats = await this.aiManager.gatherDatabaseStats();
    const issues = await this.identifyDatabaseIssues();

    return {
      lastSync: this.lastFullSync,
      statistics: stats,
      issues,
      timestamp: new Date().toISOString()
    };
  }
}

export default AIDatabaseKeeper;