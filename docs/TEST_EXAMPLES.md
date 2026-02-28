# TEST_EXAMPLES.md

## Exemplos de Testes e Cenários Críticos

---

## 📋 Visão Geral

Este documento define testes conceituais para validar o funcionamento correto do Tab Domain Executor. Cada teste é descrito em alto nível com:
- **Objetivo** do teste
- **Pré-condições** necessárias
- **Passos** de execução
- **Resultado esperado**
- **Critério de sucesso**

---

## 🎯 Categorias de Testes

1. **Testes Unitários** - Módulos isolados
2. **Testes de Integração** - Fluxos completos
3. **Testes de Segurança** - Ações destrutivas
4. **Testes de Recuperação** - Mecanismo de desfazer
5. **Testes de Edge Cases** - Cenários extremos
6. **Testes de UI/UX** - Interação do usuário

---

## 1️⃣ TESTES UNITÁRIOS

### 1.1 URL Normalizer

#### Teste: Extrair Domínio Base

**Objetivo**: Verificar se URLs são normalizadas corretamente

**Casos de Teste**:

```typescript
describe('normalizeUrl', () => {
  test('deve remover www. do domínio', () => {
    expect(normalizeUrl('https://www.youtube.com/watch?v=abc'))
      .toBe('youtube.com');
  });

  test('deve manter subdomínios diferentes de www', () => {
    expect(normalizeUrl('https://docs.google.com/document/123'))
      .toBe('docs.google.com');
  });

  test('deve retornar null para URLs do Chrome', () => {
    expect(normalizeUrl('chrome://extensions')).toBeNull();
    expect(normalizeUrl('about:blank')).toBeNull();
    expect(normalizeUrl('chrome-extension://abc123')).toBeNull();
  });

  test('deve retornar null para URLs inválidas', () => {
    expect(normalizeUrl('not-a-url')).toBeNull();
    expect(normalizeUrl('')).toBeNull();
    expect(normalizeUrl('http://')).toBeNull();
  });

  test('deve lidar com diferentes protocolos', () => {
    expect(normalizeUrl('http://github.com')).toBe('github.com');
    expect(normalizeUrl('https://github.com')).toBe('github.com');
  });

  test('deve ignorar paths e parâmetros', () => {
    expect(normalizeUrl('https://github.com/user/repo?tab=readme'))
      .toBe('github.com');
  });
});
```

---

### 1.2 Tab Grouper

#### Teste: Agrupar por Domínio

**Objetivo**: Verificar se abas são agrupadas corretamente por domínio

**Casos de Teste**:

```typescript
describe('groupByDomain', () => {
  test('deve agrupar abas pelo mesmo domínio', () => {
    const tabs: Tab[] = [
      { id: 1, domain: 'youtube.com', windowId: 1, /* ... */ },
      { id: 2, domain: 'youtube.com', windowId: 2, /* ... */ },
      { id: 3, domain: 'github.com', windowId: 1, /* ... */ }
    ];

    const groups = groupByDomain(tabs);

    expect(groups).toHaveLength(2);
    expect(groups[0].domain).toBe('youtube.com');
    expect(groups[0].tabCount).toBe(2);
    expect(groups[0].windowCount).toBe(2);
    expect(groups[1].domain).toBe('github.com');
    expect(groups[1].tabCount).toBe(1);
  });

  test('deve ordenar grupos por quantidade de abas (decrescente)', () => {
    const tabs: Tab[] = [
      { id: 1, domain: 'github.com', windowId: 1, /* ... */ },
      { id: 2, domain: 'youtube.com', windowId: 1, /* ... */ },
      { id: 3, domain: 'youtube.com', windowId: 1, /* ... */ },
      { id: 4, domain: 'youtube.com', windowId: 1, /* ... */ }
    ];

    const groups = groupByDomain(tabs);

    expect(groups[0].domain).toBe('youtube.com'); // 3 abas
    expect(groups[1].domain).toBe('github.com'); // 1 aba
  });

  test('deve ignorar abas sem domínio', () => {
    const tabs: Tab[] = [
      { id: 1, domain: 'youtube.com', windowId: 1, /* ... */ },
      { id: 2, domain: null, windowId: 1, /* ... */ }, // chrome:// ou inválida
      { id: 3, domain: 'github.com', windowId: 1, /* ... */ }
    ];

    const groups = groupByDomain(tabs);

    expect(groups).toHaveLength(2); // Apenas youtube e github
  });

  test('deve calcular windowIds corretamente', () => {
    const tabs: Tab[] = [
      { id: 1, domain: 'youtube.com', windowId: 1, /* ... */ },
      { id: 2, domain: 'youtube.com', windowId: 1, /* ... */ },
      { id: 3, domain: 'youtube.com', windowId: 3, /* ... */ }
    ];

    const groups = groupByDomain(tabs);

    expect(groups[0].windowIds).toEqual([1, 3]);
    expect(groups[0].windowCount).toBe(2);
  });
});
```

---

#### Teste: Agrupar por Janela

**Objetivo**: Verificar se abas de um domínio são agrupadas por janela

**Casos de Teste**:

```typescript
describe('groupByWindow', () => {
  test('deve agrupar abas de um domínio por janela', () => {
    const tabs: Tab[] = [
      { id: 1, domain: 'youtube.com', windowId: 1, /* ... */ },
      { id: 2, domain: 'youtube.com', windowId: 1, /* ... */ },
      { id: 3, domain: 'youtube.com', windowId: 2, /* ... */ },
      { id: 4, domain: 'github.com', windowId: 1, /* ... */ }
    ];

    const windows = groupByWindow(tabs, 'youtube.com');

    expect(windows).toHaveLength(2);
    expect(windows[0].windowId).toBe(1);
    expect(windows[0].tabCount).toBe(2);
    expect(windows[1].windowId).toBe(2);
    expect(windows[1].tabCount).toBe(1);
  });

  test('deve filtrar apenas o domínio especificado', () => {
    const tabs: Tab[] = [
      { id: 1, domain: 'youtube.com', windowId: 1, /* ... */ },
      { id: 2, domain: 'github.com', windowId: 1, /* ... */ }
    ];

    const windows = groupByWindow(tabs, 'youtube.com');

    expect(windows).toHaveLength(1);
    expect(windows[0].domain).toBe('youtube.com');
  });

  test('deve retornar array vazio se domínio não existe', () => {
    const tabs: Tab[] = [
      { id: 1, domain: 'youtube.com', windowId: 1, /* ... */ }
    ];

    const windows = groupByWindow(tabs, 'nonexistent.com');

    expect(windows).toHaveLength(0);
  });
});
```

---

#### Teste: Filtrar por Escopo

**Objetivo**: Verificar se abas são filtradas corretamente baseado no escopo

**Casos de Teste**:

```typescript
describe('filterTabsByScope', () => {
  test('deve retornar todas as abas do domínio quando scope="all"', () => {
    const tabs: Tab[] = [
      { id: 1, domain: 'youtube.com', windowId: 1, /* ... */ },
      { id: 2, domain: 'youtube.com', windowId: 2, /* ... */ },
      { id: 3, domain: 'github.com', windowId: 1, /* ... */ }
    ];

    const filtered = filterTabsByScope(tabs, 'youtube.com', 'all');

    expect(filtered).toHaveLength(2);
    expect(filtered.every(t => t.domain === 'youtube.com')).toBe(true);
  });

  test('deve filtrar por janelas quando scope="windows"', () => {
    const tabs: Tab[] = [
      { id: 1, domain: 'youtube.com', windowId: 1, /* ... */ },
      { id: 2, domain: 'youtube.com', windowId: 2, /* ... */ },
      { id: 3, domain: 'youtube.com', windowId: 3, /* ... */ }
    ];

    const filtered = filterTabsByScope(
      tabs, 
      'youtube.com', 
      'windows', 
      [1, 3]
    );

    expect(filtered).toHaveLength(2);
    expect(filtered[0].windowId).toBe(1);
    expect(filtered[1].windowId).toBe(3);
  });

  test('deve lançar erro se scope="windows" mas windowIds não fornecido', () => {
    const tabs: Tab[] = [
      { id: 1, domain: 'youtube.com', windowId: 1, /* ... */ }
    ];

    expect(() => {
      filterTabsByScope(tabs, 'youtube.com', 'windows');
    }).toThrow('windowIds obrigatório quando scope === "windows"');
  });
});
```

---

### 1.3 Recovery Manager

#### Teste: Armazenar e Recuperar Log

**Objetivo**: Verificar se log de recuperação é armazenado e recuperado corretamente

**Casos de Teste**:

```typescript
describe('Recovery Manager', () => {
  beforeEach(() => {
    // Limpar log antes de cada teste
    clearRecoveryLog();
  });

  test('deve armazenar log de recuperação', () => {
    const tabs: TabMinimal[] = [
      { url: 'https://youtube.com/1', windowId: 1 },
      { url: 'https://youtube.com/2', windowId: 2 }
    ];

    storeRecoveryLog(tabs);

    const log = getRecoveryLog();

    expect(log).not.toBeNull();
    expect(log?.tabs).toHaveLength(2);
    expect(log?.tabs[0].url).toBe('https://youtube.com/1');
  });

  test('deve verificar se há ação recuperável', () => {
    const tabs: TabMinimal[] = [
      { url: 'https://youtube.com/1', windowId: 1 }
    ];

    storeRecoveryLog(tabs);

    const status = hasRecoverableAction();

    expect(status.isRecoverable).toBe(true);
    expect(status.tabCount).toBe(1);
    expect(status.timeRemaining).toBeGreaterThan(0);
  });

  test('deve retornar false se não há log', () => {
    const status = hasRecoverableAction();

    expect(status.isRecoverable).toBe(false);
    expect(status.tabCount).toBe(0);
  });

  test('deve substituir log anterior ao armazenar novo', () => {
    const tabs1: TabMinimal[] = [
      { url: 'https://youtube.com/1', windowId: 1 }
    ];
    const tabs2: TabMinimal[] = [
      { url: 'https://github.com/1', windowId: 1 },
      { url: 'https://github.com/2', windowId: 1 }
    ];

    storeRecoveryLog(tabs1);
    storeRecoveryLog(tabs2);

    const log = getRecoveryLog();

    expect(log?.tabs).toHaveLength(2);
    expect(log?.tabs[0].url).toBe('https://github.com/1');
  });

  test('deve limpar log após clearRecoveryLog()', () => {
    const tabs: TabMinimal[] = [
      { url: 'https://youtube.com/1', windowId: 1 }
    ];

    storeRecoveryLog(tabs);
    clearRecoveryLog();

    const log = getRecoveryLog();

    expect(log).toBeNull();
  });
});
```

---

#### Teste: Validação de TTL

**Objetivo**: Verificar se TTL de 15 minutos é respeitado

**Casos de Teste**:

```typescript
describe('Recovery TTL', () => {
  test('deve retornar log válido dentro do TTL', () => {
    const tabs: TabMinimal[] = [
      { url: 'https://youtube.com/1', windowId: 1 }
    ];

    storeRecoveryLog(tabs);

    // Simular passagem de 5 minutos
    jest.advanceTimersByTime(5 * 60 * 1000);

    const status = hasRecoverableAction();

    expect(status.isRecoverable).toBe(true);
    expect(status.timeRemaining).toBeGreaterThan(0);
  });

  test('deve invalidar log após TTL expirar', () => {
    const tabs: TabMinimal[] = [
      { url: 'https://youtube.com/1', windowId: 1 }
    ];

    storeRecoveryLog(tabs);

    // Simular passagem de 16 minutos
    jest.advanceTimersByTime(16 * 60 * 1000);

    const status = hasRecoverableAction();

    expect(status.isRecoverable).toBe(false);
  });

  test('deve calcular tempo restante corretamente', () => {
    const tabs: TabMinimal[] = [
      { url: 'https://youtube.com/1', windowId: 1 }
    ];

    storeRecoveryLog(tabs);

    // Simular passagem de 5 minutos
    jest.advanceTimersByTime(5 * 60 * 1000);

    const status = hasRecoverableAction();
    const expectedRemaining = 10 * 60 * 1000; // 10 minutos

    expect(status.timeRemaining).toBeCloseTo(expectedRemaining, -3);
  });
});
```

---

## 2️⃣ TESTES DE INTEGRAÇÃO

### 2.1 Fluxo Completo: Análise de Abas

**Objetivo**: Verificar fluxo completo de análise de abas

**Pré-condições**:
- Service worker inicializado
- Popup aberto
- Múltiplas abas abertas em diferentes janelas

**Passos**:
1. Mockar `chrome.tabs.query()` para retornar array de abas
2. UI envia mensagem `ANALYZE_TABS`
3. Background processa mensagem
4. Normalizer normaliza URLs
5. Grouper agrupa por domínio
6. Background retorna `DomainGroup[]`
7. UI renderiza cards de domínios

**Resultado Esperado**:
```typescript
{
  success: true,
  domains: [
    {
      domain: 'youtube.com',
      tabCount: 5,
      windowCount: 2,
      windowIds: [1, 2]
    },
    {
      domain: 'github.com',
      tabCount: 3,
      windowCount: 1,
      windowIds: [1]
    }
  ]
}
```

**Critério de Sucesso**:
- ✅ Mensagem processada sem erros
- ✅ Domínios retornados corretamente
- ✅ Contagens de abas corretas
- ✅ WindowIds corretos

---

### 2.2 Fluxo Completo: Fechamento em Lote

**Objetivo**: Verificar fluxo completo de fechamento de abas em lote

**Pré-condições**:
- Abas já analisadas
- Domínio e escopo selecionados

**Passos**:
1. UI envia mensagem `CLOSE_BULK_TABS` com IDs e dados mínimos
2. Background chama `Executor.closeBulkTabs()`
3. Executor chama `chrome.tabs.remove()`
4. Background chama `RecoveryManager.storeRecoveryLog()`
5. Background retorna sucesso com flag `recoverable: true`
6. UI exibe feedback

**Resultado Esperado**:
```typescript
{
  success: true,
  closedCount: 5,
  recoverable: true
}
```

**Critério de Sucesso**:
- ✅ Abas fechadas via Chrome API
- ✅ Log de recuperação armazenado
- ✅ Resposta correta retornada
- ✅ UI atualizada com feedback

**Verificações Adicionais**:
```typescript
// Verificar que chrome.tabs.remove foi chamado
expect(chrome.tabs.remove).toHaveBeenCalledWith([1, 2, 3, 4, 5]);

// Verificar que log foi armazenado
const log = getRecoveryLog();
expect(log).not.toBeNull();
expect(log?.tabs).toHaveLength(5);
```

---

### 2.3 Fluxo Completo: Recuperação

**Objetivo**: Verificar fluxo completo de recuperação de abas

**Pré-condições**:
- Fechamento em lote realizado anteriormente
- Log de recuperação válido (dentro de 15 min)

**Passos**:
1. UI envia mensagem `CHECK_RECOVERY`
2. Background verifica se há log válido
3. Background retorna status de recuperação
4. UI renderiza botão de recuperação
5. Usuário clica no botão
6. UI envia mensagem `RECOVER_LAST_ACTION`
7. Background recupera log
8. Executor recria abas via `chrome.tabs.create()`
9. Background limpa log
10. Background retorna sucesso

**Resultado Esperado**:
```typescript
// Resposta de CHECK_RECOVERY
{
  success: true,
  recoverable: true,
  timeRemaining: 600000,
  tabCount: 5
}

// Resposta de RECOVER_LAST_ACTION
{
  success: true,
  restoredCount: 5
}
```

**Critério de Sucesso**:
- ✅ Status correto retornado
- ✅ Abas recriadas com URLs e windowIds corretos
- ✅ Log limpo após recuperação
- ✅ Próxima verificação retorna `recoverable: false`

**Verificações Adicionais**:
```typescript
// Verificar que chrome.tabs.create foi chamado para cada aba
expect(chrome.tabs.create).toHaveBeenCalledTimes(5);

// Verificar que log foi limpo
const log = getRecoveryLog();
expect(log).toBeNull();
```

---

## 3️⃣ TESTES DE SEGURANÇA

### 3.1 Prevenção de Ações Acidentais

**Objetivo**: Garantir que ações destrutivas não ocorrem sem intenção explícita

**Cenários de Teste**:

#### Teste: Nenhuma ação ao abrir popup
```typescript
test('não deve fechar abas ao abrir popup', () => {
  // Abrir popup
  openPopup();

  // Verificar que nenhuma aba foi fechada
  expect(chrome.tabs.remove).not.toHaveBeenCalled();
});
```

#### Teste: Nenhuma ação ao analisar abas
```typescript
test('não deve fechar abas ao analisar', async () => {
  // Analisar abas
  await sendMessage({ type: MessageType.ANALYZE_TABS });

  // Verificar que nenhuma aba foi fechada
  expect(chrome.tabs.remove).not.toHaveBeenCalled();
});
```

#### Teste: Nenhuma ação ao visualizar domínios
```typescript
test('não deve ter botões de ação na tela de domínios', () => {
  // Renderizar tela de domínios
  renderDomainView(mockDomains);

  // Verificar que não há botões de fechar
  const closeButtons = document.querySelectorAll('[data-action="close"]');
  expect(closeButtons).toHaveLength(0);
});
```

---

### 3.2 Validação de Escopo

**Objetivo**: Garantir que apenas abas dentro do escopo são afetadas

**Cenários de Teste**:

#### Teste: Apenas domínio selecionado é afetado
```typescript
test('deve fechar apenas abas do domínio selecionado', async () => {
  const tabs: Tab[] = [
    { id: 1, domain: 'youtube.com', windowId: 1, /* ... */ },
    { id: 2, domain: 'youtube.com', windowId: 1, /* ... */ },
    { id: 3, domain: 'github.com', windowId: 1, /* ... */ }
  ];

  // Fechar apenas youtube.com
  await closeBulkTabs([1, 2]);

  // Verificar que apenas IDs corretos foram passados
  expect(chrome.tabs.remove).toHaveBeenCalledWith([1, 2]);
  expect(chrome.tabs.remove).not.toHaveBeenCalledWith(
    expect.arrayContaining([3])
  );
});
```

#### Teste: Apenas janelas selecionadas são afetadas
```typescript
test('deve fechar apenas abas das janelas selecionadas', async () => {
  const tabs: Tab[] = [
    { id: 1, domain: 'youtube.com', windowId: 1, /* ... */ },
    { id: 2, domain: 'youtube.com', windowId: 2, /* ... */ },
    { id: 3, domain: 'youtube.com', windowId: 3, /* ... */ }
  ];

  // Filtrar apenas janelas 1 e 3
  const filtered = filterTabsByScope(
    tabs, 
    'youtube.com', 
    'windows', 
    [1, 3]
  );

  expect(filtered).toHaveLength(2);
  expect(filtered.map(t => t.id)).toEqual([1, 3]);
});
```

---

### 3.3 Proteção Contra Erros de API

**Objetivo**: Garantir que erros da Chrome API são tratados gracefully

**Cenários de Teste**:

#### Teste: Erro ao fechar aba já fechada
```typescript
test('deve tratar erro quando aba já foi fechada', async () => {
  // Mockar erro
  chrome.tabs.remove = jest.fn().mockRejectedValue(
    new Error('Tab not found')
  );

  const result = await closeSingleTab(999);

  expect(result.success).toBe(false);
  expect(result.error).toContain('Falha ao fechar aba');
});
```

#### Teste: Erro ao acessar abas sem permissão
```typescript
test('deve tratar erro de permissão', async () => {
  chrome.tabs.query = jest.fn().mockRejectedValue(
    new Error('Permission denied')
  );

  await expect(
    async () => await getAllTabs()
  ).rejects.toThrow('Falha ao acessar abas do navegador');
});
```

---

## 4️⃣ TESTES DE EDGE CASES

### 4.1 Cenários de Dados Vazios

#### Teste: Nenhuma aba aberta
```typescript
test('deve retornar array vazio se não há abas', async () => {
  chrome.tabs.query = jest.fn().mockResolvedValue([]);

  const tabs = await getAllTabs();

  expect(tabs).toHaveLength(0);
});

test('deve retornar mensagem apropriada na UI', async () => {
  const response = await sendMessage({
    type: MessageType.ANALYZE_TABS
  });

  expect(response.success).toBe(true);
  expect(response.domains).toHaveLength(0);
});
```

---

#### Teste: Apenas abas do Chrome (chrome://)
```typescript
test('deve ignorar abas chrome:// ao agrupar', () => {
  const tabs: Tab[] = [
    { id: 1, domain: null, url: 'chrome://extensions', /* ... */ },
    { id: 2, domain: null, url: 'chrome://settings', /* ... */ }
  ];

  const groups = groupByDomain(tabs);

  expect(groups).toHaveLength(0);
});
```

---

### 4.2 Cenários de Volume Alto

#### Teste: 100+ abas de um domínio
```typescript
test('deve agrupar corretamente 100+ abas', () => {
  const tabs: Tab[] = Array.from({ length: 150 }, (_, i) => ({
    id: i + 1,
    domain: 'youtube.com',
    windowId: (i % 5) + 1, // 5 janelas
    url: `https://youtube.com/watch?v=${i}`,
    title: `Video ${i}`,
    active: false,
    index: i
  }));

  const groups = groupByDomain(tabs);

  expect(groups).toHaveLength(1);
  expect(groups[0].tabCount).toBe(150);
  expect(groups[0].windowCount).toBe(5);
});
```

---

#### Teste: Fechar 100+ abas em lote
```typescript
test('deve fechar 100+ abas sem erro', async () => {
  const tabIds = Array.from({ length: 150 }, (_, i) => i + 1);

  const result = await closeBulkTabs(tabIds);

  expect(result.success).toBe(true);
  expect(result.data.closedCount).toBe(150);
  expect(chrome.tabs.remove).toHaveBeenCalledWith(tabIds);
});
```

---

### 4.3 Cenários de Concorrência

#### Teste: Múltiplas ações em lote rápidas
```typescript
test('deve sobrescrever log ao executar múltiplas ações', () => {
  const tabs1: TabMinimal[] = [
    { url: 'https://youtube.com/1', windowId: 1 }
  ];
  const tabs2: TabMinimal[] = [
    { url: 'https://github.com/1', windowId: 1 }
  ];

  storeRecoveryLog(tabs1);
  storeRecoveryLog(tabs2);

  const log = getRecoveryLog();

  // Apenas segunda ação é recuperável
  expect(log?.tabs[0].url).toBe('https://github.com/1');
});
```

---

### 4.4 Cenários de Dados Corrompidos

#### Teste: URL malformada
```typescript
test('deve tratar URL malformada gracefully', () => {
  expect(normalizeUrl('htp://invalid')).toBeNull();
  expect(normalizeUrl('://no-protocol')).toBeNull();
  expect(normalizeUrl('http://')).toBeNull();
});
```

---

#### Teste: TabId inválido
```typescript
test('deve tratar tabId inválido', async () => {
  chrome.tabs.remove = jest.fn().mockRejectedValue(
    new Error('Invalid tab ID')
  );

  const result = await closeSingleTab(-1);

  expect(result.success).toBe(false);
});
```

---

## 5️⃣ TESTES DE UI/UX

### 5.1 Navegação Entre Estados

**Objetivo**: Verificar transições de estado corretas

```typescript
describe('Flow State Transitions', () => {
  test('deve transitar de INITIAL para LOADING_ANALYSIS', async () => {
    setState({ currentFlow: FlowState.INITIAL });

    // Usuário clica em "Analisar Abas"
    await analyzeTabs();

    expect(getState().currentFlow).toBe(FlowState.LOADING_ANALYSIS);
  });

  test('deve transitar de LOADING_ANALYSIS para DOMAIN_VIEW', async () => {
    setState({ currentFlow: FlowState.LOADING_ANALYSIS });

    // Análise completa
    await onAnalysisComplete(mockDomains);

    expect(getState().currentFlow).toBe(FlowState.DOMAIN_VIEW);
  });

  test('deve voltar para DOMAIN_VIEW ao clicar em "Voltar"', () => {
    setState({ currentFlow: FlowState.SCOPE_SELECTION });

    // Usuário clica em "Voltar"
    goBack();

    expect(getState().currentFlow).toBe(FlowState.DOMAIN_VIEW);
  });
});
```

---

### 5.2 Renderização Condicional

**Objetivo**: Verificar que elementos UI aparecem apenas quando apropriado

```typescript
describe('Conditional Rendering', () => {
  test('botão de recuperação só aparece se há log válido', () => {
    // Sem log
    renderInitialState({ recoveryStatus: null });
    expect(document.querySelector('#recovery-btn')).toBeNull();

    // Com log válido
    renderInitialState({ 
      recoveryStatus: { 
        isRecoverable: true, 
        tabCount: 5,
        timeRemaining: 600000,
        expiresAt: Date.now() + 600000
      } 
    });
    expect(document.querySelector('#recovery-btn')).not.toBeNull();
  });

  test('botões de ação só aparecem em TAB_ACTION_VIEW', () => {
    // Em DOMAIN_VIEW
    setState({ currentFlow: FlowState.DOMAIN_VIEW });
    renderDomainView(mockDomains);
    expect(document.querySelector('[data-action="close-all"]')).toBeNull();

    // Em TAB_ACTION_VIEW
    setState({ currentFlow: FlowState.TAB_ACTION_VIEW });
    renderTabActionView(mockTabs);
    expect(document.querySelector('[data-action="close-all"]')).not.toBeNull();
  });
});
```

---

### 5.3 Feedback Visual

**Objetivo**: Verificar que usuário recebe feedback apropriado

```typescript
describe('Visual Feedback', () => {
  test('deve exibir loading durante ação', async () => {
    // Iniciar ação
    setState({ isLoading: true });
    renderLoading();

    expect(document.querySelector('.loading-indicator')).not.toBeNull();
  });

  test('deve exibir mensagem de sucesso após fechamento', () => {
    renderFeedback('5 abas fechadas com sucesso!', 'success');

    const feedback = document.querySelector('.feedback-success');
    expect(feedback).not.toBeNull();
    expect(feedback?.textContent).toContain('5 abas fechadas');
  });

  test('deve exibir mensagem de erro em caso de falha', () => {
    renderFeedback('Falha ao fechar abas', 'error');

    const feedback = document.querySelector('.feedback-error');
    expect(feedback).not.toBeNull();
    expect(feedback?.textContent).toContain('Falha');
  });
});
```

---

## 6️⃣ TESTES DE PERFORMANCE

### 6.1 Tempo de Análise

**Objetivo**: Garantir que análise de abas é rápida

```typescript
test('análise de 100 abas deve completar em menos de 1 segundo', async () => {
  const tabs = createMockTabs(100);
  chrome.tabs.query = jest.fn().mockResolvedValue(tabs);

  const start = performance.now();
  await sendMessage({ type: MessageType.ANALYZE_TABS });
  const end = performance.now();

  expect(end - start).toBeLessThan(1000);
});
```

---

### 6.2 Memória

**Objetivo**: Garantir que log de recuperação não causa vazamento de memória

```typescript
test('log deve ser limpo após recuperação', () => {
  const tabs: TabMinimal[] = Array.from({ length: 100 }, (_, i) => ({
    url: `https://youtube.com/${i}`,
    windowId: 1
  }));

  storeRecoveryLog(tabs);
  clearRecoveryLog();

  const log = getRecoveryLog();
  expect(log).toBeNull();
});
```

---

## ✅ Checklist de Cobertura de Testes

### Módulos Unitários
- [ ] URL Normalizer (6+ testes)
- [ ] Tab Grouper (8+ testes)
- [ ] Recovery Manager (7+ testes)
- [ ] Action Executor (3+ testes)
- [ ] Tab Reader (3+ testes)

### Integração
- [ ] Fluxo de análise completo
- [ ] Fluxo de fechamento completo
- [ ] Fluxo de recuperação completo

### Segurança
- [ ] Nenhuma ação sem intenção explícita
- [ ] Validação de escopo correta
- [ ] Tratamento de erros de API

### Edge Cases
- [ ] Dados vazios
- [ ] Volume alto (100+ abas)
- [ ] Concorrência
- [ ] Dados corrompidos

### UI/UX
- [ ] Transições de estado
- [ ] Renderização condicional
- [ ] Feedback visual

### Performance
- [ ] Tempo de análise < 1s para 100 abas
- [ ] Sem vazamento de memória

---

## 🚀 Executar Testes

### Comando
```bash
# Todos os testes
npm test

# Apenas unitários
npm test -- --testPathPattern=unit

# Apenas integração
npm test -- --testPathPattern=integration

# Com cobertura
npm run test:coverage
```

### Meta de Cobertura
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

---

## 📝 Notas Finais

- Todos os testes devem ser **independentes** (não depender uns dos outros)
- Usar **mocks** para Chrome APIs
- Usar **fixtures** para dados de teste consistentes
- Sempre **limpar estado** entre testes (beforeEach)
- Testes devem ser **rápidos** (< 100ms cada)
- Testes devem ser **determinísticos** (mesmo resultado sempre)

---

**Fim da Documentação**

Todas as 11 documentações foram completadas:
1. ✅ README.md
2. ✅ VISION.md
3. ✅ SCOPE.md
4. ✅ ARCHITECTURE.md
5. ✅ PROJECT_STRUCTURE.md
6. ✅ DATA_STRUCTURES.md
7. ✅ DATA_FLOW.md
8. ✅ MODULES.md
9. ✅ INSTALLATION.md
10. ✅ USAGE.md
11. ✅ TEST_EXAMPLES.md

**Próximo passo**: Implementação do código seguindo rigorosamente esta documentação.
