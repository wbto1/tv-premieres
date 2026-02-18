const fs = require('fs');
const fetch = require('node-fetch');

const URL = 'https://api.tvmaze.com/schedule/full';
const today = new Date().toISOString().split('T')[0];

async function run() {
  const res = await fetch(URL);
  const schedule = await res.json();

  const premieres = schedule
    .filter(item =>
      item.airdate === today &&
      item.show &&
      (
        item.show.type === 'Scripted' ||     // series
        item.show.type === 'TV Movie'        // films
      )
    )
    .map(item => ({
      title: item.show.name,
      type: item.show.type === "TV Movie" ? "Film" : "Serie",
      channel: item.show.network?.name || 'Onbekend',
      premiered: item.show.premiered || null
    }));

  // --- LOGIC: DAGELIJKSE LOG BIJHOUDEN ---

  const log = JSON.parse(fs.readFileSync('log.json', 'utf8'));

  // Als er nog geen entry is voor vandaag → maak een lege array
  if (!log[today]) {
    log[today] = [];
  }

  // Als er GEEN premières zijn → log een tekstregel
  if (premieres.length === 0) {
    log[today].push("Geen premières vandaag");
  } else {
    // Als er WEL premières zijn → voeg ze toe aan de log
    log[today].push({
      tijdstip: new Date().toISOString(),
      aantal: premieres.length,
      premieres: premieres
    });
  }

  // Schrijf log terug naar bestand
  fs.writeFileSync('log.json', JSON.stringify(log, null, 2));
}

run();
