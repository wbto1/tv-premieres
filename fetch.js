const fs = require('fs');
const fetch = require('node-fetch');

const URL = 'https://api.tvmaze.com/schedule?country=BE';
const today = new Date().toISOString().split('T')[0];

async function run() {
  const res = await fetch(URL);
  const schedule = await res.json();

  const premieres = schedule
    .filter(item =>
      item.show &&
      item.show.type === 'Scripted' &&
      item.show.premiered === today
    )
    .map(item => ({
      title: item.show.name,
      channel: item.show.network?.name || 'Onbekend',
      from: item.show.webChannel?.name || 'Onbekend'
    }));

  const log = JSON.parse(fs.readFileSync('log.json', 'utf8'));
  log[today] = premieres;

  fs.writeFileSync('log.json', JSON.stringify(log, null, 2));
}

run();
