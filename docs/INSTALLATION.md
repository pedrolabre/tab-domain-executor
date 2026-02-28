# INSTALLATION.md

## Guia de Instalação e Configuração

---

## 📋 Visão Geral

Este documento fornece instruções completas para:
- Configurar o ambiente de desenvolvimento
- Instalar dependências
- Buildar a extensão
- Carregar a extensão no Chrome
- Executar testes
- Fazer deploy

---

## 🔧 Pré-requisitos

### Software Necessário

#### Node.js (versão 18+ recomendada)
```bash
# Verificar versão instalada
node --version

# Deve retornar v18.x.x ou superior
```

**Download**: https://nodejs.org/

---

#### npm (vem com Node.js)
```bash
# Verificar versão instalada
npm --version

# Deve retornar 9.x.x ou superior
```

---

#### Git (opcional, para controle de versão)
```bash
# Verificar versão instalada
git --version
```

**Download**: https://git-scm.com/

---

#### Google Chrome (versão 88+)
A extensão requer Chrome 88 ou superior para suporte completo ao Manifest V3.

---

### Conhecimentos Recomendados

- TypeScript básico
- Chrome Extensions básico
- Node.js e npm
- Linha de comando

---

## 📦 Instalação

### Passo 1: Clonar ou Baixar o Projeto

#### Opção A: Com Git
```bash
git clone https://github.com/seu-usuario/tab-domain-executor.git
cd tab-domain-executor
```

#### Opção B: Download Manual
1. Baixe o arquivo ZIP do projeto
2. Extraia para uma pasta de sua escolha
3. Navegue até a pasta via terminal

---

### Passo 2: Instalar Dependências

```bash
# Instalar todas as dependências do projeto
npm install
```

**O que será instalado**:
- TypeScript
- Webpack (bundler)
- ESLint (linter)
- Prettier (formatador)
- Jest (testes)
- @types/chrome (tipos TypeScript para Chrome API)

**Tempo estimado**: 1-3 minutos (dependendo da conexão)

---

### Passo 3: Verificar Instalação

```bash
# Verificar se TypeScript foi instalado
npx tsc --version

# Verificar se Webpack foi instalado
npx webpack --version

# Listar todos os scripts disponíveis
npm run
```

---

## 🏗️ Build do Projeto

### Build de Desenvolvimento

```bash
npm run dev
```

**O que acontece**:
- TypeScript é compilado para JavaScript
- Arquivos são copiados para `/dist`
- Webpack fica em modo watch (recompila automaticamente ao salvar)
- Source maps são gerados para debugging

**Saída**:
```
dist/
├── background.js
├── background.js.map
├── popup.html
├── popup.js
├── popup.js.map
├── styles/
│   └── main.css
├── manifest.json
└── assets/
    └── icons/
```

**Deixe este comando rodando durante o desenvolvimento**.

---

### Build de Produção

```bash
npm run build
```

**O que acontece**:
- TypeScript é compilado com otimizações
- Código é minificado
- Source maps não são gerados (ou são externos)
- Arquivos prontos para distribuição

**Use este comando antes de fazer upload na Chrome Web Store**.

---

### Limpar Build Anterior

```bash
# Remover pasta dist/
rm -rf dist

# Ou no Windows
rmdir /s /q dist
```

---

## 🔌 Carregar Extensão no Chrome

### Passo 1: Abrir Gerenciador de Extensões

1. Abra o Google Chrome
2. Digite na barra de endereços: `chrome://extensions`
3. Pressione Enter

**Ou**:
1. Menu (⋮) → Mais ferramentas → Extensões

---

### Passo 2: Habilitar Modo de Desenvolvedor

1. No canto superior direito, ative o toggle **"Modo do desenvolvedor"**

![Toggle Modo Desenvolvedor](https://developer.chrome.com/static/docs/extensions/mv3/getstarted/development-basics/image/extensions-page-e0d64d89a6acf_1920.png)

---

### Passo 3: Carregar Extensão

1. Clique no botão **"Carregar sem compactação"**
2. Navegue até a pasta `dist/` do projeto
3. Selecione a pasta `dist/`
4. Clique em **"Selecionar pasta"** (ou "Open")

**Resultado**: A extensão aparecerá na lista com o nome "Tab Domain Executor"

---

### Passo 4: Fixar Extensão na Barra

1. Clique no ícone de extensões (🧩) na barra do Chrome
2. Encontre "Tab Domain Executor"
3. Clique no ícone de alfinete (📌) para fixar

**Agora a extensão estará sempre visível na barra**.

---

### Passo 5: Testar Extensão

1. Abra algumas abas de diferentes domínios (YouTube, GitHub, etc.)
2. Clique no ícone da extensão
3. Clique em "Analisar Abas"
4. Verifique se os domínios são exibidos corretamente

---

## 🔄 Atualizar Extensão Durante Desenvolvimento

### Quando Atualizar

Você precisa atualizar a extensão quando:
- ✅ Modificar código em `src/background/`
- ✅ Modificar `manifest.json`
- ✅ Adicionar novos arquivos

**Não** precisa atualizar quando:
- ❌ Modificar apenas `popup.ts` ou `popup.html` (basta reabrir o popup)
- ❌ Modificar apenas CSS

---

### Como Atualizar

#### Método 1: Botão de Atualização
1. Vá para `chrome://extensions`
2. Encontre "Tab Domain Executor"
3. Clique no ícone de atualização (🔄)

#### Método 2: Atalho de Teclado
1. Em `chrome://extensions`
2. Pressione `Ctrl+R` (Windows/Linux) ou `Cmd+R` (Mac)

#### Método 3: Recarregar Completo
1. Em `chrome://extensions`
2. Clique em "Remover"
3. Carregue novamente seguindo os passos anteriores

---

## 🧪 Executar Testes

### Testes Unitários

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch (reexecuta ao salvar)
npm run test:watch

# Executar testes com cobertura
npm run test:coverage
```

**Saída Esperada**:
```
PASS  tests/unit/modules/normalizer.test.ts
PASS  tests/unit/modules/tab-reader.test.ts
PASS  tests/unit/modules/grouper.test.ts
PASS  tests/unit/modules/executor.test.ts
PASS  tests/unit/modules/recovery.test.ts
PASS  tests/integration/dispatcher.test.ts

Test Suites: 6 passed, 6 total
Tests:       62 passed, 62 total
Snapshots:   0 total
Time:        3.5 s
```

---

### Testes de Integração

```bash
# Executar testes de integração
npm run test:integration
```

---

### Ver Cobertura de Testes

```bash
npm run test:coverage

# Abrir relatório HTML de cobertura
# Windows
start coverage/lcov-report/index.html

# Mac
open coverage/lcov-report/index.html

# Linux
xdg-open coverage/lcov-report/index.html
```

---

## 🔍 Debugging

### Debuggar Background Service Worker

1. Vá para `chrome://extensions`
2. Encontre "Tab Domain Executor"
3. Clique em **"service worker"** (link azul)
4. DevTools será aberto

**Ou**:
1. Pressione `F12` enquanto o popup estiver aberto
2. Vá para a aba "Application"
3. No menu lateral, clique em "Service Workers"

**Console Logs**:
```typescript
// Em background.ts
console.log('Background inicializado');
```

---

### Debuggar Popup UI

1. Clique no ícone da extensão para abrir o popup
2. Clique com botão direito no popup
3. Selecione **"Inspecionar"**
4. DevTools será aberto

**Console Logs**:
```typescript
// Em popup.ts
console.log('Popup inicializado');
```

---

### Debuggar com Breakpoints

1. Abra DevTools (popup ou background)
2. Vá para a aba "Sources"
3. Encontre seu arquivo TypeScript (com source maps)
4. Clique no número da linha para adicionar breakpoint
5. Execute a ação que ativa o código

---

## 🎨 Formatação e Linting

### Verificar Erros de Lint

```bash
# Executar ESLint
npm run lint
```

**Saída se houver erros**:
```
/src/background/background.ts
  10:5  error  'unused' is defined but never used  @typescript-eslint/no-unused-vars

✖ 1 problem (1 error, 0 warnings)
```

---

### Corrigir Automaticamente

```bash
# ESLint tenta corrigir erros automaticamente
npm run lint:fix
```

---

### Formatar Código

```bash
# Formatar todos os arquivos com Prettier
npm run format

# Verificar se arquivos estão formatados (sem modificar)
npm run format:check
```

---

## 📝 Scripts npm Disponíveis

```json
{
  "scripts": {
    "dev": "webpack --mode development --watch",
    "build": "webpack --mode production",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts",
    "format:check": "prettier --check src/**/*.ts",
    "clean": "rm -rf dist coverage"
  }
}
```

---

## 🔧 Configuração do Ambiente

### Variáveis de Ambiente (Opcional)

Crie um arquivo `.env` na raiz do projeto:

```env
# Modo de desenvolvimento
NODE_ENV=development

# Habilitar logs detalhados
DEBUG=true
```

**Nota**: A extensão não usa variáveis de ambiente por padrão, mas você pode configurar se necessário.

---

### Configuração do Editor (VSCode)

#### Extensões Recomendadas

Crie `.vscode/extensions.json`:
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

#### Configurações do Workspace

Crie `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["typescript"],
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## 🚀 Preparar para Produção

### Checklist Pré-Produção

- [ ] Todos os testes passando (`npm test`)
- [ ] Sem erros de lint (`npm run lint`)
- [ ] Código formatado (`npm run format:check`)
- [ ] Build de produção gerado (`npm run build`)
- [ ] Testado manualmente no Chrome
- [ ] Ícones em todas as resoluções presentes
- [ ] `manifest.json` com versão atualizada
- [ ] Descrição e permissões revisadas

---

### Build Final

```bash
# Limpar builds anteriores
npm run clean

# Gerar build de produção
npm run build

# Verificar pasta dist/
ls -la dist/
```

---

### Empacotar para Chrome Web Store

1. Comprimir pasta `dist/`:
```bash
# Linux/Mac
cd dist && zip -r ../tab-domain-executor.zip . && cd ..

# Windows (PowerShell)
Compress-Archive -Path dist\* -DestinationPath tab-domain-executor.zip
```

2. O arquivo `tab-domain-executor.zip` está pronto para upload

---

## ❓ Troubleshooting

### Problema: "npm install" falha

**Solução**:
```bash
# Limpar cache do npm
npm cache clean --force

# Deletar node_modules e package-lock.json
rm -rf node_modules package-lock.json

# Reinstalar
npm install
```

---

### Problema: Extensão não aparece após carregar

**Verificar**:
- [ ] Modo de desenvolvedor está ativado?
- [ ] Pasta `dist/` foi selecionada (não a raiz do projeto)?
- [ ] Build foi executado (`npm run dev` ou `npm run build`)?
- [ ] `manifest.json` está presente em `dist/`?

**Solução**:
```bash
# Rebuild
npm run build

# Recarregar extensão em chrome://extensions
```

---

### Problema: Service Worker não inicia

**Verificar Console**:
1. `chrome://extensions`
2. "Tab Domain Executor" → "Erros"
3. Ler mensagens de erro

**Erros Comuns**:
- Erro de sintaxe em `background.js`
- Permissão faltando em `manifest.json`
- Importação de módulo incorreta

---

### Problema: Popup não abre

**Verificar**:
- [ ] `popup.html` existe em `dist/`?
- [ ] `popup.js` existe em `dist/`?
- [ ] Caminho em `manifest.json` está correto?

**Inspecionar**:
1. Clicar com direito no ícone da extensão
2. "Inspecionar popup"
3. Ver erros no console

---

### Problema: Testes falham

**Solução**:
```bash
# Reinstalar dependências de teste
npm install --save-dev jest ts-jest @types/jest

# Executar novamente
npm test
```

---

### Problema: TypeScript não compila

**Verificar**:
```bash
# Verificar versão do TypeScript
npx tsc --version

# Compilar manualmente para ver erros
npx tsc --noEmit
```

**Ler mensagens de erro** e corrigir problemas de tipo.

---

## 📚 Recursos Adicionais

### Documentação Oficial

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Webpack Documentation](https://webpack.js.org/concepts/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

---

### Comandos Úteis de Referência

```bash
# Desenvolvimento
npm run dev          # Build + watch
npm test            # Executar testes
npm run lint        # Verificar erros

# Produção
npm run build       # Build otimizado
npm run clean       # Limpar builds

# Qualidade de Código
npm run lint:fix    # Corrigir lint
npm run format      # Formatar código
npm run test:coverage # Cobertura de testes
```

---

### Estrutura Esperada Após Build

```
dist/
├── manifest.json                 # ✓ Obrigatório
├── background.js                 # ✓ Obrigatório
├── popup.html                    # ✓ Obrigatório
├── popup.js                      # ✓ Obrigatório
├── styles/
│   └── main.css
├── assets/
│   └── icons/
│       ├── icon16.png           # ✓ Obrigatório
│       ├── icon32.png           # ✓ Obrigatório
│       ├── icon48.png           # ✓ Obrigatório
│       └── icon128.png          # ✓ Obrigatório
└── (source maps em dev mode)
```

---

## ✅ Checklist de Instalação Completa

### Ambiente
- [ ] Node.js 18+ instalado
- [ ] npm funcionando
- [ ] Chrome 88+ instalado

### Projeto
- [ ] Projeto clonado/baixado
- [ ] Dependências instaladas (`npm install`)
- [ ] Build gerado (`npm run dev` ou `npm run build`)

### Chrome
- [ ] Modo de desenvolvedor ativado
- [ ] Extensão carregada em `chrome://extensions`
- [ ] Ícone da extensão visível na barra
- [ ] Popup abre corretamente

### Testes
- [ ] Testes passando (`npm test`)
- [ ] Lint sem erros (`npm run lint`)
- [ ] Extensão testada manualmente

---

**Próximo**: Leia [USAGE.md](./USAGE.md) para entender como usar a extensão passo a passo.
