/**
 * Toast notification system for user feedback
 */

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class ToastManager {
  private toasts: Toast[] = [];
  private listeners: Set<(toasts: Toast[]) => void> = new Set();

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  show(toast: Omit<Toast, "id">) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    };

    this.toasts.push(newToast);
    this.notify();

    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, newToast.duration);
    }

    return id;
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notify();
  }

  clear() {
    this.toasts = [];
    this.notify();
  }

  getToasts(): Toast[] {
    return [...this.toasts];
  }
}

export const toastManager = new ToastManager();

// Convenience functions
export const toast = {
  success: (message: string, options?: Omit<Toast, "id" | "type" | "message">) => {
    return toastManager.show({ type: "success", message, ...options });
  },
  error: (message: string, options?: Omit<Toast, "id" | "type" | "message">) => {
    return toastManager.show({ type: "error", message, duration: 7000, ...options });
  },
  warning: (message: string, options?: Omit<Toast, "id" | "type" | "message">) => {
    return toastManager.show({ type: "warning", message, ...options });
  },
  info: (message: string, options?: Omit<Toast, "id" | "type" | "message">) => {
    return toastManager.show({ type: "info", message, ...options });
  },
};

