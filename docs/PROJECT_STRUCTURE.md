# PROJECT_STRUCTURE.md

## Estrutura de Pastas e Arquivos

---

## 📁 Visão Geral da Estrutura

```
tab-domain-executor/
├── docs/                           # Documentação do projeto
│   ├── README.md
│   ├── VISION.md
│   ├── SCOPE.md
│   ├── ARCHITECTURE.md
│   ├── PROJECT_STRUCTURE.md
│   ├── DATA_STRUCTURES.md
│   ├── DATA_FLOW.md
│   ├── MODULES.md
│   ├── INSTALLATION.md
│   ├── USAGE.md
│   └── TEST_EXAMPLES.md
│
├── src/                            # Código-fonte
│   ├── background/                 # Background Service Worker
│   │   ├── background.ts           # Entry point do service worker
│   │   ├── message-dispatcher.ts   # Roteador de mensagens
│   │   └── index.ts                # Barrel export
│   │
│   ├── modules/                    # Módulos de lógica de negócio
│   │   ├── tab-reader/             # Leitura de abas
│   │   │   ├── tab-reader.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── normalizer/             # Normalização de URLs
│   │   │   ├── url-normalizer.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── grouper/                # Agrupamento de abas
│   │   │   ├── tab-grouper.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── executor/               # Execução de ações
│   │   │   ├── action-executor.ts
│   │   │   └── index.ts
│   │   │
│   │   └── recovery/               # Gerenciamento de recuperação
│   │       ├── recovery-manager.ts
│   │       └── index.ts
│   │
│   ├── shared/                     # Código compartilhado
│   │   ├── types/                  # Tipos TypeScript
│   │   │   ├── common.types.ts
│   │   │   ├── domain.types.ts
│   │   │   ├── message.types.ts
│   │   │   ├── recovery.types.ts
│   │   │   ├── state.types.ts
│   │   │   ├── tab.types.ts
│   │   │   ├── window.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── constants/              # Constantes do sistema
│   │   │   ├── app.constants.ts
│   │   │   ├── recovery.constants.ts
│   │   │   └── index.ts
│   │   │
│   │   └── utils/                  # Utilitários gerais
│   │       ├── validators.ts
│   │       ├── formatters.ts
│   │       └── index.ts
│   │
│   ├── popup/                      # Interface do usuário
│   │   ├── popup.html              # Estrutura HTML
│   │   ├── popup.ts                # Lógica principal da UI
│   │   ├── styles/                 # Estilos CSS
│   │   │   └── main.css
│   │   │
│   │   └── state/                  # Gerenciamento de estado da UI
│   │       ├── app-state.ts
│   │       └── index.ts
│   │
│   └── manifest.json               # Manifest V3 da extensão
│
├── tests/                          # Testes automatizados
│   ├── setup.ts                    # Configuração global dos testes
│   ├── unit/                       # Testes unitários
│   │   └── modules/
│   │       ├── normalizer.test.ts
│   │       ├── tab-reader.test.ts
│   │       ├── grouper.test.ts
│   │       ├── executor.test.ts
│   │       └── recovery.test.ts
│   │
│   ├── integration/                # Testes de integração
│   │   └── dispatcher.test.ts
│   │
│   └── mocks/                      # Mocks e fixtures
│       ├── chrome.mock.ts
│       └── tab.fixtures.ts
│
├── dist/                           # Build de produção (gerado)
│   ├── background.js
│   ├── popup.html
│   ├── popup.js
│   ├── styles/
│   ├── manifest.json
│   └── assets/
│
├── assets/                         # Recursos estáticos
│   └── screenshots/                # Screenshots da extensão
│
├── config/                         # Configurações das ferramentas
│   ├── eslint.config.js            # Configuração do ESLint
│   ├── jest.config.js              # Configuração do Jest
│   └── .prettierrc                 # Configuração do Prettier
│
├── .gitignore
├── LICENSE
├── package-lock.json
├── package.json
├── README.md                       # README principal
├── tsconfig.json                   # Configuração do TypeScript
└── webpack.config.js               # Configuração do Webpack
```

---

## 📂 Detalhamento de Diretórios

### `/docs` - Documentação

**Propósito**: Centralizar toda a documentação conceitual e técnica

**Conteúdo**:
- Documentação de visão e escopo
- Guias de arquitetura e estrutura
- Especificações de dados e fluxos
- Guias de instalação e uso
- Exemplos de testes

**Justificativa**:
- Separar documentação do código-fonte
- Facilitar navegação e manutenção
- Permitir versionamento independente

---

### `/src` - Código-Fonte

**Propósito**: Todo o código TypeScript da extensão

#### `/src/background`

**Propósito**: Background Service Worker (Manifest V3)

**Arquivos**:
- `background.ts`: Entry point, registra listeners, inicializa sistema
- `message-dispatcher.ts`: Recebe mensagens do popup, roteia para módulos, retorna respostas
- `index.ts`: Barrel export para facilitar importações

**Justificativa**:
- Separar orquestração (background.ts) de roteamento (message-dispatcher.ts)
- Facilitar testes do dispatcher isoladamente
- Permitir expansão futura sem modificar entry point

**Exemplo de Estrutura Interna**:
```typescript
// background.ts
import { handle } from './message-dispatcher';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handle(message, sendResponse);
  return true; // Manter canal aberto para async
});
```

---

#### `/src/modules`

**Propósito**: Módulos de lógica de negócio isolados

**Estrutura de Subpastas**: Cada módulo tem sua própria pasta

##### `/src/modules/tab-reader`

**Responsabilidade**: Leitura de abas e janelas via Chrome API

**Arquivos**:
- `tab-reader.ts`: Implementação das funções de leitura
- `index.ts`: Barrel export

**Funções Principais**:
```typescript
export async function getAllTabs(): Promise<chrome.tabs.Tab[]>
export async function getAllWindows(): Promise<chrome.windows.Window[]>
export async function getTabsByWindowId(windowId: number): Promise<chrome.tabs.Tab[]>
```

---

##### `/src/modules/normalizer`

**Responsabilidade**: Normalização de URLs

**Arquivos**:
- `url-normalizer.ts`: Lógica de extração de domínio
- `index.ts`: Barrel export

**Funções Principais**:
```typescript
export function normalizeUrl(url: string): string | null
export function extractDomain(url: string): string | null
```

> `isValidUrl()` pertence a `shared/utils/validators.ts`

---

##### `/src/modules/grouper`

**Responsabilidade**: Agrupamento de abas

**Arquivos**:
- `tab-grouper.ts`: Lógica de agrupamento
- `index.ts`: Barrel export

**Funções Principais**:
```typescript
export function groupByDomain(tabs: Tab[]): DomainGroup[]
export function groupByWindow(tabs: Tab[], domain: string): WindowGroup[]
export function filterTabsByScope(tabs: Tab[], scope: Scope): Tab[]
```

---

##### `/src/modules/executor`

**Responsabilidade**: Execução de ações destrutivas

**Arquivos**:
- `action-executor.ts`: Execução de fechamento e restauração
- `index.ts`: Barrel export

**Funções Principais**:
```typescript
export async function closeSingleTab(tabId: number): Promise<ActionResult>
export async function closeBulkTabs(tabIds: number[]): Promise<ActionResult>
export async function restoreTabs(tabs: TabMinimal[]): Promise<ActionResult>
```

---

##### `/src/modules/recovery`

**Responsabilidade**: Gerenciamento de log de recuperação

**Arquivos**:
- `recovery-manager.ts`: Lógica de armazenamento e validação
- `index.ts`: Barrel export

**Funções Principais**:
```typescript
export function storeRecoveryLog(tabs: TabMinimal[]): void
export function getRecoveryLog(): RecoveryLog | null
export function hasRecoverableAction(): boolean
export function clearRecoveryLog(): void
```

**Estrutura Interna**:
```typescript
// Variável em memória (não persistente)
let recoveryLog: RecoveryLog | null = null;
```

---

#### `/src/shared`

**Propósito**: Código compartilhado entre módulos e UI

##### `/src/shared/types`

**Responsabilidade**: Definições de tipos TypeScript

**Arquivos**:
- `common.types.ts`: Tipos utilitários comuns
- `domain.types.ts`: Tipos de agrupamento por domínio
- `message.types.ts`: Tipos de mensagens entre popup e background
- `recovery.types.ts`: Tipos de recuperação
- `state.types.ts`: Tipos de estado da aplicação
- `tab.types.ts`: Tipos relacionados a abas
- `window.types.ts`: Tipos de agrupamento por janela
- `index.ts`: Barrel export de todos os tipos

**Justificativa**:
- Garantir type-safety em toda a aplicação
- Facilitar refatoração
- Servir como documentação viva

---

##### `/src/shared/constants`

**Responsabilidade**: Constantes do sistema

**Arquivos**:
- `app.constants.ts`: Constantes gerais (nomes de estados, etc.)
- `recovery.constants.ts`: Constantes de recuperação (TTL, etc.)
- `index.ts`: Barrel export

**Exemplo**:
```typescript
// recovery.constants.ts
export const RECOVERY_TTL_MS = 15 * 60 * 1000; // 15 minutos
export const RECOVERY_LOG_KEY = 'recovery_log';
```

---

##### `/src/shared/utils`

**Responsabilidade**: Funções utilitárias gerais

**Arquivos**:
- `validators.ts`: Validações genéricas
- `formatters.ts`: Formatação de dados (ex: tempo restante)
- `index.ts`: Barrel export

**Exemplo**:
```typescript
// formatters.ts
export function formatTimeRemaining(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  return `${minutes} min restantes`;
}
```

---

#### `/src/popup`

**Propósito**: Interface do usuário (popup da extensão)

**Arquivos Principais**:
- `popup.html`: Estrutura HTML da interface
- `popup.ts`: Lógica principal, event handlers, comunicação com background

##### `/src/popup/styles`

**Arquivos**:
- `main.css`: Estilos globais (inclui variáveis CSS e estilos de componentes)

---

##### `/src/popup/state`

**Propósito**: Gerenciamento de estado da UI

**Arquivos**:
- `app-state.ts`: Estado global da aplicação (qual tela está ativa, dados carregados)
- `index.ts`: Barrel export

**Justificativa**:
- Centralizar lógica de estado
- Facilitar debugging

---

#### `/src/manifest.json`

**Propósito**: Configuração da extensão Chrome (Manifest V3)

**Conteúdo Essencial**:
```json
{
  "manifest_version": 3,
  "name": "Tab Domain Executor",
  "version": "1.0.0",
  "description": "Executar ações destrutivas em abas agrupadas por domínio",
  "permissions": ["tabs"],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "assets/icons/icon16.png",
      "32": "assets/icons/icon32.png",
      "48": "assets/icons/icon48.png",
      "128": "assets/icons/icon128.png"
    }
  }
}
```

---

### `/tests` - Testes

**Propósito**: Testes automatizados (estrutura espelhada do `/src`)

#### `/tests/unit`

**Propósito**: Testes unitários de módulos isolados

**Estrutura**: Espelha `/src/modules`

**Exemplo**:
```typescript
// tests/unit/modules/normalizer.test.ts
import { normalizeUrl } from '@/modules/normalizer';

describe('URL Normalizer', () => {
  it('deve extrair domínio base', () => {
    expect(normalizeUrl('https://www.youtube.com/watch?v=123'))
      .toBe('youtube.com');
  });

  it('deve retornar null para URLs inválidas', () => {
    expect(normalizeUrl('chrome://extensions')).toBeNull();
  });
});
```

---

#### `/tests/integration`

**Propósito**: Testes de integração do MessageDispatcher

**Arquivos**:
- `dispatcher.test.ts`: Testa o fluxo completo de mensagens (analyze, windows, tabs, close, recovery) — 16 testes

---

#### `/tests/mocks`

**Propósito**: Mocks e fixtures para testes

**Arquivos**:
- `chrome.mock.ts`: Mock da Chrome API (tabs.query, tabs.remove, tabs.create)
- `tab.fixtures.ts`: Dados de exemplo de abas para uso nos testes

**Exemplo**:
```typescript
// chrome.mock.ts
export const mockChromeAPI = {
  tabs: {
    query: jest.fn(),
    remove: jest.fn(),
    create: jest.fn(),
  },
  windows: {
    getAll: jest.fn(),
  },
};
```

---

### `/dist` - Build de Produção

**Propósito**: Arquivos compilados prontos para carregar no Chrome

**Conteúdo**: Gerado automaticamente pelo processo de build

**Estrutura**:
```
dist/
├── background.js         # Service worker compilado
├── popup.html            # HTML copiado
├── popup.js              # UI compilada
├── styles/               # CSS copiado/compilado
├── manifest.json         # Manifest copiado
└── assets/               # Recursos copiados
```

**Nota**: Este diretório não é versionado (`.gitignore`)

---

### `/assets` - Recursos Estáticos

**Propósito**: Screenshots da extensão para documentação e README

#### `/assets/screenshots`

**Arquivos**: `TDE-screenshot-01.png` a `TDE-screenshot-06.png`

---

### `/src/assets` - Assets do Código-Fonte

**Propósito**: Ícones da extensão empacotados no build

#### `/src/assets/icons`

**Arquivos**:
- `icon16.png` - 16x16px (toolbar)
- `icon32.png` - 32x32px (Windows)
- `icon48.png` - 48x48px (gerenciador de extensões)
- `icon128.png` - 128x128px (Chrome Web Store)
- `icon.svg` - Versão vetorial
- `icon.png` - Versão base

**Justificativa**: Requerido pelo Manifest V3

---

### `/config` - Configurações das Ferramentas

**Propósito**: Configurações de ferramentas de desenvolvimento

**Arquivos**:
- `eslint.config.js`: Configuração do ESLint (TypeScript rules)
- `jest.config.js`: Configuração do Jest (ts-jest, node environment)
- `.prettierrc`: Configuração do Prettier

---

### `webpack.config.js` (raiz)

**Responsabilidade**: Configurar build do TypeScript para JavaScript

**Principais Configurações**:
- Entry points: `background.ts`, `popup.ts`
- Output: `dist/`
- Loaders: `ts-loader` para TypeScript
- Plugins: `CopyWebpackPlugin` para copiar HTML e assets

---

### `tsconfig.json` (raiz)

**Responsabilidade**: Configurar compilador TypeScript

**Principais Configurações**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

---

#### `jest.config.js`

**Responsabilidade**: Configurar framework de testes

**Principais Configurações**:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/manifest.json',
  ],
};
```

---

### Arquivos de Configuração na Raiz

#### `.gitignore`

**Conteúdo Essencial**:
```
node_modules/
dist/
*.log
.env
.DS_Store
coverage/
```

---

#### `config/eslint.config.js`

**Propósito**: Garantir qualidade e consistência de código TypeScript

---

#### `config/.prettierrc`

**Propósito**: Formatação automática de código

**Exemplo**:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

---

#### `package.json`

**Scripts Essenciais**:
```json
{
  "scripts": {
    "dev": "webpack --mode development --watch",
    "build": "webpack --mode production",
    "test": "jest --config config/jest.config.js",
    "test:watch": "jest --config config/jest.config.js --watch",
    "test:coverage": "jest --config config/jest.config.js --coverage",
    "lint": "eslint -c config/eslint.config.js src/**/*.ts",
    "lint:fix": "eslint -c config/eslint.config.js src/**/*.ts --fix",
    "format": "prettier --config config/.prettierrc --write src/**/*.ts",
    "clean": "rimraf dist coverage"
  },
  "devDependencies": {
    "@types/chrome": "^0.0.260",
    "@typescript-eslint/eslint-plugin": "^6.17.0",
    "@typescript-eslint/parser": "^6.17.0",
    "copy-webpack-plugin": "^12.0.2",
    "eslint": "^8.56.0",
    "jest": "^29.7.0",
    "prettier": "^3.1.1",
    "ts-jest": "^29.1.1",
    "ts-loader": "^9.5.1",
    "typescript": "^5.3.3",
    "webpack": "^5.104.1",
    "webpack-cli": "^5.1.4"
  }
}
```

---

## 🎯 Princípios Organizacionais

### 1. Separação por Responsabilidade

Cada pasta tem uma responsabilidade clara e única:
- `/background` - Orquestração
- `/modules` - Lógica de negócio
- `/popup` - Interface
- `/shared` - Código comum
- `/tests` - Validação

### 2. Escalabilidade

A estrutura permite adicionar novos módulos sem afetar existentes:
```
/src/modules/new-module/
  ├── new-module.ts
  └── index.ts
```

### 3. Testabilidade

Estrutura de testes espelha estrutura de código:
```
/src/modules/grouper/tab-grouper.ts
/tests/unit/modules/grouper.test.ts
```

### 4. Barrel Exports

Cada pasta tem `index.ts` para simplificar importações:
```typescript
// Sem barrel export
import { groupByDomain } from '@/modules/grouper/tab-grouper';

// Com barrel export
import { groupByDomain } from '@/modules/grouper';
```

### 5. Path Aliases

Usar aliases TypeScript para importações limpas:
```typescript
// Sem alias
import { Tab } from '../../../shared/types/tab.types';

// Com alias
import { Tab } from '@/shared/types';
```

---

## 📊 Métricas de Organização

- **Profundidade Máxima**: 4 níveis de pastas
- **Arquivos por Pasta**: Máximo 10 arquivos
- **Linhas por Arquivo**: Máximo 300 linhas
- **Responsabilidade**: 1 responsabilidade por módulo

---

**Próximo**: Leia [DATA_STRUCTURES.md](./DATA_STRUCTURES.md) para ver todos os tipos e interfaces TypeScript.
