import type { CanonicalList } from "../lib/types";

// Critics' Consensus
import sightAndSound2022 from "./lists/sight-and-sound-2022";
import tspdt1000 from "./lists/tspdt-1000";
import rogerEbert from "./lists/roger-ebert";

// Fan Favorites
import letterboxdOfficial250 from "./lists/letterboxd-official-250";
import letterboxdMostFans250 from "./lists/letterboxd-most-fans-250";
import imdbTop250 from "./lists/imdb-top250";

// Award Winners
import oscarBestPicture from "./lists/oscar-best-picture";
import cannesPalmeDor from "./lists/cannes-palme-dor";
import movies1001 from "./lists/1001-movies";

export const ALL_LISTS: CanonicalList[] = [
  // Critics' Consensus
  sightAndSound2022,
  tspdt1000,
  rogerEbert,
  // Fan Favorites
  letterboxdOfficial250,
  letterboxdMostFans250,
  imdbTop250,
  // Award Winners
  oscarBestPicture,
  cannesPalmeDor,
  movies1001,
];

export {
  sightAndSound2022,
  tspdt1000,
  rogerEbert,
  letterboxdOfficial250,
  letterboxdMostFans250,
  imdbTop250,
  oscarBestPicture,
  cannesPalmeDor,
  movies1001,
};
