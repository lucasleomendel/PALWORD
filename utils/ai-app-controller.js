import AIManager from './ai-manager.js';
import AIDatabaseKeeper from './ai-database-keeper.js';
import AIDataFetcher from './ai-data-fetcher.js';

class AIAppController {
  constructor() {
    this.aiManager = new AIManager();
    this.databaseKeeper = new AIDatabaseKeeper();
    this.dataFetcher = new AIDataFetcher();
    this.appState = {
      initialized: false,
      running: false,
      lastAction: null,
      errors: [],
      performance: {},
      lastDailySync: null
    };
  }

  async initializeApp() {
    console.log('🚀 Inicializando Aplicação com Controle por IA...');

    try {
      // Inicializar gerenciador de IA
      await this.aiManager.initialize();
      console.log('✅ AI Manager inicializado');

      // Inicializar guardião do banco de dados
      await this.databaseKeeper.initialize();
      console.log('✅ Database Keeper inicializado');

      // Inicializar buscador de dados diário
      await this.dataFetcher.initialize();
      console.log('✅ AI Data Fetcher inicializado - Sincronização diária agendada');

      this.appState.initialized = true;
      this.appState.running = true;

      // Obter status inicial
      const initialStatus = await this.aiManager.getSystemStatus();
      console.log('📊 Status Inicial do Sistema:');
      console.log(initialStatus);

      // Iniciar monitoramento de desempenho
      this.startPerformanceMonitoring();

      console.log('\n🎯 APLICAÇÃO PRONTA PARA OPERAÇÃO AUTOMÁTICA COM IA\n');
      console.log('📋 Funcionalidades ativas:');
      console.log('   ✅ Monitoramento contínuo de saúde (a cada 1 min)');
      console.log('   ✅ Verificação rápida do banco (a cada 30s)');
      console.log('   ✅ Sincronização completa (a cada 1h)');
      console.log('   ✅ Busca e atualização de dados (1x ao dia)');
      console.log('   ✅ Monitoramento de desempenho (a cada 5min)\n');
    } catch (error) {
      console.error('❌ Erro ao inicializar aplicação:', error.message);
      this.appState.errors.push({
        timestamp: new Date().toISOString(),
        error: error.message
      });
      throw error;
    }
  }

  startPerformanceMonitoring() {
    console.log('📈 Iniciando monitoramento de desempenho...');

    setInterval(async () => {
      const status = await this.getAppStatus();
      this.appState.performance = {
        timestamp: new Date().toISOString(),
        ...status
      };
    }, 300000); // A cada 5 minutos
  }

  async getAppStatus() {
    return {
      initialized: this.appState.initialized,
      running: this.appState.running,
      databaseHealth: await this.databaseKeeper.getDetailedStatus(),
      lastDailySync: this.dataFetcher.getLastDailySync(),
      aiStatus: 'operational',
      timestamp: new Date().toISOString()
    };
  }

  async handleCriticalError(error) {
    console.error('🚨 ERRO CRÍTICO DETECTADO:', error.message);

    this.appState.errors.push({
      timestamp: new Date().toISOString(),
      severity: 'critical',
      error: error.message
    });

    // Alertar IA sobre erro crítico
    const response = await this.aiManager.askAI(`
      ALERTA CRÍTICO: Um erro crítico ocorreu na aplicação:
      "${error.message}"
      
      Analise a situação e recomende ações de recuperação imediata.
    `);

    console.log('🤖 Resposta da IA:');
    console.log(response);

    return response;
  }

  async executeAICommand(command) {
    console.log(`📝 Executando comando via IA: "${command}"`);

    this.appState.lastAction = {
      command,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    try {
      const result = await this.aiManager.askAI(`
        Execute o seguinte comando de gerenciamento da aplicação:
        
        "${command}"
        
        Forneça um relatório detalhado da execução.
      `);

      this.appState.lastAction.status = 'completed';
      this.appState.lastAction.result = result;

      return result;
    } catch (error) {
      this.appState.lastAction.status = 'failed';
      this.appState.lastAction.error = error.message;
      throw error;
    }
  }

  async getFullSystemReport() {
    console.log('📋 Gerando relatório completo do sistema...');

    const report = await this.aiManager.askAI(`
      Gere um relatório executivo completo contendo:
      1. Status geral da aplicação
      2. Saúde do banco de dados
      3. Problemas identificados
      4. Ações tomadas automaticamente
      5. Recomendações para melhorias
      6. Previsão de necessidades futuras
      7. Próxima sincronização de dados agendada
      
      Seja conciso e objetivo.
    `);

    return report;
  }

  async testDatabaseConnection() {
    console.log('\n🔌 Testando conexão com banco de dados...');
    try {
      const stats = await this.aiManager.gatherDatabaseStats();
      console.log('✅ Conexão com banco de dados bem-sucedida');
      console.log('📊 Estatísticas do banco:');
      console.log(JSON.stringify(stats, null, 2));
      return stats;
    } catch (error) {
      console.error('❌ Erro ao conectar com banco de dados:', error.message);
      throw error;
    }
  }

  async verifyLovableIntegration() {
    console.log('\n🔗 Verificando integração com app Lovable...');
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const anthropicKey = process.env.ANTHROPIC_API_KEY;

      const checks = {
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseKey,
        anthropicKey: !!anthropicKey,
        timestamp: new Date().toISOString()
      };

      if (checks.supabaseUrl && checks.supabaseKey && checks.anthropicKey) {
        console.log('✅ Todas as credenciais configuradas corretamente');
        console.log('✅ Aplicação pronta para sincronizar com Lovable');
      } else {
        console.log('⚠️  Algumas credenciais estão faltando:');
        if (!checks.supabaseUrl) console.log('   - SUPABASE_URL');
        if (!checks.supabaseKey) console.log('   - SUPABASE_SERVICE_ROLE_KEY');
        if (!checks.anthropicKey) console.log('   - ANTHROPIC_API_KEY');
      }

      return checks;
    } catch (error) {
      console.error('❌ Erro ao verificar integração:', error.message);
      throw error;
    }
  }

  getAppState() {
    return this.appState;
  }
}

export default AIAppController;
