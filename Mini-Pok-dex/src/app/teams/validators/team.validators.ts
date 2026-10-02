import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, map, timer } from 'rxjs';

import { MAX_TEAM_SIZE } from '../models/team.model';

/**
 * Async validator that rejects a name already used by another team (case-insensitive).
 * The timer debounces typing: Angular cancels the previous check when the value changes.
 */
export function uniqueTeamNameValidator(
  existingNames: () => string[],
  debounceMs = 300,
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> =>
    timer(debounceMs).pipe(
      map(() => {
        const name = normalize(control.value);
        if (!name) return null;
        return existingNames().some((existing) => normalize(existing) === name)
          ? { nameTaken: true }
          : null;
      }),
    );
}

/** Requires between 1 and MAX_TEAM_SIZE Pokémon. */
export const teamSizeValidator: ValidatorFn = (control) => {
  const size = (control.value as number[] | null)?.length ?? 0;
  if (size < 1) return { teamTooSmall: true };
  if (size > MAX_TEAM_SIZE) return { teamTooLarge: true };
  return null;
};

function normalize(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}
