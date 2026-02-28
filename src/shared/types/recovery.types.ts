/**
 * Tipos relacionados ao mecanismo de recuperação
 */

import { TabMinimal } from './tab.types';

/**
 * Log de recuperação armazenado em memória
 */
export interface RecoveryLog {
  /** Lista de abas fechadas (versão mínima) */
  tabs: TabMinimal[];
  
  /** Timestamp da ação (milissegundos desde epoch) */
  timestamp: number;
  
  /** TTL em milissegundos (15 minutos = 900000ms) */
  ttl: number;
}

/**
 * Status de recuperação
 */
export interface RecoveryStatus {
  /** Indica se há ação recuperável */
  isRecoverable: boolean;
  
  /** Tempo restante em milissegundos */
  timeRemaining: number;
  
  /** Quantidade de abas recuperáveis */
  tabCount: number;
  
  /** Timestamp da expiração */
  expiresAt: number;
}
