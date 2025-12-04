'use client';

/**
 * GlobalContext - Outermost application context
 *
 * Provides global state separate from feature-specific concerns.
 * Wrapped around entire app in layout.tsx.
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { GlobalState } from '@/types/state';

/**
 * Global state context (read-only)
 */
const GlobalContext = createContext<GlobalState>({ isLoading: false });

/**
 * Global dispatch context (for updates)
 */
const GlobalDispatchContext = createContext<((update: Partial<GlobalState>) => void) | null>(null);

/**
 * Initial global state
 */
const INITIAL_GLOBAL_STATE: GlobalState = {
  isLoading: false,
  loadingMessage: undefined,
};

/**
 * GlobalProvider - Wraps entire application
 *
 * @param children - App content
 */
export function GlobalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GlobalState>(INITIAL_GLOBAL_STATE);

  /**
   * Update global state with partial updates
   *
   * @param update - Partial state object to merge
   */
  const updateGlobal = useCallback((update: Partial<GlobalState>) => {
    setState(prev => ({ ...prev, ...update }));
  }, []);

  return (
    <GlobalContext.Provider value={state}>
      <GlobalDispatchContext.Provider value={updateGlobal}>
        {children}
      </GlobalDispatchContext.Provider>
    </GlobalContext.Provider>
  );
}

/**
 * Hook to access global state
 *
 * @returns Current global state
 */
export const useGlobalState = () => useContext(GlobalContext);

/**
 * Hook to dispatch global state updates
 *
 * @returns Update function for global state
 * @throws Error if used outside GlobalProvider
 */
export const useGlobalDispatch = () => {
  const dispatch = useContext(GlobalDispatchContext);
  if (!dispatch) {
    throw new Error('useGlobalDispatch must be used within GlobalProvider');
  }
  return dispatch;
};
