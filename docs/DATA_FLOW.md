# DATA_FLOW.md

## Fluxo de Dados do Sistema

---

## 📋 Visão Geral

Este documento descreve **detalhadamente** como os dados fluem através do Tab Domain Executor, desde a interação do usuário até a execução de ações e retorno de resultados.

Cada fluxo é documentado com:
- **Diagrama de sequência**
- **Dados trafegados em cada etapa**
- **Transformações aplicadas**
- **Responsáveis por cada operação**

---

## 🎯 Princípios de Fluxo de Dados

### 1. Unidirecional
Os dados fluem sempre em uma direção clara:
```
UI → Background → Módulos → Chrome API
Chrome API → Módulos → Background → UI
```

### 2. Imutabilidade
- Dados recebidos nunca são modificados diretamente
- Cada transformação cria novos objetos
- Estado anterior é preservado

### 3. Transformação em Camadas
```
Chrome Tab (nativo) 
  → Tab (normalizado) 
  → DomainGroup (agrupado) 
  → UI Display
```

### 4. Tipagem Forte
- Cada etapa do fluxo tem tipos bem definidos
- Validação em cada camada
- Type guards para segurança

---

## 🔄 Fluxos Principais

---

## FLUXO 1: Análise Inicial de Abas

### Objetivo
Coletar todas as abas abertas, normalizar URLs, agrupar por domínio e exibir cards de domínios.

### Diagrama de Sequência

```
┌─────┐         ┌──────────┐         ┌────────────┐         ┌────────────┐         ┌─────────────┐         ┌──────────┐
│ UI  │         │ Message  │         │ Tab Reader │         │ Normalizer │         │   Grouper   │         │ Chrome   │
│     │         │Dispatcher│         │            │         │            │         │             │         │   API    │
└──┬──┘         └────┬─────┘         └─────┬──────┘         └─────┬──────┘         └──────┬──────┘         └────┬─────┘
   │                 │                     │                      │                        │                     │
   │ 1. Clique       │                     │                      │                        │                     │
   │ "Analisar Abas" │                     │                      │                        │                     │
   │─────────────────>                     │                      │                        │                     │
   │                 │                     │                      │                        │                     │
   │ 2. sendMessage  │                     │                      │                        │                     │
   │ AnalyzeTabsMsg  │                     │                      │                        │                     │
   │─────────────────>                     │                      │                        │                     │
   │                 │                     │                      │                        │                     │
   │                 │ 3. Roteia           │                      │                        │                     │
   │                 │────────────────────>│                      │                        │                     │
   │                 │                     │                      │                        │                     │
   │                 │                     │ 4. getAllTabs()      │                        │                     │
   │                 │                     │──────────────────────────────────────────────────────────────────────>│
   │                 │                     │                      │                        │                     │
   │                 │                     │ 5. chrome.tabs.Tab[] │                        │                     │
   │                 │                     │<──────────────────────────────────────────────────────────────────────│
   │                 │                     │                      │                        │                     │
   │                 │                     │ 6. Para cada tab:    │                        │                     │
   │                 │                     │    normalizeUrl()    │                        │                     │
   │                 │                     │─────────────────────>│                        │                     │
   │                 │                     │                      │                        │                     │
   │                 │                     │ 7. domain string     │                        │                     │
   │                 │                     │<─────────────────────│                        │                     │
   │                 │                     │                      │                        │                     │
   │                 │                     │ 8. Tab[] (normalized)│                        │                     │
   │                 │                     │──────────────────────────────────────────────>│                     │
   │                 │                     │                      │                        │                     │
   │                 │                     │                      │    9. groupByDomain()  │                     │
   │                 │                     │                      │                        │                     │
   │                 │                     │                      │ 10. DomainGroup[]      │                     │
   │                 │                     │<──────────────────────────────────────────────│                     │
   │                 │                     │                      │                        │                     │
   │                 │ 11. DomainGroup[]   │                      │                        │                     │
   │                 │<────────────────────│                      │                        │                     │
   │                 │                     │                      │                        │                     │
   │ 12. Response    │                     │                      │                        │                     │
   │ { domains: [...]}                     │                      │                        │                     │
   │<─────────────────                     │                      │                        │                     │
   │                 │                     │                      │                        │                     │
   │ 13. Renderiza   │                     │                      │                        │                     │
   │ Cards           │                     │                      │                        │                     │
   │                 │                     │                      │                        │                     │
```

### Dados em Cada Etapa

#### Etapa 1-2: UI → Background

**Mensagem Enviada**:
```typescript
{
  type: MessageType.ANALYZE_TABS,
  timestamp: 1737123456789
}
```

**Estado da UI**:
```typescript
{
  currentFlow: FlowState.LOADING_ANALYSIS,
  isLoading: true
}
```

---

#### Etapa 4-5: Tab Reader → Chrome API

**Dados Retornados (chrome.tabs.Tab[])**:
```typescript
[
  {
    id: 1,
    windowId: 1,
    url: "https://www.youtube.com/watch?v=abc",
    title: "Video 1 - YouTube",
    favIconUrl: "https://youtube.com/favicon.ico",
    active: true,
    index: 0
  },
  {
    id: 2,
    windowId: 1,
    url: "https://github.com/user/repo",
    title: "Repository - GitHub",
    favIconUrl: "https://github.com/favicon.ico",
    active: false,
    index: 1
  },
  {
    id: 3,
    windowId: 2,
    url: "https://www.youtube.com/watch?v=def",
    title: "Video 2 - YouTube",
    favIconUrl: "https://youtube.com/favicon.ico",
    active: true,
    index: 0
  }
  // ... mais abas
]
```

---

#### Etapa 6-7: Normalizer

**Entrada**: `"https://www.youtube.com/watch?v=abc"`

**Processamento**:
```typescript
function normalizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    let domain = parsed.hostname;
    
    // Remove www.
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    
    // Ignora URLs internas do Chrome
    if (url.startsWith('chrome://') || url.startsWith('about:')) {
      return null;
    }
    
    return domain; // "youtube.com"
  } catch {
    return null;
  }
}
```

**Saída**: `"youtube.com"`

---

#### Etapa 8: Tab[] Normalizado

**Dados Transformados**:
```typescript
[
  {
    id: 1,
    windowId: 1,
    url: "https://www.youtube.com/watch?v=abc",
    title: "Video 1 - YouTube",
    favIconUrl: "https://youtube.com/favicon.ico",
    domain: "youtube.com", // ← ADICIONADO
    active: true,
    index: 0
  },
  {
    id: 2,
    windowId: 1,
    url: "https://github.com/user/repo",
    title: "Repository - GitHub",
    favIconUrl: "https://github.com/favicon.ico",
    domain: "github.com", // ← ADICIONADO
    active: false,
    index: 1
  },
  {
    id: 3,
    windowId: 2,
    url: "https://www.youtube.com/watch?v=def",
    title: "Video 2 - YouTube",
    favIconUrl: "https://youtube.com/favicon.ico",
    domain: "youtube.com", // ← ADICIONADO
    active: true,
    index: 0
  }
]
```

---

#### Etapa 9-10: Grouper

**Entrada**: Tab[] normalizado

**Processamento**:
```typescript
function groupByDomain(tabs: Tab[]): DomainGroup[] {
  const groups = new Map<string, Tab[]>();
  
  // Agrupar abas por domínio
  for (const tab of tabs) {
    if (!tab.domain) continue;
    
    if (!groups.has(tab.domain)) {
      groups.set(tab.domain, []);
    }
    groups.get(tab.domain)!.push(tab);
  }
  
  // Converter para DomainGroup[]
  const domainGroups: DomainGroup[] = [];
  
  for (const [domain, domainTabs] of groups) {
    const windowIds = [...new Set(domainTabs.map(t => t.windowId))];
    
    domainGroups.push({
      domain,
      tabCount: domainTabs.length,
      windowCount: windowIds.length,
      windowIds,
      tabs: domainTabs
    });
  }
  
  // Ordenar por quantidade de abas (maior primeiro)
  return domainGroups.sort((a, b) => b.tabCount - a.tabCount);
}
```

**Saída**:
```typescript
[
  {
    domain: "youtube.com",
    tabCount: 2,
    windowCount: 2,
    windowIds: [1, 2],
    tabs: [/* Tab 1, Tab 3 */]
  },
  {
    domain: "github.com",
    tabCount: 1,
    windowCount: 1,
    windowIds: [1],
    tabs: [/* Tab 2 */]
  }
]
```

---

#### Etapa 12: Background → UI

**Resposta**:
```typescript
{
  success: true,
  domains: [
    {
      domain: "youtube.com",
      tabCount: 2,
      windowCount: 2,
      windowIds: [1, 2]
      // Nota: tabs[] não são enviadas para economizar payload
    },
    {
      domain: "github.com",
      tabCount: 1,
      windowCount: 1,
      windowIds: [1]
    }
  ]
}
```

---

#### Etapa 13: UI Renderiza

**Estado Atualizado**:
```typescript
{
  currentFlow: FlowState.DOMAIN_VIEW,
  domains: [/* DomainGroup[] recebidos */],
  isLoading: false
}
```

**Renderização**:
```html
<div class="domain-card">
  <h3>youtube.com</h3>
  <p>2 abas em 2 janelas</p>
  <button>Ver detalhes</button>
</div>

<div class="domain-card">
  <h3>github.com</h3>
  <p>1 aba em 1 janela</p>
  <button>Ver detalhes</button>
</div>
```

---

## FLUXO 2: Seleção de Domínio e Escopo

### Objetivo
Usuário seleciona um domínio e define o escopo (todas janelas ou escolher janelas).

### Diagrama de Sequência

```
┌─────┐         ┌──────────┐         ┌─────────────┐
│ UI  │         │ Message  │         │   Grouper   │
│     │         │Dispatcher│         │             │
└──┬──┘         └────┬─────┘         └──────┬──────┘
   │                 │                      │
   │ 1. Clique       │                      │
   │ "youtube.com"   │                      │
   │─────────────────>                      │
   │                 │                      │
   │ 2. Mudança de   │                      │
   │ estado local    │                      │
   │ (SCOPE_SELECTION)                      │
   │                 │                      │
   │ 3a. Clique      │                      │
   │ "Todas janelas" │                      │
   │─────────────────>                      │
   │                 │                      │
   │                 │ 4a. GetTabsForDomain │
   │                 │     scope: 'all'     │
   │                 │─────────────────────>│
   │                 │                      │
   │                 │ 5a. Tab[] filtradas  │
   │                 │<─────────────────────│
   │                 │                      │
   │ 6a. Resposta    │                      │
   │ { tabs: [...] } │                      │
   │<─────────────────                      │
   │                 │                      │
   │ 7a. Renderiza   │                      │
   │ lista de abas   │                      │
   │                 │                      │
   │        OU       │                      │
   │                 │                      │
   │ 3b. Clique      │                      │
   │ "Escolher       │                      │
   │  janelas"       │                      │
   │─────────────────>                      │
   │                 │                      │
   │                 │ 4b. GetWindowsForDomain
   │                 │─────────────────────>│
   │                 │                      │
   │                 │ 5b. WindowGroup[]    │
   │                 │<─────────────────────│
   │                 │                      │
   │ 6b. Resposta    │                      │
   │ { windows: [...]}                      │
   │<─────────────────                      │
   │                 │                      │
   │ 7b. Renderiza   │                      │
   │ cards janelas   │                      │
   │                 │                      │
```

### Caminho 3a: "Todas as Janelas"

#### Mensagem Enviada

```typescript
{
  type: MessageType.GET_TABS_FOR_DOMAIN,
  payload: {
    domain: "youtube.com",
    scope: "all"
  }
}
```

#### Processamento no Grouper

```typescript
function filterTabsByScope(
  tabs: Tab[], 
  domain: string, 
  scope: TabScope, 
  windowIds?: number[]
): Tab[] {
  // Filtrar por domínio
  let filtered = tabs.filter(t => t.domain === domain);
  
  // Se scope === 'windows', filtrar também por janelas
  if (scope === 'windows' && windowIds) {
    filtered = filtered.filter(t => windowIds.includes(t.windowId));
  }
  
  return filtered;
}
```

#### Resposta

```typescript
{
  success: true,
  tabs: [
    {
      id: 1,
      windowId: 1,
      url: "https://www.youtube.com/watch?v=abc",
      title: "Video 1 - YouTube",
      domain: "youtube.com",
      // ...
    },
    {
      id: 3,
      windowId: 2,
      url: "https://www.youtube.com/watch?v=def",
      title: "Video 2 - YouTube",
      domain: "youtube.com",
      // ...
    }
  ]
}
```

---

### Caminho 3b: "Escolher Janelas"

#### Mensagem Enviada

```typescript
{
  type: MessageType.GET_WINDOWS_FOR_DOMAIN,
  payload: {
    domain: "youtube.com"
  }
}
```

#### Processamento no Grouper

```typescript
function groupByWindow(tabs: Tab[], domain: string): WindowGroup[] {
  // Filtrar abas do domínio
  const domainTabs = tabs.filter(t => t.domain === domain);
  
  // Agrupar por janela
  const windows = new Map<number, Tab[]>();
  
  for (const tab of domainTabs) {
    if (!windows.has(tab.windowId)) {
      windows.set(tab.windowId, []);
    }
    windows.get(tab.windowId)!.push(tab);
  }
  
  // Converter para WindowGroup[]
  const windowGroups: WindowGroup[] = [];
  
  for (const [windowId, windowTabs] of windows) {
    windowGroups.push({
      windowId,
      windowTitle: `Janela ${windowId}`,
      domain,
      tabCount: windowTabs.length,
      tabs: windowTabs,
      selected: false
    });
  }
  
  return windowGroups.sort((a, b) => b.tabCount - a.tabCount);
}
```

#### Resposta

```typescript
{
  success: true,
  windows: [
    {
      windowId: 1,
      windowTitle: "Janela 1",
      domain: "youtube.com",
      tabCount: 1,
      selected: false
    },
    {
      windowId: 2,
      windowTitle: "Janela 2",
      domain: "youtube.com",
      tabCount: 1,
      selected: false
    }
  ]
}
```

#### UI Atualiza Estado

```typescript
{
  currentFlow: FlowState.WINDOW_SELECTION,
  windows: [/* WindowGroup[] recebidos */],
  selectedWindowIds: []
}
```

#### Usuário Seleciona Janelas

**Ação**: Usuário clica nas janelas 1 e 2

**Estado Atualizado**:
```typescript
{
  selectedWindowIds: [1, 2]
}
```

#### Usuário Confirma Seleção

**Mensagem Enviada**:
```typescript
{
  type: MessageType.GET_TABS_FOR_DOMAIN,
  payload: {
    domain: "youtube.com",
    scope: "windows",
    windowIds: [1, 2]
  }
}
```

**Resposta**: Mesma estrutura do caminho 3a, mas filtrada pelas janelas selecionadas

---

## FLUXO 3: Fechamento Individual de Aba

### Objetivo
Fechar uma única aba imediatamente.

### Diagrama de Sequência

```
┌─────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│ UI  │         │ Message  │         │ Executor │         │ Chrome   │
│     │         │Dispatcher│         │          │         │   API    │
└──┬──┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
   │                 │                    │                    │
   │ 1. Clique       │                    │                    │
   │ "Fechar aba #1" │                    │                    │
   │─────────────────>                    │                    │
   │                 │                    │                    │
   │ 2. sendMessage  │                    │                    │
   │ CloseSingleTab  │                    │                    │
   │─────────────────>                    │                    │
   │                 │                    │                    │
   │                 │ 3. Roteia          │                    │
   │                 │───────────────────>│                    │
   │                 │                    │                    │
   │                 │                    │ 4. closeSingleTab() │
   │                 │                    │───────────────────>│
   │                 │                    │                    │
   │                 │                    │ 5. chrome.tabs     │
   │                 │                    │    .remove(1)      │
   │                 │                    │                    │
   │                 │                    │ 6. void            │
   │                 │                    │<───────────────────│
   │                 │                    │                    │
   │                 │ 7. ActionResult    │                    │
   │                 │<───────────────────│                    │
   │                 │                    │                    │
   │ 8. Response     │                    │                    │
   │ { success: true }                    │                    │
   │<─────────────────                    │                    │
   │                 │                    │                    │
   │ 9. Remove da    │                    │                    │
   │ lista visual    │                    │                    │
   │                 │                    │                    │
```

### Dados em Cada Etapa

#### Mensagem

```typescript
{
  type: MessageType.CLOSE_SINGLE_TAB,
  payload: {
    tabId: 1
  }
}
```

#### Executor

```typescript
async function closeSingleTab(tabId: number): Promise<ActionResult> {
  try {
    await chrome.tabs.remove(tabId);
    
    return {
      success: true,
      data: { tabId }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

#### Resposta

```typescript
{
  success: true,
  tabId: 1
}
```

#### UI Atualiza

```typescript
// Remove a aba da lista local
state.tabs = state.tabs.filter(t => t.id !== 1);
```

**Nota Importante**: Fechamento individual **NÃO** é recuperável.

---

## FLUXO 4: Fechamento em Lote

### Objetivo
Fechar múltiplas abas de uma vez e armazenar log para recuperação.

### Diagrama de Sequência

```
┌─────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│ UI  │         │ Message  │         │ Executor │         │ Recovery │         │ Chrome   │
│     │         │Dispatcher│         │          │         │          │         │   API    │
└──┬──┘         └────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
   │                 │                    │                    │                    │
   │ 1. Clique       │                    │                    │                    │
   │ "Fechar todas"  │                    │                    │                    │
   │─────────────────>                    │                    │                    │
   │                 │                    │                    │                    │
   │ 2. sendMessage  │                    │                    │                    │
   │ CloseBulkTabs   │                    │                    │                    │
   │─────────────────>                    │                    │                    │
   │                 │                    │                    │                    │
   │                 │ 3. Roteia          │                    │                    │
   │                 │───────────────────>│                    │                    │
   │                 │                    │                    │                    │
   │                 │                    │ 4. closeBulkTabs() │                    │
   │                 │                    │───────────────────────────────────────>│
   │                 │                    │                    │                    │
   │                 │                    │ 5. chrome.tabs     │                    │
   │                 │                    │    .remove([...])  │                    │
   │                 │                    │                    │                    │
   │                 │                    │ 6. void            │                    │
   │                 │                    │<───────────────────────────────────────│
   │                 │                    │                    │                    │
   │                 │ 7. storeRecoveryLog()                   │                    │
   │                 │────────────────────────────────────────>│                    │
   │                 │                    │                    │                    │
   │                 │                    │ 8. RecoveryLog     │                    │
   │                 │                    │    armazenado      │                    │
   │                 │                    │    em memória      │                    │
   │                 │                    │                    │                    │
   │                 │ 9. void            │                    │                    │
   │                 │<────────────────────────────────────────│                    │
   │                 │                    │                    │                    │
   │                 │ 10. ActionResult   │                    │                    │
   │                 │<───────────────────│                    │                    │
   │                 │                    │                    │                    │
   │ 11. Response    │                    │                    │                    │
   │ { success, ...} │                    │                    │                    │
   │<─────────────────                    │                    │                    │
   │                 │                    │                    │                    │
   │ 12. Exibe       │                    │                    │                    │
   │ feedback        │                    │                    │                    │
   │                 │                    │                    │                    │
```

### Dados em Cada Etapa

#### Etapa 2: Mensagem Enviada

```typescript
{
  type: MessageType.CLOSE_BULK_TABS,
  payload: {
    tabIds: [1, 3, 5, 7],
    tabs: [
      { url: "https://youtube.com/watch?v=abc", windowId: 1, title: "Video 1" },
      { url: "https://youtube.com/watch?v=def", windowId: 2, title: "Video 2" },
      { url: "https://youtube.com/watch?v=ghi", windowId: 1, title: "Video 3" },
      { url: "https://youtube.com/watch?v=jkl", windowId: 2, title: "Video 4" }
    ]
  }
}
```

**Nota**: A UI envia tanto os IDs (para fechamento) quanto os dados mínimos (para recuperação).

---

#### Etapa 4-6: Executor

```typescript
async function closeBulkTabs(tabIds: number[]): Promise<ActionResult> {
  try {
    await chrome.tabs.remove(tabIds);
    
    return {
      success: true,
      data: { closedCount: tabIds.length }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

---

#### Etapa 7-9: Recovery Module

```typescript
let recoveryLog: RecoveryLog | null = null;

function storeRecoveryLog(tabs: TabMinimal[]): void {
  recoveryLog = {
    tabs,
    timestamp: Date.now(),
    ttl: RECOVERY_TTL_MS // 15 minutos
  };
  
  // Opcional: Agendar limpeza automática
  setTimeout(() => {
    if (recoveryLog && Date.now() - recoveryLog.timestamp >= recoveryLog.ttl) {
      recoveryLog = null;
    }
  }, RECOVERY_TTL_MS);
}
```

**Log Armazenado**:
```typescript
{
  tabs: [
    { url: "https://youtube.com/watch?v=abc", windowId: 1, title: "Video 1" },
    { url: "https://youtube.com/watch?v=def", windowId: 2, title: "Video 2" },
    { url: "https://youtube.com/watch?v=ghi", windowId: 1, title: "Video 3" },
    { url: "https://youtube.com/watch?v=jkl", windowId: 2, title: "Video 4" }
  ],
  timestamp: 1737123456789,
  ttl: 900000
}
```

---

#### Etapa 11: Resposta

```typescript
{
  success: true,
  closedCount: 4,
  recoverable: true
}
```

---

#### Etapa 12: UI Exibe Feedback

```typescript
// Estado atualizado
state.currentFlow = FlowState.ACTION_FEEDBACK;
state.tabs = []; // Lista vazia

// Mensagem exibida
"4 abas fechadas com sucesso. Você pode recuperar nos próximos 15 minutos."
```

---

## FLUXO 5: Verificação de Recuperação

### Objetivo
Verificar se há ação recuperável ao abrir a extensão.

### Diagrama de Sequência

```
┌─────┐         ┌──────────┐         ┌──────────┐
│ UI  │         │ Message  │         │ Recovery │
│     │         │Dispatcher│         │          │
└──┬──┘         └────┬─────┘         └────┬─────┘
   │                 │                    │
   │ 1. Popup abre   │                    │
   │─────────────────>                    │
   │                 │                    │
   │ 2. sendMessage  │                    │
   │ CheckRecovery   │                    │
   │─────────────────>                    │
   │                 │                    │
   │                 │ 3. Roteia          │
   │                 │───────────────────>│
   │                 │                    │
   │                 │                    │ 4. hasRecoverableAction()
   │                 │                    │
   │                 │                    │ 5. Verifica TTL
   │                 │                    │    now - timestamp < ttl?
   │                 │                    │
   │                 │ 6. RecoveryStatus  │
   │                 │<───────────────────│
   │                 │                    │
   │ 7. Response     │                    │
   │ { recoverable,  │                    │
   │   timeRemaining }                    │
   │<─────────────────                    │
   │                 │                    │
   │ 8. Renderiza    │                    │
   │ botão se        │                    │
   │ recoverable     │                    │
   │                 │                    │
```

### Dados em Cada Etapa

#### Mensagem

```typescript
{
  type: MessageType.CHECK_RECOVERY
}
```

---

#### Recovery Module

```typescript
function hasRecoverableAction(): RecoveryStatus {
  if (!recoveryLog) {
    return {
      isRecoverable: false,
      timeRemaining: 0,
      tabCount: 0,
      expiresAt: 0
    };
  }
  
  const now = Date.now();
  const elapsed = now - recoveryLog.timestamp;
  const remaining = recoveryLog.ttl - elapsed;
  
  if (remaining <= 0) {
    // Log expirado, limpar
    recoveryLog = null;
    
    return {
      isRecoverable: false,
      timeRemaining: 0,
      tabCount: 0,
      expiresAt: 0
    };
  }
  
  return {
    isRecoverable: true,
    timeRemaining: remaining,
    tabCount: recoveryLog.tabs.length,
    expiresAt: recoveryLog.timestamp + recoveryLog.ttl
  };
}
```

---

#### Resposta (Caso Recuperável)

```typescript
{
  success: true,
  recoverable: true,
  timeRemaining: 600000, // 10 minutos em ms
  tabCount: 4
}
```

#### Resposta (Caso Não Recuperável)

```typescript
{
  success: true,
  recoverable: false
}
```

---

#### UI Renderiza Condicionalmente

**Se recoverable === true**:
```html
<button id="recover-btn">
  Recuperar última exclusão (4 abas, 10 min restantes)
</button>
```

**Se recoverable === false**:
```html
<!-- Botão não é renderizado -->
```

---

## FLUXO 6: Recuperação de Abas

### Objetivo
Restaurar abas fechadas na última ação em lote.

### Diagrama de Sequência

```
┌─────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│ UI  │         │ Message  │         │ Recovery │         │ Executor │         │ Chrome   │
│     │         │Dispatcher│         │          │         │          │         │   API    │
└──┬──┘         └────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
   │                 │                    │                    │                    │
   │ 1. Clique       │                    │                    │                    │
   │ "Recuperar"     │                    │                    │                    │
   │─────────────────>                    │                    │                    │
   │                 │                    │                    │                    │
   │ 2. sendMessage  │                    │                    │                    │
   │ RecoverLastAction                    │                    │                    │
   │─────────────────>                    │                    │                    │
   │                 │                    │                    │                    │
   │                 │ 3. Roteia          │                    │                    │
   │                 │───────────────────>│                    │                    │
   │                 │                    │                    │                    │
   │                 │                    │ 4. getRecoveryLog()│                    │
   │                 │                    │                    │                    │
   │                 │ 5. RecoveryLog     │                    │                    │
   │                 │<───────────────────│                    │                    │
   │                 │                    │                    │                    │
   │                 │ 6. restoreTabs()   │                    │                    │
   │                 │────────────────────────────────────────>│                    │
   │                 │                    │                    │                    │
   │                 │                    │                    │ 7. Para cada tab:  │
   │                 │                    │                    │ chrome.tabs.create()│
   │                 │                    │                    │───────────────────>│
   │                 │                    │                    │                    │
   │                 │                    │                    │ 8. Tab criada      │
   │                 │                    │                    │<───────────────────│
   │                 │                    │                    │                    │
   │                 │ 9. ActionResult    │                    │                    │
   │                 │<────────────────────────────────────────│                    │
   │                 │                    │                    │                    │
   │                 │ 10. clearLog()     │                    │                    │
   │                 │───────────────────>│                    │                    │
   │                 │                    │                    │                    │
   │                 │                    │ 11. recoveryLog = null                  │
   │                 │                    │                    │                    │
   │                 │ 12. void           │                    │                    │
   │                 │<───────────────────│                    │                    │
   │                 │                    │                    │                    │
   │ 13. Response    │                    │                    │                    │
   │ { success,      │                    │                    │                    │
   │   restoredCount }                    │                    │                    │
   │<─────────────────                    │                    │                    │
   │                 │                    │                    │                    │
   │ 14. Exibe       │                    │                    │                    │
   │ feedback        │                    │                    │                    │
   │                 │                    │                    │                    │
```

### Dados em Cada Etapa

#### Mensagem

```typescript
{
  type: MessageType.RECOVER_LAST_ACTION
}
```

---

#### Recovery Module: getRecoveryLog()

```typescript
function getRecoveryLog(): RecoveryLog | null {
  if (!recoveryLog) return null;
  
  // Verificar se ainda é válido
  const now = Date.now();
  const elapsed = now - recoveryLog.timestamp;
  
  if (elapsed >= recoveryLog.ttl) {
    recoveryLog = null;
    return null;
  }
  
  return recoveryLog;
}
```

**Retorno**:
```typescript
{
  tabs: [
    { url: "https://youtube.com/watch?v=abc", windowId: 1, title: "Video 1" },
    { url: "https://youtube.com/watch?v=def", windowId: 2, title: "Video 2" },
    { url: "https://youtube.com/watch?v=ghi", windowId: 1, title: "Video 3" },
    { url: "https://youtube.com/watch?v=jkl", windowId: 2, title: "Video 4" }
  ],
  timestamp: 1737123456789,
  ttl: 900000
}
```

---

#### Executor: restoreTabs()

```typescript
async function restoreTabs(tabs: TabMinimal[]): Promise<ActionResult> {
  try {
    let restoredCount = 0;
    
    for (const tab of tabs) {
      await chrome.tabs.create({
        url: tab.url,
        windowId: tab.windowId,
        active: false
      });
      restoredCount++;
    }
    
    return {
      success: true,
      data: { restoredCount }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

---

#### Recovery Module: clearLog()

```typescript
function clearRecoveryLog(): void {
  recoveryLog = null;
}
```

---

#### Resposta

```typescript
{
  success: true,
  restoredCount: 4
}
```

---

#### UI Exibe Feedback

```typescript
state.currentFlow = FlowState.ACTION_FEEDBACK;

// Mensagem exibida
"4 abas restauradas com sucesso."
```

---

## 📊 Resumo de Transformações de Dados

```
chrome.tabs.Tab (nativo)
  ↓ [Tab Reader]
chrome.tabs.Tab[]
  ↓ [Normalizer - adiciona domain]
Tab[]
  ↓ [Grouper]
DomainGroup[]
  ↓ [UI renderiza]
Cards de Domínio

Seleção de Domínio
  ↓
WindowGroup[] (se "Escolher janelas")
  OU
Tab[] (se "Todas janelas")
  ↓ [UI renderiza]
Lista de Abas

Fechamento em Lote
  ↓ [Executor]
chrome.tabs.remove()
  ↓ [Recovery]
RecoveryLog (TabMinimal[])
  ↓ [Executor - recuperação]
chrome.tabs.create()
```

---

## ✅ Validações em Cada Camada

### UI Layer
- ✅ Verifica se domínio foi selecionado
- ✅ Verifica se janelas foram selecionadas (quando aplicável)
- ✅ Valida que há abas para fechar

### Background Layer
- ✅ Valida tipo de mensagem
- ✅ Valida estrutura de payload
- ✅ Valida domínio não vazio

### Module Layer
- ✅ Valida URLs antes de normalizar
- ✅ Valida IDs de abas existem
- ✅ Valida TTL não expirou

---

**Próximo**: Leia [MODULES.md](./MODULES.md) para ver a descrição detalhada de cada módulo, suas responsabilidades e limites.
