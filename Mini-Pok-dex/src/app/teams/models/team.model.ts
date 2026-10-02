export const MAX_TEAM_SIZE = 6;

export interface Team {
  id: string;
  name: string;
  trainerId: string;
  pokemonIds: number[];
  createdAt: string;
  /** True while an optimistic create is waiting for the server. */
  pending?: boolean;
}

export interface TeamDraft {
  name: string;
  pokemonIds: number[];
}

export interface TeamDto {
  id: string;
  name: string;
  trainer_id: string;
  pokemon_ids: number[];
  created_at: string;
}
