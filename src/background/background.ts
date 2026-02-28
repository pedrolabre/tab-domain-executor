/**
 * Background Service Worker
 * Entry point do service worker da extensão
 */

import { handle } from './message-dispatcher';
import { Message, BaseResponse } from '../shared/types';

/**
 * Inicializa o service worker
 */
function init(): void {
  console.log('Tab Domain Executor - Background Service Worker inicializado');

  // Registrar listener de mensagens
  chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
    // Delegar para MessageDispatcher
    handle(message, sendResponse);

    // Manter canal aberto para respostas assíncronas
    return true;
  });
}

// Executar inicialização
init();
