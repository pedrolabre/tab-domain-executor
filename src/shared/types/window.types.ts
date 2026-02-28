/**
 * Tipos relacionados ao agrupamento de abas por janela
 */

import { Tab } from './tab.types';

/**
 * Representa abas de um domínio em uma janela específica
 */
export interface WindowGroup {
  /** ID da janela */
  windowId: number;
  
  /** Título ou identificador da janela (ex: "Janela 1") */
  windowTitle: string;
  
  /** Domínio das abas nesta janela */
  domain: string;
  
  /** Quantidade de abas do domínio nesta janela */
  tabCount: number;
  
  /** Lista de abas (opcional, para detalhamento) */
  tabs?: Tab[];
  
  /** Indica se esta janela está selecionada pelo usuário */
  selected?: boolean;
}
