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

  const log = JSON.parse(fs.readFileSync('log.json', 'utf8'));
  log[today] = premieres;

  fs.writeFileSync('log.json', JSON.stringify(log, null, 2));
}

run();
