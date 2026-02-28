/**
 * Utilitários para o mock da Chrome Extension API
 * Resetam todos os jest.fn() entre testes sem recriar o objeto global.
 */

export function resetChromeMocks(): void {
  (global.chrome.tabs.query as jest.Mock).mockReset();
  (global.chrome.tabs.remove as jest.Mock).mockReset();
  (global.chrome.tabs.create as jest.Mock).mockReset();
  (global.chrome.windows.getAll as jest.Mock).mockReset();
  (global.chrome.runtime.sendMessage as jest.Mock).mockReset();
  global.chrome.runtime.lastError = undefined;
}

/**
 * Cria um objeto chrome.tabs.Tab com valores padrão sobreponíveis.
 */
export function makeChromeTab(
  overrides: Partial<chrome.tabs.Tab> = {}
): chrome.tabs.Tab {
  return {
    id: 1,
    windowId: 1,
    url: 'https://example.com/page',
    title: 'Example Page',
    favIconUrl: undefined,
    active: false,
    index: 0,
    pinned: false,
    highlighted: false,
    incognito: false,
    selected: false,
    discarded: false,
    autoDiscardable: true,
    groupId: -1,
    ...overrides,
  } as chrome.tabs.Tab;
}
