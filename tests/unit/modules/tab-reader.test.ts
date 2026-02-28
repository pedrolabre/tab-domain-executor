import { getAllTabs, getAllWindows, getTabsByWindowId } from '../../../src/modules/tab-reader';
import { resetChromeMocks, makeChromeTab } from '../../mocks/chrome.mock';

beforeEach(() => {
  resetChromeMocks();
});

describe('tab-reader', () => {
  describe('getAllTabs', () => {
    it('retorna todas as abas via chrome.tabs.query', async () => {
      const mockTabs = [
        makeChromeTab({ id: 1, url: 'https://a.com' }),
        makeChromeTab({ id: 2, url: 'https://b.com' }),
      ];
      (global.chrome.tabs.query as jest.Mock).mockResolvedValue(mockTabs);

      const result = await getAllTabs();

      expect(chrome.tabs.query).toHaveBeenCalledWith({});
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
    });

    it('lança erro quando chrome.tabs.query rejeita', async () => {
      (global.chrome.tabs.query as jest.Mock).mockRejectedValue(new Error('permission denied'));

      await expect(getAllTabs()).rejects.toThrow('Falha ao acessar abas do navegador');
    });
  });

  describe('getAllWindows', () => {
    it('retorna janelas via chrome.windows.getAll', async () => {
      const mockWindows = [{ id: 1, focused: true, tabs: [] }];
      (global.chrome.windows.getAll as jest.Mock).mockResolvedValue(mockWindows);

      const result = await getAllWindows();

      expect(chrome.windows.getAll).toHaveBeenCalledWith({ populate: true });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('lança erro quando chrome.windows.getAll rejeita', async () => {
      (global.chrome.windows.getAll as jest.Mock).mockRejectedValue(new Error('fail'));

      await expect(getAllWindows()).rejects.toThrow('Falha ao acessar janelas do navegador');
    });
  });

  describe('getTabsByWindowId', () => {
    it('filtra abas pelo windowId fornecido', async () => {
      const mockTabs = [makeChromeTab({ id: 10, windowId: 5 })];
      (global.chrome.tabs.query as jest.Mock).mockResolvedValue(mockTabs);

      const result = await getTabsByWindowId(5);

      expect(chrome.tabs.query).toHaveBeenCalledWith({ windowId: 5 });
      expect(result).toHaveLength(1);
    });

    it('lança erro quando a query falha', async () => {
      (global.chrome.tabs.query as jest.Mock).mockRejectedValue(new Error('fail'));

      await expect(getTabsByWindowId(5)).rejects.toThrow('Falha ao acessar abas da janela 5');
    });
  });
});
