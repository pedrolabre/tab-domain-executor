/**
 * Módulo de leitura de abas
 * Responsável por interagir com Chrome Tabs API
 */

/**
 * Obtém todas as abas abertas em todas as janelas
 * @returns Array de abas nativas do Chrome
 */
export async function getAllTabs(): Promise<chrome.tabs.Tab[]> {
  try {
    const tabs = await chrome.tabs.query({});
    return tabs;
  } catch (error) {
    console.error('Erro ao obter abas:', error);
    throw new Error('Falha ao acessar abas do navegador');
  }
}

/**
 * Obtém todas as janelas abertas
 * @returns Array de janelas nativas do Chrome
 */
export async function getAllWindows(): Promise<chrome.windows.Window[]> {
  try {
    const windows = await chrome.windows.getAll({ populate: true });
    return windows;
  } catch (error) {
    console.error('Erro ao obter janelas:', error);
    throw new Error('Falha ao acessar janelas do navegador');
  }
}

/**
 * Obtém abas de uma janela específica
 * @param windowId - ID da janela
 * @returns Array de abas da janela
 */
export async function getTabsByWindowId(windowId: number): Promise<chrome.tabs.Tab[]> {
  try {
    const tabs = await chrome.tabs.query({ windowId });
    return tabs;
  } catch (error) {
    console.error(`Erro ao obter abas da janela ${windowId}:`, error);
    throw new Error(`Falha ao acessar abas da janela ${windowId}`);
  }
}
