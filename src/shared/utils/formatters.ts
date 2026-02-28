/**
 * Funções de formatação de dados
 */

import { TimeRemaining } from '../types';

/**
 * Formata tempo restante em milissegundos para objeto estruturado
 * @param ms - Milissegundos
 * @returns Objeto com tempo formatado
 */
export function formatTimeRemaining(ms: number): TimeRemaining {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  
  let formatted: string;
  if (minutes > 0) {
    formatted = `${minutes} min restantes`;
  } else {
    formatted = `${seconds} seg restantes`;
  }
  
  return {
    totalMs: ms,
    minutes,
    seconds,
    formatted
  };
}

/**
 * Formata contagem de abas
 * @param count - Quantidade de abas
 * @returns String formatada
 */
export function formatTabCount(count: number): string {
  return count === 1 ? '1 aba' : `${count} abas`;
}

/**
 * Formata contagem de janelas
 * @param count - Quantidade de janelas
 * @returns String formatada
 */
export function formatWindowCount(count: number): string {
  return count === 1 ? '1 janela' : `${count} janelas`;
}

/**
 * Formata título de janela
 * @param windowId - ID da janela
 * @returns String formatada
 */
export function formatWindowTitle(windowId: number): string {
  return `Janela ${windowId}`;
}
