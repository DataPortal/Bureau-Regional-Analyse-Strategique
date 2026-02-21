/* =========================================================
   main.js — Brief stratégique WCARO/OCHA style (ULTRA-PRO)
   - Charge: kpi.json, charts.json, geo.json, content.json
   - Rend: HERO messages, KPI cards, insights, framework, risks,
           donor boxes, sidebar intelligence
   - Init: Leaflet map + Chart.js charts
   - UX:   Scroll storytelling (IntersectionObserver)
   ========================================================= */

async function loadJSON(path){
  const r = await fetch(path);
  if(!r.ok) throw new Error(`Impossible de charger ${path} (${r.status})`);
  return r.json();
}

function el(tag, cls){
  const e = document.createElement(tag);
  if(cls) e.className = cls;
  return e;
}

function renderHeroMessages(items){
  const wrap = document.getElementById("heroMessages");
  wrap.innerHTML = "";
  items.slice(0,3).forEach(x=>{
    const card = el("div","heroMsg");
    card.innerHTML = `
      <div class="heroMsg__title">${x.title}</div>
      <p class="heroMsg__text">${x.text}</p>
    `;
    wrap.appendChild(card);
  });
}

function renderKPIs(kpi){
  const grid = document.getElementById("kpiGrid");
  grid.innerHTML = "";
  kpi.kpis.forEach(k=>{
    const card = el("div","kpiCard reveal");
    card.innerHTML = `
      <div class="kpiLabel">${k.label}</div>
      <div class="kpiValue">${k.value}</div>
      <div class="kpiHint">${k.hint || ""}</div>
    `;
    grid.appendChild(card);
  });

  const note = document.getElementById("kpiNote");
  note.textContent = kpi.note || "";
}

function renderList(id, items){
  const ul = document.getElementById(id);
  ul.innerHTML = "";
  items.forEach(t=>{
    const li = document.createElement("li");
    li.textContent = t;
    ul.appendChild(li);
  });
}

function renderCrossCut(items){
  const wrap = document.getElementById("crossCutItems");
  wrap.innerHTML = "";
  items.forEach(x=>{
    const c = el("div","crossItem");
    c.textContent = x;
    wrap.appendChild(c);
  });
}

function renderRiskMatrix(risks){
  const wrap = document.getElementById("riskMatrix");
  wrap.innerHTML = "";
  risks.forEach(r=>{
    const cell = el("div","riskCell");
    const tags = (r.tags || []).map(t=>`<span class="tag">${t}</span>`).join("");
    cell.innerHTML = `
      <div class="riskCell__title">${r.title}</div>
      <div class="riskCell__text">${r.text}</div>
      <div class="riskCell__tagRow">${tags}</div>
    `;
    wrap.appendChild(cell);
  });
}

function renderDonorCards(cards){
  const wrap = document.getElementById("donorCards");
  wrap.innerHTML = "";
  cards.forEach(c=>{
    const d = el("div","donorCard");
    d.innerHTML = `
      <div class="donorCard__k">${c.k}</div>
      <div class="donorCard__v">${c.v}</div>
      <div class="donorCard__h">${c.h}</div>
    `;
    wrap.appendChild(d);
  });
}

function renderSidebar(items){
  const wrap = document.getElementById("intelSidebarItems");
  wrap.innerHTML = "";
  items.forEach(i=>{
    const row = el("div","intelItem");
    row.innerHTML = `
      <div class="intelItem__k">${i.k}</div>
      <div class="intelItem__v">${i.v}</div>
    `;
    wrap.appendChild(row);
  });
}

/* ----------------------------
   Charts (Chart.js)
---------------------------- */

function makeDonut(canvasId, donut){
  const ctx = document.getElementById(canvasId);
  return new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: donut.labels,
      datasets: [{ data: donut.values }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      },
      cutout: "62%"
    }
  });
}

function makeBars(canvasId, bars){
  const ctx = document.getElementById(canvasId);
  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: bars.labels,
      datasets: [{ data: bars.values }]
    },
    options: {
      responsive: true,
      indexAxis: "y",
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true } }
    }
  });
}

function makeTrend(canvasId, trend){
  const ctx = document.getElementById(canvasId);
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: trend.labels,
      datasets: [{
        label: trend.label,
        data: trend.values,
        tension: 0.35,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

/* ----------------------------
   Map (Leaflet)
---------------------------- */

function initMap(geo){
  // Vue régionale (ajustée ensuite)
  const map = L.map("map", { scrollWheelZoom: false }).setView([7, 2], 4);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  const markers = [];
  geo.features.forEach(f=>{
    const p = f.properties || {};
    const coords = f.geometry && f.geometry.coordinates;
    if(!coords || f.geometry.type !== "Point") return;

    const lng = coords[0];
    const lat = coords[1];

    const popup = `
      <b>${p.name || "Zone"}</b><br/>
      <span><b>Contexte:</b> ${p.crisis || "—"}</span><br/>
      <span><b>Priorité:</b> ${p.focus || "—"}</span><br/>
      <span><b>Signal:</b> ${p.signal || "—"}</span>
    `;

    const m = L.circleMarker([lat,lng], {
      radius: 7,
      weight: 2,
      fillOpacity: 0.25
    }).addTo(map).bindPopup(popup);

    markers.push(m);
  });

  // Fit bounds sur les markers si possible
  if(markers.length){
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds(), { padding: [16,16] });
  }

  return map;
}

function renderHotspotChips(geo){
  const wrap = document.getElementById("hotspotChips");
  wrap.innerHTML = "";
  geo.features.slice(0, 10).forEach(f=>{
    const p = f.properties || {};
    const chip = el("div","chip");
    chip.textContent = `${p.name || "Zone"} • ${p.focus || "Focus"}`;
    wrap.appendChild(chip);
  });
}

/* ----------------------------
   Scroll Storytelling
---------------------------- */

function initReveal(){
  const nodes = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  nodes.forEach(n=>io.observe(n));
}

/* ----------------------------
   Main
---------------------------- */

(async function main(){
  try{
    const [kpi, charts, geo, content] = await Promise.all([
      loadJSON("assets/data/kpi.json"),
      loadJSON("assets/data/charts.json"),
      loadJSON("assets/data/geo.json"),
      loadJSON("assets/data/content.json")
    ]);

    // HERO
    renderHeroMessages(content.hero_messages);

    // KPI
    renderKPIs(kpi);

    // Intelligence content
    renderList("insightsList", content.key_insights);
    document.getElementById("systemRisk").textContent = content.system_risk;

    // Map
    initMap(geo);
    renderHotspotChips(geo);

    // Charts
    makeDonut("chartDonut", charts.donut);
    makeBars("chartBars", charts.bars);
    makeTrend("chartTrend", charts.trend);

    // Pillars
    document.getElementById("p1Objective").textContent = content.pillars.p1.objective;
    document.getElementById("p2Objective").textContent = content.pillars.p2.objective;

    renderList("p1Actions", content.pillars.p1.actions);
    renderList("p2Actions", content.pillars.p2.actions);

    document.getElementById("p1Result").textContent = content.pillars.p1.result;
    document.getElementById("p2Result").textContent = content.pillars.p2.result;

    renderCrossCut(content.cross_cutting);

    // Risks / gaps
    renderRiskMatrix(content.risks);
    renderList("systemGaps", content.system_gaps);
    document.getElementById("opportunityBox").textContent = content.opportunity;

    // Donor
    renderDonorCards(content.investment_cards);
    renderList("roiList", content.roi);
    renderList("systemActions", content.priority_actions.system);
    renderList("communityActions", content.priority_actions.community);
    document.getElementById("finalCall").textContent = content.final_call;

    // Sidebar intelligence
    renderSidebar(content.sidebar_intelligence);

    // Footer contact
    document.getElementById("contactLine").textContent = content.contact;

    // Reveal animations
    initReveal();

  }catch(err){
    console.error("Erreur chargement brief:", err);
    const fallback = document.createElement("div");
    fallback.style.padding = "16px";
    fallback.style.margin = "16px";
    fallback.style.background = "white";
    fallback.style.border = "1px solid rgba(0,0,0,.1)";
    fallback.style.borderRadius = "12px";
    fallback.innerHTML = `
      <b>Erreur de chargement</b><br/>
      <span style="color:#555">Vérifiez que les fichiers JSON et images sont bien placés sous <code>/docs/assets/</code>.</span><br/>
      <span style="color:#555">Détail: ${String(err.message || err)}</span>
    `;
    document.body.prepend(fallback);
  }
})();
