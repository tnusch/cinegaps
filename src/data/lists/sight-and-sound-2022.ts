import type { CanonicalList } from "../../lib/types";

// Source: Sight & Sound Greatest Films Poll 2022 (Top 100)
// https://www.bfi.org.uk/sight-and-sound/greatest-films-all-time
const sightAndSound2022: CanonicalList = {
  id: "sight-and-sound-2022",
  name: "Sight & Sound Greatest Films 2022",
  shortName: "S&S 2022",
  description: "BFI Sight & Sound critics' poll — top 100 films of all time (2022 edition)",
  films: [
    { title: "Jeanne Dielman, 23 quai du Commerce, 1080 Bruxelles", year: 1975, director: "Chantal Akerman" },
    { title: "Vertigo", year: 1958, director: "Alfred Hitchcock" },
    { title: "Citizen Kane", year: 1941, director: "Orson Welles" },
    { title: "Tokyo Story", year: 1953, director: "Yasujirō Ozu" },
    { title: "In the Mood for Love", year: 2000, director: "Wong Kar-wai" },
    { title: "Metropolis", year: 1927, director: "Fritz Lang" },
    { title: "2001: A Space Odyssey", year: 1968, director: "Stanley Kubrick" },
    { title: "Beau Travail", year: 1999, director: "Claire Denis" },
    { title: "Mulholland Drive", year: 2001, director: "David Lynch" },
    { title: "Man with a Movie Camera", year: 1929, director: "Dziga Vertov" },
    { title: "Singin' in the Rain", year: 1952, director: "Stanley Donen" },
    // TODO: add remaining 90 entries
  ],
};

export default sightAndSound2022;
