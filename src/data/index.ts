import type { CanonicalList } from "../lib/types";

// Critics' Consensus
import sightAndSound2022 from "./lists/sight-and-sound-2022";
import tspdt1000 from "./lists/tspdt-1000";
import rogerEbert from "./lists/roger-ebert";

// Fan Favorites
import letterboxdOfficial500 from "./lists/letterboxd-official-500";
import letterboxdMostFans100 from "./lists/letterboxd-most-fans-100";
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
  letterboxdOfficial500,
  letterboxdMostFans100,
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
  letterboxdOfficial500,
  letterboxdMostFans100,
  imdbTop250,
  oscarBestPicture,
  cannesPalmeDor,
  movies1001,
};
