/**
 * Módulo de execução de ações
 * Responsável por executar ações destrutivas (fechamento) e restauração de abas
 */

import { ActionResult, TabMinimal } from '../../shared/types';
import { ERROR_MESSAGES } from '../../shared/constants';

/**
 * Fecha uma única aba
 * @param tabId - ID da aba
 * @returns Resultado da operação
 */
export async function closeSingleTab(tabId: number): Promise<ActionResult> {
  try {
    await chrome.tabs.remove(tabId);
    
    return {
      success: true,
      data: { tabId }
    };
  } catch (error: any) {
    console.error(`Erro ao fechar aba ${tabId}:`, error);
    
    return {
      success: false,
      error: `${ERROR_MESSAGES.CLOSE_FAILED}: ${error.message}`
    };
  }
}

/**
 * Fecha múltiplas abas
 * @param tabIds - Array de IDs de abas
 * @returns Resultado da operação
 */
export async function closeBulkTabs(tabIds: number[]): Promise<ActionResult> {
  try {
    if (!tabIds || tabIds.length === 0) {
      return {
        success: false,
        error: ERROR_MESSAGES.NO_TABS_TO_CLOSE
      };
    }
    
    await chrome.tabs.remove(tabIds);
    
    return {
      success: true,
      data: { closedCount: tabIds.length }
    };
  } catch (error: any) {
    console.error('Erro ao fechar abas em lote:', error);
    
    return {
      success: false,
      error: `${ERROR_MESSAGES.CLOSE_FAILED}: ${error.message}`
    };
  }
}

/**
 * Restaura abas a partir de dados mínimos
 * @param tabs - Array de TabMinimal
 * @returns Resultado da operação
 */
export async function restoreTabs(tabs: TabMinimal[]): Promise<ActionResult> {
  try {
    if (!tabs || tabs.length === 0) {
      return {
        success: false,
        error: ERROR_MESSAGES.NO_TABS_TO_RESTORE
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
      } catch (error: any) {
        errors.push(`Falha ao restaurar ${tab.url}: ${error.message}`);
      }
    }
    
    if (restoredCount === 0) {
      return {
        success: false,
        error: `${ERROR_MESSAGES.RESTORE_FAILED}: ${errors.join('; ')}`
      };
    }
    
    return {
      success: true,
      data: { 
        restoredCount,
        errors: errors.length > 0 ? errors : undefined
      }
    };
  } catch (error: any) {
    console.error('Erro ao restaurar abas:', error);
    
    return {
      success: false,
      error: `${ERROR_MESSAGES.RESTORE_FAILED}: ${error.message}`
    };
  }
}
