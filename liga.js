/* ============================================================
   LIGA FOOTVOLLEY ESPAÑA — biblioteca compartilhada (liga.js)
   Usada por index.html e pelas páginas de etapa.
   ============================================================ */

/* ---------- Cores por clube (identidade visual) ---------- */
const CLUB_COLORS = {
    'BCN Footvolley':  '#e24b4a',
    'CD Serfay':       '#2a9d8f',
    'FTV Alicante':    '#f4a01b',
    'AFB':             '#9b5de5',
    'Valencia':        '#ff8c42',
    'Donosti':         '#4cc9f0',
    'AD Ibiza':        '#06d6a0',
    'Vigo':            '#118ab2',
    'Madrid FTV Club': '#c1121f',
    'Praia-Arit':      '#80b918',
    'Los Cristianos':  '#e07a5f'
};
function clubColor(name) { return CLUB_COLORS[name] || '#8a98a8'; }
function clubDot(name) {
    if (!name) return '<span class="club-cell">-</span>';
    return `<span class="club-cell"><span class="club-dot" style="background:${clubColor(name)}"></span>${name}</span>`;
}

/* ---------- util ---------- */
function idxOf(arr, val) { let i = arr.indexOf(val); if (i === -1) { arr.push(val); i = arr.length - 1; } return i; }
function splitLine(line) {
    const out = []; let cur = '', q = false;
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') q = !q;
        else if (c === ',' && !q) { out.push(cur); cur = ''; }
        else cur += c;
    }
    out.push(cur);
    return out.map(s => s.trim());
}

/* ---------- classificação de grupo ----------
   Desempate: 1) victorias · 2) confronto directo · 3) coeficiente · 4) puntos a favor */
function calcStandings(grupo) {
    const n = grupo.equipes.length;
    const stats = grupo.equipes.map((e, i) => ({ idx: i, nome: e, v: 0, p_plus: 0, p_minus: 0 }));
    // resultado de cada confronto: h2h[a][b] = vencedor (a|b) ou null
    const h2h = Array.from({ length: n }, () => Array(n).fill(null));

    grupo.partidas.forEach(p => {
        if (p.p_local !== null && p.p_visit !== null) {
            stats[p.local].p_plus += p.p_local; stats[p.local].p_minus += p.p_visit;
            stats[p.visit].p_plus += p.p_visit; stats[p.visit].p_minus += p.p_local;
            if (p.p_local > p.p_visit)      { stats[p.local].v++; h2h[p.local][p.visit] = p.local; h2h[p.visit][p.local] = p.local; }
            else if (p.p_visit > p.p_local) { stats[p.visit].v++; h2h[p.local][p.visit] = p.visit; h2h[p.visit][p.local] = p.visit; }
        }
    });

    return stats.sort((a, b) => {
        if (b.v !== a.v) return b.v - a.v;                       // 1) victorias
        const w = h2h[a.idx][b.idx];                             // 2) confronto directo (só entre 2)
        if (w === a.idx) return -1;
        if (w === b.idx) return 1;
        const ca = a.p_plus - a.p_minus, cb = b.p_plus - b.p_minus;
        if (cb !== ca) return cb - ca;                           // 3) coeficiente
        return b.p_plus - a.p_plus;                              // 4) puntos a favor
    });
}

/* ---------- render de um grupo (classificação em cima, jogos embaixo) ---------- */
function renderGrupo(g, cat) {
    const standings = calcStandings(g);
    const rows = standings.map((s, i) => {
        const coef = s.p_plus - s.p_minus;
        let rc = ''; if (i === 0) rc = 'r1'; else if (i === 1) rc = 'r2'; else if (i === 2) rc = 'r3';
        let q = '<span class="qdot n"></span>';
        if (cat === 'oro')        { if (i < 2) q = '<span class="qdot q" title="Clasifica a cuartos"></span>'; else if (i === 2) q = '<span class="qdot q3" title="Va al triangular"></span>'; }
        else if (cat === 'plata') { if (i === 0) q = '<span class="qdot q" title="Clasifica directo"></span>'; else if (i === 1 || i === 2) q = '<span class="qdot q3" title="Juega octavos"></span>'; }
        else if (cat === 'bronce'){ if (i < 2) q = '<span class="qdot q" title="Clasifica a octavos"></span>'; else if (i === 2) q = '<span class="qdot q3" title="Posible mejor tercero"></span>'; }
        return `<tr>
            <td><span class="team-rank ${rc}">${i+1}</span>${s.nome}${q}</td>
            <td>${s.v}</td><td>${s.p_plus}</td><td>${s.p_minus}</td>
            <td>${coef >= 0 ? '+' : ''}${coef}</td>
        </tr>`;
    }).join('');

    const matches = g.partidas.map(p => {
        const has = p.p_local !== null && p.p_visit !== null;
        const lw = has && p.p_local > p.p_visit, vw = has && p.p_visit > p.p_local;
        return `<div class="match">
            <span class="nm">${g.equipes[p.local]}</span>
            <span class="x">×</span>
            <span class="nm right">${g.equipes[p.visit]}</span>
            <div class="score">
                <div class="b ${lw ? 'win' : ''}">${p.p_local !== null ? p.p_local : '–'}</div>
                <div class="b ${vw ? 'win' : ''}">${p.p_visit !== null ? p.p_visit : '–'}</div>
            </div>
        </div>`;
    }).join('');

    return `<div class="group-card">
        <div class="group-head">${g.nome}</div>
        <div class="group-body">
            <div class="sub-label">Clasificación</div>
            <table class="standings">
                <thead><tr><th>Pareja</th><th>V</th><th>P+</th><th>P−</th><th>Coef</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
            <div class="sub-label" style="margin-top:14px;">Partidas</div>
            ${matches}
        </div>
    </div>`;
}

/* ---------- detecta rótulos de "cruce" pré-sorteio (não mostrar) ---------- */
function isPlaceholderTeam(name) {
    if (!name) return true;
    const s = String(name).trim();
    if (!s || s === '-' || s === '–') return true;
    const low = s.toLowerCase();
    if (/^(por definir|tbd|a definir|pendiente|sorteo)$/.test(low)) return true;
    // ex.: "1º A", "2A", "3 C", "1°B"
    if (/^[123][º°o]?\s*[-/]?\s*[a-d]$/i.test(s)) return true;
    // ex.: "1º Grupo A", "primero grupo b", "segundo a"
    if (/grupo|primero|segundo|tercero/.test(low)) return true;
    // ex.: "Ganador QF1", "Vencedor C1", "Perdedor SF2", "W1", "G2"
    if (/ganador|vencedor|perdedor|ganad|vence|^[wgl]\s?\d|^qf\d|^sf\d/i.test(low)) return true;
    return false;
}

/* ---------- bracket: uma chave (partida) ---------- */
function tieHtml(m, opts = {}) {
    const rawA = m && m.a, rawB = m && m.b;
    const aTbd = isPlaceholderTeam(rawA), bTbd = isPlaceholderTeam(rawB);
    const a = aTbd ? 'Por definir' : rawA;
    const b = bTbd ? 'Por definir' : rawB;
    // só consideramos resultado se ambos os times forem reais
    const has = !aTbd && !bTbd && m && m.p_a != null && m.p_b != null;
    const aw = has && m.p_a > m.p_b, bw = has && m.p_b > m.p_a;
    const cls = ['tie']; if (opts.final) cls.push('final'); if (opts.bronze) cls.push('bronze-tie');
    return `<div class="${cls.join(' ')}">
        <div class="tie-label">${opts.label || (m && m.label) || ''}</div>
        <div class="tie-row ${aw ? 'win' : ''} ${aTbd ? 'tbd' : ''}">
            <span class="t">${a}</span><span class="s">${has && m.p_a != null ? m.p_a : ''}</span>
        </div>
        <div class="tie-row ${bw ? 'win' : ''} ${bTbd ? 'tbd' : ''}">
            <span class="t">${b}</span><span class="s">${has && m.p_b != null ? m.p_b : ''}</span>
        </div>
    </div>`;
}

/* ---------- triangular (3 terceros - oro) ---------- */
function triangularHtml(tri) {
    if (!tri || !tri.partidas || !tri.partidas.length) {
        return `<div class="group-card" style="max-width:340px;">
            <div class="group-head">Triangular · 3os</div>
            <div class="group-body"><div class="empty-note" style="padding:18px;font-size:13px;">Se define tras la fase de grupos.<br>Clasifican 2 parejas a cuartos.</div></div>
        </div>`;
    }
    const eq = tri.equipes;
    const matches = tri.partidas.map(p => {
        const has = p.p_local !== null && p.p_visit !== null;
        const lw = has && p.p_local > p.p_visit, vw = has && p.p_visit > p.p_local;
        return `<div class="match">
            <span class="nm">${eq[p.local]}</span><span class="x">×</span>
            <span class="nm right">${eq[p.visit]}</span>
            <div class="score">
                <div class="b ${lw ? 'win' : ''}">${p.p_local != null ? p.p_local : '–'}</div>
                <div class="b ${vw ? 'win' : ''}">${p.p_visit != null ? p.p_visit : '–'}</div>
            </div></div>`;
    }).join('');
    return `<div class="group-card" style="max-width:340px;">
        <div class="group-head">Triangular · 3os clasificados</div>
        <div class="group-body">
            <div class="sub-label">Partidas</div>${matches}
            <div class="format-note" style="margin-top:10px;margin-bottom:0;">Clasifican las <b>2 mejores</b> parejas a cuartos.</div>
        </div></div>`;
}

/* ---------- skeleton helpers ---------- */
function emptyRound(n) { return Array.from({ length: n }, () => null); }
function padRound(arr, n) {
    const out = (arr || []).slice(0, n);
    while (out.length < n) out.push(null);
    return out;
}

/* ---------- fase previa (triangular no Oro, octavos no Plata/Bronce) ---------- */
function preRoundBlock(po, cat) {
    if (cat === 'oro') {
        return `<div class="pre-round">
            <div class="sub-label">Fase previa · Triangular de 3os</div>
            ${triangularHtml(po && po.triangular)}
        </div>`;
    }
    const oct = (po && po.octavos && po.octavos.length) ? po.octavos : emptyRound(cat === 'bronce' ? 8 : 6);
    const cards = oct.map((m, i) => `<div style="flex:1 1 215px; min-width:200px;">${tieHtml(m, { label: 'Octavos ' + (i+1) })}</div>`).join('');
    return `<div class="pre-round">
        <div class="sub-label">Fase previa · Octavos</div>
        <div style="display:flex; gap:12px; flex-wrap:wrap;">${cards}</div>
    </div>`;
}

/* ---------- render do bracket completo (árvore conectada Cuartos→Semis→Final) ---------- */
function renderBracket(po, cat) {
    po = po || {};
    const cuartos = padRound(po.cuartos, 4);
    const semis   = padRound(po.semifinais, 2);

    const colCuartos = `<div class="bk-col matches">
        <div class="bk-round-title">Cuartos</div>
        ${cuartos.map((m, i) => `<div class="bk-cell">${tieHtml(m, { label: 'Cuartos ' + (i+1) })}</div>`).join('')}
    </div>`;
    const lines1 = `<div class="bk-col lines"><div class="bk-round-title"></div><div class="bk-merge"></div><div class="bk-merge"></div></div>`;
    const colSemis = `<div class="bk-col matches">
        <div class="bk-round-title">Semifinales</div>
        ${semis.map((m, i) => `<div class="bk-cell">${tieHtml(m, { label: 'Semifinal ' + (i+1) })}</div>`).join('')}
    </div>`;
    const lines2 = `<div class="bk-col lines"><div class="bk-round-title"></div><div class="bk-merge"></div></div>`;
    const colFinal = `<div class="bk-col matches last">
        <div class="bk-round-title">Final</div>
        <div class="bk-cell">${tieHtml(po.final, { label: 'Final', final: true })}</div>
    </div>`;

    const tree = `<div class="bk">${colCuartos}${lines1}${colSemis}${lines2}${colFinal}</div>`;
    const third = `<div class="sub-label" style="margin-top:14px;">3º y 4º puesto</div>
        <div class="third-box">${tieHtml(po.tercer, { label: '3º y 4º puesto', bronze: true })}</div>`;

    return preRoundBlock(po, cat) + tree + third;
}

/* ---------- pódio (quando a final tem resultado) ---------- */
function renderPodium(po) {
    if (!po || !po.final || po.final.p_a == null || po.final.p_b == null) return '';
    const f = po.final;
    const champ = f.p_a > f.p_b ? f.a : f.b;
    const runner = f.p_a > f.p_b ? f.b : f.a;
    let third = '';
    if (po.tercer && po.tercer.p_a != null && po.tercer.p_b != null) {
        third = po.tercer.p_a > po.tercer.p_b ? po.tercer.a : po.tercer.b;
    }
    return `<div class="podium-wrap">
        <div class="section-title">Pódio</div>
        <div class="podium">
            <div class="pod silver"><div class="place">2º</div><div class="team">${runner}</div></div>
            <div class="pod gold"><div class="medal">🏆</div><div class="place">Campeón</div><div class="team">${champ}</div></div>
            <div class="pod bronze"><div class="place">3º</div><div class="team">${third || '—'}</div></div>
        </div>
    </div>`;
}

/* ---------- parser de GRUPOS (grupo, local, visitante, pontos_local, pontos_visit) ---------- */
function parseGruposCSV(text) {
    const rows = text.trim().split('\n').map(splitLine);
    const h = rows[0].map(x => x.toLowerCase());
    const c = n => h.indexOf(n);
    const iG = c('grupo'), iL = c('local'), iV = c('visitante'), iPL = c('pontos_local'), iPV = c('pontos_visit');
    const get = (r, i) => (i >= 0 && r[i] != null ? r[i].trim() : '');
    const num = v => (v !== '' && !isNaN(parseInt(v))) ? parseInt(v) : null;
    const grupos = {};
    for (let i = 1; i < rows.length; i++) {
        const r = rows[i], grupo = get(r, iG), local = get(r, iL), visit = get(r, iV);
        if (!grupo || !local) continue;
        if (!grupos[grupo]) grupos[grupo] = { nome: grupo, partidas: [], equipes: [] };
        const g = grupos[grupo];
        g.partidas.push({ local: idxOf(g.equipes, local), visit: idxOf(g.equipes, visit), p_local: num(get(r, iPL)), p_visit: num(get(r, iPV)) });
    }
    return { grupos: Object.values(grupos) };
}

/* ---------- parser de PLAYOFFS (fase, local, visitante, pontos_local, pontos_visit)
   Aceita duas convenções de 'fase':
   - palavra-chave: Triangular / Octavos / Cuartos / Semifinal / Tercer / Final
   - código:        QF1..QF4 / SF1..SF2 / OF1..OF8 / 3lugar / Final          ---------- */
function parsePlayoffsCSV(text) {
    const rows = text.trim().split('\n').map(splitLine);
    if (rows.length < 2) return null;
    const h = rows[0].map(x => x.toLowerCase());
    const c = n => h.indexOf(n);
    const iF = c('fase'), iL = c('local'), iV = c('visitante'), iPL = c('pontos_local'), iPV = c('pontos_visit');
    const get = (r, i) => (i >= 0 && r[i] != null ? r[i].trim() : '');
    const num = v => (v !== '' && !isNaN(parseInt(v))) ? parseInt(v) : null;

    const po = { triangular: null, octavos: [], cuartos: [], semifinais: [], tercer: null, final: null };
    const triEq = [], triP = [];
    const nC = { o: 0, c: 0, s: 0 };

    for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        const fase = get(r, iF).toLowerCase(), local = get(r, iL), visit = get(r, iV);
        if (!fase || !local) continue;
        const pl = num(get(r, iPL)), pv = num(get(r, iPV));

        if (fase.includes('triang')) { triP.push({ local: idxOf(triEq, local), visit: idxOf(triEq, visit), p_local: pl, p_visit: pv }); continue; }
        const m = { a: local, b: visit, p_a: pl, p_b: pv };
        if (fase.includes('octav') || /^of\d/.test(fase))      { m.label = 'Octavos ' + (++nC.o); po.octavos.push(m); }
        else if (fase.includes('cuart') || /^qf\d/.test(fase)) { m.label = 'Cuartos ' + (++nC.c); po.cuartos.push(m); }
        else if (fase.includes('semi')  || /^sf\d/.test(fase)) { m.label = 'Semifinal ' + (++nC.s); po.semifinais.push(m); }
        else if (fase.includes('tercer') || fase.includes('3lugar') || fase === '3º' || fase === '3o' || fase.includes('bronce')) { m.label = '3º y 4º puesto'; po.tercer = m; }
        else if (fase.includes('final')) { m.label = 'Final'; po.final = m; }
    }
    if (triP.length) po.triangular = { equipes: triEq, partidas: triP };
    const hasAny = po.triangular || po.octavos.length || po.cuartos.length || po.semifinais.length || po.tercer || po.final;
    return hasAny ? po : null;
}

/* ---------- status da etapa (ao vivo / finalizada / próxima) ---------- */
function computeStatus(etapaData) {
    let anyResult = false, anyPending = false, finalDone = false;
    Object.values(etapaData || {}).forEach(d => {
        (d.grupos || []).forEach(g => g.partidas.forEach(p => {
            if (p.p_local != null && p.p_visit != null) anyResult = true; else anyPending = true;
        }));
        const f = d.playoffs && d.playoffs.final;
        if (f && f.p_a != null && f.p_b != null) finalDone = true;
    });
    if (finalDone) return { cls: 'done', text: 'Etapa finalizada' };
    if (anyResult)  return { cls: 'live', text: 'EN VIVO', dot: true };
    return { cls: 'soon', text: 'Próximamente' };
}
