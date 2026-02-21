/* =========================================================
   main.js — WCARO/OCHA HQ Web Brief (ULTRA-PRO)
   - Data: kpi.json, charts.json, geo.json, content.json
   - Render: hero, quote, intro, context, gender, risks,
             strategy, staffing, M&E, RM, donor, sidebar
   - Map: Leaflet | Charts: Chart.js
   - Reveal: IntersectionObserver
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
  document.getElementById("kpiNote").textContent = kpi.note || "";
}

function renderList(id, items){
  const ul = document.getElementById(id);
  ul.innerHTML = "";
  (items || []).forEach(t=>{
    const li = document.createElement("li");
    li.textContent = t;
    ul.appendChild(li);
  });
}

function setText(id, value){
  const n = document.getElementById(id);
  if(n) n.textContent = value || "";
}

function setPrewrapText(id, value){
  const n = document.getElementById(id);
  if(n) n.textContent = value || "";
}

function renderChips(id, items){
  const wrap = document.getElementById(id);
  wrap.innerHTML = "";
  (items || []).forEach(x=>{
    const chip = el("div","chip");
    chip.textContent = x;
    wrap.appendChild(chip);
  });
}

function renderRiskMatrix(risks){
  const wrap = document.getElementById("riskMatrix");
  wrap.innerHTML = "";
  (risks || []).forEach(r=>{
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

function renderAssumptions(assumptions){
  const wrap = document.getElementById("assumptionsGrid");
  wrap.innerHTML = "";
  (assumptions || []).forEach(a=>{
    const box = el("div","assumption");
    box.innerHTML = `
      <div class="assumption__t">${a.title}</div>
      <div class="assumption__d">${a.description}</div>
      <div class="assumption__a"><b>Application AOC :</b> ${a.application}</div>
    `;
    wrap.appendChild(box);
  });
}

function renderCrossCut(items){
  const wrap = document.getElementById("crossCutItems");
  wrap.innerHTML = "";
  (items || []).forEach(x=>{
    const c = el("div","crossItem");
    c.textContent = x;
    wrap.appendChild(c);
  });
}

function renderStaffTable(rows){
  const wrap = document.getElementById("staffTable");
  wrap.innerHTML = "";
  (rows || []).forEach(r=>{
    const row = el("div","staffRow");
    const status = (r.status || "").toLowerCase();
    const label = status === "ok" ? "OK" : (status === "?" ? "À confirmer" : (r.status || "—"));
    row.innerHTML = `
      <div class="staffRow__head">
        <div class="staffRow__title">${r.title}</div>
        <div class="staffRow__status">${label}</div>
      </div>
      <div class="staffRow__body">${r.body || ""}</div>
    `;
    wrap.appendChild(row);
  });
}

function renderTimeline(years){
  const wrap = document.getElementById("timeline");
  wrap.innerHTML = "";
  (years || []).forEach(y=>{
    const card = el("div","year");
    card.innerHTML = `
      <div class="year__t">${y.year}</div>
      <div class="year__d">${y.text}</div>
    `;
    wrap.appendChild(card);
  });
}

function renderDonorCards(cards){
  const wrap = document.getElementById("donorCards");
  wrap.innerHTML = "";
  (cards || []).forEach(c=>{
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
  (items || []).forEach(i=>{
    const row = el("div","intelItem");
    row.innerHTML = `
      <div class="intelItem__k">${i.k}</div>
      <div class="intelItem__v">${i.v}</div>
    `;
    wrap.appendChild(row);
  });
}

/* Charts */
function makeDonut(canvasId, donut){
  const ctx = document.getElementById(canvasId);
  return new Chart(ctx, {
    type: "doughnut",
    data: { labels: donut.labels, datasets: [{ data: donut.values }] },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } },
      cutout: "62%"
    }
  });
}
function makeBars(canvasId, bars){
  const ctx = document.getElementById(canvasId);
  return new Chart(ctx, {
    type:"bar",
    data:{ labels: bars.labels, datasets:[{ data: bars.values }] },
    options:{
      responsive:true,
      indexAxis:"y",
      plugins:{ legend:{ display:false } },
      scales:{ x:{ beginAtZero:true } }
    }
  });
}
function makeTrend(canvasId, trend){
  const ctx = document.getElementById(canvasId);
  return new Chart(ctx, {
    type:"line",
    data:{
      labels: trend.labels,
      datasets:[{
        label: trend.label,
        data: trend.values,
        tension: 0.35,
        fill: true
      }]
    },
    options:{
      responsive:true,
      plugins:{ legend:{ display:false } },
      scales:{ y:{ beginAtZero:true } }
    }
  });
}

/* Map */
function initMap(geo){
  const map = L.map("map", { scrollWheelZoom:false }).setView([7, 2], 4);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution:"&copy; OpenStreetMap contributors"
  }).addTo(map);

  const markers = [];
  (geo.features || []).forEach(f=>{
    const p = f.properties || {};
    const g = f.geometry || {};
    if(g.type !== "Point" || !g.coordinates) return;
    const [lng, lat] = g.coordinates;

    const popup = `
      <b>${p.name || "Zone"}</b><br/>
      <b>Contexte:</b> ${p.crisis || "—"}<br/>
      <b>Priorité:</b> ${p.focus || "—"}<br/>
      <b>Signal:</b> ${p.signal || "—"}
    `;

    const m = L.circleMarker([lat,lng], { radius:7, weight:2, fillOpacity:.25 })
      .addTo(map)
      .bindPopup(popup);
    markers.push(m);
  });

  if(markers.length){
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds(), { padding:[16,16] });
  }
  return map;
}

function renderHotspotChips(geo){
  const wrap = document.getElementById("hotspotChips");
  wrap.innerHTML = "";
  (geo.features || []).slice(0, 12).forEach(f=>{
    const p = f.properties || {};
    const chip = el("div","chip");
    chip.textContent = `${p.name || "Zone"} • ${p.focus || "Focus"}`;
    wrap.appendChild(chip);
  });
}

/* Reveal */
function initReveal(){
  const nodes = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold:0.12 });

  nodes.forEach(n=>io.observe(n));
}

(async function main(){
  try{
    const [kpi, charts, geo, content] = await Promise.all([
      loadJSON("assets/data/kpi.json"),
      loadJSON("assets/data/charts.json"),
      loadJSON("assets/data/geo.json"),
      loadJSON("assets/data/content.json")
    ]);

    // Hero
    setText("heroSubtitle", content.hero_subtitle);
    renderHeroMessages(content.hero_messages);

    // KPI
    renderKPIs(kpi);

    // Quote
    setText("quoteText", content.quote.text);
    setText("quoteAuthor", content.quote.author);

    // Intro
    setPrewrapText("introText", content.intro.text);
    renderList("alignmentsList", content.intro.alignments);
    setText("introPurpose", content.intro.purpose);

    // Context
    initMap(geo);
    renderHotspotChips(geo);
    renderList("contextKeyPoints", content.context.key_points);
    setText("genderConsequence", content.context.gender_consequence);
    setPrewrapText("westAfricaText", content.context.west_africa_text);
    setPrewrapText("centralAfricaText", content.context.central_africa_text);

    // Charts
    makeDonut("chartDonut", charts.donut);
    makeBars("chartBars", charts.bars);
    makeTrend("chartTrend", charts.trend);

    // Gender
    renderList("genderWestBullets", content.gender.west.bullets);
    setText("genderWestChallenges", content.gender.west.challenges);
    renderList("genderCentralBullets", content.gender.central.bullets);
    setText("genderCentralObstacle", content.gender.central.obstacle);

    // Risks & assumptions
    renderRiskMatrix(content.risks.matrix);
    setText("riskNote", content.risks.note);
    renderAssumptions(content.risks.assumptions);
    setText("mitigationApproach", content.risks.mitigation);

    // Strategy (3.1)
    renderList("objectivesList", content.strategy.objectives);
    setText("scopeText", content.strategy.scope);
    renderList("limitsList", content.strategy.limits);
    setText("limitsMitigation", content.strategy.limits_mitigation);

    // Pillars
    setText("p1Objective", content.strategy.pillars.p1.objective);
    setText("p1Approach", content.strategy.pillars.p1.approach);
    renderList("p1Actions", content.strategy.pillars.p1.actions);
    setText("p1Result", content.strategy.pillars.p1.result);

    setText("p2Objective", content.strategy.pillars.p2.objective);
    setText("p2Approach", content.strategy.pillars.p2.approach);
    renderList("p2Actions", content.strategy.pillars.p2.actions);
    setText("p2Result", content.strategy.pillars.p2.result);

    renderCrossCut(content.strategy.cross_cutting);

    // Staff / M&E / Timeline / RM
    renderStaffTable(content.strategy.staffing.rows);
    setText("staffNote", content.strategy.staffing.note);

    renderList("meList", content.strategy.me.points);
    setText("indicatorExamples", content.strategy.me.indicators);

    renderTimeline(content.strategy.timeline);
    renderList("rmList", content.strategy.resource_mobilization.points);
    setText("rmCall", content.strategy.resource_mobilization.call);

    // Donor / ROI
    renderDonorCards(content.investment.cards);
    renderList("roiList", content.investment.roi);
    setText("finalCall", content.investment.final_call);
    setText("contactLine", content.investment.contact);

    // Sidebar intelligence
    renderSidebar(content.sidebar_intelligence);

    // Footer
    setText("lastUpdated", content.last_updated || new Date().toISOString().slice(0,10));

    // Reveal
    initReveal();

  }catch(err){
    console.error("Erreur brief:", err);
    const fallback = document.createElement("div");
    fallback.style.padding = "16px";
    fallback.style.margin = "16px";
    fallback.style.background = "white";
    fallback.style.border = "1px solid rgba(0,0,0,.1)";
    fallback.style.borderRadius = "12px";
    fallback.innerHTML = `<b>Erreur de chargement</b><br/>
      Vérifiez <code>/docs/assets/data/*.json</code> et <code>/docs/assets/img/</code>.<br/>
      Détail: ${String(err.message || err)}`;
    document.body.prepend(fallback);
  }
})();
