async function load() {
  const res = await fetch('log.json');
  const log = await res.json();

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').textContent = today;

  const premieres = log[today] || [];

  const container = document.getElementById('premieres');

  if (premieres.length === 0) {
    container.textContent = "Geen premières vandaag.";
    return;
  }

  premieres.forEach(p => {
    const div = document.createElement('div');
    div.className = 'premiere';
    div.textContent = `${p.title} — ${p.type} (${p.channel})`;
    container.appendChild(div);
  });
}

load();
