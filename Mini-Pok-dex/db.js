module.exports = {
  trainers: [
    {
      id: 1,
      name: 'Ash',
      avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/1.png',
    },
  ],
  teams: [
    {
      id: 1,
      name: 'Kanto Starters',
      trainer_id: 1,
      pokemon_ids: [1, 4, 7],
      created_at: '2026-01-01T10:00:00.000Z',
    },
    {
      id: 2,
      name: 'Electric Shock',
      trainer_id: 1,
      pokemon_ids: [25, 26, 135, 145],
      created_at: '2026-01-02T10:00:00.000Z',
    },
  ],
};
