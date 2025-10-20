/* =====================================================
 🛍️ KOOPKRACHT WIDGET v1.3
 © 2025 - Pixel-perfect rendering (alternating rows, equal padding)
 ===================================================== */

// === 1️⃣ LAND OPHALEN VIA IP ===
async function getCountry() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return data.country_code || "NL";
  } catch (err) {
    console.error("IP lookup failed:", err);
    return "NL";
  }
}

// === 2️⃣ HELPER VOOR STERREN ===
function makeStars(score) {
  const n = Math.max(0, Math.min(5, Number(score) || 0));
  return "⭐".repeat(n);
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// === 3️⃣ TEMPLATE ===
function renderKoopkrachtBox(data) {
  const review = data.review || {};
  const scoreTypes = Array.isArray(data.score_types) && data.score_types.length
    ? data.score_types
    : [
        { score_type: "score_prijs", beschrijving: "Prijsniveau t.o.v. concurrenten" },
        { score_type: "score_installatie", beschrijving: "Moeilijkheidsgraad van installatie of gebruik" },
        { score_type: "score_geld", beschrijving: "Waarde voor je geld" },
        { score_type: "score_tijd", beschrijving: "Bespaarde tijd" },
        { score_type: "score_comfort", beschrijving: "Comfort in gebruik" }
      ];

  const icons = { prijs: "💰", installatie: "⚙️", geld: "💵", tijd: "⏱", comfort: "🛋" };

  const scoreRows = scoreTypes
    .map((st, i) => {
      const raw = (st.score_type || "").toLowerCase();
      const key = raw.startsWith("score_") ? raw.slice(6) : raw;
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      const beschrijving = escapeHtml(st.beschrijving || "");
      const score = review[`score_${key}`] ?? 0;
      const icon = icons[key] || "⭐";
      const bg = i % 2 === 0 ? "rgb(249,249,249)" : "rgb(255,255,255)";

      return `
        <div class="score-row"
             style="align-items:center;background:${bg};
                    border-radius:6px;
                    display:flex;
                    justify-content:space-between;
                    margin-bottom:4px;
                    padding:8px;">
          <div style="align-items:center;display:flex;gap:5px;">
            ${icon} <span>${label}</span>
            <span style="color:#555;cursor:help;font-size:14px;" title="${beschrijving}">ℹ️</span>
          </div>
          <div>${makeStars(score)}</div>
        </div>`;
    })
    .join("");

  const affiliate = data.affiliates?.[0];
  const affiliateUrl = affiliate?.affiliate_url || "#";
  const partner = affiliate?.affiliate_partner || "Webshop";

  return `
    <div style="
      align-items:center;
      background:#fff;
      border-radius:12px;
      border:1px solid #ddd;
      box-shadow:rgba(0,0,0,0.05) 0px 4px 12px;
      display:flex;
      flex-wrap:wrap;
      font-family:Arial,sans-serif;
      margin-bottom:25px;
      padding:20px 25px 20px 20px;
      width:100%;">
      
      <!-- SCORES -->
      <div class="scores" style="flex:1 1 300px;min-width:250px;padding-right:20px;">
        <h3 style="color:#2c3e50;font-size:20px;margin-bottom:15px;">KoopKracht Scores</h3>
        ${scoreRows}
      </div>

      <!-- IMAGE -->
      <div class="product-image" style="flex:1 1 200px;margin-top:10px;min-width:200px;text-align:center;">
        <a href="${escapeHtml(affiliateUrl)}" target="_blank" rel="noopener noreferrer" style="margin:0 auto;display:inline-block;">
          <img src="https://blogger.googleusercontent.com/img/a/AVvXsEiCryJ3N69e7Q_GrOA43NhisYRevjBTPBqpr9hZCaxC6ZXyDs97wajRFHHTiiyRSEiM2tsDbqJ4frf-NtWE3-ZgUx9Gy5Im9_hLMnIYrXvEBQgxnVuYDBZgaFXkMcBVd08WwLTbpZs0q4A_DJPYWdXkh-DzeuLyO_pElYt9VgcFSoJ23y0DppQm4ZEIGq8C"
               alt="Product afbeelding"
               width="320"
               style="opacity:1;transition:opacity 0.3s;">
        </a>
      </div>

      <!-- AFFILIATE LINK -->
      <div class="affiliate-link-section" style="margin:25px 0;text-align:center;width:100%;">
        <a href="${escapeHtml(affiliateUrl)}" target="_blank" rel="noopener noreferrer"
           style="background:rgb(126,230,34);border-radius:6px;color:white;
                  display:inline-block;font-size:16px;font-weight:bold;
                  padding:14px 30px;text-decoration:none;transition:0.3s;">
          Bekijk op ${escapeHtml(partner)}
        </a>
        <div style="text-align:center;width:inherit;margin-top:6px;">
          <span style="font-size:small;">(affiliate link)</span>
        </div>
      </div>
    </div>`;
}

// === 4️⃣ INIT FUNCTIE ===
async function initKoopkracht(id, containerEl) {
  const el = containerEl;
  if (!el) return;
  el.innerHTML = "⏳ Koopkrachtgegevens laden...";

  try {
    const country = await getCountry();
    const url = `https://script.google.com/macros/s/AKfycbw_7AV-HIqLMy7iWWO9IKSXfjufFgSlChgcdqfcbZ2-I3Lg-jDh_yQN77BPSBwhw1Wl/exec?country=${country}&id=${encodeURIComponent(id)}`;
    const res = await fetch(url);
    const data = await res.json();
    el.innerHTML = data.success ? renderKoopkrachtBox(data) : "<p>Geen koopkrachtgegevens gevonden.</p>";
  } catch (err) {
    console.error("Fout bij laden:", err);
    el.innerHTML = "<p>Kon gegevens niet laden.</p>";
  }
}

// === 5️⃣ AUTOMATISCH INITIALISEREN (werkt op Blogger) ===
(function startKoopkracht() {
  const widgets = document.querySelectorAll(".koopkracht-widget");
  if (widgets.length === 0) return setTimeout(startKoopkracht, 300);
  widgets.forEach(div => {
    const id = div.dataset.id;
    initKoopkracht(id, div);
  });
})();
