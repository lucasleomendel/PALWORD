import AIManager from './ai-manager.js';
import AIDatabaseKeeper from './ai-database-keeper.js';

class AIAppController {
  constructor() {
    this.aiManager = new AIManager();
    this.databaseKeeper = new AIDatabaseKeeper();
    this.appState = {
      initialized: false,
      running: false,
      lastAction: null,
      errors: [],
      performance: {}
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

      this.appState.initialized = true;
      this.appState.running = true;

      // Obter status inicial
      const initialStatus = await this.aiManager.getSystemStatus();
      console.log('📊 Status Inicial do Sistema:');
      console.log(initialStatus);

      // Iniciar monitoramento de desempenho
      this.startPerformanceMonitoring();

      console.log('\n🎯 APLICAÇÃO PRONTA PARA OPERAÇÃO AUTOMÁTICA COM IA\n');
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
      
      Seja conciso e objetivo.
    `);

    return report;
  }

  getAppState() {
    return this.appState;
  }
}

export default AIAppController;