/**
 * Tipos relacionados a abas do navegador
 */

/**
 * Representa uma aba do navegador com dados normalizados
 */
export interface Tab {
  /** ID único da aba no Chrome */
  id: number;
  
  /** ID da janela que contém esta aba */
  windowId: number;
  
  /** URL completa da aba */
  url: string;
  
  /** Título da aba */
  title: string;
  
  /** URL do favicon (ícone) da aba */
  favIconUrl?: string;
  
  /** Domínio base normalizado (ex: "youtube.com") */
  domain: string | null;
  
  /** Indica se a aba está ativa na janela */
  active: boolean;
  
  /** Índice da aba na janela */
  index: number;
}

/**
 * Representação mínima de aba para recuperação
 * Contém apenas dados essenciais para recriar a aba
 */
export interface TabMinimal {
  /** URL da aba */
  url: string;
  
  /** ID da janela original */
  windowId: number;
  
  /** Título original (opcional, para referência) */
  title?: string;
}
