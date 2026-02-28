/**
 * Módulo de gerenciamento de recuperação
 * Responsável por manter log temporário em memória de ações destrutivas
 */

import { RecoveryLog, RecoveryStatus, TabMinimal } from '../../shared/types';
import { RECOVERY_TTL_MS } from '../../shared/constants';

/**
 * Log de recuperação armazenado em memória
 * Não persistente, resetado ao recarregar a extensão
 */
let recoveryLog: RecoveryLog | null = null;

/**
 * Armazena log de ação destrutiva
 * Substitui qualquer log anterior
 * @param tabs - Abas fechadas (versão mínima)
 */
export function storeRecoveryLog(tabs: TabMinimal[]): void {
  recoveryLog = {
    tabs,
    timestamp: Date.now(),
    ttl: RECOVERY_TTL_MS
  };
  
  // Agendar limpeza automática
  setTimeout(() => {
    if (recoveryLog && Date.now() - recoveryLog.timestamp >= recoveryLog.ttl) {
      recoveryLog = null;
    }
  }, RECOVERY_TTL_MS);
}

/**
 * Obtém log de recuperação se ainda válido
 * @returns Log de recuperação ou null se não existe/expirou
 */
export function getRecoveryLog(): RecoveryLog | null {
  if (!recoveryLog) return null;
  
  const now = Date.now();
  const elapsed = now - recoveryLog.timestamp;
  
  // Verificar se expirou
  if (elapsed >= recoveryLog.ttl) {
    recoveryLog = null;
    return null;
  }
  
  return recoveryLog;
}

/**
 * Verifica se há ação recuperável disponível
 * @returns Status de recuperação
 */
export function hasRecoverableAction(): RecoveryStatus {
  if (!recoveryLog) {
    return {
      isRecoverable: false,
      timeRemaining: 0,
      tabCount: 0,
      expiresAt: 0
    };
  }
  
  const now = Date.now();
  const elapsed = now - recoveryLog.timestamp;
  const remaining = recoveryLog.ttl - elapsed;
  
  if (remaining <= 0) {
    // Log expirado
    recoveryLog = null;
    
    return {
      isRecoverable: false,
      timeRemaining: 0,
      tabCount: 0,
      expiresAt: 0
    };
  }
  
  return {
    isRecoverable: true,
    timeRemaining: remaining,
    tabCount: recoveryLog.tabs.length,
    expiresAt: recoveryLog.timestamp + recoveryLog.ttl
  };
}

/**
 * Limpa log de recuperação
 * Chamado após recuperação bem-sucedida
 */
export function clearRecoveryLog(): void {
  recoveryLog = null;
}
