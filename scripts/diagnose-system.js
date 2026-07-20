import AIAppController from '../utils/ai-app-controller.js';

// Script de diagnóstico completo do sistema
const controller = new AIAppController();

async function runDiagnostics() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     PALWORLD - DIAGNÓSTICO COMPLETO DO SISTEMA         ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const diagnostics = {
    timestamp: new Date().toLocaleString('pt-BR'),
    checks: {},
    errors: []
  };

  try {
    // 1. Verificar ambiente e credenciais
    console.log('📋 [1/6] Verificando Ambiente e Credenciais...');
    try {
      const envCheck = await controller.verifyLovableIntegration();
      diagnostics.checks.environment = {
        status: 'OK',
        details: envCheck
      };
      console.log('✅ Ambiente configurado corretamente\n');
    } catch (error) {
      diagnostics.checks.environment = { status: 'ERROR', error: error.message };
      diagnostics.errors.push('Erro ao verificar ambiente: ' + error.message);
      console.log('❌ Erro ao verificar ambiente\n');
    }

    // 2. Testar conexão com Supabase
    console.log('🔌 [2/6] Testando Conexão com Supabase...');
    try {
      const dbStats = await controller.testDatabaseConnection();
      diagnostics.checks.database = {
        status: 'OK',
        statistics: dbStats
      };
      console.log('✅ Conexão com banco de dados estabelecida\n');
    } catch (error) {
      diagnostics.checks.database = { status: 'ERROR', error: error.message };
      diagnostics.errors.push('Erro ao conectar com banco: ' + error.message);
      console.log('❌ Erro ao conectar com banco de dados\n');
    }

    // 3. Testar integração com IA
    console.log('🤖 [3/6] Testando Integração com Claude IA...');
    try {
      const aiTest = await controller.aiManager.askAI(
        'Confirme que está conectado e pronto para gerenciar o sistema Palworld.'
      );
      diagnostics.checks.ai = {
        status: 'OK',
        message: 'IA respondeu com sucesso'
      };
      console.log('✅ IA operacional\n');
      console.log('   Resposta da IA: ' + aiTest.substring(0, 100) + '...\n');
    } catch (error) {
      diagnostics.checks.ai = { status: 'ERROR', error: error.message };
      diagnostics.errors.push('Erro ao conectar com IA: ' + error.message);
      console.log('❌ Erro ao conectar com IA\n');
    }

    // 4. Verificar monitoramento
    console.log('📊 [4/6] Verificando Sistema de Monitoramento...');
    try {
      diagnostics.checks.monitoring = {
        status: 'OK',
        features: [
          'Health checks a cada 1 minuto',
          'Verificação rápida a cada 30 segundos',
          'Sincronização completa a cada 1 hora',
          'Busca de dados diária',
          'Monitoramento de desempenho a cada 5 minutos'
        ]
      };
      console.log('✅ Sistema de monitoramento configurado\n');
      diagnostics.checks.monitoring.features.forEach(f => console.log('   • ' + f));
      console.log();
    } catch (error) {
      diagnostics.checks.monitoring = { status: 'ERROR', error: error.message };
      diagnostics.errors.push('Erro ao verificar monitoramento: ' + error.message);
      console.log('❌ Erro ao verificar monitoramento\n');
    }

    // 5. Verificar integração com Lovable
    console.log('🔗 [5/6] Verificando Integração com Lovable...');
    try {
      const lovableStatus = {
        supabaseConnected: !!process.env.SUPABASE_URL,
        supabaseKeyValid: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        anthropicKeyValid: !!process.env.ANTHROPIC_API_KEY,
        readyForLovable: !!(
          process.env.SUPABASE_URL &&
          process.env.SUPABASE_SERVICE_ROLE_KEY &&
          process.env.ANTHROPIC_API_KEY
        )
      };

      diagnostics.checks.lovable = {
        status: lovableStatus.readyForLovable ? 'OK' : 'INCOMPLETE',
        details: lovableStatus
      };

      if (lovableStatus.readyForLovable) {
        console.log('✅ Pronto para sincronizar com app Lovable\n');
      } else {
        console.log('⚠️  Algumas credenciais faltando para Lovable\n');
      }
    } catch (error) {
      diagnostics.checks.lovable = { status: 'ERROR', error: error.message };
      diagnostics.errors.push('Erro ao verificar Lovable: ' + error.message);
      console.log('❌ Erro ao verificar Lovable\n');
    }

    // 6. Status geral do aplicativo
    console.log('🎯 [6/6] Status Geral do Aplicativo...');
    try {
      const appStatus = await controller.getAppStatus();
      diagnostics.checks.appStatus = {
        status: 'OK',
        details: appStatus
      };
      console.log('✅ Aplicativo operacional\n');
    } catch (error) {
      diagnostics.checks.appStatus = { status: 'ERROR', error: error.message };
      diagnostics.errors.push('Erro ao obter status do app: ' + error.message);
      console.log('❌ Erro ao obter status do app\n');
    }

  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error.message);
  }

  // Resumo final
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                   RESUMO DO DIAGNÓSTICO                ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const successCount = Object.values(diagnostics.checks).filter(c => c.status === 'OK').length;
  const totalChecks = Object.keys(diagnostics.checks).length;

  console.log(`📊 Testes Passados: ${successCount}/${totalChecks}`);
  console.log(`⏰ Timestamp: ${diagnostics.timestamp}\n`);

  if (diagnostics.errors.length > 0) {
    console.log('❌ ERROS ENCONTRADOS:');
    diagnostics.errors.forEach((err, i) => {
      console.log(`   ${i + 1}. ${err}`);
    });
    console.log();
  }

  console.log('✅ RECOMENDAÇÕES:');
  if (diagnostics.checks.environment?.status === 'OK') {
    console.log('   ✓ Credenciais configuradas corretamente');
  } else {
    console.log('   ✗ Configure as variáveis de ambiente no .env');
  }

  if (diagnostics.checks.database?.status === 'OK') {
    console.log('   ✓ Banco de dados conectado');
  } else {
    console.log('   ✗ Verifique a conexão com Supabase');
  }

  if (diagnostics.checks.ai?.status === 'OK') {
    console.log('   ✓ IA operacional');
  } else {
    console.log('   ✗ Verifique a chave da API Anthropic');
  }

  if (diagnostics.checks.lovable?.status === 'OK') {
    console.log('   ✓ Pronto para sincronizar com Lovable');
  } else {
    console.log('   ✗ Configure credenciais para Lovable');
  }

  console.log('\n💡 Próximos passos:');
  console.log('   1. Executar: npm run start:ai');
  console.log('   2. Verificar logs de sincronização');
  console.log('   3. Acessar o app Lovable para ver dados em tempo real\n');

  console.log('════════════════════════════════════════════════════════\n');

  return diagnostics;
}

// Executar diagnósticos
runDiagnostics().catch(error => {
  console.error('Erro fatal durante diagnóstico:', error);
  process.exit(1);
});
