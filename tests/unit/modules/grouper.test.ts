import { groupByDomain, groupByWindow, filterTabsByScope } from '../../../src/modules/grouper';
import { makeTab, makeMultiDomainTabs } from '../../mocks/tab.fixtures';

describe('tab-grouper', () => {
  describe('groupByDomain', () => {
    it('retorna array vazio para lista vazia de abas', () => {
      expect(groupByDomain([])).toEqual([]);
    });

    it('ignora abas com domain === null', () => {
      const tabs = [makeTab({ domain: null })];
      expect(groupByDomain(tabs)).toHaveLength(0);
    });

    it('agrupa abas do mesmo domínio em um único grupo', () => {
      const tabs = [
        makeTab({ id: 1, domain: 'example.com' }),
        makeTab({ id: 2, domain: 'example.com' }),
      ];
      const result = groupByDomain(tabs);

      expect(result).toHaveLength(1);
      expect(result[0].domain).toBe('example.com');
      expect(result[0].tabCount).toBe(2);
    });

    it('cria grupos distintos para domínios diferentes', () => {
      const tabs = makeMultiDomainTabs();
      const result = groupByDomain(tabs);

      const domains = result.map(g => g.domain);
      expect(domains).toContain('youtube.com');
      expect(domains).toContain('github.com');
      expect(domains).toContain('google.com');
    });

    it('ordena grupos pelo número de abas (maior primeiro)', () => {
      const tabs = makeMultiDomainTabs();
      const result = groupByDomain(tabs);

      expect(result[0].domain).toBe('youtube.com');
      expect(result[0].tabCount).toBe(3);
      expect(result[1].tabCount).toBe(2);
    });

    it('calcula windowCount corretamente para domínios em múltiplas janelas', () => {
      const tabs = makeMultiDomainTabs();
      const result = groupByDomain(tabs);
      const youtube = result.find(g => g.domain === 'youtube.com')!;

      expect(youtube.windowCount).toBe(2);
      expect(youtube.windowIds).toEqual(expect.arrayContaining([1, 2]));
    });
  });

  describe('groupByWindow', () => {
    it('retorna array vazio quando não há abas do domínio', () => {
      const tabs = makeMultiDomainTabs();
      expect(groupByWindow(tabs, 'nonexistent.com')).toHaveLength(0);
    });

    it('cria um grupo por janela que contém o domínio', () => {
      const tabs = makeMultiDomainTabs();
      const result = groupByWindow(tabs, 'youtube.com');

      expect(result).toHaveLength(2);
      const windowIds = result.map(w => w.windowId);
      expect(windowIds).toContain(1);
      expect(windowIds).toContain(2);
    });

    it('contabiliza corretamente as abas por janela', () => {
      const tabs = makeMultiDomainTabs();
      const result = groupByWindow(tabs, 'youtube.com');
      const window1 = result.find(w => w.windowId === 1)!;

      // youtube na janela 1: tabs id 1 e 2
      expect(window1.tabCount).toBe(2);
    });

    it('formata o título da janela como "Janela {id}"', () => {
      const tabs = [makeTab({ windowId: 7, domain: 'x.com' })];
      const result = groupByWindow(tabs, 'x.com');

      expect(result[0].windowTitle).toBe('Janela 7');
    });
  });

  describe('filterTabsByScope', () => {
    it('scope "all" retorna todas as abas do domínio', () => {
      const tabs = makeMultiDomainTabs();
      const result = filterTabsByScope(tabs, 'youtube.com', 'all');

      expect(result).toHaveLength(3);
      result.forEach(t => expect(t.domain).toBe('youtube.com'));
    });

    it('scope "windows" filtra pelas janelas fornecidas', () => {
      const tabs = makeMultiDomainTabs();
      const result = filterTabsByScope(tabs, 'youtube.com', 'windows', [1]);

      expect(result).toHaveLength(2);
      result.forEach(t => expect(t.windowId).toBe(1));
    });

    it('scope "windows" sem windowIds lança erro', () => {
      const tabs = makeMultiDomainTabs();
      expect(() => filterTabsByScope(tabs, 'youtube.com', 'windows')).toThrow(
        'windowIds obrigatório quando scope === "windows"'
      );
    });

    it('scope "windows" com array vazio lança erro', () => {
      const tabs = makeMultiDomainTabs();
      expect(() => filterTabsByScope(tabs, 'youtube.com', 'windows', [])).toThrow(
        'windowIds obrigatório quando scope === "windows"'
      );
    });
  });
});
