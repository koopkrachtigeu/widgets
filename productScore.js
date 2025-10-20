/* =====================================================
 🛍️ KOOPKRACHT WIDGET v1.4
 Compact mode + pixel-perfect layout (alternating rows)
 ===================================================== */

// === 1️⃣ LAND OPHALEN VIA IP ===
async function getCountry() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return data.country_code || "NL";
  } catch {
    return "NL";
  }
}

// === 2️⃣ HELPERS ===
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

// === 3️⃣ RENDER FUNCTIE ===
function renderKoopkrachtBox(data, compact = false) {
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
                    margin-bottom:${compact ? 2 : 4}px;
                    padding:${compact ? 5 : 8}px;">
          <div style="align-items:center;display:flex;gap:${compact ? 3 : 5}px;">
            ${icon} <span>${label}</span>
            <span style="color:#555;cursor:help;font-size:${compact ? 12 : 14}px;" title="${beschrijving}">ℹ️</span>
          </div>
          <div style="font-size:${compact ? 13 : 16}px;">${makeStars(score)}</div>
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
      margin-bottom:20px;
      padding:${compact ? "15px 20px" : "20px 25px 20px 20px"};
      width:100%;
      font-size:${compact ? "14px" : "16px"};">
      
      <!-- SCORES -->
      <div class="scores" style="flex:1 1 250px;min-width:230px;padding-right:15px;">
        <h3 style="color:#2c3e50;font-size:${compact ? 17 : 20}px;margin-bottom:${compact ? 10 : 15}px;">KoopKracht Scores</h3>
        ${scoreRows}
      </div>

      <!-- IMAGE -->
      <div class="product-image" style="flex:1 1 180px;margin-top:${compact ? 6 : 10}px;min-width:180px;text-align:center;">
        <a href="${escapeHtml(affiliateUrl)}" target="_blank" rel="noopener noreferrer">
          <img src="https://blogger.googleusercontent.com/img/a/AVvXsEiCryJ3N69e7Q_GrOA43NhisYRevjBTPBqpr9hZCaxC6ZXyDs97wajRFHHTiiyRSEiM2tsDbqJ4frf-NtWE3-ZgUx9Gy5Im9_hLMnIYrXvEBQgxnVuYDBZgaFXkMcBVd08WwLTbpZs0q4A_DJPYWdXkh-DzeuLyO_pElYt9VgcFSoJ23y0DppQm4ZEIGq8C"
               alt="Product afbeelding"
               width="${compact ? 220 : 320}"
               style="opacity:1;transition:opacity 0.3s;">
        </a>
      </div>

      <!-- AFFILIATE LINK -->
      <div class="affiliate-link-section" style="margin:${compact ? 18 : 25}px 0;text-align:center;width:100%;">
        <a href="${escapeHtml(affiliateUrl)}" target="_blank" rel="noopener noreferrer"
           style="background:rgb(126,230,34);border-radius:6px;color:white;
                  display:inline-block;font-size:${compact ? 14 : 16}px;font-weight:bold;
                  padding:${compact ? "10px 20px" : "14px 30px"};text-decoration:none;transition:0.3s;">
          Bekijk op ${escapeHtml(partner)}
        </a>
        <div style="text-align:center;width:inherit;margin-top:5px;">
          <span style="font-size:${compact ? "x-small" : "small"};">(affiliate link)</span>
        </div>
      </div>
    </div>`;
}

// === 4️⃣ INIT ===
async function initKoopkracht(id, containerEl) {
  if (!containerEl) return;
  const compact = containerEl.classList.contains("compact");
  containerEl.innerHTML = "⏳ Koopkrachtgegevens laden...";
  try {
    const country = await getCountry();
    const url = `https://script.google.com/macros/s/AKfycbw_7AV-HIqLMy7iWWO9IKSXfjufFgSlChgcdqfcbZ2-I3Lg-jDh_yQN77BPSBwhw1Wl/exec?country=${country}&id=${encodeURIComponent(id)}`;
    const res = await fetch(url);
    const data = await res.json();
    containerEl.innerHTML = data.success
      ? renderKoopkrachtBox(data, compact)
      : "<p>Geen koopkrachtgegevens gevonden.</p>";
  } catch (err) {
    console.error("Fout bij laden:", err);
    containerEl.innerHTML = "<p>Kon gegevens niet laden.</p>";
  }
}

// === 5️⃣ AUTO INIT ===
(function startKoopkracht() {
  const widgets = document.querySelectorAll(".koopkracht-widget");
  if (widgets.length === 0) return setTimeout(startKoopkracht, 300);
  widgets.forEach(div => {
    const id = div.dataset.id;
    initKoopkracht(id, div);
  });
})();
