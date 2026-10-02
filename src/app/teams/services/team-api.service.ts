import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { GraphqlClientService } from '../../core/graphql/graphql-client.service';
import { Team, TeamDraft, TeamDto } from '../models/team.model';

export const MOCK_API_URL = 'http://localhost:4000';
export const DEFAULT_TRAINER_ID = '1';

const TEAM_FIELDS = 'id name trainer_id pokemon_ids created_at';

const GET_TEAMS = `
  query GetTeams {
    allTeams { ${TEAM_FIELDS} }
  }
`;

const CREATE_TEAM = `
  mutation CreateTeam($name: String!, $trainer_id: ID!, $pokemon_ids: [Int]!, $created_at: Date!) {
    createTeam(name: $name, trainer_id: $trainer_id, pokemon_ids: $pokemon_ids, created_at: $created_at) {
      ${TEAM_FIELDS}
    }
  }
`;

const DELETE_TEAM = `
  mutation DeleteTeam($id: ID!) {
    deleteTeam(id: $id) { id }
  }
`;

@Injectable({ providedIn: 'root' })
export class TeamApiService {
  private readonly graphql = inject(GraphqlClientService);

  /** Fetches all teams from the mock server, newest first. */
  getTeams(): Observable<Team[]> {
    return this.graphql
      .request<{ allTeams: TeamDto[] }>(MOCK_API_URL, GET_TEAMS)
      .pipe(
        map((data) =>
          data.allTeams.map(toTeam).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        ),
      );
  }

  /** Creates a team for the default trainer and emits the saved row. */
  createTeam(draft: TeamDraft, createdAt: string): Observable<Team> {
    return this.graphql
      .request<{ createTeam: TeamDto }>(MOCK_API_URL, CREATE_TEAM, {
        name: draft.name,
        trainer_id: DEFAULT_TRAINER_ID,
        pokemon_ids: draft.pokemonIds,
        created_at: createdAt,
      })
      .pipe(map((data) => toTeam(data.createTeam)));
  }

  /** Deletes a team and emits its id. */
  deleteTeam(id: string): Observable<string> {
    return this.graphql
      .request<{ deleteTeam: { id: string } }>(MOCK_API_URL, DELETE_TEAM, { id })
      .pipe(map((data) => data.deleteTeam.id));
  }
}

function toTeam(dto: TeamDto): Team {
  return {
    id: String(dto.id),
    name: dto.name,
    trainerId: String(dto.trainer_id),
    pokemonIds: dto.pokemon_ids ?? [],
    createdAt: dto.created_at,
  };
}
