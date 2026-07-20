# PALWORD - Gerenciador Inteligente de Dados Palworld

## 🤖 Sistema de IA Inteligente

PALWORD agora possui um **sistema de IA de segunda geração** que gerencia automaticamente toda a aplicação, mantendo o banco de dados sempre atualizado e saudável.

### Funcionalidades Principais

#### 1. **AI Manager** - Gerenciador Central
- Diagnóstico inicial do sistema
- Monitoramento contínuo de saúde
- Análise de integridade de dados
- Identificação automática de problemas
- Recomendação de ações corretivas
- Comunicação em linguagem natural com Claude 3.5 Sonnet

#### 2. **Database Keeper** - Guardião do Banco de Dados
- Verificações rápidas a cada 30 segundos
- Sincronização completa a cada 1 hora
- Validação de integridade de dados
- Limpeza de duplicatas
- Detecção de dados desatualizados
- Monitoramento contínuo:
  - Tabela de Pals
  - Habilidades de Parceria
  - Habilidades Passivas
  - Habilidades Ativas
  - Árvore Tecnológica
  - Pares de Reprodução
  - Localizações do Mapa

#### 3. **App Controller** - Controlador da Aplicação
- Inicialização automática com IA
- Monitoramento de desempenho (a cada 5 minutos)
- Tratamento de erros críticos
- Execução de comandos via IA
- Geração de relatórios completos
- Gerenciamento geral do aplicativo

### Como Usar

#### Instalação
```bash
npm install
```

#### Configurar Variáveis de Ambiente
Crie um arquivo `.env` baseado em `.env.example`:
```bash
SUPABASE_URL=sua_url_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_serviço
ANTHROPIC_API_KEY=sua_chave_anthropic
```

#### Iniciar a IA
```bash
npm run start:ai
```

Ou executar importação + IA:
```bash
npm run sync
```

### O Que a IA Faz Automaticamente

1. **Ao Iniciar:**
   - Diagnostica o sistema
   - Verifica saúde do banco de dados
   - Gera relatório de status

2. **A Cada 30 Segundos:**
   - Verifica problemas no banco
   - Identifica dados faltando
   - Detecta inconsistências

3. **A Cada 1 Hora:**
   - Sincroniza completo do banco
   - Valida integridade dos dados
   - Limpa duplicatas
   - Identifica dados desatualizados
   - Sugere ações de atualização

4. **A Cada 5 Minutos:**
   - Monitora desempenho
   - Coleta métricas do sistema
   - Atualiza estado da aplicação

### Exemplos de Comandos via IA

```javascript
import AIAppController from './utils/ai-app-controller.js';

const controller = new AIAppController();
await controller.initializeApp();

// Executar comando
const result = await controller.executeAICommand(
  'Analise os Pals mais raros e sugira estratégias de reprodução'
);

// Obter relatório
const report = await controller.getFullSystemReport();
```

### Logs e Monitoring

Todos os eventos são registrados no banco de dados:
- `ai_sync_logs` - Log de sincronizações
- `ai_health_logs` - Log de verificações de saúde

### Estrutura da IA

```
utils/
├── ai-manager.js           # Gerenciador central de IA
├── ai-database-keeper.js   # Guardião automático do banco
└── ai-app-controller.js    # Controlador geral da app

scripts/
└── start-ai-controller.js  # Script de inicialização
```

### Tecnologias Utilizadas

- **Claude 3.5 Sonnet** - IA inteligente para análise e decisões
- **Supabase** - Banco de dados em tempo real
- **Node.js** - Runtime JavaScript
- **Anthropic SDK** - API da IA

### Status do Sistema

A IA mantém track de:
- ✅ Saúde do banco de dados
- ✅ Integridade de dados
- ✅ Desempenho da aplicação
- ✅ Erros e problemas
- ✅ Ações executadas
- ✅ Recomendações futuras

### Roadmap Futuro

- [ ] Integração com GitHub Actions para sincronização automática
- [ ] Dashboard web para visualização em tempo real
- [ ] Alertas via Discord/Telegram
- [ ] Machine learning para previsão de dados faltando
- [ ] Auto-correção de dados inconsistentes
- [ ] Otimização de queries baseada em IA

---

**PALWORD** - Gerenciador Inteligente de Palworld 🎮🤖
