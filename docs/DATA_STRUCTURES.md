# DATA_STRUCTURES.md

## Estruturas de Dados e Tipos TypeScript

---

## 📋 Visão Geral

Este documento define **todas** as estruturas de dados, tipos, interfaces e enums utilizados no Tab Domain Executor. Cada tipo é documentado com sua responsabilidade, campos, e exemplos de uso.

---

## 🗂️ Organização dos Tipos

Os tipos estão organizados em arquivos separados por domínio:

1. **tab.types.ts** - Tipos relacionados a abas
2. **message.types.ts** - Tipos de comunicação entre popup e background
3. **domain.types.ts** - Tipos de agrupamento por domínio
4. **window.types.ts** - Tipos de agrupamento por janela
5. **recovery.types.ts** - Tipos de recuperação
6. **state.types.ts** - Tipos de estado da aplicação
7. **common.types.ts** - Tipos comuns e utilitários

---

## 1️⃣ tab.types.ts

### `Tab`

**Propósito**: Representação estendida de uma aba do Chrome

**Fonte**: Extensão de `chrome.tabs.Tab` com dados normalizados

```typescript
/**
 * Representa uma aba do navegador com dados normalizados
 */
export interface Tab {
  /** ID único da aba no Chrome */
  id: number;
  
  /** ID da janela que contém esta aba */
  windowId: number;
  
  /** URL completa da aba */
  url: string;
  
  /** Título da aba */
  title: string;
  
  /** URL do favicon (ícone) da aba */
  favIconUrl?: string;
  
  /** Domínio base normalizado (ex: "youtube.com") */
  domain: string | null;
  
  /** Indica se a aba está ativa na janela */
  active: boolean;
  
  /** Índice da aba na janela */
  index: number;
}
```

**Exemplo de Uso**:
```typescript
const tab: Tab = {
  id: 123,
  windowId: 1,
  url: 'https://www.youtube.com/watch?v=abc',
  title: 'Video Title - YouTube',
  favIconUrl: 'https://www.youtube.com/favicon.ico',
  domain: 'youtube.com',
  active: false,
  index: 3
};
```

---

### `TabMinimal`

**Propósito**: Versão mínima de Tab para armazenamento e recuperação

```typescript
/**
 * Representação mínima de aba para recuperação
 * Contém apenas dados essenciais para recriar a aba
 */
export interface TabMinimal {
  /** URL da aba */
  url: string;
  
  /** ID da janela original */
  windowId: number;
  
  /** Título original (opcional, para referência) */
  title?: string;
}
```

**Exemplo de Uso**:
```typescript
const minimalTab: TabMinimal = {
  url: 'https://youtube.com/watch?v=abc',
  windowId: 1,
  title: 'Video Title - YouTube'
};
```

---

## 2️⃣ message.types.ts

### `MessageType`

**Propósito**: Enum de todos os tipos de mensagens possíveis

```typescript
/**
 * Tipos de mensagens trocadas entre popup e background
 */
export enum MessageType {
  /** Solicita análise de todas as abas abertas */
  ANALYZE_TABS = 'ANALYZE_TABS',
  
  /** Solicita janelas disponíveis para um domínio */
  GET_WINDOWS_FOR_DOMAIN = 'GET_WINDOWS_FOR_DOMAIN',
  
  /** Solicita abas de um domínio com escopo definido */
  GET_TABS_FOR_DOMAIN = 'GET_TABS_FOR_DOMAIN',
  
  /** Solicita fechamento de uma única aba */
  CLOSE_SINGLE_TAB = 'CLOSE_SINGLE_TAB',
  
  /** Solicita fechamento de múltiplas abas */
  CLOSE_BULK_TABS = 'CLOSE_BULK_TABS',
  
  /** Verifica se há ação recuperável */
  CHECK_RECOVERY = 'CHECK_RECOVERY',
  
  /** Solicita recuperação da última ação */
  RECOVER_LAST_ACTION = 'RECOVER_LAST_ACTION'
}
```

---

### `BaseMessage`

**Propósito**: Interface base para todas as mensagens

```typescript
/**
 * Interface base para todas as mensagens
 */
export interface BaseMessage {
  /** Tipo da mensagem */
  type: MessageType;
  
  /** Timestamp de envio (opcional, para debug) */
  timestamp?: number;
}
```

---

### Mensagens Específicas

#### `AnalyzeTabsMessage`

```typescript
/**
 * Mensagem para solicitar análise de abas
 */
export interface AnalyzeTabsMessage extends BaseMessage {
  type: MessageType.ANALYZE_TABS;
}
```

---

#### `GetWindowsForDomainMessage`

```typescript
/**
 * Mensagem para obter janelas de um domínio
 */
export interface GetWindowsForDomainMessage extends BaseMessage {
  type: MessageType.GET_WINDOWS_FOR_DOMAIN;
  payload: {
    /** Domínio base (ex: "youtube.com") */
    domain: string;
  };
}
```

---

#### `GetTabsForDomainMessage`

```typescript
/**
 * Escopo de seleção de abas
 */
export type TabScope = 'all' | 'windows';

/**
 * Mensagem para obter abas de um domínio
 */
export interface GetTabsForDomainMessage extends BaseMessage {
  type: MessageType.GET_TABS_FOR_DOMAIN;
  payload: {
    /** Domínio base */
    domain: string;
    
    /** Tipo de escopo */
    scope: TabScope;
    
    /** IDs de janelas (obrigatório se scope === 'windows') */
    windowIds?: number[];
  };
}
```

---

#### `CloseSingleTabMessage`

```typescript
/**
 * Mensagem para fechar uma única aba
 */
export interface CloseSingleTabMessage extends BaseMessage {
  type: MessageType.CLOSE_SINGLE_TAB;
  payload: {
    /** ID da aba a ser fechada */
    tabId: number;
  };
}
```

---

#### `CloseBulkTabsMessage`

```typescript
/**
 * Mensagem para fechar múltiplas abas
 */
export interface CloseBulkTabsMessage extends BaseMessage {
  type: MessageType.CLOSE_BULK_TABS;
  payload: {
    /** IDs das abas a serem fechadas */
    tabIds: number[];
    
    /** Dados para recuperação */
    tabs: TabMinimal[];
  };
}
```

---

#### `CheckRecoveryMessage`

```typescript
/**
 * Mensagem para verificar se há ação recuperável
 */
export interface CheckRecoveryMessage extends BaseMessage {
  type: MessageType.CHECK_RECOVERY;
}
```

---

#### `RecoverLastActionMessage`

```typescript
/**
 * Mensagem para recuperar última ação
 */
export interface RecoverLastActionMessage extends BaseMessage {
  type: MessageType.RECOVER_LAST_ACTION;
}
```

---

### `Message`

**Propósito**: Union type de todas as mensagens possíveis

```typescript
/**
 * Union type de todas as mensagens possíveis
 */
export type Message =
  | AnalyzeTabsMessage
  | GetWindowsForDomainMessage
  | GetTabsForDomainMessage
  | CloseSingleTabMessage
  | CloseBulkTabsMessage
  | CheckRecoveryMessage
  | RecoverLastActionMessage;
```

---

### Respostas

#### `BaseResponse`

```typescript
/**
 * Interface base para todas as respostas
 */
export interface BaseResponse {
  /** Indica se a operação foi bem-sucedida */
  success: boolean;
  
  /** Mensagem de erro (se success === false) */
  error?: string;
}
```

---

#### `AnalyzeTabsResponse`

```typescript
/**
 * Resposta para análise de abas
 */
export interface AnalyzeTabsResponse extends BaseResponse {
  /** Lista de domínios agrupados */
  domains?: DomainGroup[];
}
```

---

#### `GetWindowsForDomainResponse`

```typescript
/**
 * Resposta para obtenção de janelas de um domínio
 */
export interface GetWindowsForDomainResponse extends BaseResponse {
  /** Lista de janelas agrupadas */
  windows?: WindowGroup[];
}
```

---

#### `GetTabsForDomainResponse`

```typescript
/**
 * Resposta para obtenção de abas de um domínio
 */
export interface GetTabsForDomainResponse extends BaseResponse {
  /** Lista de abas filtradas */
  tabs?: Tab[];
}
```

---

#### `CloseSingleTabResponse`

```typescript
/**
 * Resposta para fechamento de aba individual
 */
export interface CloseSingleTabResponse extends BaseResponse {
  /** ID da aba fechada */
  tabId?: number;
}
```

---

#### `CloseBulkTabsResponse`

```typescript
/**
 * Resposta para fechamento em lote
 */
export interface CloseBulkTabsResponse extends BaseResponse {
  /** Quantidade de abas fechadas */
  closedCount?: number;
  
  /** Indica se a ação é recuperável */
  recoverable?: boolean;
}
```

---

#### `CheckRecoveryResponse`

```typescript
/**
 * Resposta para verificação de recuperação
 */
export interface CheckRecoveryResponse extends BaseResponse {
  /** Indica se há ação recuperável */
  recoverable: boolean;
  
  /** Tempo restante em milissegundos (se recoverable === true) */
  timeRemaining?: number;
  
  /** Quantidade de abas recuperáveis */
  tabCount?: number;
}
```

---

#### `RecoverLastActionResponse`

```typescript
/**
 * Resposta para recuperação de última ação
 */
export interface RecoverLastActionResponse extends BaseResponse {
  /** Quantidade de abas restauradas */
  restoredCount?: number;
}
```

---

## 3️⃣ domain.types.ts

### `DomainGroup`

**Propósito**: Agrupamento de abas por domínio

```typescript
/**
 * Representa um grupo de abas por domínio
 */
export interface DomainGroup {
  /** Domínio base (ex: "youtube.com") */
  domain: string;
  
  /** Quantidade total de abas deste domínio */
  tabCount: number;
  
  /** Quantidade de janelas que contêm abas deste domínio */
  windowCount: number;
  
  /** IDs das janelas envolvidas */
  windowIds: number[];
  
  /** Lista de abas (opcional, para detalhamento) */
  tabs?: Tab[];
}
```

**Exemplo de Uso**:
```typescript
const domainGroup: DomainGroup = {
  domain: 'youtube.com',
  tabCount: 18,
  windowCount: 2,
  windowIds: [1, 3],
  tabs: [/* array de Tab */]
};
```

---

## 4️⃣ window.types.ts

### `WindowGroup`

**Propósito**: Agrupamento de abas de um domínio por janela

```typescript
/**
 * Representa abas de um domínio em uma janela específica
 */
export interface WindowGroup {
  /** ID da janela */
  windowId: number;
  
  /** Título ou identificador da janela (ex: "Janela 1") */
  windowTitle: string;
  
  /** Domínio das abas nesta janela */
  domain: string;
  
  /** Quantidade de abas do domínio nesta janela */
  tabCount: number;
  
  /** Lista de abas (opcional, para detalhamento) */
  tabs?: Tab[];
  
  /** Indica se esta janela está selecionada pelo usuário */
  selected?: boolean;
}
```

**Exemplo de Uso**:
```typescript
const windowGroup: WindowGroup = {
  windowId: 1,
  windowTitle: 'Janela Principal',
  domain: 'youtube.com',
  tabCount: 12,
  tabs: [/* array de Tab */],
  selected: true
};
```

---

## 5️⃣ recovery.types.ts

### `RecoveryLog`

**Propósito**: Log temporário de ação destrutiva para recuperação

```typescript
/**
 * Log de recuperação armazenado em memória
 */
export interface RecoveryLog {
  /** Lista de abas fechadas (versão mínima) */
  tabs: TabMinimal[];
  
  /** Timestamp da ação (milissegundos desde epoch) */
  timestamp: number;
  
  /** TTL em milissegundos (15 minutos = 900000ms) */
  ttl: number;
}
```

**Exemplo de Uso**:
```typescript
const recoveryLog: RecoveryLog = {
  tabs: [
    { url: 'https://youtube.com/watch?v=1', windowId: 1 },
    { url: 'https://youtube.com/watch?v=2', windowId: 1 },
  ],
  timestamp: Date.now(),
  ttl: 900000 // 15 minutos
};
```

---

### `RecoveryStatus`

**Propósito**: Status da recuperação

```typescript
/**
 * Status de recuperação
 */
export interface RecoveryStatus {
  /** Indica se há ação recuperável */
  isRecoverable: boolean;
  
  /** Tempo restante em milissegundos */
  timeRemaining: number;
  
  /** Quantidade de abas recuperáveis */
  tabCount: number;
  
  /** Timestamp da expiração */
  expiresAt: number;
}
```

---

## 6️⃣ state.types.ts

### `FlowState`

**Propósito**: Estados possíveis do fluxo da aplicação

```typescript
/**
 * Estados do fluxo de interação do usuário
 */
export enum FlowState {
  /** Estado inicial, antes de qualquer análise */
  INITIAL = 'INITIAL',
  
  /** Carregando análise de abas */
  LOADING_ANALYSIS = 'LOADING_ANALYSIS',
  
  /** Visualizando lista de domínios */
  DOMAIN_VIEW = 'DOMAIN_VIEW',
  
  /** Selecionando escopo (todas janelas ou escolher janelas) */
  SCOPE_SELECTION = 'SCOPE_SELECTION',
  
  /** Selecionando janelas específicas */
  WINDOW_SELECTION = 'WINDOW_SELECTION',
  
  /** Visualizando lista final de abas */
  TAB_ACTION_VIEW = 'TAB_ACTION_VIEW',
  
  /** Executando ação destrutiva */
  EXECUTING_ACTION = 'EXECUTING_ACTION',
  
  /** Exibindo feedback pós-ação */
  ACTION_FEEDBACK = 'ACTION_FEEDBACK',
  
  /** Estado de erro */
  ERROR = 'ERROR'
}
```

---

### `AppState`

**Propósito**: Estado global da aplicação

```typescript
/**
 * Estado global da aplicação
 */
export interface AppState {
  /** Estado atual do fluxo */
  currentFlow: FlowState;
  
  /** Lista de domínios (quando em DOMAIN_VIEW) */
  domains: DomainGroup[];
  
  /** Domínio atualmente selecionado */
  selectedDomain: string | null;
  
  /** Escopo selecionado */
  selectedScope: TabScope | null;
  
  /** Lista de janelas (quando em WINDOW_SELECTION) */
  windows: WindowGroup[];
  
  /** IDs de janelas selecionadas */
  selectedWindowIds: number[];
  
  /** Lista de abas (quando em TAB_ACTION_VIEW) */
  tabs: Tab[];
  
  /** Status de recuperação */
  recoveryStatus: RecoveryStatus | null;
  
  /** Mensagem de erro (quando em ERROR) */
  errorMessage: string | null;
  
  /** Indica se há operação em andamento */
  isLoading: boolean;
}
```

**Exemplo de Uso**:
```typescript
const initialState: AppState = {
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

---

## 7️⃣ common.types.ts

### `ActionResult`

**Propósito**: Resultado genérico de uma ação

```typescript
/**
 * Resultado de uma ação executada
 */
export interface ActionResult {
  /** Indica se a ação foi bem-sucedida */
  success: boolean;
  
  /** Mensagem de erro (se success === false) */
  error?: string;
  
  /** Dados adicionais da ação */
  data?: any;
}
```

---

### `ValidationResult`

**Propósito**: Resultado de validação

```typescript
/**
 * Resultado de validação de dados
 */
export interface ValidationResult {
  /** Indica se os dados são válidos */
  isValid: boolean;
  
  /** Lista de erros de validação */
  errors: string[];
}
```

---

### `TimeRemaining`

**Propósito**: Representação de tempo restante formatado

```typescript
/**
 * Tempo restante formatado
 */
export interface TimeRemaining {
  /** Milissegundos totais */
  totalMs: number;
  
  /** Minutos */
  minutes: number;
  
  /** Segundos */
  seconds: number;
  
  /** String formatada (ex: "5 min restantes") */
  formatted: string;
}
```

---

## 📊 Constantes de Tipos

### recovery.constants.ts

```typescript
/**
 * Constantes relacionadas à recuperação
 */

/** Tempo de vida do log de recuperação (15 minutos em ms) */
export const RECOVERY_TTL_MS = 15 * 60 * 1000;

/** Chave para armazenamento em memória */
export const RECOVERY_LOG_KEY = 'recovery_log';
```

---

### app.constants.ts

```typescript
/**
 * Constantes gerais da aplicação
 */

/** Nome da extensão */
export const APP_NAME = 'Tab Domain Executor';

/** Versão da extensão */
export const APP_VERSION = '1.0.0';

/** Mensagens de erro padrão */
export const ERROR_MESSAGES = {
  TABS_NOT_FOUND: 'Nenhuma aba encontrada',
  DOMAIN_NOT_FOUND: 'Domínio não encontrado',
  WINDOWS_NOT_FOUND: 'Nenhuma janela encontrada',
  INVALID_SCOPE: 'Escopo inválido',
  CLOSE_FAILED: 'Falha ao fechar abas',
  RECOVERY_EXPIRED: 'Período de recuperação expirado',
  RECOVERY_NOT_AVAILABLE: 'Nenhuma ação recuperável disponível',
  RESTORE_FAILED: 'Falha ao restaurar abas',
  PERMISSION_DENIED: 'Permissão negada pelo Chrome'
} as const;

/** Mensagens de sucesso padrão */
export const SUCCESS_MESSAGES = {
  TABS_CLOSED: 'Abas fechadas com sucesso',
  TABS_RESTORED: 'Abas restauradas com sucesso',
  RECOVERY_AVAILABLE: 'Você pode recuperar esta ação nos próximos 15 minutos'
} as const;
```

---

## 🔗 Relações Entre Tipos

### Hierarquia de Mensagens

```
BaseMessage
├── AnalyzeTabsMessage
├── GetWindowsForDomainMessage
├── GetTabsForDomainMessage
├── CloseSingleTabMessage
├── CloseBulkTabsMessage
├── CheckRecoveryMessage
└── RecoverLastActionMessage
```

### Hierarquia de Respostas

```
BaseResponse
├── AnalyzeTabsResponse
├── GetWindowsForDomainResponse
├── GetTabsForDomainResponse
├── CloseSingleTabResponse
├── CloseBulkTabsResponse
├── CheckRecoveryResponse
└── RecoverLastActionResponse
```

### Fluxo de Tipos no Sistema

```
Chrome Tab (nativo)
  ↓ [Tab Reader]
Tab (normalizado)
  ↓ [Normalizer]
Tab (com domain)
  ↓ [Grouper]
DomainGroup / WindowGroup
  ↓ [UI → Message]
CloseBulkTabsMessage
  ↓ [Executor]
ActionResult
  ↓ [Recovery]
RecoveryLog
```

---

## 🎯 Type Guards

### Funções Auxiliares de Tipo

```typescript
/**
 * Verifica se uma mensagem é do tipo específico
 */
export function isMessageType<T extends Message>(
  message: Message,
  type: MessageType
): message is T {
  return message.type === type;
}

/**
 * Verifica se uma URL é válida e processável
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return !url.startsWith('chrome://') && 
           !url.startsWith('about:') &&
           !url.startsWith('chrome-extension://');
  } catch {
    return false;
  }
}

/**
 * Verifica se um domínio é válido
 */
export function isValidDomain(domain: string | null): domain is string {
  return domain !== null && domain.length > 0 && !domain.startsWith('chrome');
}

/**
 * Verifica se um log de recuperação é válido (não expirado)
 */
export function isRecoveryLogValid(log: RecoveryLog | null): log is RecoveryLog {
  if (!log) return false;
  const now = Date.now();
  return now - log.timestamp < log.ttl;
}
```

---

## 📝 Exemplos de Uso Completo

### Exemplo 1: Análise de Abas

```typescript
// UI envia mensagem
const message: AnalyzeTabsMessage = {
  type: MessageType.ANALYZE_TABS,
  timestamp: Date.now()
};

// Background responde
const response: AnalyzeTabsResponse = {
  success: true,
  domains: [
    {
      domain: 'youtube.com',
      tabCount: 18,
      windowCount: 2,
      windowIds: [1, 3]
    },
    {
      domain: 'github.com',
      tabCount: 5,
      windowCount: 1,
      windowIds: [1]
    }
  ]
};
```

---

### Exemplo 2: Fechamento em Lote

```typescript
// UI envia mensagem
const message: CloseBulkTabsMessage = {
  type: MessageType.CLOSE_BULK_TABS,
  payload: {
    tabIds: [1, 2, 3, 4, 5],
    tabs: [
      { url: 'https://youtube.com/1', windowId: 1 },
      { url: 'https://youtube.com/2', windowId: 1 },
      { url: 'https://youtube.com/3', windowId: 3 },
      { url: 'https://youtube.com/4', windowId: 3 },
      { url: 'https://youtube.com/5', windowId: 3 }
    ]
  }
};

// Background responde
const response: CloseBulkTabsResponse = {
  success: true,
  closedCount: 5,
  recoverable: true
};
```

---

### Exemplo 3: Verificação de Recuperação

```typescript
// UI envia mensagem
const message: CheckRecoveryMessage = {
  type: MessageType.CHECK_RECOVERY
};

// Background responde
const response: CheckRecoveryResponse = {
  success: true,
  recoverable: true,
  timeRemaining: 600000, // 10 minutos
  tabCount: 5
};
```

---

## ✅ Checklist de Implementação

Ao implementar cada arquivo de tipos:

- [ ] Exportar todos os tipos, interfaces e enums
- [ ] Documentar com comentários JSDoc
- [ ] Fornecer exemplos de uso quando apropriado
- [ ] Criar barrel export em `index.ts`
- [ ] Garantir type-safety em todas as operações
- [ ] Implementar type guards quando necessário

---

**Próximo**: Leia [DATA_FLOW.md](./DATA_FLOW.md) para entender como os dados fluem entre os componentes usando estes tipos.
