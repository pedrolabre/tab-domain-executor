/**
 * Tipos de comunicação entre popup e background
 */

import { Tab, TabMinimal } from './tab.types';
import { DomainGroup } from './domain.types';
import { WindowGroup } from './window.types';
import { RecoveryStatus } from './recovery.types';

/**
 * Tipos de mensagens trocadas entre popup e background
 */
export enum MessageType {
  /** Solicita análise de todas as abas abertas */
  ANALYZE_TABS = 'ANALYZE_TABS',
  
  /** Solicita janelas disponíveis para um domínio */
  GET_WINDOWS_FOR_DOMAIN = 'GET_WINDOWS_FOR_DOMAIN',
  
  /** Solicita abas de um domínio com escopo definido */
  GET_TABS_FOR_DOMAIN = 'GET_TABS_FOR_DOMAIN',
  
  /** Solicita fechamento de uma única aba */
  CLOSE_SINGLE_TAB = 'CLOSE_SINGLE_TAB',
  
  /** Solicita fechamento de múltiplas abas */
  CLOSE_BULK_TABS = 'CLOSE_BULK_TABS',
  
  /** Verifica se há ação recuperável */
  CHECK_RECOVERY = 'CHECK_RECOVERY',
  
  /** Solicita recuperação da última ação */
  RECOVER_LAST_ACTION = 'RECOVER_LAST_ACTION'
}

/**
 * Escopo de seleção de abas
 */
export type TabScope = 'all' | 'windows';

/**
 * Interface base para todas as mensagens
 */
export interface BaseMessage {
  /** Tipo da mensagem */
  type: MessageType;
  
  /** Timestamp de envio (opcional, para debug) */
  timestamp?: number;
}

/**
 * Mensagem para solicitar análise de abas
 */
export interface AnalyzeTabsMessage extends BaseMessage {
  type: MessageType.ANALYZE_TABS;
}

/**
 * Mensagem para obter janelas de um domínio
 */
export interface GetWindowsForDomainMessage extends BaseMessage {
  type: MessageType.GET_WINDOWS_FOR_DOMAIN;
  payload: {
    /** Domínio base (ex: "youtube.com") */
    domain: string;
  };
}

/**
 * Mensagem para obter abas de um domínio
 */
export interface GetTabsForDomainMessage extends BaseMessage {
  type: MessageType.GET_TABS_FOR_DOMAIN;
  payload: {
    /** Domínio base */
    domain: string;
    
    /** Tipo de escopo */
    scope: TabScope;
    
    /** IDs de janelas (obrigatório se scope === 'windows') */
    windowIds?: number[];
  };
}

/**
 * Mensagem para fechar uma única aba
 */
export interface CloseSingleTabMessage extends BaseMessage {
  type: MessageType.CLOSE_SINGLE_TAB;
  payload: {
    /** ID da aba a ser fechada */
    tabId: number;
  };
}

/**
 * Mensagem para fechar múltiplas abas
 */
export interface CloseBulkTabsMessage extends BaseMessage {
  type: MessageType.CLOSE_BULK_TABS;
  payload: {
    /** IDs das abas a serem fechadas */
    tabIds: number[];
    
    /** Dados para recuperação */
    tabs: TabMinimal[];
  };
}

/**
 * Mensagem para verificar se há ação recuperável
 */
export interface CheckRecoveryMessage extends BaseMessage {
  type: MessageType.CHECK_RECOVERY;
}

/**
 * Mensagem para recuperar última ação
 */
export interface RecoverLastActionMessage extends BaseMessage {
  type: MessageType.RECOVER_LAST_ACTION;
}

/**
 * Union type de todas as mensagens possíveis
 */
export type Message =
  | AnalyzeTabsMessage
  | GetWindowsForDomainMessage
  | GetTabsForDomainMessage
  | CloseSingleTabMessage
  | CloseBulkTabsMessage
  | CheckRecoveryMessage
  | RecoverLastActionMessage;

/**
 * Interface base para todas as respostas
 */
export interface BaseResponse {
  /** Indica se a operação foi bem-sucedida */
  success: boolean;
  
  /** Mensagem de erro (se success === false) */
  error?: string;
}

/**
 * Resposta para análise de abas
 */
export interface AnalyzeTabsResponse extends BaseResponse {
  /** Lista de domínios agrupados */
  domains?: DomainGroup[];
}

/**
 * Resposta para obtenção de janelas de um domínio
 */
export interface GetWindowsForDomainResponse extends BaseResponse {
  /** Lista de janelas agrupadas */
  windows?: WindowGroup[];
}

/**
 * Resposta para obtenção de abas de um domínio
 */
export interface GetTabsForDomainResponse extends BaseResponse {
  /** Lista de abas filtradas */
  tabs?: Tab[];
}

/**
 * Resposta para fechamento de aba individual
 */
export interface CloseSingleTabResponse extends BaseResponse {
  /** ID da aba fechada */
  tabId?: number;
}

/**
 * Resposta para fechamento em lote
 */
export interface CloseBulkTabsResponse extends BaseResponse {
  /** Quantidade de abas fechadas */
  closedCount?: number;
  
  /** Indica se a ação é recuperável */
  recoverable?: boolean;
}

/**
 * Resposta para verificação de recuperação
 */
export interface CheckRecoveryResponse extends BaseResponse {
  /** Indica se há ação recuperável */
  recoverable: boolean;
  
  /** Tempo restante em milissegundos (se recoverable === true) */
  timeRemaining?: number;
  
  /** Quantidade de abas recuperáveis */
  tabCount?: number;
}

/**
 * Resposta para recuperação de última ação
 */
export interface RecoverLastActionResponse extends BaseResponse {
  /** Quantidade de abas restauradas */
  restoredCount?: number;
}
