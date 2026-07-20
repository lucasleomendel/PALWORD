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

// Iniciar a aplicação
(async () => {
  try {
    await controller.initializeApp();

    // Manter a aplicação rodando
    console.log('\n📡 Sistema aguardando comandos e monitorando automaticamente...');
  } catch (error) {
    console.error('❌ Falha ao iniciar aplicação:', error.message);
    process.exit(1);
  }
})();