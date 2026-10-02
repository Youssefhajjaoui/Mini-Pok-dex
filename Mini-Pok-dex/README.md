# Mini Pokédex

An Angular 20 app that lists the 151 Kanto Pokémon from [PokéAPI](https://beta.pokeapi.co/graphql/v1beta) and lets you build, view and delete teams stored on a local mock GraphQL server.

- Sortable, searchable, filterable and paginated Pokémon table
- Detail panel with abilities and an animated radar chart of the base stats
- Team builder with reactive-form validation and optimistic creation
- Loading, empty and error (with Retry) states in every view

## Getting started

Requires Node.js 20.19+ (tested with Node 22). The Angular project lives in the `Mini-Pok-dex/` folder of the repository.

```bash
git clone https://github.com/Youssefhajjaoui/Mini-Pok-dex.git
cd Mini-Pok-dex/Mini-Pok-dex
npm install
```

Start the mock GraphQL server for teams (port 4000) in one terminal:

```bash
npm run mock        # same as: npx json-graphql-server db.js --port 4000
```

Start the app in another terminal and open http://localhost:4200:

```bash
npm start           # same as: ng serve
```

The Pokémon list comes from the public PokéAPI, so it needs an internet connection. Teams are kept in memory by the mock server and reset when it restarts.

### Other commands

```bash
npm test -- --watch=false   # unit tests (Vitest, no browser needed)
npm run build               # production build in dist/
```

## Architecture

```
src/app/
  core/graphql/       GraphqlClientService: GraphQL over HttpClient POST, readable errors
  core/charts/        Tree-shaken ECharts build, loaded lazily with the detail panel
  common/             Toasts, type badge, shared SCSS mixins, LoadStatus type
  pokedex/
    services/         PokéAPI queries (list of 151, abilities per Pokémon) with retry
    state/            PokemonStore, AbilitiesStore, pure selectors
    pages/            Pokédex page: table, toolbar, pagination
    components/       Detail panel, stats radar chart
  teams/
    services/         Mock server queries and mutations (allTeams, createTeam, deleteTeam)
    state/            TeamStore with optimistic create, team selectors
    validators/       Unique team name (async) and team size validators
    components/       Team builder form, team list, teams panel
```

### RxJS stores for server data, signals for UI state

Each store (`PokemonStore`, `AbilitiesStore`, `TeamStore`) is an injectable service holding its state in a `BehaviorSubject` and exposing read-only streams (`items$`, `status$`, `error$`, ...). Only the store's methods change the state. No state library is used.

Async work stays in RxJS, where its operators fit best: `retry` for flaky requests, `debounceTime` and `switchMap` for search, `combineLatest` to combine filters, and `shareReplay` so several views share one result.

Components read store streams through `toSignal` and keep UI state in signals: selected Pokémon, sort, page, page size and selected team. Derived values such as the visible page, team type distribution and total base stats are `computed()`. All components are standalone, use `OnPush`, `inject()`, and `input()` / `output()`.

### Client-side paging on a cached list

The 151 Kanto Pokémon are fetched once and cached in `PokemonStore`. Search, type filter, sort and pagination run on that cached list as pure functions (`pokemon.selectors.ts`). This keeps sorting and filtering correct across the whole list, which server-side pages would not, and makes every interaction instant. The list is reused by the detail panel and the team builder's autocomplete, so neither refetches it.

### Optimistic team creation

`TeamStore.create()` inserts the new team immediately with a temporary negative id and a "Saving…" state. When the server answers, the temporary row is replaced by the saved one. If the request fails, only that temporary row is removed (teams changed in the meantime are kept) and an error toast explains what happened. Delete waits for the server and shows a "Deleting…" state on the row.

### Detail panel and radar chart

Abilities are fetched only when a Pokémon is opened and are cached per Pokémon in `AbilitiesStore`. The radar chart's layout is set once and only the six stat values change between Pokémon, so ECharts morphs the shape instead of redrawing it. ECharts is code-split and loads the first time the panel opens.

## Tests

18 Vitest tests cover:

- **Selectors:** search by name or number, type filter, stable sorting, pagination, and the combined RxJS filter pipeline
- **TeamStore:** optimistic create shows a pending row, replaces it on success, and rolls back with an error toast on failure
- **PokemonStore:** caches the list, exposes errors, and refetches on Retry
- **Validators:** duplicate team names (case-insensitive, debounced) and team size limits (1 to 6)

## With more time

- Fetch Pokémon beyond Kanto with cursor-based paging into the same cache, plus virtual scrolling for long lists
- Edit existing teams and pick a trainer instead of the default one
- Component tests for the table, detail panel and team builder states
- End-to-end tests for the demo flow
- Lint (angular-eslint) and commit message checks in CI
