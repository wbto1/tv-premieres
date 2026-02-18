const fs = require("fs");
const fetch = require("node-fetch");

const channels = [
  "vtm",
  "vtm2",
  "vtm3",
  "vtm4",
  "play4",
  "play5",
  "play6",
  "play7",
  "vrt1",
  "canvas",
  "ketnet"
];

async function run() {
  const today = new Date().toISOString().split("T")[0];
  const currentYear = new Date().getFullYear();

  if (!fs.existsSync("raw")) {
    fs.mkdirSync("raw");
  }

  let allPrograms = [];

  for (const ch of channels) {
    const url = `https://www.tvgids.nl/api/v1/programs?channels=${ch}&date=${today}`;

    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json"
        }
      });

      const data = await res.json();

      fs.writeFileSync(
        `raw/${today}-${ch}.json`,
        JSON.stringify(data, null, 2)
      );

      if (Array.isArray(data.programs)) {
        allPrograms.push(...data.programs);
      }

      console.log(`OK: ${ch}`);
    } catch (err) {
      console.log(`FOUT bij ${ch}: ${err.message}`);
    }
  }

  // FILTERS
  const badGenres = [
    "Soap",
    "Reality",
    "Talkshow",
    "Talk Show",
    "Nieuws",
    "News",
    "Game Show"
  ];

  const filtered = allPrograms
    .filter(p => {
      if (!p.title) return false;

      const genre = p.genre || "";
      const year = p.year ? parseInt(p.year) : null;
      const season = p.season ? parseInt(p.season) : null;

      // Blokkeer rommelgenres
      if (badGenres.some(g => genre.includes(g))) return false;

      // Series: alleen seizoen 1 en recent (laatste 2 jaar)
      const isSeries =
        p.type === "series" &&
        season === 1 &&
        year &&
        year >= currentYear - 2;

      // Films: alleen recent (laatste 3 jaar)
      const isFilm =
        p.type === "movie" &&
        year &&
        year >= currentYear - 3;

      return isSeries || isFilm;
    })
    .map(p => ({
      title: p.title,
      channel: p.channel,
      type: p.type,
      year: p.year,
      season: p.season || null,
      genre: p.genre || null,
      start: p.start,
      end: p.end
    }));

  // LOGGEN
  let log = {};
  try {
    log = JSON.parse(fs.readFileSync("log.json", "utf8"));
  } catch (e) {
    log = {};
  }

  if (!log[today]) log[today] = [];

  log[today].push({
    tijdstip: new Date().toISOString(),
    aantal: filtered.length,
    premieres: filtered
  });

  fs.writeFileSync("log.json", JSON.stringify(log, null, 2));
}

run();
