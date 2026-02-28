/**
 * Tipos relacionados ao estado da aplicação
 */

import { Tab } from './tab.types';
import { DomainGroup } from './domain.types';
import { WindowGroup } from './window.types';
import { RecoveryStatus } from './recovery.types';
import { TabScope } from './message.types';

/**
 * Estados do fluxo de interação do usuário
 */
export enum FlowState {
  /** Estado inicial, antes de qualquer análise */
  INITIAL = 'INITIAL',
  
  /** Carregando análise de abas */
  LOADING_ANALYSIS = 'LOADING_ANALYSIS',
  
  /** Visualizando lista de domínios */
  DOMAIN_VIEW = 'DOMAIN_VIEW',
  
  /** Selecionando escopo (todas janelas ou escolher janelas) */
  SCOPE_SELECTION = 'SCOPE_SELECTION',
  
  /** Selecionando janelas específicas */
  WINDOW_SELECTION = 'WINDOW_SELECTION',
  
  /** Visualizando lista final de abas */
  TAB_ACTION_VIEW = 'TAB_ACTION_VIEW',
  
  /** Executando ação destrutiva */
  EXECUTING_ACTION = 'EXECUTING_ACTION',
  
  /** Exibindo feedback pós-ação */
  ACTION_FEEDBACK = 'ACTION_FEEDBACK',
  
  /** Estado de erro */
  ERROR = 'ERROR'
}

/**
 * Estado global da aplicação
 */
export interface AppState {
  /** Estado atual do fluxo */
  currentFlow: FlowState;
  
  /** Lista de domínios (quando em DOMAIN_VIEW) */
  domains: DomainGroup[];
  
  /** Domínio atualmente selecionado */
  selectedDomain: string | null;
  
  /** Escopo selecionado */
  selectedScope: TabScope | null;
  
  /** Lista de janelas (quando em WINDOW_SELECTION) */
  windows: WindowGroup[];
  
  /** IDs de janelas selecionadas */
  selectedWindowIds: number[];
  
  /** Lista de abas (quando em TAB_ACTION_VIEW) */
  tabs: Tab[];
  
  /** Status de recuperação */
  recoveryStatus: RecoveryStatus | null;
  
  /** Mensagem de erro (quando em ERROR) */
  errorMessage: string | null;
  
  /** Indica se há operação em andamento */
  isLoading: boolean;
}
