# PALWORD - Gerenciador Inteligente de Dados Palworld

## 🤖 Sistema de IA Inteligente (v2.0)

PALWORD agora possui um **sistema de IA de segunda geração** que gerencia automaticamente toda a aplicação, mantendo o banco de dados sempre atualizado e saudável com sincronização diária automática.

## ✨ Funcionalidades Principais

### 1. **AI Manager** - Gerenciador Central
- ✅ Diagnóstico inicial do sistema
- ✅ Monitoramento contínuo de saúde (a cada 1 minuto)
- ✅ Análise de integridade de dados
- ✅ Identificação automática de problemas
- ✅ Recomendação de ações corretivas
- ✅ Comunicação em linguagem natural com Claude 3.5 Sonnet

### 2. **Database Keeper** - Guardião do Banco de Dados
- ✅ Verificações rápidas a cada **30 segundos**
- ✅ Sincronização completa a cada **1 hora**
- ✅ Validação de integridade de dados
- ✅ Limpeza automática de duplicatas
- ✅ Detecção de dados desatualizados
- ✅ Monitoramento contínuo de:
  - Tabela de Pals
  - Habilidades de Parceria
  - Habilidades Passivas
  - Habilidades Ativas
  - Árvore Tecnológica
  - Pares de Reprodução
  - Localizações do Mapa

### 3. **AI Data Fetcher** - Buscador Automático de Dados ⭐ NOVO
- ✅ **Sincronização diária automática** (1x ao dia)
- ✅ Busca inteligente em palworld.gg
- ✅ Sistema de retry automático (3 tentativas)
- ✅ Atualização de 7 tipos de dados:
  - Pals (personagens)
  - Partner Skills (habilidades de parceria)
  - Passive Skills (habilidades passivas)
  - Active Skills (habilidades ativas)
  - Technology Tree (árvore tecnológica)
  - Breeding Pairs (pares de reprodução)
  - Map Locations (localizações do mapa)
- ✅ Logging automático de sincronizações

### 4. **App Controller** - Controlador da Aplicação
- ✅ Inicialização automática com IA
- ✅ Monitoramento de desempenho (a cada 5 minutos)
- ✅ Tratamento de erros críticos
- ✅ Execução de comandos via IA
- ✅ Geração de relatórios completos
- ✅ Gerenciamento geral do aplicativo
- ✅ Verificação de conexão com banco de dados
- ✅ Validação de integração com Lovable

## 🚀 Como Usar

### Instalação
```bash
npm install
```

### Configurar Variáveis de Ambiente
Crie um arquivo `.env` baseado em `.env.example`:
```bash
SUPABASE_URL=sua_url_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_serviço
ANTHROPIC_API_KEY=sua_chave_anthropic
NODE_ENV=development
DEBUG=true
```

### Executar Diagnóstico Completo
Antes de iniciar, verifique se tudo está configurado corretamente:
```bash
npm run diagnose
```

Isso vai verificar:
- ✅ Variáveis de ambiente
- ✅ Conexão com Supabase
- ✅ Conexão com Claude IA
- ✅ Sistema de monitoramento
- ✅ Integração com Lovable
- ✅ Status geral do aplicativo

### Iniciar a IA
```bash
npm run start:ai
```

Ou executar importação + IA:
```bash
npm run sync
```

## 📊 O Que a IA Faz Automaticamente

### ⏱️ Timeline de Operação

| Intervalo | Ação | Detalhes |
|-----------|------|---------|
| **Ao iniciar** | Diagnóstico completo | Verifica saúde, credenciais e conexões |
| **A cada 30s** | Verificação rápida | Identifica problemas imediatos |
| **A cada 1 min** | Health check | Análise de integridade de dados |
| **A cada 1h** | Sincronização completa | Valida, limpa e atualiza banco |
| **1x ao dia** | Busca de dados | Sincroniza com palworld.gg |
| **A cada 5min** | Monitoramento de desempenho | Coleta métricas do sistema |
| **24/7** | Gerenciamento automático | IA toma ações corretivas |

### 📋 Exemplo de Saída ao Iniciar

```
════════════════════════════════════════
   PALWORLD - SISTEMA DE IA
   Inicialização e Verificação de Sistema
════════════════════════════════════════

🔐 Verificando credenciais e configurações...
✅ Todas as credenciais configuradas corretamente
✅ Aplicação pronta para sincronizar com Lovable

🔌 Testando conexão com Supabase...
✅ Conexão com banco de dados bem-sucedida
📊 Estatísticas do banco:
{
  "pals": { "count": 150, "lastUpdated": "2026-07-20T13:00:00Z" },
  "partner_skills": { "count": 75 },
  "passive_skills": { "count": 120 },
  "active_skills": { "count": 95 },
  "technologies": { "count": 88 },
  "breeding_pairs": { "count": 340 },
  "map_locations": { "count": 25 }
}

🚀 Inicializando Aplicação com Controle por IA...
🤖 Inicializando AI Manager...
✅ AI Manager inicializado
💾 Inicializando AI Database Keeper...
✅ Database Keeper inicializado
📡 Inicializando AI Data Fetcher...
✅ AI Data Fetcher inicializado - Sincronização diária agendada

════════════════════════════════════════
✅ SISTEMA OPERACIONAL
════════════════════════════════════════

📡 Sistema aguardando comandos e monitorando automaticamente...

💡 Próximas ações agendadas:
   • Verificação rápida: a cada 30 segundos
   • Sincronização completa: a cada 1 hora
   • Busca de dados: 1x ao dia (próxima em 24h)
   • Monitoramento de desempenho: a cada 5 minutos
```

## 🔗 Integração com Lovable

O PALWORD está totalmente integrado com o app Lovable através do Supabase. Todos os dados sincronizados estão disponíveis em tempo real no app.

### Dados Sincronizados em Tempo Real:
- 📱 Pals (com rarity e elementos)
- ⚔️ Partner Skills (cooldown e descrição)
- 🛡️ Passive Skills (rarity e ícone)
- ⚡ Active Skills (power e cooldown)
- 🌳 Technology Tree (custo e descrição)
- 🥚 Breeding Pairs (pais e filhotes)
- 🗺️ Map Locations (coordenadas e type)

## 🛠️ Scripts Disponíveis

```bash
# Iniciar sistema de IA com monitoramento automático
npm run start:ai

# Executar diagnóstico completo do sistema
npm run diagnose

# Sincronizar dados manualmente (import + AI)
npm run sync

# Apenas importar dados de Pals
npm run import:pals
```

## 📊 Logs e Monitoring

Todos os eventos são registrados automaticamente no banco de dados:

### Tabelas de Log
- `ai_sync_logs` - Log de sincronizações (diárias, horárias, etc)
- `ai_health_logs` - Log de verificações de saúde do sistema

### Monitorar em Tempo Real
Acesse o Supabase e consulte:
```sql
SELECT * FROM ai_sync_logs ORDER BY timestamp DESC LIMIT 50;
SELECT * FROM ai_health_logs ORDER BY timestamp DESC LIMIT 50;
```

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────┐
│         AIAppController (Controlador)            │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┼──────────┬──────────┐
        │          │          │          │
        ▼          ▼          ▼          ▼
   AIManager  DatabaseKeeper DataFetcher  Performance
   (Monitor)  (Validator)    (Sync)       (Metrics)
   
   • Health checks    • Integrity    • Daily sync    • Resource
   • IA decisions     • Cleanup      • Web scrape    • Monitoring
   • Analysis         • Validation   • Data update   • Alerts
```

## 🔐 Segurança

- ✅ Chaves armazenadas em `.env` (nunca em git)
- ✅ Apenas service role key para operações críticas
- ✅ Supabase RLS para proteção de dados
- ✅ Logs de auditoria de todas as ações

## 📈 Estatísticas Coletadas

O sistema coleta automaticamente:
- Total de registros por tabela
- Última atualização de cada tabela
- Taxa de erro em operações
- Tempo de resposta de APIs
- Disponibilidade do sistema

## 🚀 Roadmap Futuro

- [ ] Dashboard web em tempo real
- [ ] Alertas via Discord/Telegram
- [ ] Machine learning para detecção de anomalias
- [ ] Auto-correção de dados inconsistentes
- [ ] Otimização de queries baseada em IA
- [ ] Backup automático diário
- [ ] Sincronização bidirecional com Lovable

## 🐛 Troubleshooting

### Erro: "Faltam SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY"
**Solução:** Configure o arquivo `.env` com suas credenciais do Supabase

### Erro: "Falha ao conectar com IA"
**Solução:** Verifique se `ANTHROPIC_API_KEY` está configurada corretamente

### Banco de dados não atualiza
**Solução:** Execute `npm run diagnose` para verificar conectividade

### Sincronização diária não ocorre
**Solução:** Verifique se o aplicativo está rodando 24/7. Use systemd ou PM2 para manter sempre ativo.

## 💡 Dicas

1. **Manter sempre ligado:** Use PM2 ou Docker para manter o serviço ativo 24/7
2. **Monitorar logs:** Consulte regularmente `ai_sync_logs` no Supabase
3. **Testar mudanças:** Use `npm run diagnose` antes de fazer alterações
4. **Escalar:** Aumente `this.dailySyncInterval` para sincronizar menos frequentemente

## 📞 Suporte

Para problemas ou dúvidas:
1. Consulte o README.md
2. Execute o diagnóstico: `npm run diagnose`
3. Verifique os logs no Supabase
4. Abra uma issue no GitHub

---

**PALWORLD** - Gerenciador Inteligente de Palworld com IA 🎮🤖

Última atualização: **2026-07-20**  
Versão: **2.0 - Sistema de IA Completo**
