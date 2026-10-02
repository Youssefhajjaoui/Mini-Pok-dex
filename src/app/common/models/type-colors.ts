export interface TypeColor {
  background: string;
  text: string;
}

const LIGHT_TEXT = '#fff';
const DARK_TEXT = '#1b1b2f';

export const TYPE_COLORS: Record<string, TypeColor> = {
  normal: { background: '#a8a878', text: LIGHT_TEXT },
  fire: { background: '#f08030', text: LIGHT_TEXT },
  water: { background: '#6890f0', text: LIGHT_TEXT },
  grass: { background: '#78c850', text: LIGHT_TEXT },
  electric: { background: '#f8d030', text: DARK_TEXT },
  ice: { background: '#98d8d8', text: DARK_TEXT },
  fighting: { background: '#c03028', text: LIGHT_TEXT },
  poison: { background: '#a040a0', text: LIGHT_TEXT },
  ground: { background: '#e0c068', text: DARK_TEXT },
  flying: { background: '#a890f0', text: LIGHT_TEXT },
  psychic: { background: '#f85888', text: LIGHT_TEXT },
  bug: { background: '#a8b820', text: LIGHT_TEXT },
  rock: { background: '#b8a038', text: LIGHT_TEXT },
  ghost: { background: '#705898', text: LIGHT_TEXT },
  dragon: { background: '#7038f8', text: LIGHT_TEXT },
  dark: { background: '#705848', text: LIGHT_TEXT },
  steel: { background: '#b8b8d0', text: DARK_TEXT },
  fairy: { background: '#ee99ac', text: DARK_TEXT },
};

const FALLBACK: TypeColor = { background: '#68a090', text: LIGHT_TEXT };

export function typeColor(type: string): TypeColor {
  return TYPE_COLORS[type] ?? FALLBACK;
}
