/**
 * Setup para testes Jest
 */

// Mock da Chrome API global
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
    },
    lastError: undefined,
  },
  tabs: {
    query: jest.fn(),
    remove: jest.fn(),
    create: jest.fn(),
  },
  windows: {
    getAll: jest.fn(),
  },
} as any;
