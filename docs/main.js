/* =========================================================
   main.js — HQ Brief (UN Women | Bleu ONU + Orange)
   - Data: assets/data/kpi.json, charts.json, geo.json, content.json
   - UI: résumé + sections repliables (Détails)
   - Actions: tout déplier / tout replier
   - Couleurs: utilise --uw-blue et --uw-orange du CSS fourni
   - Pas de libellés techniques côté interface (messages sobres)
   ========================================================= */

async function loadJSON(path, { optional = false } = {}) {
  const r = await fetch(path, { cache: "no-store" });
  if (!r.ok) {
    if (optional) return null;
    throw new Error(`Impossible de charger ${path} (${r.status})`);
  }
  return r.json();
}

function $(id) { return document.getElementById(id); }
function clear(id) { const n = $(id); if (!n) return null; n.innerHTML = ""; return n; }
function setText(id, text) { const n = $(id); if (n) n.textContent = (text ?? "").toString(); }

function sum(arr) { return (arr || []).reduce((a, v) => a + (Number(v) || 0), 0); }
function pct(v, total) { const t = Number(total) || 0; const x = Number(v) || 0; return t ? `${Math.round((x / t) * 100)}%` : "0%"; }

function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/* ---------- Renderers ---------- */
function renderList(id, items) {
  const ul = clear(id);
  if (!ul) return;
  (items || []).forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    ul.appendChild(li);
  });
}

function renderKPIs(kpi) {
  const wrap = clear("kpiGrid");
  if (!wrap) return;
  (kpi?.kpis || []).forEach(k => {
    const card = document.createElement("div");
    card.className = "kpiCard";
    card.innerHTML = `
      <div class="kpiLabel">${k.label ?? ""}</div>
      <div class="kpiValue">${k.value ?? ""}</div>
      <div class="kpiHint">${k.hint ?? ""}</div>
    `;
    wrap.appendChild(card);
  });
}

function renderMicroKpis(items) {
  const wrap = clear("microKpis");
  if (!wrap) return;
  (items || []).slice(0, 3).forEach(x => {
    const box = document.createElement("div");
    box.className = "microKpi";
    box.innerHTML = `<div class="microKpi__k">${x.k ?? ""}</div><div class="microKpi__v">${x.v ?? ""}</div>`;
    wrap.appendChild(box);
  });
}

function renderSignals(items) {
  const wrap = clear("heroSignals");
  if (!wrap) return;
  (items || []).slice(0, 3).forEach(x => {
    const c = document.createElement("div");
    c.className = "signalCard";
    c.innerHTML = `<p class="signalCard__t">${x.title ?? ""}</p><p class="signalCard__d">${x.text ?? ""}</p>`;
    wrap.appendChild(c);
  });
}

function renderKeyMessages(items) {
  const wrap = clear("keyMessages");
  if (!wrap) return;
  (items || []).slice(0, 3).forEach(m => {
    const c = document.createElement("div");
    c.className = "msg";
    c.innerHTML = `<p class="msg__t">${m.title ?? ""}</p><p class="msg__d">${m.text ?? ""}</p>`;
    wrap.appendChild(c);
  });
}

function renderRiskMatrix(risks) {
  const wrap = clear("riskMatrix");
  if (!wrap) return;
  (risks || []).forEach(r => {
    const tags = (r.tags || []).map(t => `<span class="tag">${t}</span>`).join("");
    const cell = document.createElement("div");
    cell.className = "riskCell";
    cell.innerHTML = `
      <div class="riskCell__title">${r.title ?? ""}</div>
      <div class="riskCell__text">${r.text ?? ""}</div>
      <div class="riskCell__tagRow">${tags}</div>
    `;
    wrap.appendChild(cell);
  });
}

function renderAssumptions(assumptions) {
  const wrap = clear("assumptionsGrid");
  if (!wrap) return;
  (assumptions || []).forEach(a => {
    const box = document.createElement("div");
    box.className = "assumption";
    box.innerHTML = `
      <div class="assumption__t">${a.title ?? ""}</div>
      <div class="assumption__d">${a.description ?? ""}</div>
      <div class="assumption__a"><b>Application AOC :</b> ${a.application ?? ""}</div>
    `;
    wrap.appendChild(box);
  });
}

function renderStaff(rows) {
  const wrap = clear("staffTable");
  if (!wrap) return;
  (rows || []).slice(0, 4).forEach(r => {
    const row = document.createElement("div");
    row.className = "staffRow";
    const status = (r.status || "").toLowerCase();
    const label = status === "ok" ? "OK" : (status.includes("conf") ? "À confirmer" : (r.status || "—"));
    row.innerHTML = `
      <div class="staffRow__head">
        <div class="staffRow__title">${r.title ?? ""}</div>
        <div class="staffRow__status">${label}</div>
      </div>
      <div class="staffRow__body">${r.body ?? ""}</div>
    `;
    wrap.appendChild(row);
  });
}

function renderTimeline(years) {
  const wrap = clear("timeline");
  if (!wrap) return;
  (years || []).forEach(y => {
    const card = document.createElement("div");
    card.className = "year";
    card.innerHTML = `<div class="year__t">${y.year ?? ""}</div><div class="year__d">${y.text ?? ""}</div>`;
    wrap.appendChild(card);
  });
}

function renderDonorCards(cards) {
  const wrap = clear("donorCards");
  if (!wrap) return;
  (cards || []).forEach(c => {
    const d = document.createElement("div");
    d.className = "donorCard";
    d.innerHTML = `
      <div class="donorCard__k">${c.k ?? ""}</div>
      <div class="donorCard__v">${c.v ?? ""}</div>
      <div class="donorCard__h">${c.h ?? ""}</div>
    `;
    wrap.appendChild(d);
  });
}

function renderIntelDock(items) {
  const wrap = clear("intelDock");
  if (!wrap) return;
  (items || []).slice(0, 5).forEach((i, idx) => {
    const pill = document.createElement("div");
    pill.className = "pill " + (idx % 2 === 0 ? "pill--blue" : "pill--orange");
    pill.innerHTML = `<span>${i.k ?? ""}</span> <b>${i.v ?? ""}</b>`;
    wrap.appendChild(pill);
  });
}

function renderIllustrationFrame(targetId, src, captionTargetId, captionText) {
  const frame = $(targetId);
  if (!frame) return;

  frame.innerHTML = "";
  if (src) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = captionText || "Illustration";
    img.loading = "lazy";
    img.onerror = () => { frame.textContent = "Illustration (à remplacer)"; };
    frame.appendChild(img);
  } else {
    frame.textContent = "Illustration (à remplacer)";
  }
  if (captionTargetId) setText(captionTargetId, captionText || "");
}

function renderIllustrationStack(targetId, items) {
  const wrap = clear(targetId);
  if (!wrap) return;
  (items || []).slice(0, 3).forEach(it => {
    const card = document.createElement("div");
    card.className = "illustrationCard";
    card.innerHTML = `
      <div class="illustrationCard__frame">Illustration (à remplacer)</div>
      <div class="illustrationCard__cap">${it.caption ?? ""}</div>
    `;
    wrap.appendChild(card);

    if (it.src) {
      const frame = card.querySelector(".illustrationCard__frame");
      frame.innerHTML = "";
      const img = document.createElement("img");
      img.src = it.src;
      img.alt = it.caption || "Illustration";
      img.loading = "lazy";
      img.onerror = () => { frame.textContent = "Illustration (à remplacer)"; };
      frame.appendChild(img);
    }
  });
}

/* ---------- Charts (bleu / orange + %) ---------- */
function hasCharts() { return typeof Chart !== "undefined"; }

function makeDonut(canvasId, donut) {
  if (!hasCharts()) return null;
  const c = $(canvasId); if (!c) return null;

  const blue = cssVar("--uw-blue", "#448BCA");
  const orange = cssVar("--uw-orange", "#f58220");
  const total = sum(donut?.values);
  const hasDL = !!window.ChartDataLabels;

  return new Chart(c, {
    type: "doughnut",
    data: {
      labels: donut?.labels || [],
      datasets: [{
        data: donut?.values || [],
        backgroundColor: [blue, orange],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      cutout: "62%",
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = ctx.raw ?? 0;
              return ` ${ctx.label}: ${v} (${pct(v, total)})`;
            }
          }
        },
        datalabels: hasDL ? {
          color: "#fff",
          font: { weight: "900" },
          formatter: (v) => pct(v, total)
        } : undefined
      }
    },
    plugins: hasDL ? [window.ChartDataLabels] : []
  });
}

function makeBars(canvasId, bars) {
  if (!hasCharts()) return null;
  const c = $(canvasId); if (!c) return null;

  const blue = cssVar("--uw-blue", "#448BCA");
  const total = sum(bars?.values);
  const hasDL = !!window.ChartDataLabels;

  return new Chart(c, {
    type: "bar",
    data: {
      labels: bars?.labels || [],
      datasets: [{
        data: bars?.values || [],
        backgroundColor: blue,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      indexAxis: "y",
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = ctx.raw ?? 0;
              return ` ${v} (${pct(v, total)})`;
            }
          }
        },
        datalabels: hasDL ? {
          anchor: "end",
          align: "right",
          color: "rgba(11,18,32,.85)",
          font: { weight: "900" },
          formatter: (v) => pct(v, total)
        } : undefined
      },
      scales: {
        x: { beginAtZero: true },
        y: { grid: { display: false } }
      }
    },
    plugins: hasDL ? [window.ChartDataLabels] : []
  });
}

function makeTrend(canvasId, trend) {
  if (!hasCharts()) return null;
  const c = $(canvasId); if (!c) return null;

  const orange = cssVar("--uw-orange", "#f58220");

  return new Chart(c, {
    type: "line",
    data: {
      labels: trend?.labels || [],
      datasets: [{
        label: trend?.label || "",
        data: trend?.values || [],
        tension: 0.35,
        fill: true,
        backgroundColor: "rgba(245,130,32,.14)",
        borderColor: orange,
        pointRadius: 2.5,
        pointHoverRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

/* ---------- Map ---------- */
function hasLeaflet() { return typeof L !== "undefined"; }

function initMap(geo) {
  const mapEl = $("map");
  if (!mapEl) return;

  if (!hasLeaflet()) {
    mapEl.innerHTML = `<div class="mapFallback">Carte indisponible</div>`;
    return;
  }

  const map = L.map("map", { scrollWheelZoom: false }).setView([7, 2], 4);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  const markers = [];
  (geo?.features || []).forEach(f => {
    const p = f.properties || {};
    const g = f.geometry || {};
    if (g.type !== "Point" || !g.coordinates) return;

    const [lng, lat] = g.coordinates;
    const popup = `
      <b>${p.name || "Zone"}</b><br/>
      <b>Contexte :</b> ${p.crisis || "—"}<br/>
      <b>Priorité :</b> ${p.focus || "—"}<br/>
      <b>Signal :</b> ${p.signal || "—"}
    `;

    const m = L.circleMarker([lat, lng], {
      radius: 7,
      weight: 2,
      color: cssVar("--uw-blue", "#448BCA"),
      fillColor: cssVar("--uw-orange", "#f58220"),
      fillOpacity: 0.25
    }).addTo(map).bindPopup(popup);

    markers.push(m);
  });

  if (markers.length) {
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds(), { padding: [16, 16] });
  }
}

function renderHotspotChips(geo) {
  const wrap = clear("hotspotChips");
  if (!wrap) return;
  (geo?.features || []).forEach(f => {
    const p = f.properties || {};
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = `${p.name || "Zone"} • ${p.focus || "Focus"}`;
    wrap.appendChild(chip);
  });
}

/* ---------- Details buttons ---------- */
function initDetailsButtons() {
  const openBtn = document.querySelector('[data-open="allDetails"]');
  const closeBtn = document.querySelector('[data-close="allDetails"]');
  const all = () => Array.from(document.querySelectorAll("details.detailBlock"));

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      all().forEach(d => d.open = true);
      window.location.hash = "#snapshot";
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      all().forEach(d => d.open = false);
    });
  }
}

/* ---------- Main ---------- */
(async function main() {
  try {
    const DIR = "assets/data";
    const [kpi, charts, geo, content] = await Promise.all([
      loadJSON(`${DIR}/kpi.json`, { optional: true }),
      loadJSON(`${DIR}/charts.json`, { optional: true }),
      loadJSON(`${DIR}/geo.json`, { optional: true }),
      loadJSON(`${DIR}/content.json`)
    ]);

    // HERO
    setText("heroLead", content?.hero_lead || "");
    renderSignals(content?.hero_signals || []);
    renderMicroKpis(content?.micro_kpis || []);
    renderIllustrationFrame("heroIllustration", content?.hero_illustration?.src || "", "heroIllustrationCap", content?.hero_illustration?.caption || "");

    // SNAPSHOT
    if (kpi) renderKPIs(kpi);
    renderKeyMessages(content?.key_messages || []);
    setText("snapshotDetails", content?.snapshot_details || "");
    renderIllustrationStack("snapshotIllustrations", content?.snapshot_illustrations || []);

    // CONTEXT
    renderList("contextSummary", content?.context_summary || []);
    setText("westAfricaText", content?.west_africa_text || "");
    setText("centralAfricaText", content?.central_africa_text || "");
    if (geo) { initMap(geo); renderHotspotChips(geo); }
    else { const mapEl = $("map"); if (mapEl) mapEl.innerHTML = `<div class="mapFallback">Carte à intégrer</div>`; }

    // CHARTS
    if (charts?.donut) makeDonut("chartDonut", charts.donut);
    if (charts?.bars) makeBars("chartBars", charts.bars);
    if (charts?.trend) makeTrend("chartTrend", charts.trend);

    // GENDER
    renderList("genderWestSummary", content?.gender_west_summary || []);
    setText("genderWestDetails", content?.gender_west_details || "");
    renderList("genderCentralSummary", content?.gender_central_summary || []);
    setText("genderCentralDetails", content?.gender_central_details || "");
    renderIllustrationStack("genderIllustrations", content?.gender_illustrations || []);

    // RISKS
    renderRiskMatrix(content?.risks_matrix || []);
    setText("riskMitigation", content?.risk_mitigation || "");
    renderAssumptions(content?.assumptions || []);

    // STRATEGY
    renderList("objectivesList", content?.objectives || []);
    setText("scopeText", content?.scope || "");
    renderList("limitsList", content?.limits || []);
    setText("limitsMitigation", content?.limits_mitigation || "");

    setText("p1Objective", content?.p1_objective || "");
    setText("p1Approach", content?.p1_approach || "");
    setText("p1Result", content?.p1_result || "");
    renderList("p1Actions", content?.p1_actions || []);

    setText("p2Objective", content?.p2_objective || "");
    setText("p2Approach", content?.p2_approach || "");
    setText("p2Result", content?.p2_result || "");
    renderList("p2Actions", content?.p2_actions || []);

    renderStaff(content?.staff_rows || []);
    renderList("meList", content?.me_points || []);
    setText("indicatorExamples", content?.me_indicators || "");

    renderList("rmList", content?.rm_points || []);
    setText("rmCall", content?.rm_call || "");
    renderTimeline(content?.timeline || []);

    // INVESTMENT
    renderDonorCards(content?.donor_cards || []);
    renderList("roiList", content?.roi || []);
    setText("finalCall", content?.final_call || "");
    setText("contactLine", content?.contact || "");

    renderIllustrationFrame("donorIllustration", content?.donor_illustration?.src || "", "donorIllustrationCap", content?.donor_illustration?.caption || "");

    // Dock
    renderIntelDock(content?.intel_dock || []);

    // Footer
    setText("lastUpdated", content?.last_updated || new Date().toISOString().slice(0, 10));

    initDetailsButtons();

  } catch (err) {
    console.error(err);
    // Message sobre (sans jargon)
    const box = document.createElement("div");
    box.style.margin = "16px";
    box.style.padding = "14px";
    box.style.background = "white";
    box.style.border = "1px solid rgba(0,0,0,.12)";
    box.style.borderRadius = "12px";
    box.style.color = "#111";
    box.innerHTML = `<b>Impossible d’afficher la page pour le moment.</b><br/>Merci de vérifier la présence des fichiers dans <code>assets/data</code>.`;
    document.body.prepend(box);
  }
})();
