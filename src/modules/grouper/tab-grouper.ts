/**
 * Módulo de agrupamento de abas
 * Responsável por agrupar abas por domínio e janela
 */

import { Tab, DomainGroup, WindowGroup, TabScope } from '../../shared/types';
import { formatWindowTitle } from '../../shared/utils';

/**
 * Agrupa abas por domínio base
 * @param tabs - Array de abas normalizadas
 * @returns Array de grupos de domínio
 */
export function groupByDomain(tabs: Tab[]): DomainGroup[] {
  const groups = new Map<string, Tab[]>();
  
  // Agrupar abas por domínio
  for (const tab of tabs) {
    if (!tab.domain) continue;
    
    if (!groups.has(tab.domain)) {
      groups.set(tab.domain, []);
    }
    groups.get(tab.domain)!.push(tab);
  }
  
  // Converter para DomainGroup[]
  const domainGroups: DomainGroup[] = [];
  
  for (const [domain, domainTabs] of groups) {
    const windowIds = [...new Set(domainTabs.map(t => t.windowId))];
    
    domainGroups.push({
      domain,
      tabCount: domainTabs.length,
      windowCount: windowIds.length,
      windowIds,
      tabs: domainTabs
    });
  }
  
  // Ordenar por quantidade de abas (maior primeiro)
  return domainGroups.sort((a, b) => b.tabCount - a.tabCount);
}

/**
 * Agrupa abas de um domínio por janela
 * @param tabs - Array de abas normalizadas
 * @param domain - Domínio a filtrar
 * @returns Array de grupos de janela
 */
export function groupByWindow(tabs: Tab[], domain: string): WindowGroup[] {
  // Filtrar abas do domínio
  const domainTabs = tabs.filter(t => t.domain === domain);
  
  // Agrupar por janela
  const windows = new Map<number, Tab[]>();
  
  for (const tab of domainTabs) {
    if (!windows.has(tab.windowId)) {
      windows.set(tab.windowId, []);
    }
    windows.get(tab.windowId)!.push(tab);
  }
  
  // Converter para WindowGroup[]
  const windowGroups: WindowGroup[] = [];
  
  for (const [windowId, windowTabs] of windows) {
    windowGroups.push({
      windowId,
      windowTitle: formatWindowTitle(windowId),
      domain,
      tabCount: windowTabs.length,
      tabs: windowTabs,
      selected: false
    });
  }
  
  // Ordenar por quantidade de abas (maior primeiro)
  return windowGroups.sort((a, b) => b.tabCount - a.tabCount);
}

/**
 * Filtra abas de um domínio baseado no escopo definido
 * @param tabs - Array de abas normalizadas
 * @param domain - Domínio a filtrar
 * @param scope - Escopo ('all' ou 'windows')
 * @param windowIds - IDs de janelas (obrigatório se scope === 'windows')
 * @returns Array de abas filtradas
 */
export function filterTabsByScope(
  tabs: Tab[],
  domain: string,
  scope: TabScope,
  windowIds?: number[]
): Tab[] {
  // Filtrar por domínio
  let filtered = tabs.filter(t => t.domain === domain);
  
  // Se scope === 'windows', filtrar também por janelas
  if (scope === 'windows') {
    if (!windowIds || windowIds.length === 0) {
      throw new Error('windowIds obrigatório quando scope === "windows"');
    }
    filtered = filtered.filter(t => windowIds.includes(t.windowId));
  }
  
  return filtered;
}
