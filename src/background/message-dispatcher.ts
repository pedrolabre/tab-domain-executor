/**
 * Message Dispatcher
 * Responsável por rotear mensagens do popup para os módulos apropriados
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
  GetWindowsForDomainMessage,
  GetTabsForDomainMessage,
  CloseSingleTabMessage,
  CloseBulkTabsMessage,
  Tab
} from '../shared/types';

import { ERROR_MESSAGES } from '../shared/constants';
import { isValidScope, isValidWindowIds } from '../shared/utils';

import { getAllTabs } from '../modules/tab-reader';
import { normalizeUrl } from '../modules/normalizer';
import { groupByDomain, groupByWindow, filterTabsByScope } from '../modules/grouper';
import { closeSingleTab, closeBulkTabs, restoreTabs } from '../modules/executor';
import {
  hasRecoverableAction,
  getRecoveryLog,
  storeRecoveryLog,
  clearRecoveryLog
} from '../modules/recovery';

/**
 * Processa uma mensagem recebida do popup
 * @param message - Mensagem recebida
 * @param sendResponse - Callback para enviar resposta
 */
export async function handle(
  message: Message,
  sendResponse: (response: BaseResponse) => void
): Promise<void> {
  try {
    // Validar mensagem
    if (!message || !message.type) {
      sendResponse({
        success: false,
        error: ERROR_MESSAGES.INVALID_MESSAGE
      });
      return;
    }

    // Rotear baseado no tipo
    switch (message.type) {
      case MessageType.ANALYZE_TABS:
        await handleAnalyzeTabs(sendResponse);
        break;

      case MessageType.GET_WINDOWS_FOR_DOMAIN:
        await handleGetWindowsForDomain(message as GetWindowsForDomainMessage, sendResponse);
        break;

      case MessageType.GET_TABS_FOR_DOMAIN:
        await handleGetTabsForDomain(message as GetTabsForDomainMessage, sendResponse);
        break;

      case MessageType.CLOSE_SINGLE_TAB:
        await handleCloseSingleTab(message as CloseSingleTabMessage, sendResponse);
        break;

      case MessageType.CLOSE_BULK_TABS:
        await handleCloseBulkTabs(message as CloseBulkTabsMessage, sendResponse);
        break;

      case MessageType.CHECK_RECOVERY:
        await handleCheckRecovery(sendResponse);
        break;

      case MessageType.RECOVER_LAST_ACTION:
        await handleRecoverLastAction(sendResponse);
        break;

      default:
        sendResponse({
          success: false,
          error: ERROR_MESSAGES.UNKNOWN_MESSAGE_TYPE
        });
    }
  } catch (error: any) {
    console.error('Erro no dispatcher:', error);
    sendResponse({
      success: false,
      error: error.message || 'Erro desconhecido'
    });
  }
}

/**
 * Handler: Analisa todas as abas abertas
 */
async function handleAnalyzeTabs(
  sendResponse: (response: AnalyzeTabsResponse) => void
): Promise<void> {
  try {
    // 1. Obter todas as abas
    const chromeTabs = await getAllTabs();

    // 2. Normalizar URLs e criar Tab[]
    const tabs: Tab[] = chromeTabs.map(chromeTab => ({
      id: chromeTab.id!,
      windowId: chromeTab.windowId!,
      url: chromeTab.url || '',
      title: chromeTab.title || '',
      favIconUrl: chromeTab.favIconUrl,
      domain: normalizeUrl(chromeTab.url || ''),
      active: chromeTab.active,
      index: chromeTab.index
    }));

    // 3. Agrupar por domínio
    const domains = groupByDomain(tabs);

    // 4. Retornar (sem incluir tabs[] completo para economizar payload, mas inclui min/max ID para ordenação)
    const domainsWithoutTabs = domains.map(d => ({
      domain: d.domain,
      tabCount: d.tabCount,
      windowCount: d.windowCount,
      windowIds: d.windowIds,
      minTabId: d.tabs && d.tabs.length ? Math.min(...d.tabs.map(t => t.id)) : undefined,
      maxTabId: d.tabs && d.tabs.length ? Math.max(...d.tabs.map(t => t.id)) : undefined
    }));

    sendResponse({
      success: true,
      domains: domainsWithoutTabs
    });
  } catch (error: any) {
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Handler: Obtém janelas de um domínio
 */
async function handleGetWindowsForDomain(
  message: GetWindowsForDomainMessage,
  sendResponse: (response: GetWindowsForDomainResponse) => void
): Promise<void> {
  try {
    const { domain } = message.payload;

    // Validar domínio
    if (!domain || domain.trim() === '') {
      sendResponse({
        success: false,
        error: ERROR_MESSAGES.EMPTY_DOMAIN
      });
      return;
    }

    // 1. Obter todas as abas
    const chromeTabs = await getAllTabs();

    // 2. Normalizar
    const tabs: Tab[] = chromeTabs.map(chromeTab => ({
      id: chromeTab.id!,
      windowId: chromeTab.windowId!,
      url: chromeTab.url || '',
      title: chromeTab.title || '',
      favIconUrl: chromeTab.favIconUrl,
      domain: normalizeUrl(chromeTab.url || ''),
      active: chromeTab.active,
      index: chromeTab.index
    }));

    // 3. Agrupar por janela
    const windows = groupByWindow(tabs, domain);

    // 4. Retornar (sem incluir tabs[] completo)
    const windowsWithoutTabs = windows.map(w => ({
      windowId: w.windowId,
      windowTitle: w.windowTitle,
      domain: w.domain,
      tabCount: w.tabCount,
      selected: false
    }));

    sendResponse({
      success: true,
      windows: windowsWithoutTabs
    });
  } catch (error: any) {
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Handler: Obtém abas de um domínio com escopo
 */
async function handleGetTabsForDomain(
  message: GetTabsForDomainMessage,
  sendResponse: (response: GetTabsForDomainResponse) => void
): Promise<void> {
  try {
    const { domain, scope, windowIds } = message.payload;

    // Validar domínio
    if (!domain || domain.trim() === '') {
      sendResponse({
        success: false,
        error: ERROR_MESSAGES.EMPTY_DOMAIN
      });
      return;
    }

    // Validar escopo
    if (!isValidScope(scope)) {
      sendResponse({
        success: false,
        error: ERROR_MESSAGES.INVALID_SCOPE
      });
      return;
    }

    // Validar windowIds se scope === 'windows'
    if (scope === 'windows' && !isValidWindowIds(windowIds)) {
      sendResponse({
        success: false,
        error: ERROR_MESSAGES.WINDOW_IDS_REQUIRED
      });
      return;
    }

    // 1. Obter todas as abas
    const chromeTabs = await getAllTabs();

    // 2. Normalizar
    const tabs: Tab[] = chromeTabs.map(chromeTab => ({
      id: chromeTab.id!,
      windowId: chromeTab.windowId!,
      url: chromeTab.url || '',
      title: chromeTab.title || '',
      favIconUrl: chromeTab.favIconUrl,
      domain: normalizeUrl(chromeTab.url || ''),
      active: chromeTab.active,
      index: chromeTab.index
    }));

    // 3. Filtrar por escopo
    const filteredTabs = filterTabsByScope(tabs, domain, scope, windowIds);

    sendResponse({
      success: true,
      tabs: filteredTabs
    });
  } catch (error: any) {
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Handler: Fecha aba individual
 */
async function handleCloseSingleTab(
  message: CloseSingleTabMessage,
  sendResponse: (response: CloseSingleTabResponse) => void
): Promise<void> {
  try {
    const { tabId } = message.payload;

    const result = await closeSingleTab(tabId);

    if (result.success) {
      sendResponse({
        success: true,
        tabId: result.data?.tabId
      });
    } else {
      sendResponse({
        success: false,
        error: result.error
      });
    }
  } catch (error: any) {
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Handler: Fecha abas em lote
 */
async function handleCloseBulkTabs(
  message: CloseBulkTabsMessage,
  sendResponse: (response: CloseBulkTabsResponse) => void
): Promise<void> {
  try {
    const { tabIds, tabs } = message.payload;

    // 1. Fechar abas
    const result = await closeBulkTabs(tabIds);

    if (!result.success) {
      sendResponse({
        success: false,
        error: result.error
      });
      return;
    }

    // 2. Armazenar log de recuperação
    storeRecoveryLog(tabs);

    // 3. Retornar sucesso
    sendResponse({
      success: true,
      closedCount: result.data?.closedCount,
      recoverable: true
    });
  } catch (error: any) {
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Handler: Verifica se há ação recuperável
 */
async function handleCheckRecovery(
  sendResponse: (response: CheckRecoveryResponse) => void
): Promise<void> {
  try {
    const status = hasRecoverableAction();

    sendResponse({
      success: true,
      recoverable: status.isRecoverable,
      timeRemaining: status.timeRemaining,
      tabCount: status.tabCount
    });
  } catch (error: any) {
    sendResponse({
      success: false,
      recoverable: false,
      error: error.message
    });
  }
}

/**
 * Handler: Recupera última ação
 */
async function handleRecoverLastAction(
  sendResponse: (response: RecoverLastActionResponse) => void
): Promise<void> {
  try {
    // 1. Obter log
    const log = getRecoveryLog();

    if (!log) {
      sendResponse({
        success: false,
        error: ERROR_MESSAGES.RECOVERY_NOT_AVAILABLE
      });
      return;
    }

    // 2. Restaurar abas
    const result = await restoreTabs(log.tabs);

    if (!result.success) {
      sendResponse({
        success: false,
        error: result.error
      });
      return;
    }

    // 3. Limpar log
    clearRecoveryLog();

    // 4. Retornar sucesso
    sendResponse({
      success: true,
      restoredCount: result.data?.restoredCount
    });
  } catch (error: any) {
    sendResponse({
      success: false,
      error: error.message
    });
  }
}
