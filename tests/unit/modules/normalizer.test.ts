import { normalizeUrl, extractDomain } from '../../../src/modules/normalizer';

describe('URL Normalizer', () => {
  describe('normalizeUrl', () => {
    it('deve extrair domínio base de URL simples', () => {
      const url = 'https://youtube.com/watch?v=abc';
      const result = normalizeUrl(url);
      expect(result).toBe('youtube.com');
    });

    it('deve remover www. do domínio', () => {
      const url = 'https://www.youtube.com/watch?v=abc';
      const result = normalizeUrl(url);
      expect(result).toBe('youtube.com');
    });

    it('deve retornar null para URLs internas do Chrome', () => {
      const url = 'chrome://extensions';
      const result = normalizeUrl(url);
      expect(result).toBeNull();
    });
  });

  describe('extractDomain', () => {
    it('deve ser um alias para normalizeUrl', () => {
      const url = 'https://github.com/user/repo';
      const resultNormalize = normalizeUrl(url);
      const resultExtract = extractDomain(url);
      expect(resultExtract).toBe(resultNormalize);
    });
  });
});
