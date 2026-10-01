/**
 * Centralized toast / notification helper utility.
 * Integrates with existing UI components without introducing third-party dependencies.
 */

import { isApiError } from '@/lib/api/errors';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastPayload {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  requestId?: string;
  duration?: number;
}

type ToastListener = (toast: ToastPayload) => void;
const toastListeners = new Set<ToastListener>();

export function subscribeToToasts(listener: ToastListener): () => void {
  toastListeners.add(listener);
  return () => {
    toastListeners.delete(listener);
  };
}

function dispatchToast(type: ToastType, message: string, title?: string, requestId?: string, duration = 4000): void {
  const payload: ToastPayload = {
    id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    title,
    message,
    requestId,
    duration,
  };

  // Dispatch to in-memory subscribers
  toastListeners.forEach((listener) => {
    try {
      listener(payload);
    } catch {
      // Ignore listener error
    }
  });

  // Also dispatch browser CustomEvent for external subscribers
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('washora:toast', { detail: payload }));
  }
}

export function showSuccess(message: string, title: string = 'Success'): void {
  dispatchToast('success', message, title);
}

export function showError(errorOrMessage: unknown, title: string = 'Error'): void {
  if (typeof errorOrMessage === 'string') {
    dispatchToast('error', errorOrMessage, title);
    return;
  }

  if (isApiError(errorOrMessage)) {
    const errorMsg = errorOrMessage.message || 'An unexpected error occurred.';
    dispatchToast('error', errorMsg, title, errorOrMessage.requestId);
    return;
  }

  if (errorOrMessage instanceof Error) {
    dispatchToast('error', errorOrMessage.message, title);
    return;
  }

  dispatchToast('error', 'An unexpected error occurred. Please try again.', title);
}

export function showWarning(message: string, title: string = 'Warning'): void {
  dispatchToast('warning', message, title);
}

export function showInfo(message: string, title: string = 'Information'): void {
  dispatchToast('info', message, title);
}
