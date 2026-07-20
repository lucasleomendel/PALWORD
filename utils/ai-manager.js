import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const client = new Anthropic();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class AIManager {
  constructor() {
    this.conversationHistory = [];
    this.lastSync = null;
    this.syncInterval = 60000; // 1 minute
  }

  async initialize() {
    console.log('🤖 Inicializando AI Manager...');
    await this.performInitialDiagnosis();
    this.startContinuousMonitoring();
  }

  async performInitialDiagnosis() {
    const diagnosis = `
    Você é um gerenciador de IA inteligente responsável por:
    1. Monitorar a saúde do banco de dados Palworld
    2. Verificar integridade dos dados (Pals, Skills, Technologies, etc)
    3. Identificar dados faltantes ou desatualizados
    4. Sugerir otimizações e melhorias
    5. Gerenciar atualizações automáticas
    
    Inicie o diagnóstico do sistema atual.
    `;

    await this.askAI(diagnosis);
  }

  async askAI(userMessage) {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    try {
      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        system: `Você é um gerenciador de IA especializado em Palworld. 
        Seu objetivo é manter o aplicativo funcionando perfeitamente, 
        monitorar o banco de dados, identificar problemas e sugerir soluções automáticas.
        Responda sempre em Português e seja objetivo.`,
        messages: this.conversationHistory
      });

      const assistantMessage = response.content[0].text;
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      });

      return assistantMessage;
    } catch (error) {
      console.error('❌ Erro ao comunicar com IA:', error.message);
      throw error;
    }
  }

  async startContinuousMonitoring() {
    console.log('📡 Iniciando monitoramento contínuo...');
    setInterval(async () => {
      await this.performHealthCheck();
    }, this.syncInterval);
  }

  async performHealthCheck() {
    try {
      const stats = await this.gatherDatabaseStats();
      const healthReport = await this.askAI(`
        Analise o estado atual do banco de dados:
        
        ${JSON.stringify(stats, null, 2)}
        
        Identifique problemas, inconsistências ou dados faltantes.
        Sugira ações corretivas se necessário.
      `);

      console.log('🏥 Relatório de Saúde do Sistema:');
      console.log(healthReport);

      await this.logHealthCheck(healthReport, stats);
      await this.executeRecommendedActions(healthReport);
    } catch (error) {
      console.error('❌ Erro durante health check:', error.message);
    }
  }

  async gatherDatabaseStats() {
    const stats = {};

    const tables = [
      'pals',
      'partner_skills',
      'passive_skills',
      'active_skills',
      'technologies',
      'breeding_pairs',
      'map_locations'
    ];

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (!error) {
          stats[table] = {
            count,
            lastUpdated: new Date().toISOString()
          };
        }
      } catch (err) {
        stats[table] = { error: err.message };
      }
    }

    return stats;
  }

  async logHealthCheck(report, stats) {
    try {
      await supabase.from('ai_health_logs').insert({
        timestamp: new Date().toISOString(),
        report,
        stats: JSON.stringify(stats),
        status: 'completed'
      });
    } catch (error) {
      console.error('❌ Erro ao registrar health check:', error.message);
    }
  }

  async executeRecommendedActions(healthReport) {
    const actionPrompt = `
      Baseado neste relatório de saúde:
      "${healthReport}"
      
      Liste APENAS as ações que devem ser executadas automaticamente (sem intervenção humana).
      Formato esperado:
      AÇÃO: [descrição da ação]
      PRIORIDADE: [alta/média/baixa]
      AUTOMÁTICO: [sim/não]
      
      Separe cada ação com ---
    `;

    const actions = await this.askAI(actionPrompt);
    console.log('📋 Ações Recomendadas:');
    console.log(actions);

    await this.parseAndExecuteActions(actions);
  }

  async parseAndExecuteActions(actionsText) {
    const actionBlocks = actionsText.split('---');

    for (const block of actionBlocks) {
      if (block.includes('AUTOMÁTICO: sim')) {
        console.log('⚙️ Executando ação automática...');
        console.log(block);
        // Implementar execução de ações específicas aqui
      }
    }
  }

  async updateDatabase(instruction) {
    const updatePrompt = `
      Como gerenciador de IA, execute a seguinte tarefa no banco de dados:
      
      "${instruction}"
      
      Confirme se a ação foi executada com sucesso.
    `;

    const response = await this.askAI(updatePrompt);
    console.log('✅ Resultado da atualização:', response);
    return response;
  }

  async getSystemStatus() {
    return await this.askAI('Forneça um resumo completo do status atual do sistema Palworld.');
  }
}

export default AIManager;