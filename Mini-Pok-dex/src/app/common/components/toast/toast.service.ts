import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error';

export interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

const TOAST_DURATION_MS = 5000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly toastList = signal<Toast[]>([]);

  readonly toasts = this.toastList.asReadonly();

  /** Shows a success message that disappears on its own. */
  success(message: string): void {
    this.show(message, 'success');
  }

  /** Shows an error message that disappears on its own. */
  error(message: string): void {
    this.show(message, 'error');
  }

  /** Removes a toast before its timer runs out. */
  dismiss(id: number): void {
    this.toastList.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  private show(message: string, kind: ToastKind): void {
    const id = ++this.nextId;
    this.toastList.update((toasts) => [...toasts, { id, message, kind }]);
    setTimeout(() => this.dismiss(id), TOAST_DURATION_MS);
  }
}
