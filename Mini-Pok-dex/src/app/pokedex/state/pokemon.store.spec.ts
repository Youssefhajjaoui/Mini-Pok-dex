import { TestBed } from '@angular/core/testing';
import { Subject, firstValueFrom, of } from 'rxjs';

import { Pokemon } from '../models/pokemon.model';
import { PokemonApiService } from '../services/pokemon-api.service';
import { PokemonStore } from './pokemon.store';

describe('PokemonStore', () => {
  let store: PokemonStore;
  let response: Subject<Pokemon[]>;
  let getPokemonList: ReturnType<typeof vi.fn>;
  let getPokemonByIds: ReturnType<typeof vi.fn>;

  const status = () => firstValueFrom(store.status$);

  beforeEach(() => {
    response = new Subject<Pokemon[]>();
    getPokemonList = vi.fn(() => response);
    getPokemonByIds = vi.fn();

    TestBed.configureTestingModule({
      providers: [{ provide: PokemonApiService, useValue: { getPokemonList, getPokemonByIds } }],
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

  it('fetches only uncached ids by id and merges them into byId$', async () => {
    store.load();
    response.next([{ id: 25, name: 'pikachu' } as Pokemon]);
    response.complete();

    const typhlosion = { id: 157, name: 'typhlosion' } as Pokemon;
    getPokemonByIds.mockReturnValue(of([typhlosion]));

    store.loadByIds([25, 157, 157]);
    store.loadByIds([157]);

    expect(getPokemonByIds).toHaveBeenCalledTimes(1);
    expect(getPokemonByIds).toHaveBeenCalledWith([157]);
    expect((await firstValueFrom(store.byId$)).get(157)).toBe(typhlosion);
    expect(await firstValueFrom(store.items$)).toHaveLength(1);
  });
});
