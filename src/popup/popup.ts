/**
 * Popup UI
 * Lógica principal da interface do usuário
 */

import {
  Message,
  MessageType,
  BaseResponse,
  AnalyzeTabsResponse,
  GetWindowsForDomainResponse,
  GetTabsForDomainResponse,
  CloseSingleTabResponse,
  CloseBulkTabsResponse,
  CheckRecoveryResponse,
  RecoverLastActionResponse,
  FlowState,
  DomainGroup,
  WindowGroup,
  Tab,
  TabScope
} from '../shared/types';

import { formatTabCount, formatWindowCount, formatTimeRemaining } from '../shared/utils';
import { SUCCESS_MESSAGES } from '../shared/constants';
import { getState, setState, setFlow, resetState } from './state';

/**
 * Envia mensagem para o background
 * @param message - Mensagem a enviar
 * @returns Promessa com resposta
 */
async function sendMessage<T extends BaseResponse>(message: Message): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response: T) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else if (!response) {
        reject(new Error('Resposta vazia do background'));
      } else {
        resolve(response);
      }
    });
  });
}

/**
 * Obtém elemento do DOM
 */
function getElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Elemento não encontrado: ${id}`);
  }
  return element;
}

/**
 * Obtém container de conteúdo
 */
function getContentContainer(): HTMLElement {
  return getElement('content');
}

/**
 * Limpa conteúdo
 */
function clearContent(): void {
  getContentContainer().innerHTML = '';
}

/**
 * Renderiza estado inicial
 */
function renderInitialState(): void {
  clearContent();
  setFlow(FlowState.INITIAL);

  const state = getState();
  const container = getContentContainer();

  let html = '<div class="header"><h1>Tab Domain Executor</h1></div>';

  // Verificar se há recuperação disponível
  if (state.recoveryStatus && state.recoveryStatus.isRecoverable) {
    const timeFormatted = formatTimeRemaining(state.recoveryStatus.timeRemaining);
    html += `
      <div class="recovery-box">
        <h3>⚠️ Recuperação Disponível</h3>
        <p>${formatTabCount(state.recoveryStatus.tabCount)} podem ser recuperadas</p>
        <p class="text-small">Tempo restante: ${timeFormatted.formatted}</p>
        <button id="recover-btn" class="button button-primary">
          Recuperar última exclusão
        </button>
      </div>
    `;
  }

  html += `
    <div class="empty-state">
      <div class="empty-state-icon">
        <img src="assets/icons/icon128.png" alt="Ícone TDE" style="width:64px;height:64px;margin-bottom:8px;display:block;margin:auto;" />
      </div>
      <p>Nenhuma análise foi executada</p>
    </div>
    <button id="analyze-btn" class="button button-primary">
      Analisar Abas
    </button>
  `;

  container.innerHTML = html;

  // Event listeners
  const analyzeBtn = document.getElementById('analyze-btn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', handleAnalyzeTabs);
  }

  const recoverBtn = document.getElementById('recover-btn');
  if (recoverBtn) {
    recoverBtn.addEventListener('click', handleRecoverAction);
  }
}

/**
 * Renderiza loading
 */
function renderLoading(message: string = 'Carregando...'): void {
  clearContent();
  const container = getContentContainer();

  container.innerHTML = `
    <div class="loading">
      <div class="loading-spinner"></div>
      <p>${message}</p>
    </div>
  `;
}

/**
 * Renderiza erro
 */
function renderError(message: string): void {
  clearContent();
  setFlow(FlowState.ERROR);

  const container = getContentContainer();

  container.innerHTML = `
    <div class="header">
      <button id="back-btn" class="back-button">← Voltar</button>
      <h1>Erro</h1>
    </div>
    <div class="feedback feedback-error">
      <p>${message}</p>
    </div>
    <button id="retry-btn" class="button button-primary">
      Tentar Novamente
    </button>
  `;

  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      resetState();
      init();
    });
  }

  const retryBtn = document.getElementById('retry-btn');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      resetState();
      init();
    });
  }
}

/**
 * Renderiza visualização de domínios
 */
function renderDomainView(domains: DomainGroup[]): void {
  clearContent();
  setFlow(FlowState.DOMAIN_VIEW);

  const container = getContentContainer();

  let html = `
    <div class="header">
      <button id="back-btn" class="back-button">← Voltar</button>
      <h1>Domínios Encontrados</h1>
    </div>
    <div class="search-filter-bar">
      <input type="text" id="domain-search" class="search-input" placeholder="Buscar domínio..." />
      <select id="domain-sort" class="sort-select">
        <option value="most" selected>Mais abas abertas</option>
        <option value="least">Menos abas abertas</option>
        <option value="oldest">Mais antigo</option>
        <option value="recent">Mais recente</option>
        <option value="az">A → Z</option>
        <option value="za">Z → A</option>
      </select>
    </div>
  `;

  if (domains.length === 0) {
    html += `
      <div class="empty-state">
        <p>Nenhum domínio encontrado</p>
      </div>
    `;
  } else {
    html += '<div class="domain-list" id="domain-list"></div>';
  }

  container.innerHTML = html;

  // Event listeners
  const backBtn = document.getElementById('back-btn');
  // Função para renderizar lista filtrada e ordenada
  function renderDomainCards(filteredDomains: DomainGroup[]) {
    const list = document.getElementById('domain-list');
    if (!list) return;
    let cardsHtml = '';
    filteredDomains.forEach(domain => {
      cardsHtml += `
        <div class="card domain-card" data-domain="${domain.domain}">
          <div class="card-header">
            <div class="card-title">${domain.domain}</div>
          </div>
          <div class="card-subtitle">
            ${formatTabCount(domain.tabCount)} em ${formatWindowCount(domain.windowCount)}
          </div>
        </div>
      `;
    });
    list.innerHTML = cardsHtml;
    // Reaplicar listeners
    const domainCards = document.querySelectorAll('.domain-card');
    domainCards.forEach(card => {
      card.addEventListener('click', () => {
        const domain = card.getAttribute('data-domain');
        if (domain) {
          handleSelectDomain(domain);
        }
      });
    });
  }

  // Ordenação inicial: Mais abas abertas
  let sortMode = 'most';
  let searchTerm = '';
  function getSortedFilteredDomains() {
    let filtered = domains;
    if (searchTerm) {
      filtered = filtered.filter(d => d.domain.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    let sorted = [...filtered];
    if (sortMode === 'most') {
      sorted.sort((a, b) => b.tabCount - a.tabCount);
    } else if (sortMode === 'least') {
      sorted.sort((a, b) => a.tabCount - b.tabCount);
    } else if (sortMode === 'az') {
      sorted.sort((a, b) => a.domain.localeCompare(b.domain));
    } else if (sortMode === 'za') {
      sorted.sort((a, b) => b.domain.localeCompare(a.domain));
    } else if (sortMode === 'oldest') {
      // Mais antigo: domínio cuja aba com menor ID (mais antiga) vem primeiro
      sorted.sort((a, b) => {
        const aMin = a.minTabId ?? Infinity;
        const bMin = b.minTabId ?? Infinity;
        return aMin - bMin;
      });
    } else {
      // Mais recente: domínio cuja aba com maior ID (mais nova) vem primeiro
      sorted.sort((a, b) => {
        const aMax = a.maxTabId ?? -Infinity;
        const bMax = b.maxTabId ?? -Infinity;
        return bMax - aMax;
      });
    }
    return sorted;
  }

  // Inicial
  renderDomainCards(getSortedFilteredDomains());

  // Listeners de busca e filtro
  const searchInput = document.getElementById('domain-search') as HTMLInputElement;
  const sortSelect = document.getElementById('domain-sort') as HTMLSelectElement;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchTerm = searchInput.value;
      renderDomainCards(getSortedFilteredDomains());
    });
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      sortMode = sortSelect.value;
      renderDomainCards(getSortedFilteredDomains());
    });
  }
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      resetState();
      init();
    });
  }

  const domainCards = document.querySelectorAll('.domain-card');
  domainCards.forEach(card => {
    card.addEventListener('click', () => {
      const domain = card.getAttribute('data-domain');
      if (domain) {
        handleSelectDomain(domain);
      }
    });
  });
}

/**
 * Renderiza seleção de escopo
 */
function renderScopeSelection(domain: string, windowCount: number, tabCount: number): void {
  clearContent();
  setFlow(FlowState.SCOPE_SELECTION);

  const container = getContentContainer();

  container.innerHTML = `
    <div class="header">
      <button id="back-btn" class="back-button">← Voltar</button>
      <h1>Escolher Escopo</h1>
    </div>
    
    <div class="card">
      <div class="card-title">Domínio: ${domain}</div>
      <div class="card-subtitle">${formatTabCount(tabCount)} em ${formatWindowCount(windowCount)}</div>
    </div>

    <div class="scope-options">
      <div class="scope-option" id="scope-all">
        <h3>Todas as janelas</h3>
        <p>Fechar ${formatTabCount(tabCount)} em ${formatWindowCount(windowCount)}</p>
      </div>

      <div class="scope-option" id="scope-windows">
        <h3>Escolher janelas</h3>
        <p>Selecionar manualmente</p>
      </div>
    </div>
  `;

  // Event listeners
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      const state = getState();
      renderDomainView(state.domains);
    });
  }

  const scopeAll = document.getElementById('scope-all');
  if (scopeAll) {
    scopeAll.addEventListener('click', () => handleScopeAll(domain));
  }

  const scopeWindows = document.getElementById('scope-windows');
  if (scopeWindows) {
    scopeWindows.addEventListener('click', () => handleScopeWindows(domain));
  }
}

/**
 * Renderiza seleção de janelas
 */
function renderWindowSelection(windows: WindowGroup[], domain: string): void {
  clearContent();
  setFlow(FlowState.WINDOW_SELECTION);

  const container = getContentContainer();
  const state = getState();

  let html = `
    <div class="header">
      <button id="back-btn" class="back-button">← Voltar</button>
      <h1>Escolher Janelas</h1>
    </div>

    <div class="card">
      <div class="card-title">Domínio: ${domain}</div>
      <div class="card-subtitle">Selecione as janelas</div>
    </div>

    <div class="window-list">
  `;

  windows.forEach(window => {
    const isSelected = state.selectedWindowIds.includes(window.windowId);
    html += `
      <div class="card checkbox-card ${isSelected ? 'selected' : ''}" data-window-id="${window.windowId}">
        <input type="checkbox" ${isSelected ? 'checked' : ''} />
        <div class="card-title">${window.windowTitle}</div>
        <div class="card-subtitle">${formatTabCount(window.tabCount)} de ${domain}</div>
      </div>
    `;
  });

  html += `
    </div>
    <button id="continue-btn" class="button button-primary" ${state.selectedWindowIds.length === 0 ? 'disabled' : ''}>
      Continuar (${formatTabCount(state.selectedWindowIds.reduce((acc, id) => {
        const window = windows.find(w => w.windowId === id);
        return acc + (window?.tabCount || 0);
      }, 0))})
    </button>
  `;

  container.innerHTML = html;

  // Event listeners
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      const totalTabs = windows.reduce((acc, w) => acc + w.tabCount, 0);
      renderScopeSelection(domain, windows.length, totalTabs);
    });
  }

  const windowCards = document.querySelectorAll('.checkbox-card');
  windowCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).tagName !== 'INPUT') {
        const checkbox = card.querySelector('input[type="checkbox"]') as HTMLInputElement;
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event('change'));
        }
      }
    });

    const checkbox = card.querySelector('input[type="checkbox"]') as HTMLInputElement;
    if (checkbox) {
      checkbox.addEventListener('change', (e) => {
        const windowId = parseInt(card.getAttribute('data-window-id') || '0');
        const state = getState();
        
        if ((e.target as HTMLInputElement).checked) {
          if (!state.selectedWindowIds.includes(windowId)) {
            setState({ selectedWindowIds: [...state.selectedWindowIds, windowId] });
          }
          card.classList.add('selected');
        } else {
          setState({ selectedWindowIds: state.selectedWindowIds.filter(id => id !== windowId) });
          card.classList.remove('selected');
        }

        // Atualizar botão
        const continueBtn = document.getElementById('continue-btn') as HTMLButtonElement;
        const updatedState = getState();
        const selectedCount = updatedState.selectedWindowIds.reduce((acc, id) => {
          const window = windows.find(w => w.windowId === id);
          return acc + (window?.tabCount || 0);
        }, 0);

        if (continueBtn) {
          continueBtn.disabled = updatedState.selectedWindowIds.length === 0;
          continueBtn.textContent = `Continuar (${formatTabCount(selectedCount)})`;
        }
      });
    }
  });

  const continueBtn = document.getElementById('continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => handleContinueWithWindows(domain));
  }
}

/**
 * Renderiza lista de abas para ação
 */
function renderTabActionView(tabs: Tab[], domain: string, scope: TabScope): void {
  clearContent();
  setFlow(FlowState.TAB_ACTION_VIEW);

  const container = getContentContainer();
  const state = getState();

  const scopeText = scope === 'all' ? 'Todas as janelas' : `Janelas selecionadas`;

  let html = `
    <div class="header">
      <button id="back-btn" class="back-button">← Voltar</button>
      <h1>Abas do Domínio</h1>
    </div>

    <div class="card">
      <div class="card-title">${domain}</div>
      <div class="card-subtitle">${scopeText} - ${formatTabCount(tabs.length)} serão afetadas</div>
    </div>

    <div class="tab-list">
  `;

  tabs.forEach(tab => {
    html += `
      <div class="tab-item" data-tab-id="${tab.id}">
        <div class="tab-info">
          <div class="tab-title">${tab.title || 'Sem título'}</div>
          <div class="tab-url">${tab.url}</div>
          <div class="tab-meta">Janela ${tab.windowId}</div>
        </div>
        <div class="tab-action">
          <button class="close-single-btn" data-tab-id="${tab.id}">Fechar</button>
        </div>
      </div>
    `;
  });

  html += `
    </div>
    <button id="close-all-btn" class="button button-danger mt-md">
      Fechar todas as ${formatTabCount(tabs.length)}
    </button>
  `;

  container.innerHTML = html;

  // Event listeners
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (scope === 'all') {
        const domainGroup = state.domains.find(d => d.domain === domain);
        if (domainGroup) {
          renderScopeSelection(domain, domainGroup.windowCount, domainGroup.tabCount);
        }
      } else {
        renderWindowSelection(state.windows, domain);
      }
    });
  }

  const closeSingleBtns = document.querySelectorAll('.close-single-btn');
  closeSingleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = parseInt(btn.getAttribute('data-tab-id') || '0');
      handleCloseSingleTab(tabId);
    });
  });

  const closeAllBtn = document.getElementById('close-all-btn');
  if (closeAllBtn) {
    closeAllBtn.addEventListener('click', () => handleCloseAllTabs(tabs));
  }
}

/**
 * Renderiza feedback após ação
 */
function renderFeedback(message: string, type: 'success' | 'error', recoverable: boolean = false): void {
  clearContent();
  setFlow(FlowState.ACTION_FEEDBACK);

  const container = getContentContainer();

  let html = `
    <div class="header">
      <h1>Tab Domain Executor</h1>
    </div>

    <div class="feedback feedback-${type}">
      <p>${message}</p>
    </div>
  `;

  if (recoverable && type === 'success') {
    html += `
      <div class="feedback feedback-warning mt-sm">
        <p class="text-small">${SUCCESS_MESSAGES.RECOVERY_AVAILABLE}</p>
      </div>
    `;
  }

  html += `
    <button id="back-home-btn" class="button button-primary mt-md">
      Voltar ao início
    </button>
  `;

  container.innerHTML = html;

  const backHomeBtn = document.getElementById('back-home-btn');
  if (backHomeBtn) {
    backHomeBtn.addEventListener('click', () => {
      resetState();
      init();
    });
  }
}

// ============================================
// HANDLERS
// ============================================

/**
 * Handler: Analisar abas
 */
async function handleAnalyzeTabs(): Promise<void> {
  try {
    renderLoading('Analisando abas...');

    const response = await sendMessage<AnalyzeTabsResponse>({
      type: MessageType.ANALYZE_TABS
    });

    if (!response.success || !response.domains) {
      renderError(response.error || 'Falha ao analisar abas');
      return;
    }

    setState({ domains: response.domains });
    renderDomainView(response.domains);
  } catch (error: any) {
    renderError(error.message || 'Erro ao analisar abas');
  }
}

/**
 * Handler: Selecionar domínio
 */
async function handleSelectDomain(domain: string): Promise<void> {
  const state = getState();
  const domainGroup = state.domains.find(d => d.domain === domain);

  if (!domainGroup) {
    renderError('Domínio não encontrado');
    return;
  }

  setState({ selectedDomain: domain });
  renderScopeSelection(domain, domainGroup.windowCount, domainGroup.tabCount);
}

/**
 * Handler: Escopo "Todas as janelas"
 */
async function handleScopeAll(domain: string): Promise<void> {
  try {
    renderLoading('Carregando abas...');

    setState({ selectedScope: 'all' });

    const response = await sendMessage<GetTabsForDomainResponse>({
      type: MessageType.GET_TABS_FOR_DOMAIN,
      payload: {
        domain,
        scope: 'all'
      }
    });

    if (!response.success || !response.tabs) {
      renderError(response.error || 'Falha ao obter abas');
      return;
    }

    setState({ tabs: response.tabs });
    renderTabActionView(response.tabs, domain, 'all');
  } catch (error: any) {
    renderError(error.message || 'Erro ao obter abas');
  }
}

/**
 * Handler: Escopo "Escolher janelas"
 */
async function handleScopeWindows(domain: string): Promise<void> {
  try {
    renderLoading('Carregando janelas...');

    setState({ selectedScope: 'windows', selectedWindowIds: [] });

    const response = await sendMessage<GetWindowsForDomainResponse>({
      type: MessageType.GET_WINDOWS_FOR_DOMAIN,
      payload: { domain }
    });

    if (!response.success || !response.windows) {
      renderError(response.error || 'Falha ao obter janelas');
      return;
    }

    setState({ windows: response.windows });
    renderWindowSelection(response.windows, domain);
  } catch (error: any) {
    renderError(error.message || 'Erro ao obter janelas');
  }
}

/**
 * Handler: Continuar com janelas selecionadas
 */
async function handleContinueWithWindows(domain: string): Promise<void> {
  try {
    const state = getState();

    if (state.selectedWindowIds.length === 0) {
      return;
    }

    renderLoading('Carregando abas...');

    const response = await sendMessage<GetTabsForDomainResponse>({
      type: MessageType.GET_TABS_FOR_DOMAIN,
      payload: {
        domain,
        scope: 'windows',
        windowIds: state.selectedWindowIds
      }
    });

    if (!response.success || !response.tabs) {
      renderError(response.error || 'Falha ao obter abas');
      return;
    }

    setState({ tabs: response.tabs });
    renderTabActionView(response.tabs, domain, 'windows');
  } catch (error: any) {
    renderError(error.message || 'Erro ao obter abas');
  }
}

/**
 * Handler: Fechar aba individual
 */
async function handleCloseSingleTab(tabId: number): Promise<void> {
  try {
    const response = await sendMessage<CloseSingleTabResponse>({
      type: MessageType.CLOSE_SINGLE_TAB,
      payload: { tabId }
    });

    if (!response.success) {
      alert(response.error || 'Falha ao fechar aba');
      return;
    }

    // Remover aba da lista visualmente
    const state = getState();
    const updatedTabs = state.tabs.filter(t => t.id !== tabId);
    setState({ tabs: updatedTabs });

    // Remover elemento do DOM
    const tabItem = document.querySelector(`[data-tab-id="${tabId}"]`);
    if (tabItem) {
      tabItem.remove();
    }

    // Se não há mais abas, voltar
    if (updatedTabs.length === 0) {
      renderFeedback('Todas as abas foram fechadas', 'success');
    }
  } catch (error: any) {
    alert(error.message || 'Erro ao fechar aba');
  }
}

/**
 * Handler: Fechar todas as abas
 */
async function handleCloseAllTabs(tabs: Tab[]): Promise<void> {
  try {
    renderLoading('Fechando abas...');

    const tabIds = tabs.map(t => t.id);
    const tabsMinimal = tabs.map(t => ({
      url: t.url,
      windowId: t.windowId,
      title: t.title
    }));

    const response = await sendMessage<CloseBulkTabsResponse>({
      type: MessageType.CLOSE_BULK_TABS,
      payload: {
        tabIds,
        tabs: tabsMinimal
      }
    });

    if (!response.success) {
      renderError(response.error || 'Falha ao fechar abas');
      return;
    }

    const message = `${formatTabCount(response.closedCount || 0)} fechadas com sucesso!`;
    renderFeedback(message, 'success', response.recoverable || false);
  } catch (error: any) {
    renderError(error.message || 'Erro ao fechar abas');
  }
}

/**
 * Handler: Recuperar última ação
 */
async function handleRecoverAction(): Promise<void> {
  try {
    renderLoading('Recuperando abas...');

    const response = await sendMessage<RecoverLastActionResponse>({
      type: MessageType.RECOVER_LAST_ACTION
    });

    if (!response.success) {
      renderError(response.error || 'Falha ao recuperar abas');
      return;
    }

    const message = `${formatTabCount(response.restoredCount || 0)} restauradas com sucesso!`;
    renderFeedback(message, 'success');
  } catch (error: any) {
    renderError(error.message || 'Erro ao recuperar abas');
  }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

/**
 * Inicializa o popup
 */
async function init(): Promise<void> {
  try {
    // Verificar se há ação recuperável
    const checkResponse = await sendMessage<CheckRecoveryResponse>({
      type: MessageType.CHECK_RECOVERY
    });

    if (checkResponse.success && checkResponse.recoverable) {
      setState({
        recoveryStatus: {
          isRecoverable: true,
          timeRemaining: checkResponse.timeRemaining || 0,
          tabCount: checkResponse.tabCount || 0,
          expiresAt: Date.now() + (checkResponse.timeRemaining || 0)
        }
      });
    }

    renderInitialState();
  } catch (error: any) {
    console.error('Erro ao inicializar:', error);
    renderInitialState();
  }
}

// Executar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
