/**
 * Gerenciador de estado da aplicação
 */

import { AppState, FlowState } from '../../shared/types';

const initialState: AppState = {
  currentFlow: FlowState.INITIAL,
  domains: [],
  selectedDomain: null,
  selectedScope: null,
  windows: [],
  selectedWindowIds: [],
  tabs: [],
  recoveryStatus: null,
  errorMessage: null,
  isLoading: false
};

let appState: AppState = { ...initialState };

export function getState(): AppState {
  return { ...appState };
}

export function setState(newState: Partial<AppState>): void {
  appState = {
    ...appState,
    ...newState
  };
}

export function resetState(): void {
  appState = { ...initialState };
}

export function setFlow(flow: FlowState): void {
  appState.currentFlow = flow;
}

export function getCurrentFlow(): FlowState {
  return appState.currentFlow;
}
