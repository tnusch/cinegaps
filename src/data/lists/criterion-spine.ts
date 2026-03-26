import type { CanonicalList } from "../../lib/types";

// Source: Criterion Collection spine numbers #1–1100+ (active releases only)
// https://www.criterion.com/shop/browse/list?q=+&t=spine_number
const criterionSpine: CanonicalList = {
  id: "criterion-spine",
  name: "Criterion Collection",
  shortName: "Criterion",
  description: "Films with an active Criterion Collection spine number",
  films: [
    { title: "Grand Illusion", year: 1937, director: "Jean Renoir" },
    { title: "The Rules of the Game", year: 1939, director: "Jean Renoir" },
    { title: "Rashomon", year: 1950, director: "Akira Kurosawa" },
    { title: "Seven Samurai", year: 1954, director: "Akira Kurosawa" },
    { title: "The 400 Blows", year: 1959, director: "François Truffaut" },
    { title: "L'Avventura", year: 1960, director: "Michelangelo Antonioni" },
    { title: "8½", year: 1963, director: "Federico Fellini" },
    { title: "Nights of Cabiria", year: 1957, director: "Federico Fellini" },
    { title: "Breathless", year: 1960, director: "Jean-Luc Godard" },
    { title: "The Seventh Seal", year: 1957, director: "Ingmar Bergman" },
    // TODO: add remaining ~1000+ entries
  ],
};

export default criterionSpine;
