/* =========================================================
   main.js — Brief narratif (Style ONU)
   Chargement robuste GitHub Pages (racine / docs)
   ========================================================= */

function $(id){ return document.getElementById(id); }

function safeText(v){
  if(v === null || v === undefined) return "";
  const s = String(v).trim();
  return s ? s : "";
}

async function tryLoadJSON(paths){
  let lastErr = null;
  for(const p of paths){
    try{
      const r = await fetch(p, { cache: "no-store" });
      if(!r.ok) throw new Error(`${p} (${r.status})`);
      return await r.json();
    }catch(e){
      lastErr = e;
    }
  }
  throw lastErr || new Error("Impossible de charger le JSON.");
}

function showLoadError(message){
  const box = document.createElement("div");
  box.className = "panel";
  box.style.margin = "16px";
  box.innerHTML = `
    <div class="panelHead">
      <h2 style="margin:0">Contenu non chargé</h2>
      <div class="panelMeta">Vérifiez l’emplacement des fichiers <code>content.json</code> et <code>main.js</code>.</div>
    </div>
    <div class="longText">${safeText(message)}</div>
    <div class="resultBox" style="margin-top:12px">
      Chemins testés :<br/>
      <code>assets/data/content.json</code> • <code>./assets/data/content.json</code> • <code>docs/assets/data/content.json</code> • <code>./docs/assets/data/content.json</code>
    </div>
  `;
  document.body.prepend(box);
}

/* -------- Render helpers (identiques à ta structure) -------- */
function renderSignals(items){
  const wrap = $("heroSignals");
  if(!wrap) return;
  wrap.innerHTML = "";
  (items || []).slice(0,3).forEach(x=>{
    const c = document.createElement("div");
    c.className = "signalCard";
    c.innerHTML = `<p class="signalCard__t">${safeText(x.title)}</p><p class="signalCard__d">${safeText(x.text)}</p>`;
    wrap.appendChild(c);
  });
}

function renderMicroKpis(items){
  const wrap = $("microKpis");
  if(!wrap) return;
  wrap.innerHTML = "";
  (items || []).slice(0,4).forEach(x=>{
    const box = document.createElement("div");
    box.className = "microKpi";
    box.innerHTML = `<div class="microKpi__k">${safeText(x.k)}</div><div class="microKpi__v">${safeText(x.v)}</div>`;
    wrap.appendChild(box);
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

  const cap = captionTargetId ? $(captionTargetId) : null;
  if(cap) cap.textContent = captionText || "";
}

function renderIllustrationStack(targetId, items){
  const wrap = $(targetId);
  if(!wrap) return;
  wrap.innerHTML = "";

  (items || []).slice(0,3).forEach(it=>{
    const card = document.createElement("div");
    card.className = "illustrationCard";

    const frameId = `frame_${Math.random().toString(16).slice(2)}`;
    card.innerHTML = `
      <div class="illustrationCard__frame" id="${frameId}">Illustration (à remplacer)</div>
      <div class="illustrationCard__cap">${safeText(it.caption)}</div>
    `;
    wrap.appendChild(card);

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

function renderKPIs(kpi){
  const wrap = $("kpiGrid");
  if(!wrap) return;
  wrap.innerHTML = "";
  (kpi?.kpis || []).forEach(k=>{
    const card = document.createElement("div");
    card.className = "kpiCard";
    card.innerHTML = `
      <div class="kpiLabel">${safeText(k.label)}</div>
      <div class="kpiValue">${safeText(k.value)}</div>
      <div class="kpiHint">${safeText(k.hint)}</div>
    `;
    wrap.appendChild(card);
  });
}

function renderKeyMessages(items){
  const wrap = $("keyMessages");
  if(!wrap) return;
  wrap.innerHTML = "";
  (items || []).slice(0,4).forEach(m=>{
    const c = document.createElement("div");
    c.className = "msg";
    c.innerHTML = `<p class="msg__t">${safeText(m.title)}</p><p class="msg__d">${safeText(m.text)}</p>`;
    wrap.appendChild(c);
  });
}

function renderIntelDock(items){
  const wrap = $("intelDock");
  if(!wrap) return;
  wrap.innerHTML = "";
  (items || []).slice(0,5).forEach((i, idx)=>{
    const pill = document.createElement("div");
    pill.className = "pill " + (idx % 2 === 0 ? "pill--blue" : "pill--orange");
    pill.innerHTML = `<span>${safeText(i.k)}</span> <b>${safeText(i.v)}</b>`;
    wrap.appendChild(pill);
  });
}

function renderPoints9(points){
  const wrap = $("points9");
  if(!wrap) return;
  wrap.innerHTML = "";

  (points || []).slice(0,9).forEach(p=>{
    const n = safeText(p.n);
    const title = safeText(p.title);
    const summary = safeText(p.summary);
    const commentary = safeText(p.commentary);
    const illSrc = safeText(p.illustration?.src);
    const illCap = safeText(p.illustration?.caption);

    const bodyHTML = Array.isArray(p.content)
      ? `<ul class="bullets">${p.content.map(x=>`<li>${safeText(x)}</li>`).join("")}</ul>`
      : `<div class="longText">${safeText(p.content)}</div>`;

    const detail = document.createElement("details");
    detail.className = "detailBlock";
    if(Number(n) === 1) detail.open = true;

    detail.innerHTML = `
      <summary class="detailBlock__summary">
        <span>${n}. ${title}</span>
        <span class="detailBlock__hint">${summary ? "Voir le détail" : "Ouvrir"}</span>
      </summary>
      <div class="detailBlock__body">
        <div class="grid2">
          <div>
            ${summary ? `<div class="resultBox" style="margin-bottom:12px">${summary}</div>` : ""}
            ${bodyHTML}
            ${commentary ? `<p style="margin-top:12px"><em>${commentary}</em></p>` : ""}
          </div>
          <div>
            <div class="illustrationCard">
              <div class="illustrationCard__frame">
                ${illSrc ? `<img src="${illSrc}" alt="${illCap || "Illustration"}">` : "Illustration (à remplacer)"}
              </div>
              <div class="illustrationCard__cap">${illCap}</div>
            </div>
          </div>
        </div>
      </div>
    `;
    wrap.appendChild(detail);
  });
}

function initDetailsButtons(){
  const openBtn = document.querySelector('[data-open="allDetails"]');
  const closeBtn = document.querySelector('[data-close="allDetails"]');
  const all = () => Array.from(document.querySelectorAll("details.detailBlock"));

  if(openBtn){
    openBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      all().forEach(d=> d.open = true);
      window.location.hash = "#structure";
    });
  }
  if(closeBtn){
    closeBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      all().forEach(d=> d.open = false);
      window.location.hash = "#structure";
    });
  }
}

(async function main(){
  try{
    const content = await tryLoadJSON([
      "assets/data/content.json",
      "./assets/data/content.json",
      "docs/assets/data/content.json",
      "./docs/assets/data/content.json"
    ]);

    // Hero
    if($("heroLead") && content.hero_lead) $("heroLead").textContent = safeText(content.hero_lead);
    renderSignals(content.hero_signals || []);
    renderMicroKpis(content.micro_kpis || []);
    renderIllustrationFrame(
      "heroIllustration",
      content.hero_illustration?.src || "",
      "heroIllustrationCap",
      content.hero_illustration?.caption || ""
    );

    // Snapshot (KPI optionnel)
    try{
      const kpi = await tryLoadJSON([
        "assets/data/kpi.json",
        "./assets/data/kpi.json",
        "docs/assets/data/kpi.json",
        "./docs/assets/data/kpi.json"
      ]);
      renderKPIs(kpi);
    }catch(_){ /* ok si absent */ }

    renderKeyMessages(content.key_messages || []);
    if($("snapshotDetails")) $("snapshotDetails").textContent = safeText(content.snapshot_details);
    renderIllustrationStack("snapshotIllustrations", content.snapshot_illustrations || []);

    // 9 points
    renderPoints9(content.points_9 || []);

    // Dock + footer
    renderIntelDock(content.intel_dock || []);
    if($("lastUpdated")){
      $("lastUpdated").textContent = safeText(content.last_updated) || new Date().toISOString().slice(0,10);
    }

    initDetailsButtons();

  }catch(err){
    showLoadError(err?.message || String(err));
  }
})();
