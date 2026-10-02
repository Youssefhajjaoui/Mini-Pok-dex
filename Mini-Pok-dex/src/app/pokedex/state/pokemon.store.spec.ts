import { TestBed } from '@angular/core/testing';
import { Subject, firstValueFrom } from 'rxjs';

import { Pokemon } from '../models/pokemon.model';
import { PokemonApiService } from '../services/pokemon-api.service';
import { PokemonStore } from './pokemon.store';

describe('PokemonStore', () => {
  let store: PokemonStore;
  let response: Subject<Pokemon[]>;
  let getPokemonList: ReturnType<typeof vi.fn>;

  const status = () => firstValueFrom(store.status$);

  beforeEach(() => {
    response = new Subject<Pokemon[]>();
    getPokemonList = vi.fn(() => response);

    TestBed.configureTestingModule({
      providers: [{ provide: PokemonApiService, useValue: { getPokemonList } }],
    });
    store = TestBed.inject(PokemonStore);
  });

  it('fetches once and serves the cached list afterwards', async () => {
    store.load();
    expect(await status()).toBe('loading');

    store.load();
    expect(getPokemonList).toHaveBeenCalledTimes(1);

    const bulbasaur = { id: 1, name: 'bulbasaur' } as Pokemon;
    response.next([bulbasaur]);
    response.complete();

    store.load();
    expect(getPokemonList).toHaveBeenCalledTimes(1);
    expect(await status()).toBe('success');
    expect((await firstValueFrom(store.byId$)).get(1)).toBe(bulbasaur);
  });

  it('exposes the error message and refetches on a forced retry', async () => {
    store.load();
    response.error(new Error('Could not reach the server.'));

    expect(await status()).toBe('error');
    expect(await firstValueFrom(store.error$)).toBe('Could not reach the server.');

    response = new Subject<Pokemon[]>();
    store.load(true);
    expect(getPokemonList).toHaveBeenCalledTimes(2);
    expect(await status()).toBe('loading');
    expect(await firstValueFrom(store.error$)).toBeNull();
  });
});
