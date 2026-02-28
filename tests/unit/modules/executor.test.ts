import { closeSingleTab, closeBulkTabs, restoreTabs } from '../../../src/modules/executor';
import { ERROR_MESSAGES } from '../../../src/shared/constants';
import { resetChromeMocks, makeChromeTab } from '../../mocks/chrome.mock';
import { makeTabMinimal } from '../../mocks/tab.fixtures';

beforeEach(() => {
  resetChromeMocks();
});

describe('action-executor', () => {
  describe('closeSingleTab', () => {
    it('retorna sucesso ao fechar aba existente', async () => {
      (global.chrome.tabs.remove as jest.Mock).mockResolvedValue(undefined);

      const result = await closeSingleTab(42);

      expect(chrome.tabs.remove).toHaveBeenCalledWith(42);
      expect(result.success).toBe(true);
      expect(result.data?.tabId).toBe(42);
    });

    it('retorna falha quando chrome.tabs.remove rejeita', async () => {
      (global.chrome.tabs.remove as jest.Mock).mockRejectedValue(
        new Error('No tab with id')
      );

      const result = await closeSingleTab(99);

      expect(result.success).toBe(false);
      expect(result.error).toContain(ERROR_MESSAGES.CLOSE_FAILED);
    });
  });

  describe('closeBulkTabs', () => {
    it('retorna erro para array vazio', async () => {
      const result = await closeBulkTabs([]);

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.NO_TABS_TO_CLOSE);
      expect(chrome.tabs.remove).not.toHaveBeenCalled();
    });

    it('fecha múltiplas abas e retorna closedCount', async () => {
      (global.chrome.tabs.remove as jest.Mock).mockResolvedValue(undefined);

      const result = await closeBulkTabs([1, 2, 3]);

      expect(chrome.tabs.remove).toHaveBeenCalledWith([1, 2, 3]);
      expect(result.success).toBe(true);
      expect(result.data?.closedCount).toBe(3);
    });

    it('retorna falha quando chrome.tabs.remove rejeita', async () => {
      (global.chrome.tabs.remove as jest.Mock).mockRejectedValue(
        new Error('Chrome error')
      );

      const result = await closeBulkTabs([1, 2]);

      expect(result.success).toBe(false);
      expect(result.error).toContain(ERROR_MESSAGES.CLOSE_FAILED);
    });
  });

  describe('restoreTabs', () => {
    it('retorna erro para array vazio', async () => {
      const result = await restoreTabs([]);

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.NO_TABS_TO_RESTORE);
    });

    it('cria abas via chrome.tabs.create e retorna restoredCount', async () => {
      (global.chrome.tabs.create as jest.Mock).mockResolvedValue(makeChromeTab());
      const tabs = [
        makeTabMinimal({ url: 'https://a.com', windowId: 1 }),
        makeTabMinimal({ url: 'https://b.com', windowId: 1 }),
      ];

      const result = await restoreTabs(tabs);

      expect(chrome.tabs.create).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
      expect(result.data?.restoredCount).toBe(2);
    });

    it('abre abas com active: false', async () => {
      (global.chrome.tabs.create as jest.Mock).mockResolvedValue(makeChromeTab());
      await restoreTabs([makeTabMinimal()]);

      expect(chrome.tabs.create).toHaveBeenCalledWith(
        expect.objectContaining({ active: false })
      );
    });

    it('retorna falha quando todas as criações falham', async () => {
      (global.chrome.tabs.create as jest.Mock).mockRejectedValue(new Error('fail'));

      const result = await restoreTabs([makeTabMinimal()]);

      expect(result.success).toBe(false);
      expect(result.error).toContain(ERROR_MESSAGES.RESTORE_FAILED);
    });

    it('retorna sucesso parcial quando apenas algumas criações falham', async () => {
      (global.chrome.tabs.create as jest.Mock)
        .mockResolvedValueOnce(makeChromeTab())
        .mockRejectedValueOnce(new Error('fail'));

      const tabs = [
        makeTabMinimal({ url: 'https://a.com' }),
        makeTabMinimal({ url: 'https://b.com' }),
      ];
      const result = await restoreTabs(tabs);

      expect(result.success).toBe(true);
      expect(result.data?.restoredCount).toBe(1);
      expect(result.data?.errors).toHaveLength(1);
    });
  });
});
