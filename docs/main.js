/* =========================================================
   main.js — HQ Brief (Summary-first + Details toggles)
   - Data: kpi.json, charts.json, geo.json, content.json
   - UX: résumé stratégique + <details> accordéons
   - Buttons: open/close all details
   - Images: placeholders if missing
   ========================================================= */

async function loadJSON(path){
  const r = await fetch(path);
  if(!r.ok) throw new Error(`Impossible de charger ${path} (${r.status})`);
  return r.json();
}

function $(id){ return document.getElementById(id); }

function renderList(id, items){
  const ul = $(id);
  ul.innerHTML = "";
  (items || []).forEach(t=>{
    const li = document.createElement("li");
    li.textContent = t;
    ul.appendChild(li);
  });
}

function renderKPIs(kpi){
  const wrap = $("kpiGrid");
  wrap.innerHTML = "";
  (kpi.kpis || []).forEach(k=>{
    const card = document.createElement("div");
    card.className = "kpiCard";
    card.innerHTML = `
      <div class="kpiLabel">${k.label}</div>
      <div class="kpiValue">${k.value}</div>
      <div class="kpiHint">${k.hint || ""}</div>
    `;
    wrap.appendChild(card);
  });
}

function renderMicroKpis(items){
  const wrap = $("microKpis");
  wrap.innerHTML = "";
  (items || []).slice(0,3).forEach(x=>{
    const box = document.createElement("div");
    box.className = "microKpi";
    box.innerHTML = `<div class="microKpi__k">${x.k}</div><div class="microKpi__v">${x.v}</div>`;
    wrap.appendChild(box);
  });
}

function renderSignals(items){
  const wrap = $("heroSignals");
  wrap.innerHTML = "";
  (items || []).slice(0,3).forEach(x=>{
    const c = document.createElement("div");
    c.className = "signalCard";
    c.innerHTML = `<p class="signalCard__t">${x.title}</p><p class="signalCard__d">${x.text}</p>`;
    wrap.appendChild(c);
  });
}

function renderKeyMessages(items){
  const wrap = $("keyMessages");
  wrap.innerHTML = "";
  (items || []).slice(0,3).forEach(m=>{
    const c = document.createElement("div");
    c.className = "msg";
    c.innerHTML = `<p class="msg__t">${m.title}</p><p class="msg__d">${m.text}</p>`;
    wrap.appendChild(c);
  });
}

function renderRiskMatrix(risks){
  const wrap = $("riskMatrix");
  wrap.innerHTML = "";
  (risks || []).forEach(r=>{
    const tags = (r.tags || []).map(t=>`<span class="tag">${t}</span>`).join("");
    const cell = document.createElement("div");
    cell.className = "riskCell";
    cell.innerHTML = `
      <div class="riskCell__title">${r.title}</div>
      <div class="riskCell__text">${r.text}</div>
      <div class="riskCell__tagRow">${tags}</div>
    `;
    wrap.appendChild(cell);
  });
}

function renderAssumptions(assumptions){
  const wrap = $("assumptionsGrid");
  wrap.innerHTML = "";
  (assumptions || []).forEach(a=>{
    const box = document.createElement("div");
    box.className = "assumption";
    box.innerHTML = `
      <div class="assumption__t">${a.title}</div>
      <div class="assumption__d">${a.description}</div>
      <div class="assumption__a"><b>Application AOC :</b> ${a.application}</div>
    `;
    wrap.appendChild(box);
  });
}

function renderStaff(rows){
  const wrap = $("staffTable");
  wrap.innerHTML = "";
  (rows || []).slice(0,4).forEach(r=>{
    const row = document.createElement("div");
    row.className = "staffRow";
    const status = (r.status || "").toLowerCase();
    const label = status === "ok" ? "OK" : (status.includes("conf") ? "À confirmer" : (r.status || "—"));
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
  const wrap = $("timeline");
  wrap.innerHTML = "";
  (years || []).forEach(y=>{
    const card = document.createElement("div");
    card.className = "year";
    card.innerHTML = `<div class="year__t">${y.year}</div><div class="year__d">${y.text}</div>`;
    wrap.appendChild(card);
  });
}

function renderDonorCards(cards){
  const wrap = $("donorCards");
  wrap.innerHTML = "";
  (cards || []).forEach(c=>{
    const d = document.createElement("div");
    d.className = "donorCard";
    d.innerHTML = `
      <div class="donorCard__k">${c.k}</div>
      <div class="donorCard__v">${c.v}</div>
      <div class="donorCard__h">${c.h}</div>
    `;
    wrap.appendChild(d);
  });
}

function renderIntelDock(items){
  const wrap = $("intelDock");
  wrap.innerHTML = "";
  (items || []).slice(0,5).forEach((i, idx)=>{
    const pill = document.createElement("div");
    pill.className = "pill " + (idx % 2 === 0 ? "pill--blue" : "pill--orange");
    pill.innerHTML = `<span>${i.k}</span> <b>${i.v}</b>`;
    wrap.appendChild(pill);
  });
}

function renderIllustrationFrame(targetId, src, captionTargetId, captionText){
  const frame = $(targetId);
  if(!frame) return;
  frame.innerHTML = "";
  if(src){
    const img = document.createElement("img");
    img.src = src;
    img.alt = captionText || "Illustration";
    frame.appendChild(img);
  }else{
    frame.textContent = "Illustration (à remplacer)";
  }
  if(captionTargetId){
    const cap = $(captionTargetId);
    if(cap) cap.textContent = captionText || "";
  }
}

function renderIllustrationStack(targetId, items){
  const wrap = $(targetId);
  wrap.innerHTML = "";
  (items || []).slice(0,3).forEach(it=>{
    const card = document.createElement("div");
    card.className = "illustrationCard";
    const frameId = `frame_${Math.random().toString(16).slice(2)}`;
    card.innerHTML = `
      <div class="illustrationCard__frame" id="${frameId}">Illustration (à remplacer)</div>
      <div class="illustrationCard__cap">${it.caption || ""}</div>
    `;
    wrap.appendChild(card);

    // load image if provided
    if(it.src){
      const f = document.getElementById(frameId);
      f.innerHTML = "";
      const img = document.createElement("img");
      img.src = it.src;
      img.alt = it.caption || "Illustration";
      f.appendChild(img);
    }
  });
}

/* Charts */
function makeDonut(canvasId, donut){
  return new Chart($(canvasId), {
    type: "doughnut",
    data: { labels: donut.labels, datasets: [{ data: donut.values }] },
    options: { responsive:true, plugins:{ legend:{ position:"bottom" } }, cutout:"62%" }
  });
}
function makeBars(canvasId, bars){
  return new Chart($(canvasId), {
    type:"bar",
    data:{ labels: bars.labels, datasets:[{ data: bars.values }] },
    options:{ responsive:true, indexAxis:"y", plugins:{ legend:{ display:false } }, scales:{ x:{ beginAtZero:true } } }
  });
}
function makeTrend(canvasId, trend){
  return new Chart($(canvasId), {
    type:"line",
    data:{ labels: trend.labels, datasets:[{ label: trend.label, data: trend.values, tension:0.35, fill:true }] },
    options:{ responsive:true, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true } } }
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
}

function renderHotspotChips(geo){
  const wrap = $("hotspotChips");
  wrap.innerHTML = "";
  (geo.features || []).forEach(f=>{
    const p = f.properties || {};
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = `${p.name || "Zone"} • ${p.focus || "Focus"}`;
    wrap.appendChild(chip);
  });
}

/* Details buttons */
function initDetailsButtons(){
  const openBtn = document.querySelector('[data-open="allDetails"]');
  const closeBtn = document.querySelector('[data-close="allDetails"]');
  const all = () => Array.from(document.querySelectorAll("details.detailBlock"));

  if(openBtn){
    openBtn.addEventListener("click", ()=>{
      all().forEach(d=> d.open = true);
      window.location.hash = "#snapshot";
    });
  }
  if(closeBtn){
    closeBtn.addEventListener("click", ()=>{
      all().forEach(d=> d.open = false);
    });
  }
}

(async function main(){
  try{
    const [kpi, charts, geo, content] = await Promise.all([
      loadJSON("assets/data/kpi.json"),
      loadJSON("assets/data/charts.json"),
      loadJSON("assets/data/geo.json"),
      loadJSON("assets/data/content.json")
    ]);

    // HERO (summary)
    $("heroLead").textContent = content.hero_lead || "";
    renderSignals(content.hero_signals || []);
    renderMicroKpis(content.micro_kpis || []);

    renderIllustrationFrame(
      "heroIllustration",
      content.hero_illustration?.src || "",
      "heroIllustrationCap",
      content.hero_illustration?.caption || ""
    );

    // SNAPSHOT
    renderKPIs(kpi);
    renderKeyMessages(content.key_messages || []);
    $("snapshotDetails").textContent = content.snapshot_details || "";
    renderIllustrationStack("snapshotIllustrations", content.snapshot_illustrations || []);

    // CONTEXT
    renderList("contextSummary", content.context_summary || []);
    $("westAfricaText").textContent = content.west_africa_text || "";
    $("centralAfricaText").textContent = content.central_africa_text || "";
    initMap(geo);
    renderHotspotChips(geo);

    // Charts
    makeDonut("chartDonut", charts.donut);
    makeBars("chartBars", charts.bars);
    makeTrend("chartTrend", charts.trend);

    // GENDER
    renderList("genderWestSummary", content.gender_west_summary || []);
    $("genderWestDetails").textContent = content.gender_west_details || "";
    renderList("genderCentralSummary", content.gender_central_summary || []);
    $("genderCentralDetails").textContent = content.gender_central_details || "";
    renderIllustrationStack("genderIllustrations", content.gender_illustrations || []);

    // RISKS
    renderRiskMatrix(content.risks_matrix || []);
    $("riskMitigation").textContent = content.risk_mitigation || "";
    renderAssumptions(content.assumptions || []);

    // STRATEGY
    renderList("objectivesList", content.objectives || []);
    $("scopeText").textContent = content.scope || "";
    renderList("limitsList", content.limits || []);
    $("limitsMitigation").textContent = content.limits_mitigation || "";

    $("p1Objective").textContent = content.p1_objective || "";
    $("p1Approach").textContent = content.p1_approach || "";
    $("p1Result").textContent = content.p1_result || "";
    renderList("p1Actions", content.p1_actions || []);

    $("p2Objective").textContent = content.p2_objective || "";
    $("p2Approach").textContent = content.p2_approach || "";
    $("p2Result").textContent = content.p2_result || "";
    renderList("p2Actions", content.p2_actions || []);

    renderStaff(content.staff_rows || []);
    renderList("meList", content.me_points || []);
    $("indicatorExamples").textContent = content.me_indicators || "";

    renderList("rmList", content.rm_points || []);
    $("rmCall").textContent = content.rm_call || "";
    renderTimeline(content.timeline || []);

    // INVESTMENT
    renderDonorCards(content.donor_cards || []);
    renderList("roiList", content.roi || []);
    $("finalCall").textContent = content.final_call || "";
    $("contactLine").textContent = content.contact || "";

    renderIllustrationFrame(
      "donorIllustration",
      content.donor_illustration?.src || "",
      "donorIllustrationCap",
      content.donor_illustration?.caption || ""
    );

    // Dock
    renderIntelDock(content.intel_dock || []);

    // Footer
    $("lastUpdated").textContent = content.last_updated || new Date().toISOString().slice(0,10);

    initDetailsButtons();

  }catch(err){
    console.error("Erreur brief:", err);
    const box = document.createElement("div");
    box.style.margin = "16px";
    box.style.padding = "14px";
    box.style.background = "white";
    box.style.border = "1px solid rgba(0,0,0,.12)";
    box.style.borderRadius = "12px";
    box.innerHTML = `<b>Erreur de chargement</b><br/>Vérifiez <code>/docs/assets/data/content.json</code> et vos images.<br/><br/>Détail: ${String(err.message || err)}`;
    document.body.prepend(box);
  }
})();
