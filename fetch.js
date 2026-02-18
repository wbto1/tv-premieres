const fs = require('fs');
const fetch = require('node-fetch');

const URL = 'https://api.tvmaze.com/schedule/full';
const today = new Date().toISOString().split('T')[0];

async function run() {
  const res = await fetch(URL);
  const schedule = await res.json();

  // PREMIERES ZOEKEN
  const premieres = schedule
    .filter(item =>
      (
        item.airdate === today ||                 // aflevering die vandaag uitgezonden wordt
        item.show?.premiered === today            // serie/film die vandaag in première gaat
      ) &&
      (
        item.show?.type === 'Scripted' ||         // series
        item.show?.type === 'TV Movie'            // films
      )
    )
    .map(item => ({
      title: item.show.name,
      type: item.show.type === "TV Movie" ? "Film" : "Serie",
      channel: item.show.network?.name || 'Onbekend',
      premiered: item.show.premiered || null
    }));

  // LOG INLADEN
  const log = JSON.parse(fs.readFileSync('log.json', 'utf8'));

  // Als er nog geen entry is voor vandaag → maak een lege array
  if (!log[today]) {
    log[today] = [];
  }

  // LOGICA: altijd iets loggen
  if (premieres.length === 0) {
    // Geen premières → tekstregel toevoegen
    log[today].push("Geen premières vandaag");
  } else {
    // Wel premières → volledige info toevoegen
    log[today].push({
      tijdstip: new Date().toISOString(),
      aantal: premieres.length,
      premieres: premieres
    });
  }

  // LOG OPSLAAN
  fs.writeFileSync('log.json', JSON.stringify(log, null, 2));
}

run();
