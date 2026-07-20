import AIAppController from '../utils/ai-app-controller.js';

// Inicializar controlador da aplicação com IA
const controller = new AIAppController();

process.on('uncaughtException', async (error) => {
  console.error('❌ Exceção não capturada:', error);
  await controller.handleCriticalError(error);
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
  await controller.handleCriticalError(new Error(reason));
});

// Iniciar a aplicação com verificações
(async () => {
  try {
    console.log('════════════════════════════════════════');
    console.log('   PALWORLD - SISTEMA DE IA');
    console.log('   Inicialização e Verificação de Sistema');
    console.log('════════════════════════════════════════\n');

    // Verificar credenciais
    console.log('🔐 Verificando credenciais e configurações...');
    const credentialCheck = await controller.verifyLovableIntegration();
    console.log(JSON.stringify(credentialCheck, null, 2));

    // Testar conexão com banco de dados
    console.log('\n🔌 Testando conexão com Supabase...');
    const dbStats = await controller.testDatabaseConnection();

    // Inicializar aplicação
    console.log('\n🚀 Iniciando aplicação principal...');
    await controller.initializeApp();

    // Sistema em operação
    console.log('\n════════════════════════════════════════');
    console.log('✅ SISTEMA OPERACIONAL');
    console.log('════════════════════════════════════════');
    console.log('📡 Sistema aguardando comandos e monitorando automaticamente...');
    console.log('\n💡 Próximas ações agendadas:');
    console.log('   • Verificação rápida: a cada 30 segundos');
    console.log('   • Sincronização completa: a cada 1 hora');
    console.log('   • Busca de dados: 1x ao dia (próxima em 24h)');
    console.log('   • Monitoramento de desempenho: a cada 5 minutos');
    console.log('\n📋 Para ver relatório completo do sistema, use:');
    console.log('   controller.getFullSystemReport()');
    console.log('\n════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Falha ao iniciar aplicação:', error.message);
    console.error('\n🔍 Diagnóstico:');
    console.error(error);
    process.exit(1);
  }
})();
