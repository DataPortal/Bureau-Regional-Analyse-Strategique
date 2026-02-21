async function loadJSON(path){
 const r = await fetch(path);
 return await r.json();
}

function renderKPI(data){
 const row=document.getElementById("kpiRow");

 data.kpis.forEach(k=>{
   const div=document.createElement("div");
   div.className="kpi";
   div.innerHTML=`
     <div>${k.label}</div>
     <div class="value">${k.value}</div>
   `;
   row.appendChild(div);
 });
}

function initMap(geo){
 const map=L.map('map').setView([7,2],4);

 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
   attribution:'© OpenStreetMap'
 }).addTo(map);

 L.geoJSON(geo,{
   onEachFeature:(f,l)=>{
     l.bindPopup(`<b>${f.properties.name}</b>`);
   }
 }).addTo(map);
}

(async function(){

 const kpi=await loadJSON("assets/data/kpi.json");
 renderKPI(kpi);

 const geo=await loadJSON("assets/data/geo.json");
 initMap(geo);

})();
