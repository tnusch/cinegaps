import type { CanonicalList } from "../../lib/types";

// Source: "1001 Movies You Must See Before You Die" (2021 edition)
// Edited by Steven Jay Schneider
const movies1001: CanonicalList = {
  id: "1001-movies",
  name: "1001 Movies You Must See Before You Die",
  shortName: "1001 Movies",
  description: "The canonical film book edited by Steven Jay Schneider (2021 edition)",
  films: [
    { title: "A Trip to the Moon", year: 1902, director: "Georges Méliès" },
    { title: "The Birth of a Nation", year: 1915, director: "D.W. Griffith" },
    { title: "Nosferatu", year: 1922, director: "F.W. Murnau" },
    { title: "The General", year: 1926, director: "Buster Keaton" },
    { title: "Metropolis", year: 1927, director: "Fritz Lang" },
    { title: "Sunrise: A Song of Two Humans", year: 1927, director: "F.W. Murnau" },
    { title: "The Passion of Joan of Arc", year: 1928, director: "Carl Theodor Dreyer" },
    { title: "Un Chien Andalou", year: 1929, director: "Luis Buñuel" },
    { title: "M", year: 1931, director: "Fritz Lang" },
    { title: "2001: A Space Odyssey", year: 1968, director: "Stanley Kubrick" },
    { title: "Frankenstein", year: 1931, director: "James Whale" },
    // TODO: add remaining ~991 entries
  ],
};

export default movies1001;
