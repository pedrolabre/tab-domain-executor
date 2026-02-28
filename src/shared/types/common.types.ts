/**
 * Tipos comuns e utilitários
 */

/**
 * Resultado de uma ação executada
 */
export interface ActionResult {
  /** Indica se a ação foi bem-sucedida */
  success: boolean;
  
  /** Mensagem de erro (se success === false) */
  error?: string;
  
  /** Dados adicionais da ação */
  data?: any;
}

/**
 * Resultado de validação de dados
 */
export interface ValidationResult {
  /** Indica se os dados são válidos */
  isValid: boolean;
  
  /** Lista de erros de validação */
  errors: string[];
}

/**
 * Tempo restante formatado
 */
export interface TimeRemaining {
  /** Milissegundos totais */
  totalMs: number;
  
  /** Minutos */
  minutes: number;
  
  /** Segundos */
  seconds: number;
  
  /** String formatada (ex: "5 min restantes") */
  formatted: string;
}
