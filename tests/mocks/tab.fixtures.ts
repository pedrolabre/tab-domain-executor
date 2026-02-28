/**
 * Fixtures de dados para testes
 * Factories para Tab, TabMinimal e chrome.tabs.Tab
 */

import { Tab, TabMinimal } from '../../src/shared/types';
import { makeChromeTab } from './chrome.mock';

export { makeChromeTab };

/**
 * Cria um Tab (tipo interno normalizado) com valores padrão sobreponíveis.
 */
export function makeTab(overrides: Partial<Tab> = {}): Tab {
  return {
    id: 1,
    windowId: 1,
    url: 'https://example.com/page',
    title: 'Example Page',
    domain: 'example.com',
    active: false,
    index: 0,
    ...overrides,
  };
}

/**
 * Cria um TabMinimal com valores padrão sobreponíveis.
 */
export function makeTabMinimal(overrides: Partial<TabMinimal> = {}): TabMinimal {
  return {
    url: 'https://example.com/page',
    windowId: 1,
    title: 'Example Page',
    ...overrides,
  };
}

/**
 * Constrói um conjunto de abas distribuídas em múltiplos domínios/janelas.
 * youtube.com: 3 abas (janelas 1 e 2)
 * github.com:  2 abas (janela 1)
 * google.com:  1 aba  (janela 2)
 */
export function makeMultiDomainTabs(): Tab[] {
  return [
    makeTab({ id: 1, windowId: 1, domain: 'youtube.com', url: 'https://youtube.com/a', index: 0 }),
    makeTab({ id: 2, windowId: 1, domain: 'youtube.com', url: 'https://youtube.com/b', index: 1 }),
    makeTab({ id: 3, windowId: 2, domain: 'youtube.com', url: 'https://youtube.com/c', index: 0 }),
    makeTab({ id: 4, windowId: 1, domain: 'github.com',  url: 'https://github.com/a',  index: 2 }),
    makeTab({ id: 5, windowId: 1, domain: 'github.com',  url: 'https://github.com/b',  index: 3 }),
    makeTab({ id: 6, windowId: 2, domain: 'google.com',  url: 'https://google.com/a',  index: 1 }),
  ];
}
