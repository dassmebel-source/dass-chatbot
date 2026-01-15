(function () {
  // --- usuń poprzednie instancje (cache / podwójne wczytanie) ---
  try { document.getElementById("dassBox")?.remove(); } catch (e) {}
  try { document.getElementById("dassBtn")?.remove(); } catch (e) {}
  try { document.getElementById("dassStyle")?.remove(); } catch (e) {}

  // ====== USTAWIENIA ======
  const BRAND = "DassMebel";
  const OWNER_NAME = "Krzysztof";
  const PHONE_PRETTY = "534 705 014";
  const PHONE_TEL = "534705014";
  const EMAIL = "dass.mebel@gmail.com";
  const AREA = "Wrocław i okolice";

  // webhook Make (wklejony jak podałeś)
  const WEBHOOK_URL = "https://hook.eu1.make.com/kynppjcki7lx1gx3frnhywtq3g3sfsis";

  // ====== POMOCNICZE ======
  const esc = (s) =>
    String(s || "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[m]));

  const nowISO = () => new Date().toISOString();
  const isPhone = (s) => /^[0-9 +()-]{7,}$/.test(String(s || "").trim());
  const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());

  function normalizeText(t) {
    return String(t || "")
      .trim()
      .toLowerCase()
      .replace(/[ąćęłńóśźż]/g, (c) => ({
        ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z"
      }[c]));
  }

  // Rozpoznanie kategorii po tekście klienta
  function topicFromText(t) {
    if (/(kuchn)/.test(t)) return "Meble kuchenne";
    if (/(lazien|łazien|umywalk|szafka lazienk|lustro|blat lazien)/.test(t)) return "Meble łazienkowe";
    if (/(szaf|wn[eę]k|drzwi przesuw|przesuwn)/.test(t)) return "Szafy";
    if (/(garder)/.test(t)) return "Garderoby";
    if (/(zabud|indywid|nietyp|skos|komin|wneka nietyp)/.test(t)) return "Zabudowy indywidualne";
    return "";
  }

  // Tematy bardziej techniczne / trudniejsze -> kieruj do Krzysztofa
  function looksHardQuestion(t) {
    const hard =
      /(projekt|rysunek|wizualiz|pomiar|montaz|gwaranc|zalicz|faktura|umowa|raty|skos|komin|gaz|hydraul|instalac|agdr|blat kamien|spiek|kwarc|fornir|lakier|termin realiz|nietyp|wymiana instalac|przenies)/;
    return hard.test(t);
  }

  function contactCard() {
    return (
      `<b>Kontakt do ${OWNER_NAME}</b><br>` +
      `📞 <a href="tel:${PHONE_TEL}" style="color:inherit;text-decoration:underline">${PHONE_PRETTY}</a><br>` +
      `✉️ <a href="mailto:${EMAIL}" style="color:inherit;text-decoration:underline">${EMAIL}</a>`
    );
  }

  async function sendLead(payload) {
    if (!WEBHOOK_URL) return false;
    try {
      const r = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      return r.ok;
    } catch (e) {
      return false;
    }
  }

  // ====== STYLE ======
  const css = `
#dassBtn{
  position:fixed; right:18px; bottom:18px; z-index:99999;
  border:0; border-radius:999px; padding:12px 16px;
  font-weight:900; cursor:pointer;
  box-shadow:0 10px 25px rgba(0,0,0,.20);
  background:#111; color:#fff;
}
#dassBox{
  position:fixed; right:18px; bottom:78px;
  width:360px; height:580px; max-width:calc(100vw - 36px);
  background:#fff; border-radius:16px;
  box-shadow:0 18px 60px rgba(0,0,0,.25);
  display:none; z-index:99999; overflow:hidden;
  font-family:Arial,sans-serif;
}
#dassHead{
  background:linear-gradient(90deg,#111,#222);
  color:#fff; padding:12px;
  display:flex; align-items:center; justify-content:space-between;
}
#dassHead .ttl{font-weight:900;font-size:14px}
#dassHead .sub{font-size:12px;opacity:.85;margin-top:2px}
#dassClose{
  border:0; background:transparent; color:#fff;
  font-size:22px; cursor:pointer; line-height:1;
  padding:4px 8px; border-radius:10px;
}
#dassClose:hover{background:rgba(255,255,255,.12)}
#dassBody{
  padding:12px; height:415px; overflow:auto;
  background:#f6f7f9; font-size:14px;
}
#dassQuick{
  padding:10px 12px; background:#fff;
  border-top:1px solid #eee;
  display:flex; gap:8px; flex-wrap:wrap;
}
.dq{
  border:1px solid #ddd; background:#fff;
  border-radius:999px; padding:8px 10px;
  font-size:13px; cursor:pointer;
}
.dq:hover{background:#f2f2f2}
#dassInput{
  display:flex; border-top:1px solid #eee; background:#fff;
}
#dassInput input{
  flex:1; border:0; padding:12px 10px; font-size:14px; outline:none;
}
#dassInput button{
  border:0; padding:10px 12px; cursor:pointer; font-weight:900;
  background:#111; color:#fff;
}
.msg{margin:10px 0; display:flex}
.msg .b{
  max-width:86%; padding:10px 12px; border-radius:14px;
  line-height:1.35; white-space:pre-line;
}
.bot{justify-content:flex-start}
.bot .b{background:#fff;border:1px solid #e7e7e7}
.user{justify-content:flex-end}
.user .b{background:#111;color:#fff}
.small{font-size:12px;color:#666}
hr.sep{border:0;border-top:1px solid #eee;margin:10px 0}
  `;
  const style = document.createElement("style");
  style.id = "dassStyle";
  style.textContent = css;
  document.head.appendChild(style);

  // ====== UI ======
  const btn = document.createElement("button");
  btn.id = "dassBtn";
  btn.textContent = "💬 Kontakt / wycena";
  document.body.appendChild(btn);

  const box = document.createElement("div");
  box.id = "dassBox";
  box.innerHTML = `
    <div id="dassHead">
      <div>
        <div class="ttl">${BRAND} — szybki kontakt</div>
        <div class="sub">Zostaw szczegóły • oddzwonimy</div>
      </div>
      <button id="dassClose" aria-label="Zamknij">×</button>
    </div>
    <div id="dassBody"></div>
    <div id="dassQuick"></div>
    <div id="dassInput">
      <input id="dassTxt" placeholder="Napisz wiadomość lub wybierz kategorię…" autocomplete="off"/>
      <button id="dassSend">Wyślij</button>
    </div>
  `;
  document.body.appendChild(box);

  const body = box.querySelector("#dassBody");
  const quick = box.querySelector("#dassQuick");
  const input = box.querySelector("#dassTxt");
  const send = box.querySelector("#dassSend");
  const closeBtn = box.querySelector("#dassClose");

  function add(html, who = "bot") {
    const row = document.createElement("div");
    row.className = "msg " + who;
    const bubble = document.createElement("div");
    bubble.className = "b";
    bubble.innerHTML = html;
    row.appendChild(bubble);
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  function setQuick(buttons) {
    quick.innerHTML = "";
    (buttons || []).forEach(({ t, v }) => {
      const b = document.createElement("button");
      b.className = "dq";
      b.textContent = t;
      b.onclick = () => handle(v);
      quick.appendChild(b);
    });
  }

  function openChat() {
    box.style.display = "block";
    input.focus();
    if (!body.dataset.inited) {
      body.dataset.inited = "1";

      add(
        `<b>Witaj 👋</b><br><br>
         Ten czat ma <b>ułatwić szybki kontakt</b> i zebrać informacje do wyceny / realizacji.<br><br>
         📍 Działamy: <b>${AREA}</b><br>
         Jeśli wolisz od razu porozmawiać — ${contactCard()}<br>
         <hr class="sep">
         Wybierz rodzaj mebli lub opisz krótko, czego potrzebujesz:`
      );

      setQuick([
        { t: "🍽️ Meble kuchenne", v: "meble kuchenne" },
        { t: "🚿 Meble łazienkowe", v: "meble łazienkowe" },
        { t: "🚪 Szafy", v: "szafy" },
        { t: "👗 Garderoby", v: "garderoby" },
        { t: "🧰 Zabudowy indywidualne", v: "zabudowy indywidualne" },
        { t: "☎️ Kontakt", v: "kontakt" }
      ]);
    }
  }

  function toggleChat() {
    box.style.display = box.style.display === "block" ? "none" : "block";
    if (box.style.display === "block") openChat();
  }

  btn.onclick = toggleChat;
  closeBtn.onclick = () => (box.style.display = "none");

  // ====== FLOW ======
  const S = {
    step: "start",
    data: { type: "", city: "", dims: "", budget: "", timeline: "", notes: "", contact: "", message: "" }
  };

  function resetFlow() {
    S.step = "start";
    S.data = { type: "", city: "", dims: "", budget: "", timeline: "", notes: "", contact: "", message: "" };
    add(`<span class="small">OK — zaczynamy od nowa. Wybierz kategorię lub opisz temat.</span>`);
    setQuick([
      { t: "🍽️ Meble kuchenne", v: "meble kuchenne" },
      { t: "🚿 Meble łazienkowe", v: "meble łazienkowe" },
      { t: "🚪 Szafy", v: "szafy" },
      { t: "👗 Garderoby", v: "garderoby" },
      { t: "🧰 Zabudowy indywidualne", v: "zabudowy indywidualne" },
      { t: "☎️ Kontakt", v: "kontakt" }
    ]);
  }

  function routeToKrzysztof(reason) {
    add(
      `To temat, który najlepiej doprecyzuje <b>${OWNER_NAME}</b> 😊<br>
       <span class="small">${esc(reason || "Żeby odpowiedzieć dokładnie, potrzebujemy krótkiej konsultacji.")}</span><br><br>
       ${contactCard()}`,
      "bot"
    );
  }

  function askCity() { S.step = "askCity"; add(`OK 🙂 W jakim mieście ma być realizacja? <span class="small">(${AREA})</span>`); }
  function askDims() { S.step = "askDims"; add(`Podaj <b>wymiary</b> lub krótki opis (np. „2,5 m + 2,0 m, narożna, do sufitu”). Jeśli nie masz — napisz „brak”.`); }
  function askBudget() { S.step = "askBudget"; add(`Masz orientacyjny <b>budżet</b>? (np. „10–15 tys.” albo „nie wiem”)`); }
  function askTimeline() { S.step = "askTimeline"; add(`Na kiedy ma być realizacja? (np. „ASAP”, „za 2 miesiące”, „marzec”)`); }
  function askNotes() { S.step = "askNotes"; add(`Dodatkowe informacje? (np. „fronty lakier”, „blat spiek”, „AGD w zabudowie”, „skos/komin”). Jeśli nie — napisz „brak”.`); }
  function askContact() { S.step = "askContact"; add(`Na koniec zostaw <b>telefon lub email</b> — ${OWNER_NAME} odezwie się po sprawdzeniu szczegółów.`); }

  function summaryHTML() {
    const d = S.data;
    return `
<b>Podsumowanie</b><br>
• Rodzaj: <b>${esc(d.type || "-")}</b><br>
• Miasto: <b>${esc(d.city || "-")}</b><br>
• Wymiary/opis: <b>${esc(d.dims || "-")}</b><br>
• Budżet: <b>${esc(d.budget || "-")}</b><br>
• Termin: <b>${esc(d.timeline || "-")}</b><br>
• Dodatkowe info: <b>${esc(d.notes || "-")}</b><br>
• Kontakt: <b>${esc(d.contact || "-")}</b>
    `.trim();
  }

  async function finalizeAndSend() {
    const payload = {
      type: S.data.type,
      city: S.data.city,
      dims: S.data.dims,
      budget: S.data.budget,
      timeline: S.data.timeline,
      notes: S.data.notes,
      contact: S.data.contact,
      message: S.data.message,
      page: location.href,
      time: nowISO()
    };

    const ok = await sendLead(payload);

    add(summaryHTML(), "bot");
    add(`<hr class="sep">${ok ? "✅" : "ℹ️"} Dziękuję! <b>${OWNER_NAME}</b> odezwie się wkrótce.<br><br>${contactCard()}`, "bot");

    setQuick([
      { t: "➕ Nowe zapytanie", v: "restart" },
      { t: "☎️ Kontakt", v: "kontakt" }
    ]);

    S.step = "done";
  }

  // ====== GŁÓWNA LOGIKA ======
  async function handle(raw) {
    const text = String(raw || "").trim();
    if (!text) return;

    add(esc(text), "user");
    const t = normalizeText(text);

    // Komendy / szybkie intencje
    if (/(restart|od nowa|reset)/.test(t)) { resetFlow(); return; }
    if (/(kontakt|telefon|mail|email|zadzwo|oddzwon)/.test(t)) { add(`Jasne 🙂<br>${contactCard()}`, "bot"); return; }
    if (/(pomiar|spotkanie|konsultac|termin)/.test(t) && S.step === "start") {
      routeToKrzysztof("W sprawie terminu pomiaru/spotkania proszę o kontakt — ustalimy dogodny dzień.");
      return;
    }

    // Jeśli temat wygląda na techniczny / trudny (na starcie) — kieruj do Krzysztofa
    if (looksHardQuestion(t) && S.step === "start") {
      routeToKrzysztof("To kwestia techniczna/nietypowa — najłatwiej doprecyzować ją w krótkiej rozmowie.");
      return;
    }

    // Wykryj kategorię (albo z przycisków, albo z tekstu)
    const detectedType = topicFromText(t);

    if (S.step === "start") {
      if (detectedType) {
        S.data.type = detectedType;
        S.data.message = text;
        setQuick([]);
        askCity();
        return;
      }
      // brak typu -> poproś o wybór
      add(`Wybierz proszę rodzaj mebli (przyciski) albo napisz np. „meble kuchenne”.`, "bot");
      return;
    }

    // Zbieranie danych
    if (S.step === "askCity") { S.data.city = text; askDims(); return; }
    if (S.step === "askDims") { S.data.dims = (t === "brak") ? "" : text; askBudget(); return; }
    if (S.step === "askBudget") { S.data.budget = text; askTimeline(); return; }
    if (S.step === "askTimeline") { S.data.timeline = text; askNotes(); return; }
    if (S.step === "askNotes") { S.data.notes = (t === "brak") ? "" : text; askContact(); return; }

    if (S.step === "askContact") {
      if (!isPhone(text) && !isEmail(text)) {
        add(`To nie wygląda jak telefon ani email 🙂 Podaj numer (np. ${PHONE_PRETTY}) albo email.`, "bot");
        return;
      }
      S.data.contact = text;
      await finalizeAndSend();
      return;
    }

    if (S.step === "done") {
      add(`Jeśli chcesz nowe zapytanie, kliknij <b>➕ Nowe zapytanie</b> lub napisz „restart”.`, "bot");
      return;
    }

    // Awaryjnie
    add(`Daj mi proszę chwilę 🙂 Jeśli to temat nietypowy, najlepiej: ${contactCard()}`, "bot");
  }

  function sendFromInput() {
    const v = input.value.trim();
    if (!v) return;
    input.value = "";
    handle(v);
  }

  send.onclick = sendFromInput;
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") sendFromInput(); });

  btn.addEventListener("click", openChat, { once: true });
})();
