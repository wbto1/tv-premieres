const fs = require('fs');
const fetch = require('node-fetch');

const URL = 'https://api.tvmaze.com/schedule/full';
const today = new Date().toISOString().split('T')[0];
const currentYear = new Date().getFullYear();

async function run() {
  const res = await fetch(URL);
  const schedule = await res.json();

  // Genres die we absoluut NIET willen
  const badGenres = [
    'Soap',
    'Reality',
    'Talk Show',
    'Talkshow',
    'News',
    'Game Show'
  ];

  const premieres = schedule
    .filter(item => {
      if (!item.show) return false;

      const show = item.show;
      const premiered = show.premiered || null;
      const year = premiered ? parseInt(premiered.slice(0, 4), 10) : null;

      // Alleen titels die vandaag op Vlaamse tv komen
      const isToday =
        item.airdate === today ||
        show.premiered === today;

      if (!isToday) return false;

      // Rommelgenres blokkeren
      const hasBadGenre = Array.isArray(show.genres)
        ? show.genres.some(g => badGenres.includes(g))
        : false;

      if (hasBadGenre) return false;

      // SERIES: alleen seizoen 1 + recent (laatste 2 jaar)
      const isRecentSeries =
        show.type === 'Scripted' &&
        item.season === 1 &&
        year &&
        year >= currentYear - 2;

      // FILMS: alleen recent (laatste 3 jaar)
      const isRecentFilm =
        show.type === 'TV Movie' &&
        year &&
        year >= currentYear - 3;

      return isRecentSeries || isRecentFilm;
    })
    .map(item => {
      const show = item.show;
      const premiered = show.premiered || null;
      const year = premiered ? parseInt(premiered.slice(0, 4), 10) : null;

      return {
        title: show.name,
        type: show.type === 'TV Movie' ? 'Film' : 'Serie',
        channel: show.network?.name || 'Onbekend',
        premiered: premiered,
        year: year,
        season: item.season || null,
        genres: show.genres || []
      };
    });

  // LOG INLADEN
  let log = {};
  try {
    log = JSON.parse(fs.readFileSync('log.json', 'utf8'));
  } catch (e) {
    log = {};
  }

  if (!log[today]) {
    log[today] = [];
  }

  if (premieres.length === 0) {
    log[today].push("Geen premières vandaag");
  } else {
    log[today].push({
      tijdstip: new Date().toISOString(),
      aantal: premieres.length,
      premieres: premieres
    });
  }

  fs.writeFileSync('log.json', JSON.stringify(log, null, 2));
}

run();
