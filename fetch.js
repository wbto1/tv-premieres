const fs = require('fs');
const fetch = require('node-fetch');

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

  if (!fs.existsSync("raw")) {
    fs.mkdirSync("raw");
  }

  for (const ch of channels) {
    const url = `https://www.tvgids.nl/epg/channel/${ch}.json`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      fs.writeFileSync(
        `raw/${today}-${ch}.json`,
        JSON.stringify(data, null, 2)
      );

      console.log(`OK: ${ch}`);
    } catch (err) {
      console.log(`FOUT bij ${ch}: ${err.message}`);
    }
  }
}

run();
