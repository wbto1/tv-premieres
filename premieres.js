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

    const title = document.createElement('div');
    title.className = 'premiere-title';

    const badge = document.createElement('span');
    badge.className = 'badge ' + (p.type === 'Film' ? 'badge-film' : 'badge-serie');
    badge.textContent = p.type;

    const text = document.createElement('span');
    text.textContent = p.title;

    title.appendChild(badge);
    title.appendChild(text);

    const meta = document.createElement('div');
    meta.className = 'premiere-meta';
    meta.textContent = `Zender: ${p.channel}`;

    div.appendChild(title);
    div.appendChild(meta);

    container.appendChild(div);
  });
}

load();
