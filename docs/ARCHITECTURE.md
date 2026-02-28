# ARCHITECTURE.md

## Arquitetura do Sistema

---

## 📐 Visão Geral

O Tab Domain Executor é construído seguindo uma **arquitetura modular baseada em camadas** com **separação estrita de responsabilidades** e **comunicação por mensagens**.

### Princípios Arquiteturais

1. **Separação de Concerns**: Cada módulo tem uma responsabilidade única e bem definida
2. **Comunicação Unidirecional**: UI nunca executa ações diretamente, apenas solicita ao background
3. **Imutabilidade de Dados**: Dados fluem em uma direção sem modificações intermediárias
4. **Fail-Safe**: Erros são tratados em cada camada sem propagar falhas catastróficas
5. **Testabilidade**: Cada módulo pode ser testado isoladamente

---

## 🏗️ Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                         USUÁRIO                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                      POPUP UI                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Componentes Visuais                                │  │
│  │  • Gerenciamento de Estado Local                      │  │
│  │  • Event Handlers                                     │  │
│  │  • Renderização de Fluxo                              │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ chrome.runtime.sendMessage()
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              MESSAGE DISPATCHER (Background)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Roteamento de Mensagens                            │  │
│  │  • Validação de Payloads                              │  │
│  │  • Orquestração de Fluxos                             │  │
│  └──────────────────────────────────────────────────────┘  │
└────────┬────────────────────────────────────┬───────────────┘
         │                                    │
         ↓                                    ↓
┌──────────────────────┐           ┌──────────────────────────┐
│  TAB READER MODULE   │           │  ACTION EXECUTOR MODULE  │
│  ┌────────────────┐  │           │  ┌────────────────────┐  │
│  │ • Query Tabs   │  │           │  │ • Close Single Tab │  │
│  │ • Get Windows  │  │           │  │ • Close Bulk Tabs  │  │
│  └────────────────┘  │           │  │ • Restore Tabs     │  │
└──────┬───────────────┘           │  └────────────────────┘  │
       │                           └──────────┬───────────────┘
       ↓                                      │
┌──────────────────────┐                      │
│ NORMALIZER MODULE    │                      │
│  ┌────────────────┐  │                      │
│  │ • Extract Domain│ │                      │
│  │ • Clean URLs    │ │                      │
│  └────────────────┘  │                      │
└──────┬───────────────┘                      │
       │                                      │
       ↓                                      ↓
┌──────────────────────┐           ┌──────────────────────────┐
│  GROUPER MODULE      │           │  RECOVERY MODULE         │
│  ┌────────────────┐  │           │  ┌────────────────────┐  │
│  │ • Group by     │  │           │  │ • Store Action     │  │
│  │   Domain       │  │           │  │ • Check TTL        │  │
│  │ • Group by     │  │           │  │ • Retrieve Log     │  │
│  │   Window       │  │           │  │ • Clear Log        │  │
│  └────────────────┘  │           │  └────────────────────┘  │
└──────────────────────┘           └──────────────────────────┘
         │                                    │
         └────────────────┬───────────────────┘
                          ↓
                ┌──────────────────────┐
                │  SHARED MODELS       │
                │  ┌────────────────┐  │
                │  │ • Types        │  │
                │  │ • Interfaces   │  │
                │  │ • Enums        │  │
                │  │ • Constants    │  │
                │  └────────────────┘  │
                └──────────────────────┘
```

---

## 🧩 Camadas e Responsabilidades

### 1. Camada de Apresentação (UI Layer)

**Responsabilidade**: Interface com o usuário

**Componentes**:
- `popup.html` - Estrutura HTML
- `popup.ts` - Lógica de controle da UI e renderização
- `state/app-state.ts` - Gerenciamento de estado local

**O que FAZ**:
- ✅ Renderiza estados visuais do fluxo
- ✅ Captura interações do usuário
- ✅ Envia mensagens para o background
- ✅ Atualiza UI com base em respostas
- ✅ Gerencia estado local da navegação (qual tela mostrar)

**O que NÃO FAZ**:
- ❌ Acessa diretamente a API `chrome.tabs`
- ❌ Executa lógica de negócio
- ❌ Persiste dados
- ❌ Fecha abas diretamente

**Comunicação**:
- Envia: Mensagens tipadas para o background
- Recebe: Respostas tipadas do background

---

### 2. Camada de Orquestração (Background Service Worker)

**Responsabilidade**: Coordenação central e roteamento

**Componentes**:
- `background.ts` - Service Worker principal
- `message-dispatcher.ts` - Roteador de mensagens

**O que FAZ**:
- ✅ Recebe mensagens do popup
- ✅ Valida payloads de mensagens
- ✅ Roteia para o módulo apropriado
- ✅ Orquestra fluxos complexos (ex: análise → normalização → agrupamento)
- ✅ Retorna respostas estruturadas para o popup
- ✅ Mantém estado em memória (recovery log)

**O que NÃO FAZ**:
- ❌ Renderiza UI
- ❌ Contém lógica de negócio específica (delega para módulos)
- ❌ Acessa DOM

**Comunicação**:
- Recebe: Mensagens do popup via `chrome.runtime.onMessage`
- Envia: Respostas via `sendResponse()`
- Chama: Módulos internos via importação direta

---

### 3. Camada de Leitura (Tab Reader Module)

**Responsabilidade**: Interação com Chrome Tabs API

**Componentes**:
- `tab-reader.ts`

**O que FAZ**:
- ✅ Consulta todas as abas abertas via `chrome.tabs.query({})`
- ✅ Obtém informações de janelas via `chrome.windows.getAll()`
- ✅ Retorna dados brutos das abas (Tab[])
- ✅ Trata erros de permissão ou API

**O que NÃO FAZ**:
- ❌ Normaliza URLs
- ❌ Agrupa abas
- ❌ Fecha abas
- ❌ Filtra ou transforma dados

**Comunicação**:
- Chamado por: Background Service Worker
- Retorna: `Promise<Tab[]>` ou `Promise<Window[]>`

---

### 4. Camada de Normalização (Normalizer Module)

**Responsabilidade**: Transformação de URLs em domínios base

**Componentes**:
- `url-normalizer.ts`

**O que FAZ**:
- ✅ Recebe uma URL completa (ex: `https://www.youtube.com/watch?v=abc`)
- ✅ Extrai o domínio base (ex: `youtube.com`)
- ✅ Remove `www.` se presente
- ✅ Trata URLs inválidas (ex: `chrome://`, `about:`)
- ✅ Retorna domínio normalizado ou null

**O que NÃO FAZ**:
- ❌ Acessa APIs do Chrome
- ❌ Agrupa dados
- ❌ Persiste informações

**Comunicação**:
- Chamado por: Background Service Worker ou Grouper Module
- Retorna: `string | null`

---

### 5. Camada de Agrupamento (Grouper Module)

**Responsabilidade**: Organização de abas por domínio e janela

**Componentes**:
- `tab-grouper.ts`

**O que FAZ**:
- ✅ Recebe array de abas com URLs normalizadas
- ✅ Agrupa abas por domínio base
- ✅ Conta abas por domínio
- ✅ Identifica janelas envolvidas por domínio
- ✅ Agrupa abas de um domínio específico por janela
- ✅ Retorna estruturas de dados organizadas

**O que NÃO FAZ**:
- ❌ Normaliza URLs (delega para Normalizer)
- ❌ Acessa APIs do Chrome
- ❌ Executa ações destrutivas

**Comunicação**:
- Chamado por: Background Service Worker
- Usa: Normalizer Module
- Retorna: Objetos estruturados (DomainGroup[], WindowGroup[], etc.)

---

### 6. Camada de Execução (Action Executor Module)

**Responsabilidade**: Execução de ações destrutivas

**Componentes**:
- `action-executor.ts`

**O que FAZ**:
- ✅ Fecha aba individual via `chrome.tabs.remove(tabId)`
- ✅ Fecha múltiplas abas via `chrome.tabs.remove(tabIds[])`
- ✅ Recria abas via `chrome.tabs.create()`
- ✅ Trata erros de execução (aba já fechada, permissão negada)
- ✅ Retorna resultado da operação (sucesso/falha)

**O que NÃO FAZ**:
- ❌ Decide quais abas fechar (recebe IDs explícitos)
- ❌ Mantém log de ações (delega para Recovery Module)
- ❌ Agrupa ou filtra abas

**Comunicação**:
- Chamado por: Background Service Worker
- Retorna: `Promise<ActionResult>`

---

### 7. Camada de Recuperação (Recovery Module)

**Responsabilidade**: Gerenciamento de log temporário para desfazer ações

**Componentes**:
- `recovery-manager.ts`

**O que FAZ**:
- ✅ Armazena em memória dados da última ação em lote
- ✅ Define timestamp da ação
- ✅ Verifica se há ação recuperável (TTL de 15 minutos)
- ✅ Retorna dados para recuperação
- ✅ Limpa log após recuperação ou expiração
- ✅ Expõe método para verificar se há log válido

**O que NÃO FAZ**:
- ❌ Persiste dados em storage/disco
- ❌ Mantém múltiplas ações
- ❌ Executa a recuperação (delega para Action Executor)
- ❌ Permite configuração de TTL

**Comunicação**:
- Chamado por: Background Service Worker
- Retorna: `RecoveryLog | null`

**Estrutura de Dados em Memória**:
```typescript
{
  tabs: { url: string, windowId: number }[],
  timestamp: number,
  ttl: 900000 // 15 minutos em ms
}
```

---

### 8. Camada de Modelos (Shared Models)

**Responsabilidade**: Contratos de dados compartilhados

**Componentes**:
- `types.ts` - Tipos TypeScript
- `interfaces.ts` - Interfaces
- `enums.ts` - Enumerações
- `constants.ts` - Constantes

**O que FAZ**:
- ✅ Define tipos de mensagens
- ✅ Define estruturas de dados
- ✅ Define estados do fluxo
- ✅ Define constantes do sistema (TTL, etc.)

**O que NÃO FAZ**:
- ❌ Contém lógica
- ❌ Executa operações

**Comunicação**:
- Usado por: Todos os módulos

---

## 🔄 Fluxo de Dados

### Fluxo 1: Análise de Abas

```
1. Usuário clica "Analisar Abas" (UI)
   ↓
2. UI envia mensagem { type: "ANALYZE_TABS" } → Background
   ↓
3. Background → Tab Reader: getAllTabs()
   ↓
4. Tab Reader retorna Tab[] brutos
   ↓
5. Background → Normalizer: normalizeUrl() para cada aba
   ↓
6. Background → Grouper: groupByDomain(tabs normalizadas)
   ↓
7. Grouper retorna DomainGroup[]
   ↓
8. Background envia resposta { domains: DomainGroup[] } → UI
   ↓
9. UI renderiza cards de domínios
```

### Fluxo 2: Seleção de Domínio e Escopo

```
1. Usuário seleciona domínio "youtube.com" (UI)
   ↓
2. UI muda estado local para "scope-selection"
   ↓
3. UI renderiza opções: "Todas as janelas" | "Escolher janelas"
   ↓
4a. Se "Todas as janelas":
    - UI envia { type: "GET_TABS_FOR_DOMAIN", domain: "youtube.com", scope: "all" } → Background
    - Background filtra todas as abas daquele domínio
    - Retorna lista completa
    
4b. Se "Escolher janelas":
    - UI envia { type: "GET_WINDOWS_FOR_DOMAIN", domain: "youtube.com" } → Background
    - Background → Grouper: groupByWindow(domain)
    - Retorna WindowGroup[]
    - UI renderiza cards de janelas
    - Usuário seleciona janelas [1, 3]
    - UI envia { type: "GET_TABS_FOR_DOMAIN", domain: "youtube.com", scope: "windows", windowIds: [1, 3] }
    - Background filtra abas do domínio nas janelas [1, 3]
    ↓
5. Background retorna lista final de abas
   ↓
6. UI renderiza lista de abas com botões de ação
```

### Fluxo 3: Execução de Fechamento em Lote

```
1. Usuário clica "Fechar todas as abas" (UI)
   ↓
2. UI envia { type: "CLOSE_BULK_TABS", tabIds: [1, 2, 3, ...] } → Background
   ↓
3. Background → Action Executor: closeTabs(tabIds)
   ↓
4. Action Executor executa chrome.tabs.remove(tabIds)
   ↓
5. Background → Recovery Module: storeAction({ urls, windowIds, timestamp })
   ↓
6. Recovery Module armazena em memória
   ↓
7. Background retorna { success: true, recoverable: true } → UI
   ↓
8. UI exibe feedback: "Abas fechadas. Você pode recuperar nos próximos 15 minutos."
```

### Fluxo 4: Recuperação

```
1. Usuário abre extensão (UI)
   ↓
2. UI envia { type: "CHECK_RECOVERY" } → Background
   ↓
3. Background → Recovery Module: hasRecoverableAction()
   ↓
4. Recovery Module verifica timestamp + TTL
   ↓
5. Se válido, retorna { recoverable: true, timeRemaining: 600000 }
   ↓
6. UI renderiza botão "Recuperar última exclusão (10 min restantes)"
   ↓
7. Usuário clica "Recuperar" (UI)
   ↓
8. UI envia { type: "RECOVER_LAST_ACTION" } → Background
   ↓
9. Background → Recovery Module: getRecoveryLog()
   ↓
10. Recovery Module retorna { tabs: [...] }
    ↓
11. Background → Action Executor: restoreTabs(tabs)
    ↓
12. Action Executor recria abas via chrome.tabs.create()
    ↓
13. Background → Recovery Module: clearLog()
    ↓
14. Background retorna { success: true, restoredCount: 12 } → UI
    ↓
15. UI exibe feedback: "12 abas recuperadas com sucesso"
```

---

## 🔐 Segurança Arquitetural

### 1. Isolamento de Responsabilidades

- UI **nunca** acessa `chrome.tabs` diretamente
- Action Executor **nunca** decide quais abas fechar
- Recovery Module **nunca** persiste além da memória

### 2. Validação em Camadas

- **UI**: Valida inputs do usuário (ex: janela selecionada existe)
- **Background**: Valida estrutura de mensagens
- **Módulos**: Validam parâmetros recebidos

### 3. Tratamento de Erros

```
UI Layer
  ↓ try/catch
Background Layer
  ↓ try/catch
Module Layer
  ↓ try/catch
Chrome API
```

Cada camada captura seus próprios erros e retorna estados de erro estruturados.

### 4. Imutabilidade de Estado

- Dados fluem em uma direção
- Módulos não modificam dados recebidos
- Novas estruturas são criadas a cada transformação

---

## 🧪 Testabilidade

### Módulos Isolados

Cada módulo pode ser testado independentemente:

```typescript
// Exemplo: Testar Normalizer
describe('URL Normalizer', () => {
  it('deve extrair domínio base', () => {
    expect(normalizeUrl('https://www.youtube.com/watch?v=123'))
      .toBe('youtube.com');
  });
});
```

### Mocks de Chrome API

Para testar módulos que dependem da Chrome API:

```typescript
// Mock chrome.tabs.query
global.chrome = {
  tabs: {
    query: jest.fn().mockResolvedValue([...]),
  },
};
```

### Testes de Integração

Testar fluxo completo mockando apenas Chrome APIs:

```
UI (real) → Background (real) → Modules (real) → Chrome API (mock)
```

---

## 📦 Estrutura de Dependências

```
UI Layer
  └─→ Shared Models

Background Layer
  ├─→ Message Dispatcher
  ├─→ Tab Reader Module
  ├─→ Normalizer Module
  ├─→ Grouper Module
  ├─→ Action Executor Module
  ├─→ Recovery Module
  └─→ Shared Models

Tab Reader Module
  └─→ Shared Models

Normalizer Module
  └─→ Shared Models

Grouper Module
  ├─→ Normalizer Module
  └─→ Shared Models

Action Executor Module
  └─→ Shared Models

Recovery Module
  └─→ Shared Models
```

**Regra**: Nenhuma dependência circular. Fluxo sempre de camadas superiores para inferiores.

---

## 🚀 Escalabilidade

### Como a Arquitetura Permite Crescimento

1. **Novos Tipos de Agrupamento**
   - Adicionar novo módulo de agrupamento
   - Não afeta módulos existentes

2. **Novas Ações Destrutivas**
   - Estender Action Executor Module
   - Adicionar novos tipos de mensagem

3. **Novas Visualizações**
   - Adicionar componentes na UI Layer
   - Background permanece inalterado

4. **Persistência Futura**
   - Adicionar Storage Module
   - Recovery Module delega persistência

---

## 📊 Métricas de Qualidade Arquitetural

- **Acoplamento**: Baixo (módulos independentes)
- **Coesão**: Alta (responsabilidade única por módulo)
- **Complexidade Ciclomática**: Baixa (funções pequenas e focadas)
- **Profundidade de Dependências**: Máximo 2 níveis
- **Testabilidade**: Alta (módulos isoláveis)

---

**Próximo**: Leia [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) para ver a estrutura detalhada de pastas e arquivos.
