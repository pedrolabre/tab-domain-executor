/**
 * Testes de integração para o message-dispatcher.
 * Usa Chrome API mockada (via setup.ts) mas executa a lógica real dos módulos.
 */

import { handle } from '../../src/background/message-dispatcher';
import { MessageType } from '../../src/shared/types';
import { ERROR_MESSAGES } from '../../src/shared/constants';
import { clearRecoveryLog } from '../../src/modules/recovery';
import { resetChromeMocks, makeChromeTab } from '../mocks/chrome.mock';

beforeEach(() => {
  resetChromeMocks();
  clearRecoveryLog();
});

/** Helper: retorna a resposta do dispatcher como Promise */
function dispatch(message: any): Promise<any> {
  return new Promise(resolve => handle(message, resolve));
}

describe('message-dispatcher — integração', () => {
  describe('validação de mensagem', () => {
    it('retorna erro para mensagem null', async () => {
      const res = await dispatch(null);
      expect(res.success).toBe(false);
      expect(res.error).toBe(ERROR_MESSAGES.INVALID_MESSAGE);
    });

    it('retorna erro para tipo de mensagem desconhecido', async () => {
      const res = await dispatch({ type: 'UNKNOWN_TYPE' });
      expect(res.success).toBe(false);
      expect(res.error).toBe(ERROR_MESSAGES.UNKNOWN_MESSAGE_TYPE);
    });
  });

  describe('ANALYZE_TABS', () => {
    it('retorna lista de domínios agrupados', async () => {
      (global.chrome.tabs.query as jest.Mock).mockResolvedValue([
        makeChromeTab({ id: 1, windowId: 1, url: 'https://youtube.com/a' }),
        makeChromeTab({ id: 2, windowId: 1, url: 'https://youtube.com/b' }),
        makeChromeTab({ id: 3, windowId: 1, url: 'https://github.com/x' }),
      ]);

      const res = await dispatch({ type: MessageType.ANALYZE_TABS });

      expect(res.success).toBe(true);
      expect(res.domains).toHaveLength(2);
      expect(res.domains[0].domain).toBe('youtube.com');
      expect(res.domains[0].tabCount).toBe(2);
    });

    it('filtra abas com URLs do Chrome (chrome://)', async () => {
      (global.chrome.tabs.query as jest.Mock).mockResolvedValue([
        makeChromeTab({ id: 1, windowId: 1, url: 'chrome://extensions' }),
        makeChromeTab({ id: 2, windowId: 1, url: 'https://google.com' }),
      ]);

      const res = await dispatch({ type: MessageType.ANALYZE_TABS });

      // chrome:// domain é null — não aparece nos grupos
      expect(res.domains).toHaveLength(1);
      expect(res.domains[0].domain).toBe('google.com');
    });
  });

  describe('GET_WINDOWS_FOR_DOMAIN', () => {
    it('retorna erro para domínio vazio', async () => {
      const res = await dispatch({
        type: MessageType.GET_WINDOWS_FOR_DOMAIN,
        payload: { domain: '' },
      });
      expect(res.success).toBe(false);
      expect(res.error).toBe(ERROR_MESSAGES.EMPTY_DOMAIN);
    });

    it('retorna janelas do domínio solicitado', async () => {
      (global.chrome.tabs.query as jest.Mock).mockResolvedValue([
        makeChromeTab({ id: 1, windowId: 1, url: 'https://youtube.com/a' }),
        makeChromeTab({ id: 2, windowId: 2, url: 'https://youtube.com/b' }),
      ]);

      const res = await dispatch({
        type: MessageType.GET_WINDOWS_FOR_DOMAIN,
        payload: { domain: 'youtube.com' },
      });

      expect(res.success).toBe(true);
      expect(res.windows).toHaveLength(2);
    });
  });

  describe('GET_TABS_FOR_DOMAIN', () => {
    it('retorna erro para escopo inválido', async () => {
      const res = await dispatch({
        type: MessageType.GET_TABS_FOR_DOMAIN,
        payload: { domain: 'x.com', scope: 'invalid' },
      });
      expect(res.success).toBe(false);
      expect(res.error).toBe(ERROR_MESSAGES.INVALID_SCOPE);
    });

    it('retorna abas com scope "all"', async () => {
      (global.chrome.tabs.query as jest.Mock).mockResolvedValue([
        makeChromeTab({ id: 1, windowId: 1, url: 'https://x.com/a' }),
        makeChromeTab({ id: 2, windowId: 2, url: 'https://x.com/b' }),
      ]);

      const res = await dispatch({
        type: MessageType.GET_TABS_FOR_DOMAIN,
        payload: { domain: 'x.com', scope: 'all' },
      });

      expect(res.success).toBe(true);
      expect(res.tabs).toHaveLength(2);
    });

    it('retorna erro quando scope "windows" sem windowIds', async () => {
      const res = await dispatch({
        type: MessageType.GET_TABS_FOR_DOMAIN,
        payload: { domain: 'x.com', scope: 'windows', windowIds: [] },
      });
      expect(res.success).toBe(false);
      expect(res.error).toBe(ERROR_MESSAGES.WINDOW_IDS_REQUIRED);
    });
  });

  describe('CLOSE_SINGLE_TAB', () => {
    it('fecha aba e retorna tabId', async () => {
      (global.chrome.tabs.remove as jest.Mock).mockResolvedValue(undefined);

      const res = await dispatch({
        type: MessageType.CLOSE_SINGLE_TAB,
        payload: { tabId: 7 },
      });

      expect(res.success).toBe(true);
      expect(res.tabId).toBe(7);
    });

    it('retorna falha quando chrome.tabs.remove rejeita', async () => {
      (global.chrome.tabs.remove as jest.Mock).mockRejectedValue(new Error('gone'));

      const res = await dispatch({
        type: MessageType.CLOSE_SINGLE_TAB,
        payload: { tabId: 7 },
      });

      expect(res.success).toBe(false);
    });
  });

  describe('CLOSE_BULK_TABS', () => {
    it('fecha abas em lote e armazena log de recuperação', async () => {
      (global.chrome.tabs.remove as jest.Mock).mockResolvedValue(undefined);

      const res = await dispatch({
        type: MessageType.CLOSE_BULK_TABS,
        payload: {
          tabIds: [1, 2, 3],
          tabs: [
            { url: 'https://a.com', windowId: 1 },
            { url: 'https://b.com', windowId: 1 },
            { url: 'https://c.com', windowId: 1 },
          ],
        },
      });

      expect(res.success).toBe(true);
      expect(res.closedCount).toBe(3);
      expect(res.recoverable).toBe(true);
    });
  });

  describe('CHECK_RECOVERY', () => {
    it('retorna recoverable: false quando não há log', async () => {
      const res = await dispatch({ type: MessageType.CHECK_RECOVERY });

      expect(res.success).toBe(true);
      expect(res.recoverable).toBe(false);
    });

    it('retorna recoverable: true após fechar abas em lote', async () => {
      (global.chrome.tabs.remove as jest.Mock).mockResolvedValue(undefined);

      await dispatch({
        type: MessageType.CLOSE_BULK_TABS,
        payload: {
          tabIds: [1],
          tabs: [{ url: 'https://a.com', windowId: 1 }],
        },
      });

      const res = await dispatch({ type: MessageType.CHECK_RECOVERY });
      expect(res.recoverable).toBe(true);
      expect(res.tabCount).toBe(1);
    });
  });

  describe('RECOVER_LAST_ACTION', () => {
    it('retorna erro quando não há ação recuperável', async () => {
      const res = await dispatch({ type: MessageType.RECOVER_LAST_ACTION });

      expect(res.success).toBe(false);
      expect(res.error).toContain(
        ERROR_MESSAGES.RECOVERY_NOT_AVAILABLE
      );
    });

    it('restaura abas e limpa o log de recuperação', async () => {
      (global.chrome.tabs.remove as jest.Mock).mockResolvedValue(undefined);
      (global.chrome.tabs.create as jest.Mock).mockResolvedValue(
        makeChromeTab()
      );

      // Fechar abas primeiro para criar o log
      await dispatch({
        type: MessageType.CLOSE_BULK_TABS,
        payload: {
          tabIds: [1],
          tabs: [{ url: 'https://a.com', windowId: 1 }],
        },
      });

      const res = await dispatch({ type: MessageType.RECOVER_LAST_ACTION });

      expect(res.success).toBe(true);
      expect(chrome.tabs.create).toHaveBeenCalledTimes(1);
    });
  });
});
