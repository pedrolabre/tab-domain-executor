import {
  storeRecoveryLog,
  getRecoveryLog,
  hasRecoverableAction,
  clearRecoveryLog,
} from '../../../src/modules/recovery';
import { RECOVERY_TTL_MS } from '../../../src/shared/constants';
import { makeTabMinimal } from '../../mocks/tab.fixtures';

beforeEach(() => {
  // Limpar estado do módulo entre testes
  clearRecoveryLog();
  jest.useRealTimers();
});

describe('recovery-manager', () => {
  const sampleTabs = [
    makeTabMinimal({ url: 'https://a.com', windowId: 1 }),
    makeTabMinimal({ url: 'https://b.com', windowId: 2 }),
  ];

  describe('storeRecoveryLog', () => {
    it('armazena o log com as abas fornecidas', () => {
      storeRecoveryLog(sampleTabs);
      const log = getRecoveryLog();

      expect(log).not.toBeNull();
      expect(log!.tabs).toHaveLength(2);
      expect(log!.tabs[0].url).toBe('https://a.com');
    });

    it('define ttl igual a RECOVERY_TTL_MS', () => {
      storeRecoveryLog(sampleTabs);
      const log = getRecoveryLog();

      expect(log!.ttl).toBe(RECOVERY_TTL_MS);
    });

    it('substitui log anterior ao chamar novamente', () => {
      storeRecoveryLog(sampleTabs);
      storeRecoveryLog([makeTabMinimal({ url: 'https://c.com' })]);

      const log = getRecoveryLog();
      expect(log!.tabs).toHaveLength(1);
      expect(log!.tabs[0].url).toBe('https://c.com');
    });
  });

  describe('getRecoveryLog', () => {
    it('retorna null quando não há log armazenado', () => {
      expect(getRecoveryLog()).toBeNull();
    });

    it('retorna o log quando existe e está dentro do TTL', () => {
      storeRecoveryLog(sampleTabs);
      expect(getRecoveryLog()).not.toBeNull();
    });

    it('retorna null e limpa o log após expiração do TTL', () => {
      jest.useFakeTimers();
      storeRecoveryLog(sampleTabs);

      // Avançar além do TTL
      jest.advanceTimersByTime(RECOVERY_TTL_MS + 1000);

      expect(getRecoveryLog()).toBeNull();
    });
  });

  describe('hasRecoverableAction', () => {
    it('retorna isRecoverable: false quando não há log', () => {
      const status = hasRecoverableAction();

      expect(status.isRecoverable).toBe(false);
      expect(status.tabCount).toBe(0);
      expect(status.timeRemaining).toBe(0);
    });

    it('retorna isRecoverable: true com tabCount correto', () => {
      storeRecoveryLog(sampleTabs);
      const status = hasRecoverableAction();

      expect(status.isRecoverable).toBe(true);
      expect(status.tabCount).toBe(2);
      expect(status.timeRemaining).toBeGreaterThan(0);
    });

    it('retorna isRecoverable: false após expiração do TTL', () => {
      jest.useFakeTimers();
      storeRecoveryLog(sampleTabs);
      jest.advanceTimersByTime(RECOVERY_TTL_MS + 1000);

      const status = hasRecoverableAction();
      expect(status.isRecoverable).toBe(false);
    });

    it('define expiresAt como timestamp + ttl', () => {
      storeRecoveryLog(sampleTabs);
      const log = getRecoveryLog()!;
      const status = hasRecoverableAction();

      expect(status.expiresAt).toBe(log.timestamp + log.ttl);
    });
  });

  describe('clearRecoveryLog', () => {
    it('remove o log existente', () => {
      storeRecoveryLog(sampleTabs);
      clearRecoveryLog();

      expect(getRecoveryLog()).toBeNull();
    });

    it('não lança erro quando não há log', () => {
      expect(() => clearRecoveryLog()).not.toThrow();
    });
  });
});
