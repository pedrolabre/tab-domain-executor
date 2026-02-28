# MODULES.md

## Descrição Detalhada dos Módulos

---

## 📋 Visão Geral

Este documento descreve cada módulo do sistema, definindo claramente:
- **Responsabilidade única** do módulo
- **Funções públicas** expostas
- **Dependências** de outros módulos
- **Limites e restrições** do que o módulo NÃO faz
- **Exemplos de uso**

---

## 🗂️ Índice de Módulos

1. [Background Service Worker](#1-background-service-worker)
2. [Message Dispatcher](#2-message-dispatcher)
3. [Tab Reader Module](#3-tab-reader-module)
4. [URL Normalizer Module](#4-url-normalizer-module)
5. [Tab Grouper Module](#5-tab-grouper-module)
6. [Action Executor Module](#6-action-executor-module)
7. [Recovery Manager Module](#7-recovery-manager-module)
8. [Popup UI](#8-popup-ui)
9. [State Manager](#9-state-manager)

---

## 1. Background Service Worker

### 📍 Localização
`src/background/background.ts`

### 🎯 Responsabilidade
Entry point do service worker. Inicializa o sistema e registra listeners para mensagens do popup.

### 📦 Funções Públicas

#### `init()`
```typescript
/**
 * Inicializa o service worker
 * Registra listeners de mensagens
 */
function init(): void
```

**Comportamento**:
- Registra listener para `chrome.runtime.onMessage`
- Mantém canal de comunicação aberto para respostas assíncronas
- Delega todas as mensagens para o MessageDispatcher

**Exemplo**:
```typescript
// Executado automaticamente quando o service worker inicia
init();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Delega para o dispatcher (named import)
  handle(message, sendResponse);
  
  // Mantém canal aberto para async
  return true;
});
```

### ✅ O Que Este Módulo FAZ
- ✅ Inicializa o service worker
- ✅ Registra listeners
- ✅ Mantém estado de runtime ativo
- ✅ Delega processamento de mensagens

### ❌ O Que Este Módulo NÃO FAZ
- ❌ Processa lógica de negócio
- ❌ Acessa diretamente Chrome APIs (além de runtime)
- ❌ Mantém estado de aplicação
- ❌ Valida mensagens (delega para dispatcher)

### 📊 Dependências
- `MessageDispatcher`

---

## 2. Message Dispatcher

### 📍 Localização
`src/background/message-dispatcher.ts`

### 🎯 Responsabilidade
Roteador central de mensagens. Recebe mensagens do popup, valida, roteia para o módulo apropriado e retorna respostas estruturadas.

### 📦 Funções Públicas

#### `handle()`
```typescript
/**
 * Processa uma mensagem recebida do popup
 * @param message - Mensagem recebida
 * @param sendResponse - Callback para enviar resposta
 */
async function handle(
  message: Message,
  sendResponse: (response: BaseResponse) => void
): Promise<void>
```

**Comportamento**:
- Valida estrutura da mensagem
- Identifica tipo de mensagem via `message.type`
- Roteia para função handler apropriada
- Captura erros e retorna respostas de erro estruturadas
- Sempre retorna uma resposta (sucesso ou erro)

**Exemplo**:
```typescript
async function handle(message: Message, sendResponse) {
  try {
    // Valida mensagem
    if (!message || !message.type) {
      sendResponse({ 
        success: false, 
        error: 'Mensagem inválida' 
      });
      return;
    }
    
    // Roteia baseado no tipo
    switch (message.type) {
      case MessageType.ANALYZE_TABS:
        await handleAnalyzeTabs(sendResponse);
        break;
        
      case MessageType.GET_WINDOWS_FOR_DOMAIN:
        await handleGetWindowsForDomain(message, sendResponse);
        break;
        
      case MessageType.CLOSE_BULK_TABS:
        await handleCloseBulkTabs(message, sendResponse);
        break;
        
      // ... outros casos
        
      default:
        sendResponse({ 
          success: false, 
          error: 'Tipo de mensagem desconhecido' 
        });
    }
  } catch (error) {
    sendResponse({ 
      success: false, 
      error: error.message 
    });
  }
}
```

### 🔧 Funções Internas (Handlers)

#### `handleAnalyzeTabs()`
```typescript
async function handleAnalyzeTabs(
  sendResponse: (response: AnalyzeTabsResponse) => void
): Promise<void>
```

**Fluxo**:
1. Chama `TabReader.getAllTabs()`
2. Para cada tab, chama `Normalizer.normalizeUrl(tab.url)`
3. Chama `Grouper.groupByDomain(tabs)`
4. Retorna `DomainGroup[]`

---

#### `handleGetWindowsForDomain()`
```typescript
async function handleGetWindowsForDomain(
  message: GetWindowsForDomainMessage,
  sendResponse: (response: GetWindowsForDomainResponse) => void
): Promise<void>
```

**Fluxo**:
1. Valida `message.payload.domain`
2. Chama `TabReader.getAllTabs()`
3. Chama `Grouper.groupByWindow(tabs, domain)`
4. Retorna `WindowGroup[]`

---

#### `handleGetTabsForDomain()`
```typescript
async function handleGetTabsForDomain(
  message: GetTabsForDomainMessage,
  sendResponse: (response: GetTabsForDomainResponse) => void
): Promise<void>
```

**Fluxo**:
1. Valida `message.payload.domain` e `message.payload.scope`
2. Chama `TabReader.getAllTabs()`
3. Chama `Grouper.filterTabsByScope(tabs, domain, scope, windowIds?)`
4. Retorna `Tab[]`

---

#### `handleCloseSingleTab()`
```typescript
async function handleCloseSingleTab(
  message: CloseSingleTabMessage,
  sendResponse: (response: CloseSingleTabResponse) => void
): Promise<void>
```

**Fluxo**:
1. Valida `message.payload.tabId`
2. Chama `Executor.closeSingleTab(tabId)`
3. Retorna resultado

---

#### `handleCloseBulkTabs()`
```typescript
async function handleCloseBulkTabs(
  message: CloseBulkTabsMessage,
  sendResponse: (response: CloseBulkTabsResponse) => void
): Promise<void>
```

**Fluxo**:
1. Valida `message.payload.tabIds` e `message.payload.tabs`
2. Chama `Executor.closeBulkTabs(tabIds)`
3. Se sucesso, chama `RecoveryManager.storeRecoveryLog(tabs)`
4. Retorna resultado com flag `recoverable: true`

---

#### `handleCheckRecovery()`
```typescript
async function handleCheckRecovery(
  sendResponse: (response: CheckRecoveryResponse) => void
): Promise<void>
```

**Fluxo**:
1. Chama `RecoveryManager.hasRecoverableAction()`
2. Retorna `RecoveryStatus`

---

#### `handleRecoverLastAction()`
```typescript
async function handleRecoverLastAction(
  sendResponse: (response: RecoverLastActionResponse) => void
): Promise<void>
```

**Fluxo**:
1. Chama `RecoveryManager.getRecoveryLog()`
2. Se log existe e válido, chama `Executor.restoreTabs(log.tabs)`
3. Se sucesso, chama `RecoveryManager.clearRecoveryLog()`
4. Retorna resultado

### ✅ O Que Este Módulo FAZ
- ✅ Valida estrutura de mensagens
- ✅ Roteia mensagens para handlers apropriados
- ✅ Orquestra chamadas entre múltiplos módulos
- ✅ Padroniza respostas (sucesso/erro)
- ✅ Captura e trata erros globalmente

### ❌ O Que Este Módulo NÃO FAZ
- ❌ Executa lógica de negócio diretamente
- ❌ Acessa Chrome APIs diretamente
- ❌ Mantém estado persistente
- ❌ Transforma dados (delega para módulos especializados)

### 📊 Dependências
- `TabReader`
- `Normalizer`
- `Grouper`
- `Executor`
- `RecoveryManager`
- `Shared Types`

---

## 3. Tab Reader Module

### 📍 Localização
`src/modules/tab-reader/tab-reader.ts`

### 🎯 Responsabilidade
Camada de abstração para leitura de abas e janelas via Chrome Tabs API.

### 📦 Funções Públicas

#### `getAllTabs()`
```typescript
/**
 * Obtém todas as abas abertas em todas as janelas
 * @returns Array de abas nativas do Chrome
 */
async function getAllTabs(): Promise<chrome.tabs.Tab[]>
```

**Implementação**:
```typescript
async function getAllTabs(): Promise<chrome.tabs.Tab[]> {
  try {
    const tabs = await chrome.tabs.query({});
    return tabs;
  } catch (error) {
    console.error('Erro ao obter abas:', error);
    throw new Error('Falha ao acessar abas do navegador');
  }
}
```

---

#### `getAllWindows()`
```typescript
/**
 * Obtém todas as janelas abertas
 * @returns Array de janelas nativas do Chrome
 */
async function getAllWindows(): Promise<chrome.windows.Window[]>
```

**Implementação**:
```typescript
async function getAllWindows(): Promise<chrome.windows.Window[]> {
  try {
    const windows = await chrome.windows.getAll({ populate: true });
    return windows;
  } catch (error) {
    console.error('Erro ao obter janelas:', error);
    throw new Error('Falha ao acessar janelas do navegador');
  }
}
```

---

#### `getTabsByWindowId()`
```typescript
/**
 * Obtém abas de uma janela específica
 * @param windowId - ID da janela
 * @returns Array de abas da janela
 */
async function getTabsByWindowId(windowId: number): Promise<chrome.tabs.Tab[]>
```

**Implementação**:
```typescript
async function getTabsByWindowId(windowId: number): Promise<chrome.tabs.Tab[]> {
  try {
    const tabs = await chrome.tabs.query({ windowId });
    return tabs;
  } catch (error) {
    console.error(`Erro ao obter abas da janela ${windowId}:`, error);
    throw new Error(`Falha ao acessar abas da janela ${windowId}`);
  }
}
```

### ✅ O Que Este Módulo FAZ
- ✅ Consulta Chrome Tabs API
- ✅ Retorna dados brutos de abas/janelas
- ✅ Trata erros de permissão/API
- ✅ Fornece interface consistente para leitura

### ❌ O Que Este Módulo NÃO FAZ
- ❌ Normaliza URLs
- ❌ Agrupa ou filtra abas
- ❌ Modifica abas
- ❌ Fecha abas
- ❌ Mantém cache de dados

### 📊 Dependências
- Chrome Tabs API (nativa)
- Chrome Windows API (nativa)

---

## 4. URL Normalizer Module

### 📍 Localização
`src/modules/normalizer/url-normalizer.ts`

### 🎯 Responsabilidade
Extrair domínio base de URLs e normalizar para formato consistente.

### 📦 Funções Públicas

#### `normalizeUrl()`
```typescript
/**
 * Extrai domínio base de uma URL
 * @param url - URL completa
 * @returns Domínio base normalizado ou null se inválido
 */
function normalizeUrl(url: string): string | null
```

**Implementação**:
```typescript
function normalizeUrl(url: string): string | null {
  try {
    // Verificar URLs internas do Chrome
    if (url.startsWith('chrome://') || 
        url.startsWith('about:') ||
        url.startsWith('chrome-extension://')) {
      return null;
    }
    
    // Parse URL
    const parsed = new URL(url);
    let domain = parsed.hostname;
    
    // Remover www.
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    
    return domain;
  } catch (error) {
    // URL inválida
    return null;
  }
}
```

**Exemplos**:
```typescript
normalizeUrl('https://www.youtube.com/watch?v=abc')
// → "youtube.com"

normalizeUrl('https://github.com/user/repo')
// → "github.com"

normalizeUrl('http://docs.google.com/document/123')
// → "docs.google.com"

normalizeUrl('chrome://extensions')
// → null

normalizeUrl('about:blank')
// → null

normalizeUrl('invalid-url')
// → null
```

---

#### `isValidUrl()`
```typescript
/**
 * Verifica se uma URL é válida e processável
 * @param url - URL a validar
 * @returns true se válida
 */
function isValidUrl(url: string): boolean
```

> ⚠️ **Localização real**: `isValidUrl()` está em `src/shared/utils/validators.ts`, não no módulo normalizer. É importada pelo dispatcher via `shared/utils`.

**Implementação** (em `validators.ts`):
```typescript
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return !url.startsWith('chrome://') && 
           !url.startsWith('about:') &&
           !url.startsWith('chrome-extension://');
  } catch {
    return false;
  }
}
```
```typescript
/**
 * Alias para normalizeUrl
 * Mantido para clareza semântica
 */
function extractDomain(url: string): string | null
```

### ✅ O Que Este Módulo FAZ
- ✅ Extrai domínio base de URLs
- ✅ Remove prefixos `www.`
- ✅ Valida URLs
- ✅ Filtra URLs internas do Chrome
- ✅ Retorna null para URLs inválidas

### ❌ O Que Este Módulo NÃO FAZ
- ❌ Acessa APIs do Chrome
- ❌ Modifica abas
- ❌ Armazena dados
- ❌ Agrupa domínios
- ❌ Diferencia subdomínios (ex: `docs.google.com` vs `drive.google.com` são tratados como diferentes)

### 📊 Dependências
- Nenhuma (módulo puro)

---

## 5. Tab Grouper Module

### 📍 Localização
`src/modules/grouper/tab-grouper.ts`

### 🎯 Responsabilidade
Agrupar abas por domínio e por janela, filtrar abas baseado em escopo.

### 📦 Funções Públicas

#### `groupByDomain()`
```typescript
/**
 * Agrupa abas por domínio base
 * @param tabs - Array de abas normalizadas
 * @returns Array de grupos de domínio
 */
function groupByDomain(tabs: Tab[]): DomainGroup[]
```

**Implementação**:
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

---

#### `groupByWindow()`
```typescript
/**
 * Agrupa abas de um domínio por janela
 * @param tabs - Array de abas normalizadas
 * @param domain - Domínio a filtrar
 * @returns Array de grupos de janela
 */
function groupByWindow(tabs: Tab[], domain: string): WindowGroup[]
```

**Implementação**:
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
  
  // Ordenar por quantidade de abas (maior primeiro)
  return windowGroups.sort((a, b) => b.tabCount - a.tabCount);
}
```

---

#### `filterTabsByScope()`
```typescript
/**
 * Filtra abas de um domínio baseado no escopo definido
 * @param tabs - Array de abas normalizadas
 * @param domain - Domínio a filtrar
 * @param scope - Escopo ('all' ou 'windows')
 * @param windowIds - IDs de janelas (obrigatório se scope === 'windows')
 * @returns Array de abas filtradas
 */
function filterTabsByScope(
  tabs: Tab[],
  domain: string,
  scope: TabScope,
  windowIds?: number[]
): Tab[]
```

**Implementação**:
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
  if (scope === 'windows') {
    if (!windowIds || windowIds.length === 0) {
      throw new Error('windowIds obrigatório quando scope === "windows"');
    }
    filtered = filtered.filter(t => windowIds.includes(t.windowId));
  }
  
  return filtered;
}
```

### ✅ O Que Este Módulo FAZ
- ✅ Agrupa abas por domínio
- ✅ Agrupa abas de um domínio por janela
- ✅ Filtra abas baseado em escopo
- ✅ Ordena grupos por quantidade de abas
- ✅ Calcula estatísticas (contagens, janelas envolvidas)

### ❌ O Que Este Módulo NÃO FAZ
- ❌ Normaliza URLs (usa `Normalizer`)
- ❌ Acessa Chrome APIs
- ❌ Modifica abas
- ❌ Fecha abas
- ❌ Persiste dados

### 📊 Dependências
- `Normalizer` (para usar domínios já normalizados)
- `Shared Types` (DomainGroup, WindowGroup, etc.)

---

## 6. Action Executor Module

### 📍 Localização
`src/modules/executor/action-executor.ts`

### 🎯 Responsabilidade
Executar ações destrutivas (fechamento) e restauração de abas.

### 📦 Funções Públicas

#### `closeSingleTab()`
```typescript
/**
 * Fecha uma única aba
 * @param tabId - ID da aba
 * @returns Resultado da operação
 */
async function closeSingleTab(tabId: number): Promise<ActionResult>
```

**Implementação**:
```typescript
async function closeSingleTab(tabId: number): Promise<ActionResult> {
  try {
    await chrome.tabs.remove(tabId);
    
    return {
      success: true,
      data: { tabId }
    };
  } catch (error) {
    console.error(`Erro ao fechar aba ${tabId}:`, error);
    
    return {
      success: false,
      error: `Falha ao fechar aba: ${error.message}`
    };
  }
}
```

---

#### `closeBulkTabs()`
```typescript
/**
 * Fecha múltiplas abas
 * @param tabIds - Array de IDs de abas
 * @returns Resultado da operação
 */
async function closeBulkTabs(tabIds: number[]): Promise<ActionResult>
```

**Implementação**:
```typescript
async function closeBulkTabs(tabIds: number[]): Promise<ActionResult> {
  try {
    if (!tabIds || tabIds.length === 0) {
      return {
        success: false,
        error: 'Nenhuma aba para fechar'
      };
    }
    
    await chrome.tabs.remove(tabIds);
    
    return {
      success: true,
      data: { closedCount: tabIds.length }
    };
  } catch (error) {
    console.error('Erro ao fechar abas em lote:', error);
    
    return {
      success: false,
      error: `Falha ao fechar abas: ${error.message}`
    };
  }
}
```

---

#### `restoreTabs()`
```typescript
/**
 * Restaura abas a partir de dados mínimos
 * @param tabs - Array de TabMinimal
 * @returns Resultado da operação
 */
async function restoreTabs(tabs: TabMinimal[]): Promise<ActionResult>
```

**Implementação**:
```typescript
async function restoreTabs(tabs: TabMinimal[]): Promise<ActionResult> {
  try {
    if (!tabs || tabs.length === 0) {
      return {
        success: false,
        error: 'Nenhuma aba para restaurar'
      };
    }
    
    let restoredCount = 0;
    const errors: string[] = [];
    
    for (const tab of tabs) {
      try {
        await chrome.tabs.create({
          url: tab.url,
          windowId: tab.windowId,
          active: false // Não ativar automaticamente
        });
        restoredCount++;
      } catch (error) {
        errors.push(`Falha ao restaurar ${tab.url}: ${error.message}`);
      }
    }
    
    if (restoredCount === 0) {
      return {
        success: false,
        error: `Falha ao restaurar todas as abas: ${errors.join('; ')}`
      };
    }
    
    return {
      success: true,
      data: { 
        restoredCount,
        errors: errors.length > 0 ? errors : undefined
      }
    };
  } catch (error) {
    console.error('Erro ao restaurar abas:', error);
    
    return {
      success: false,
      error: `Falha ao restaurar abas: ${error.message}`
    };
  }
}
```

### ✅ O Que Este Módulo FAZ
- ✅ Fecha aba individual
- ✅ Fecha múltiplas abas
- ✅ Restaura abas a partir de URLs e windowIds
- ✅ Trata erros individualmente na restauração
- ✅ Retorna resultados estruturados

### ❌ O Que Este Módulo NÃO FAZ
- ❌ Decide quais abas fechar (recebe IDs explícitos)
- ❌ Armazena log de ações
- ❌ Valida escopo ou permissões
- ❌ Agrupa ou filtra abas

### 📊 Dependências
- Chrome Tabs API (nativa)
- `Shared Types` (ActionResult, TabMinimal)

---

## 7. Recovery Manager Module

### 📍 Localização
`src/modules/recovery/recovery-manager.ts`

### 🎯 Responsabilidade
Gerenciar log temporário em memória de ações destrutivas para recuperação.

### 💾 Estado Interno

```typescript
/**
 * Log de recuperação armazenado em memória
 * Não persistente, resetado ao recarregar a extensão
 */
let recoveryLog: RecoveryLog | null = null;
```

### 📦 Funções Públicas

#### `storeRecoveryLog()`
```typescript
/**
 * Armazena log de ação destrutiva
 * Substitui qualquer log anterior
 * @param tabs - Abas fechadas (versão mínima)
 */
function storeRecoveryLog(tabs: TabMinimal[]): void
```

**Implementação**:
```typescript
function storeRecoveryLog(tabs: TabMinimal[]): void {
  recoveryLog = {
    tabs,
    timestamp: Date.now(),
    ttl: RECOVERY_TTL_MS // 15 minutos
  };
  
  // Agendar limpeza automática
  setTimeout(() => {
    if (recoveryLog && Date.now() - recoveryLog.timestamp >= recoveryLog.ttl) {
      recoveryLog = null;
    }
  }, RECOVERY_TTL_MS);
}
```

---

#### `getRecoveryLog()`
```typescript
/**
 * Obtém log de recuperação se ainda válido
 * @returns Log de recuperação ou null se não existe/expirou
 */
function getRecoveryLog(): RecoveryLog | null
```

**Implementação**:
```typescript
function getRecoveryLog(): RecoveryLog | null {
  if (!recoveryLog) return null;
  
  const now = Date.now();
  const elapsed = now - recoveryLog.timestamp;
  
  // Verificar se expirou
  if (elapsed >= recoveryLog.ttl) {
    recoveryLog = null;
    return null;
  }
  
  return recoveryLog;
}
```

---

#### `hasRecoverableAction()`
```typescript
/**
 * Verifica se há ação recuperável disponível
 * @returns Status de recuperação
 */
function hasRecoverableAction(): RecoveryStatus
```

**Implementação**:
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
    // Log expirado
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

#### `clearRecoveryLog()`
```typescript
/**
 * Limpa log de recuperação
 * Chamado após recuperação bem-sucedida
 */
function clearRecoveryLog(): void
```

**Implementação**:
```typescript
function clearRecoveryLog(): void {
  recoveryLog = null;
}
```

### ✅ O Que Este Módulo FAZ
- ✅ Armazena log em memória
- ✅ Valida TTL de 15 minutos
- ✅ Retorna status de recuperação
- ✅ Limpa log automaticamente após expiração
- ✅ Limpa log após recuperação bem-sucedida

### ❌ O Que Este Módulo NÃO FAZ
- ❌ Persiste dados em disco/storage
- ❌ Mantém histórico múltiplo
- ❌ Executa recuperação (delega para Executor)
- ❌ Permite configuração de TTL
- ❌ Notifica usuário sobre expiração

### 📊 Dependências
- `Shared Types` (RecoveryLog, RecoveryStatus, TabMinimal)
- `Shared Constants` (RECOVERY_TTL_MS)

---

## 8. Popup UI

### 📍 Localização
`src/popup/popup.ts`

### 🎯 Responsabilidade
Interface do usuário. Gerencia interações, envia mensagens ao background e renderiza estados visuais.

### 📦 Funções Principais

#### `init()`
```typescript
/**
 * Inicializa o popup
 * Carrega estado inicial e verifica recuperação
 */
async function init(): Promise<void>
```

**Comportamento**:
- Renderiza estado inicial
- Verifica se há ação recuperável
- Registra event listeners

---

#### `sendMessage()`
```typescript
/**
 * Envia mensagem para o background
 * @param message - Mensagem a enviar
 * @returns Promessa com resposta
 */
async function sendMessage<T extends BaseResponse>(
  message: Message
): Promise<T>
```

**Implementação**:
```typescript
async function sendMessage<T extends BaseResponse>(
  message: Message
): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response: T) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}
```

---

#### Funções de Renderização

```typescript
function renderInitialState(): void
function renderDomainView(domains: DomainGroup[]): void
function renderScopeSelection(domain: string): void
function renderWindowSelection(windows: WindowGroup[]): void
function renderTabActionView(tabs: Tab[]): void
function renderFeedback(message: string, type: 'success' | 'error'): void
function renderRecoveryButton(status: RecoveryStatus): void
```

### ✅ O Que Este Módulo FAZ
- ✅ Renderiza interface visual
- ✅ Captura interações do usuário
- ✅ Envia mensagens ao background
- ✅ Atualiza UI baseado em respostas
- ✅ Gerencia navegação entre estados

### ❌ O Que Este Módulo NÃO FAZ
- ❌ Acessa Chrome Tabs API diretamente
- ❌ Executa lógica de negócio
- ❌ Normaliza ou agrupa dados
- ❌ Fecha abas diretamente

### 📊 Dependências
- Chrome Runtime API (para sendMessage)
- `StateManager`
- `Shared Types`

---

## 9. State Manager

### 📍 Localização
`src/popup/state/app-state.ts`

### 🎯 Responsabilidade
Gerenciar estado global da aplicação no popup.

### 💾 Estado

```typescript
let appState: AppState = {
  currentFlow: FlowState.INITIAL,
  domains: [],
  selectedDomain: null,
  selectedScope: null,
  windows: [],
  selectedWindowIds: [],
  tabs: [],
  recoveryStatus: null,
  errorMessage: null,
  isLoading: false
};
```

### 📦 Funções Públicas

```typescript
function getState(): AppState
function setState(newState: Partial<AppState>): void
function resetState(): void
function setFlow(flow: FlowState): void
```

### ✅ O Que Este Módulo FAZ
- ✅ Mantém estado centralizado
- ✅ Fornece interface para leitura/escrita
- ✅ Permite atualizações parciais
- ✅ Gerencia transições de fluxo

### ❌ O Que Este Módulo NÃO FAZ
- ❌ Persiste estado
- ❌ Envia mensagens ao background
- ❌ Renderiza UI

### 📊 Dependências
- `Shared Types` (AppState, FlowState)

---

## 📊 Resumo de Dependências

```
Background Service Worker
  └─→ Message Dispatcher
        ├─→ Tab Reader
        ├─→ Normalizer
        ├─→ Grouper
        │     └─→ Normalizer
        ├─→ Executor
        └─→ Recovery Manager

Popup UI
  ├─→ State Manager
  └─→ Chrome Runtime (sendMessage)
```

---

## ✅ Checklist de Implementação por Módulo

### Background
- [ ] Registrar listener de mensagens
- [ ] Delegar para MessageDispatcher
- [ ] Manter canal aberto para async

### MessageDispatcher
- [ ] Implementar validação de mensagens
- [ ] Implementar todos os handlers
- [ ] Padronizar respostas
- [ ] Capturar erros globalmente

### TabReader
- [ ] Implementar getAllTabs()
- [ ] Implementar getAllWindows()
- [ ] Tratar erros de permissão

### Normalizer
- [ ] Implementar normalizeUrl()
- [ ] Filtrar URLs internas do Chrome
- [ ] Remover www.

### Grouper
- [ ] Implementar groupByDomain()
- [ ] Implementar groupByWindow()
- [ ] Implementar filterTabsByScope()

### Executor
- [ ] Implementar closeSingleTab()
- [ ] Implementar closeBulkTabs()
- [ ] Implementar restoreTabs()

### RecoveryManager
- [ ] Implementar storeRecoveryLog()
- [ ] Implementar getRecoveryLog()
- [ ] Implementar hasRecoverableAction()
- [ ] Implementar clearRecoveryLog()
- [ ] Validar TTL

### Popup UI
- [ ] Implementar todas as funções de renderização
- [ ] Implementar sendMessage()
- [ ] Registrar event listeners

### StateManager
- [ ] Implementar getState()
- [ ] Implementar setState()
- [ ] Implementar resetState()

---

**Próximo**: Leia [INSTALLATION.md](./INSTALLATION.md) para saber como configurar, buildar e carregar a extensão.
