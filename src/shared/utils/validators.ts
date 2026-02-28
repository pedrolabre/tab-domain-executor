/**
 * Funções de validação
 */

import { Message, MessageType, TabScope } from '../types';

/**
 * Verifica se uma URL é válida e processável
 * @param url - URL a validar
 * @returns true se válida
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return !url.startsWith('chrome://') && 
           !url.startsWith('about:') &&
           !url.startsWith('chrome-extension://');
  } catch {
    return false;
  }
}

/**
 * Verifica se um domínio é válido
 * @param domain - Domínio a validar
 * @returns true se válido
 */
export function isValidDomain(domain: string | null): domain is string {
  return domain !== null && domain.length > 0 && !domain.startsWith('chrome');
}

/**
 * Verifica se uma mensagem é do tipo específico
 * @param message - Mensagem a verificar
 * @param type - Tipo esperado
 * @returns true se a mensagem é do tipo especificado
 */
export function isMessageType<T extends Message>(
  message: Message,
  type: MessageType
): message is T {
  return message.type === type;
}

/**
 * Verifica se um escopo é válido
 * @param scope - Escopo a validar
 * @returns true se válido
 */
export function isValidScope(scope: any): scope is TabScope {
  return scope === 'all' || scope === 'windows';
}

/**
 * Verifica se um array de IDs de janelas é válido
 * @param windowIds - IDs de janelas
 * @returns true se válido
 */
export function isValidWindowIds(windowIds: any): windowIds is number[] {
  return Array.isArray(windowIds) && 
         windowIds.length > 0 && 
         windowIds.every(id => typeof id === 'number');
}
