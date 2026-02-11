async function loadLog() {
  const res = await fetch('log.json');
  const data = await res.json();

  const container = document.getElementById('log');
  container.innerHTML = '';

  const dates = Object.keys(data).sort().reverse();

  dates.forEach(date => {
    const block = document.createElement('div');
    block.className = 'date-block';

    const title = document.createElement('h2');
    title.textContent = date;
    block.appendChild(title);

    if (data[date].length === 0) {
      block.innerHTML += '<p>Geen premières vandaag.</p>';
    } else {
      data[date].forEach(item => {
        const div = document.createElement('div');
        div.className = 'series-item';
        div.textContent = `• ${item.title} (${item.from} → ${item.channel})`;
        block.appendChild(div);
      });
    }

    container.appendChild(block);
  });
}

loadLog();
