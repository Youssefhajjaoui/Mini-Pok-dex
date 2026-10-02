import { TestBed } from '@angular/core/testing';
import { Subject, firstValueFrom, of } from 'rxjs';

import { ToastService } from '../../common/toast/toast.service';
import { Team } from '../models/team.model';
import { TeamApiService } from '../services/team-api.service';
import { TeamStore } from './team.store';

const existing: Team = {
  id: '1',
  name: 'Kanto Starters',
  trainerId: '1',
  pokemonIds: [1, 4, 7],
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('TeamStore', () => {
  let store: TeamStore;
  let createResponse: Subject<Team>;
  let api: { getTeams: ReturnType<typeof vi.fn>; createTeam: ReturnType<typeof vi.fn> };
  let toast: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  const teams = () => firstValueFrom(store.teams$);

  beforeEach(() => {
    createResponse = new Subject<Team>();
    api = {
      getTeams: vi.fn(() => of([existing])),
      createTeam: vi.fn(() => createResponse),
    };
    toast = { success: vi.fn(), error: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: TeamApiService, useValue: api },
        { provide: ToastService, useValue: toast },
      ],
    });
    store = TestBed.inject(TeamStore);
    store.load();
  });

  it('shows a new team immediately as pending, before the server answers', async () => {
    store.create({ name: 'Water Squad', pokemonIds: [7, 8, 9] });

    const [first, second] = await teams();
    expect(first).toEqual(
      expect.objectContaining({ name: 'Water Squad', pokemonIds: [7, 8, 9], pending: true }),
    );
    expect(Number(first.id)).toBeLessThan(0);
    expect(second).toBe(existing);
    expect(api.createTeam).toHaveBeenCalledWith(
      { name: 'Water Squad', pokemonIds: [7, 8, 9] },
      first.createdAt,
    );
  });

  it('replaces the temporary row with the saved team on success', async () => {
    store.create({ name: 'Water Squad', pokemonIds: [7, 8, 9] });
    const saved: Team = { ...existing, id: '3', name: 'Water Squad', pokemonIds: [7, 8, 9] };

    createResponse.next(saved);
    createResponse.complete();

    expect(await teams()).toEqual([saved, existing]);
    expect(toast.success).toHaveBeenCalledWith('Team "Water Squad" created.');
  });

  it('rolls back the temporary row and shows an error when the server fails', async () => {
    store.create({ name: 'Water Squad', pokemonIds: [7, 8, 9] });

    createResponse.error(new Error('Could not reach the server.'));

    expect(await teams()).toEqual([existing]);
    expect(toast.error).toHaveBeenCalledWith(
      'Could not create "Water Squad". Could not reach the server.',
    );
  });
});
