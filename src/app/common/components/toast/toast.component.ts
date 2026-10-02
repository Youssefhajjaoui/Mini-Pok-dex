import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div class="toast-stack" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast"
          [class.toast--error]="toast.kind === 'error'"
          [attr.role]="toast.kind === 'error' ? 'alert' : 'status'"
        >
          <span class="toast__message">{{ toast.message }}</span>
          <button
            type="button"
            class="toast__close"
            aria-label="Dismiss"
            (click)="toastService.dismiss(toast.id)"
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toast-stack {
      position: fixed;
      right: var(--space-6);
      bottom: var(--space-6);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      max-width: 360px;
    }
    .toast {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      border-left: 4px solid var(--color-success);
      background: var(--color-surface-raised);
      box-shadow: 0 8px 24px rgb(0 0 0 / 40%);
      animation: toast-in 0.2s ease-out;
    }
    .toast--error {
      border-left-color: var(--color-danger);
    }
    .toast__message {
      flex: 1;
      font-size: 0.9rem;
    }
    .toast__close {
      border: none;
      background: none;
      color: var(--color-text-muted);
      font-size: 1.1rem;
      line-height: 1;
      cursor: pointer;
    }
    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);
}
