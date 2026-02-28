/**
 * Constantes gerais da aplicação
 */

/** Nome da extensão */
export const APP_NAME = 'Tab Domain Executor';

/** Versão da extensão */
export const APP_VERSION = '1.0.0';

/** Mensagens de erro padrão */
export const ERROR_MESSAGES = {
  TABS_NOT_FOUND: 'Nenhuma aba encontrada',
  DOMAIN_NOT_FOUND: 'Domínio não encontrado',
  WINDOWS_NOT_FOUND: 'Nenhuma janela encontrada',
  INVALID_SCOPE: 'Escopo inválido',
  CLOSE_FAILED: 'Falha ao fechar abas',
  RECOVERY_EXPIRED: 'Período de recuperação expirado',
  RECOVERY_NOT_AVAILABLE: 'Nenhuma ação recuperável disponível',
  RESTORE_FAILED: 'Falha ao restaurar abas',
  PERMISSION_DENIED: 'Permissão negada pelo Chrome',
  INVALID_MESSAGE: 'Mensagem inválida',
  UNKNOWN_MESSAGE_TYPE: 'Tipo de mensagem desconhecido',
  WINDOW_IDS_REQUIRED: 'IDs de janelas obrigatório quando scope === "windows"',
  EMPTY_DOMAIN: 'Domínio não pode ser vazio',
  NO_TABS_TO_CLOSE: 'Nenhuma aba para fechar',
  NO_TABS_TO_RESTORE: 'Nenhuma aba para restaurar'
} as const;

/** Mensagens de sucesso padrão */
export const SUCCESS_MESSAGES = {
  TABS_CLOSED: 'Abas fechadas com sucesso',
  TABS_RESTORED: 'Abas restauradas com sucesso',
  RECOVERY_AVAILABLE: 'Você pode recuperar esta ação nos próximos 15 minutos'
} as const;
