/**
 * Módulo de normalização de URLs
 * Responsável por extrair domínio base de URLs
 */

/**
 * Extrai domínio base de uma URL
 * @param url - URL completa
 * @returns Domínio base normalizado ou null se inválido
 */
export function normalizeUrl(url: string): string | null {
  try {
    // Verificar URLs internas do Chrome
    if (url.startsWith('chrome://') || 
        url.startsWith('about:') ||
        url.startsWith('chrome-extension://')) {
      return null;
    }
    
    // Parse URL
    const parsed = new URL(url);
    let domain = parsed.hostname;
    
    // Remover www.
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    
    return domain;
  } catch (error) {
    // URL inválida
    return null;
  }
}

/**
 * Alias para normalizeUrl
 * Mantido para clareza semântica
 */
export function extractDomain(url: string): string | null {
  return normalizeUrl(url);
}
