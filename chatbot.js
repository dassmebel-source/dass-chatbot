(function () {
  // Usuń poprzednie instancje (cache / podwójne wczytanie)
  try { document.getElementById("dassBox")?.remove(); } catch (e) {}
  try { document.getElementById("dassBtn")?.remove(); } catch (e) {}
  try { document.getElementById("dassStyle")?.remove(); } catch (e) {}

  // ====== USTAWIENIA ======
  const BRAND = "DassMebel";
  const OWNER_NAME = "Pan Krzysztof";
  const PHONE_PRETTY = "534 705 014";
  const PHONE_TEL = "534705014";
  const EMAIL = "dass.mebel@gmail.com";
  const AREA = "Wrocław i okolice";

  // Wklej tutaj SWÓJ webhook z Make:
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

  function looksHardQuestion(t) {
    const hard =
      /(dokladna wycena|projekt|rysunek|wizualiz|pomiar|montaz|gwaranc|zalicz|faktura|umowa|raty|skos|komin|gaz|hydraul|instalac|agdr|blat kamien|spiek|kwarc|fornir|lakier|termin realiz)/;
    return hard.test(t);
  }

  function topicFromText(t) {
    if (/(kuchn)/.test(t)) return "Kuchnia";
    if (/(garder|szafa|wn[eę]ka|drzwi przesuw)/.test(t)) return "Garderoba";
    if (/(lazien|łazien|umywalk|szafka lazienk)/.test(t)) return "Łazienka";
    if (/(biurk|pokoj|salon|sypialn|komod|regal)/.test(t)) return "Inne";
    return "";
  }

  function moneyHint(type) {
    if (type === "Kuchnia") {
      return (
        "Cena kuchni na wymiar zależy od długości zabudowy, frontów, blatu i wyposażenia.\n" +
        "Podaj: miasto + wymiary (np. 2,5 m + 2,0 m) + preferencje — podam orientacyjne widełki."
      );
    }
    if (type === "Garderoba") {
      return (
        "Cena garderoby/szafy zależy od wymiarów, systemu drzwi i wyposażenia (szuflady, kosze, drążki).\n" +
        "Podaj wymiary + miasto — podam orientacyjne widełki."
      );
    }
    if (type === "Łazienka") {
      return (
        "Zabudowa łazienkowa zależy od wymiarów i materiałów (wilgocioodporność).\n" +
        "Podaj wymiary + miasto — podam orientacyjne widełki."
      );
    }
    return (
      "Żeby oszacować koszt, potrzebuję: typu mebli + wymiarów + miasta.\n" +
      "Napisz te informacje, a przygotuję orientacyjne widełki."
    );
  }

  function contactCard() {
    return (
      `<b>Kontakt do ${OWNER_NAME}</b><br>` +
      `📞 <a href="tel:${PHONE_TEL}" style="color:inherit;text-decoration:underline">${PHONE_PRETTY}</a><br>` +
      `✉️ <a href="mailto:${EMAIL}" style="color:inherit;text-decoration:underline">${EMAIL}</a>`
    );
  }

  async function sendLead(payload) {
    if (!WEBHOOK_URL || WEBHOOK_URL.includes("TUTAJ_WKLEJ")) return false;
    try {
      const r = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return r.ok;
    } catch (e) {
      return false;
    }
  }

  // ====== STYLE ======
  const css = `
#dassBtn{position:fixed;right:18px;bottom:18px;z-index:99999;border:0;border-radius:999px;padding:12px 16px;font-weight:900;cursor:pointer;box-shadow:0 10px 25px rgba(0,0,0,.2);background:#111;color:#fff}
#dassBox{position:fixed;right:18px;bottom:78px;width:360px;height:560px;max-width:calc(100vw - 36px);background:#fff;border-radius:16px;box-shadow:0 18px 60px rgba(0,0,0,.25);display:none;z-index:99999;overflow:hidden;font-family:Arial,sans-serif}
#dassHead{background:#111;color:#fff;padding:12px;display:flex;align-items:center;justify-content:space-between}
#dassHead .ttl{font-weight:900;font-size:14px}
#dassHead .sub{font-size:12px;opacity:.85;margin-top:2px}
#dassClose{border:0;background:transparent;color:#fff;font-size:22px;cursor:pointer;line-height:1;padding:4px 8px;border-radius:10px}
#dassClose:hover{background:rgba(255,255,255,.12)}
#dassBody{padding:12px;height:395px;overflow:auto;background:#f6f7f9;font-size:14px}
#dassQuick{padding:10px 12px;background:#fff;border-top:1px solid #eee;display:flex;gap:8px;flex-wrap:wrap}
.dq{border:1px solid #ddd;background:#fff;border-radius:999px;padding:8px 10px;font-size:13px;cursor:pointer}
.dq:hover{background:#f2f2f2}
#dassInput{display:flex;border-top:1px solid #eee;background:#fff}
#dassInput input{flex:1;border:0;padding:12px 10px;font-size:14px;outline:none}
#dassInput button{border:0;padding:10px 12px;cursor:pointer;font-weight:900;background:#111;color:#fff}
.msg{margin:10px 0;display:flex}
.msg .b{max-width:86%;padding:10px 12px;border-radius:14px;line-height:1.35;white-space:pre-line}
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
  btn.textContent = "💬 Szybka wycena";
  document.body.appendChild(btn);

  const box = document.createElement("div");
  box.id = "dassBox";
  box.innerHTML = `
    <div id="dassHead">
      <div>
        <div class="ttl">${BRAND} — szybki kontakt</div>
        <div class="sub">Wycena • terminy • pytania</div>
      </div>
      <button id="dassClose" aria-label="Zamknij">×</button>
    </div>
    <div id="dassBody"></div>
    <div id="dassQuick"></div>
    <div id="dassInput">
      <input id="dassTxt" placeholder="Napisz: kuchnia / garderoba / łazienka / wycena…" autocomplete="off"/>
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
         Ten czat ma <b>ułatwić szybki kontakt</b> i zebrać informacje do wyceny.<br><br>
         📍 Działamy: <b>${AREA}</b><br>
         Jeśli wolisz od razu porozmawiać — ${contactCard()}<br>
         <hr class="sep">
         Napisz temat (np. <b>kuchnia</b>, <b>garderoba</b>, <b>łazienka</b>) albo kliknij przycisk:`
      );
      setQuick([
        { t: "🍽️ Kuchnia", v: "kuchnia" },
        { t: "👗 Garderoba / szafa", v: "garderoba" },
        { t: "🚿 Łazienka", v: "lazienka" },
        { t: "💰 Pytanie o cenę", v: "cena" },
        { t: "📅 Termin / pomiar", v: "pomiar" },
        { t: "☎️ Kontakt", v: "kontakt" },
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
    data: { type: "", city: "", dims: "", budget: "", timeline: "", contact: "", notes: "" },
  };

  function askCity() { S.step = "askCity"; add(`OK 🙂 W jakim mieście ma być realizacja? <span class="small">(${AREA})</span>`); }
  function askDims() { S.step = "askDims"; add(`Podaj <b>wymiary</b> lub krótki opis (np. „2,5 m + 2,0 m, narożna, do sufitu”). Jeśli nie masz — napisz „brak”.`); }
  function askBudget() { S.step = "askBudget"; add(`Masz orientacyjny <b>budżet</b>? (np. „10–15 tys.” albo „nie wiem”)`); }
  function askTimeline() { S.step = "askTimeline"; add(`Na kiedy ma być realizacja? (np. „ASAP”, „za 2 miesiące”, „marzec”)`); }
  function askNotes() { S.step = "askNotes"; add(`Dodatkowe info? (np. „fronty lakier”, „blat spiek”, „AGD w zabudowie”, „skos/komin”). Jeśli nie — napisz „brak”.`); }
  function askContact() { S.step = "askContact"; add(`Na koniec zostaw <b>telefon lub email</b> — ${OWNER_NAME} odezwie się z konkretną informacją.`); }

  function summaryHTML() {
    const d = S.data;
    return `
<b>Podsumowanie zapytania</b><br>
• Typ: <b>${esc(d.type || "-")}</b><br>
• Miasto: <b>${esc(d.city || "-")}</b><br>
• Wymiary/opis: <b>${esc(d.dims || "-")}</b><br>
• Budżet: <b>${esc(d.budget || "-")}</b><br>
• Termin: <b>${esc(d.timeline || "-")}</b><br>
• Kontakt: <b>${esc(d.contact || "-")}</b><br>
• Dodatkowe info: <b>${esc(d.notes || "-")}</b>
    `.trim();
  }

  function routeToOwner(reason) {
    add(
      `To temat, który najlepiej doprecyzuje <b>${OWNER_NAME}</b> 😊<br>
       <span class="small">${esc(reason || "Żeby odpowiedzieć precyzyjnie, potrzebujemy kilku szczegółów.")}</span><br><br>
       ${contactCard()}`
    );
  }

  async function finalizeAndSend() {
    const payload = {
      type: S.data.type,
      city: S.data.city,
      dims: S.data.dims,
      budget: S.data.budget,
      timeline: S.data.timeline,
      contact: S.data.contact,
      notes: S.data.notes,
      page: location.href,
      time: nowISO(),
    };
    const ok = await sendLead(payload);
    add(summaryHTML(), "bot");
    add(`<hr class="sep">${ok ? "✅" : "ℹ️"} Dziękuję! ${OWNER_NAME} odezwie się po sprawdzeniu szczegółów.<br><br>${contactCard()}`, "bot");
    setQuick([
      { t: "➕ Nowe zapytanie", v: "restart" },
      { t: "💰 Pytanie o cenę", v: "cena" },
      { t: "☎️ Kontakt", v: "kontakt" },
    ]);
    S.step = "done";
  }

  async function handle(raw) {
    const text = String(raw || "").trim();
    if (!text) return;

    add(esc(text), "user");
    const t = normalizeText(text);

    if (/(restart|od nowa|reset)/.test(t)) {
      S.step = "start";
      S.data = { type: "", city: "", dims: "", budget: "", timeline: "", contact: "", notes: "" };
      add(`<span class="small">OK — zaczynamy od nowa. Napisz: <b>kuchnia</b> / <b>garderoba</b> / <b>łazienka</b> / <b>cena</b>.</span>`);
      setQuick([
        { t: "🍽️ Kuchnia", v: "kuchnia" },
        { t: "👗 Garderoba", v: "garderoba" },
        { t: "🚿 Łazienka", v: "lazienka" },
        { t: "💰 Pytanie o cenę", v: "cena" },
        { t: "☎️ Kontakt", v: "kontakt" },
      ]);
      return;
    }

    if (/(kontakt|telefon|mail|email|zadzwo|oddzwon)/.test(t)) {
      add(`Jasne 🙂<br>${contactCard()}`, "bot");
      return;
    }

    if (/(pomiar|spotkanie|konsultac|termin)/.test(t) && S.step === "start") {
      routeToOwner("W sprawie terminu pomiaru/spotkania proszę o kontakt — ustalimy dogodny dzień.");
      return;
    }

    if (looksHardQuestion(t) && S.step === "start") {
      routeToOwner("To kwestia wymagająca krótkiej konsultacji (warunki techniczne/projekt). Najlepiej skontaktować się bezpośrednio.");
      return;
    }

    const detectedType = topicFromText(t);

    if (detectedType && S.step === "start") {
      S.data.type = detectedType;
      setQuick([]);
      askCity();
      return;
    }

    if (/(ile|cena|koszt|kosztuje|wycena)/.test(t) && S.step === "start") {
      S.data.type = detectedType || S.data.type || "";
      add(esc(moneyHint(S.data.type)).replace(/\n/g, "<br>"), "bot");
      S.step = "askType";
      add(`Żeby przygotować wycenę: jaki typ mebli? <b>kuchnia</b> / <b>garderoba</b> / <b>łazienka</b> / inne`, "bot");
      setQuick([
        { t: "🍽️ Kuchnia", v: "kuchnia" },
        { t: "👗 Garderoba", v: "garderoba" },
        { t: "🚿 Łazienka", v: "lazienka" },
        { t: "🧰 Inne", v: "inne" },
      ]);
      return;
    }

    if (S.step === "askType") {
      const type = detectedType || (/(inne|inny)/.test(t) ? "Inne" : "");
      if (!type) { add(`Napisz proszę: kuchnia / garderoba / łazienka / inne.`, "bot"); return; }
      S.data.type = type;
      setQuick([]);
      askCity();
      return;
    }

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

    add(`Mogę pomóc w wycenie 🙂 Napisz: <b>kuchnia</b>, <b>garderoba</b>, <b>łazienka</b> albo <b>cena</b>.`, "bot");
  }

  function sendFromInput() {
    const v = input.value.trim();
    if (!v) return;
    input.value = "";
    handle(v);
  }

  send.onclick = sendFromInput;
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") sendFromInput(); });

  // pierwsze kliknięcie inicjuje treść
  btn.addEventListener("click", openChat, { once: true });
})();
