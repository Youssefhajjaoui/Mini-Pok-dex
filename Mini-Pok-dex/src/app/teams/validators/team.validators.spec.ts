import { FormControl, ValidationErrors } from '@angular/forms';
import { Observable, firstValueFrom } from 'rxjs';

import { teamSizeValidator, uniqueTeamNameValidator } from './team.validators';

describe('team validators', () => {
  describe('uniqueTeamNameValidator', () => {
    const validate = (value: string) => {
      const validator = uniqueTeamNameValidator(() => ['Kanto Starters', 'Electric Shock'], 0);
      return firstValueFrom(
        validator(new FormControl(value)) as Observable<ValidationErrors | null>,
      );
    };

    it('rejects an existing name, ignoring case and surrounding spaces', async () => {
      expect(await validate('  kanto STARTERS ')).toEqual({ nameTaken: true });
    });

    it('accepts a new name and leaves an empty name to the required validator', async () => {
      expect(await validate('Water Squad')).toBeNull();
      expect(await validate('   ')).toBeNull();
    });

    it('waits for the debounce before checking', () => {
      vi.useFakeTimers();
      try {
        const validator = uniqueTeamNameValidator(() => ['Kanto Starters'], 300);
        const result = vi.fn();
        (validator(new FormControl('Kanto Starters')) as Observable<ValidationErrors | null>)
          .subscribe(result);

        vi.advanceTimersByTime(299);
        expect(result).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(result).toHaveBeenCalledWith({ nameTaken: true });
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('teamSizeValidator', () => {
    const validate = (ids: number[]) => teamSizeValidator(new FormControl(ids));

    it('requires between 1 and 6 Pokémon', () => {
      expect(validate([])).toEqual({ teamTooSmall: true });
      expect(validate([1])).toBeNull();
      expect(validate([1, 2, 3, 4, 5, 6])).toBeNull();
      expect(validate([1, 2, 3, 4, 5, 6, 7])).toEqual({ teamTooLarge: true });
    });
  });
});
