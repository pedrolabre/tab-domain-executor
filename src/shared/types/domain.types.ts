/**
 * Tipos relacionados ao agrupamento de abas por domínio
 */

import { Tab } from './tab.types';

/**
 * Representa um grupo de abas por domínio
 */
export interface DomainGroup {
  /** Domínio base (ex: "youtube.com") */
  domain: string;
  
  /** Quantidade total de abas deste domínio */
  tabCount: number;
  
  /** Quantidade de janelas que contêm abas deste domínio */
  windowCount: number;
  
  /** IDs das janelas envolvidas */
  windowIds: number[];
  
  /** Lista de abas (opcional, para detalhamento) */
  tabs?: Tab[];

  /** ID mínimo das abas deste domínio (proxy para a aba mais antiga) */
  minTabId?: number;

  /** ID máximo das abas deste domínio (proxy para a aba mais recente) */
  maxTabId?: number;
}
