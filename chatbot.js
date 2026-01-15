(function(){
  if (window.__dassChatLoaded) return;
  window.__dassChatLoaded = true;

  // ====== USTAWIENIA (opcjonalnie uzupełnij) ======
  const BRAND = "DassMebel";
  const PHONE = ""; // np. "+48 123 456 789"
  const EMAIL = ""; // np. "kontakt@dassmebel.pl"
  const AREA  = ""; // np. "Wrocław i okolice"

  // ====== STYLE ======
  const css = `
#dassBtn{position:fixed;right:18px;bottom:18px;z-index:99999;border:0;border-radius:999px;padding:12px 16px;font-weight:700;cursor:pointer;box-shadow:0 10px 25px rgba(0,0,0,.2);background:#fff}
#dassBox{position:fixed;right:18px;bottom:78px;width:340px;height:520px;max-width:calc(100vw - 36px);background:#fff;border-radius:14px;box-shadow:0 18px 60px rgba(0,0,0,.25);display:none;z-index:99999;font-family:Arial,sans-serif;overflow:hidden}
#dassHead{background:#111;color:#fff;padding:10px 12px;font-weight:800;display:flex;align-items:center;justify-content:space-between}
#dassClose{background:transparent;border:0;color:#fff;font-size:20px;cursor:pointer;line-height:1}
#dassBody{padding:10px;height:380px;overflow:auto;font-size:14px;background:#fafafa}
#dassQuick{padding:8px 10px;background:#fff;border-top:1px solid #eee;display:flex;gap:8px;flex-wrap:wrap}
.dq{border:1px solid #ddd;background:#fff;border-radius:999px;padding:7px 10px;font-size:13px;cursor:pointer}
#dassInput{display:flex;border-top:1px solid #eee;background:#fff}
#dassInput input{flex:1;border:0;padding:11px 10px;font-size:14px;outline:none}
#dassInput button{border:0;padding:10px 12px;cursor:pointer;font-weight:800;background:#111;color:#fff}
.msg{margin:8px 0;display:flex}
.msg .b{max-width:85%;padding:9px 11px;border-radius:12px;line-height:1.35}
.bot{justify-content:flex-start}
.bot .b{background:#fff;border:1px solid #e7e7e7}
.user{justify-content:flex-end}
.user .b{background:#111;color:#fff}
.small{font-size:12px;color:#666}
a.dlink{color:inherit;text-decoration:underline}
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ====== UI ======
  const btn = document.createElement("button");
  btn.id = "dassBtn";
  btn.textContent = "💬 Zapytaj o meble";
  document.body.appendChild(btn);

  const box = document.createElement("div");
  box.id = "dassBox";
  box.innerHTML = `
    <div id="dassHead">
      <div>${BRAND} – szybka wycena</div>
      <button id="dassClose" aria-label="Zamknij">×</button>
    </div>
    <div id="dassBody"></div>
    <div id="dassQuick"></div>
    <div id="dassInput">
      <input id="dassTxt" placeholder="Napisz tutaj..." autocomplete="off" />
      <button id="dassSend">OK</button>
    </div>`;
  document.body.appendChild(box);

  const body = box.querySelector("#dassBody");
  const quick = box.querySelector("#dassQuick");
  const input = box.querySelector("#dassTxt");
  const send = box.querySelector("#dassSend");
  const closeBtn = box.querySelector("#dassClose");

  function add(text, who="bot"){
    const row = document.createElement("div");
    row.className = "msg " + who;
    const bubble = document.createElement("div");
    bubble.className = "b";
    bubble.innerHTML = text;
    row.appendChild(bubble);
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  function setQuick(buttons){
    quick.innerHTML = "";
    (buttons || []).forEach(({t,v})=>{
      const b = document.createElement("button");
      b.className = "dq";
      b.textContent = t;
      b.onclick = ()=>handle(v);
      quick.appendChild(b);
    });
  }

  function openChat(){
    box.style.display = "block";
    input.focus();
    if (!body.dataset.inited){
      body.dataset.inited = "1";
      add(`Cześć 👋 Napisz: <b>kuchnia</b>, <b>garderoba</b>, <b>łazienka</b> lub <b>wycena</b>.`);
      add(`<span class="small">Podaj też miasto i (jeśli masz) wymiary — szybciej oszacujemy koszt.</span>`);
      setQuick([
        {t:"Kuchnia", v:"kuchnia"},
        {t:"Garderoba", v:"garderoba"},
        {t:"Łazienka", v:"lazienka"},
        {t:"Wycena", v:"wycena"},
        {t:"Ile kosztuje?", v:"cena"}
      ]);
    }
  }

  function toggleChat(){
    box.style.display = (box.style.display === "block") ? "none" : "block";
    if (box.style.display === "block") input.focus();
  }

  btn.onclick = toggleChat;
  closeBtn.onclick = ()=> box.style.display = "none";

  // ====== LOGIKA ROZMOWY (stan) ======
  const S = {
    step: "start",
    data: { type:"", city:"", dims:"", budget:"", timeline:"", contact:"" }
  };

  const isPhone = s => /^[0-9 +()-]{7,}$/.test(s);
  const isEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

  function summarize(){
    const d = S.data;
    return `
      <b>Podsumowanie</b><br>
      • Typ: <b>${d.type||"-"}</b><br>
      • Miasto: <b>${d.city||"-"}</b><br>
      • Wymiary/opis: <b>${d.dims||"-"}</b><br>
      • Budżet: <b>${d.budget||"-"}</b><br>
      • Termin: <b>${d.timeline||"-"}</b><br>
      • Kontakt: <b>${d.contact||"-"}</b>
    `;
  }

  function priceHint(type){
    if (type === "Kuchnia") return "Cena kuchni zależy głównie od długości zabudowy, rodzaju frontów i blatu oraz sprzętu. Daj mi: miasto + wymiary (np. 2,5m + 2m) + styl/budżet, to podam widełki.";
    if (type === "Garderoba") return "Cena garderoby zależy od wymiarów (szer./wys./gł.) i wyposażenia (szuflady, kosze, drążki). Podaj mi wymiary i miasto, to podam widełki.";
    if (type === "Łazienka") return "Cena zabudowy łazienkowej zależy od wymiarów i materiałów (wilgocioodporność). Podaj mi wymiary i miasto — podam widełki.";
    return "Podaj mi typ mebli + wymiary + miasto, a podam orientacyjne widełki.";
  }

  function handle(raw){
    const text = (raw||"").toString().trim();
    if (!text) return;

    // jeśli user kliknął quick button, nie pokazujemy tego jako user message? — pokażmy, żeby było czytelnie
    add(text, "user");

    const t = text.toLowerCase();

    // szybkie rozpoznanie tematu
    if (/(kuchn)/.test(t)) { S.data.type="Kuchnia"; S.step="askCity"; add("OK 🙂 W jakim mieście ma być realizacja?"+(AREA?` (obszar: ${AREA})`:""),"bot"); setQuick([]); return; }
    if (/(garder)/.test(t)) { S.data.type="Garderoba"; S.step="askCity"; add("Jasne 🙂 W jakim mieście?","bot"); setQuick([]); return; }
    if (/(łazien|lazien)/.test(t)) { S.data.type="Łazienka"; S.step="askCity"; add("OK 🙂 W jakim mieście?","bot"); setQuick([]); return; }
    if (/(wycena)/.test(t)) { S.step="askType"; add("Super. Jakie meble: kuchnia / garderoba / łazienka / inne?","bot"); setQuick([{t:"Kuchnia",v:"kuchnia"},{t:"Garderoba",v:"garderoba"},{t:"Łazienka",v:"lazienka"}]); return; }

    // pytania o cenę
    if (/(ile|cena|koszt|kosztuje)/.test(t)){
      add(priceHint(S.data.type), "bot");
      if (S.step === "start") {
        S.step = "askType";
        add("Napisz proszę: kuchnia / garderoba / łazienka + (jeśli masz) wymiary.", "bot");
      }
      return;
    }

    // obsługa kroków (zbieranie danych)
    if (S.step === "askType"){
      add("Napisz proszę: kuchnia / garderoba / łazienka (albo kliknij przycisk).", "bot");
      return;
    }

    if (S.step === "askCity"){
      S.data.city = text;
      S.step = "askDims";
      add("Dzięki. Masz wymiary / krótki opis? (np. 2,5m + 2m, narożna, wysokość do sufitu). Jeśli nie – napisz „brak”.", "bot");
      return;
    }

    if (S.step === "askDims"){
      S.data.dims = (t === "brak") ? "" : text;
      S.step = "askBudget";
      add("Masz orientacyjny budżet? (np. 8–12 tys., 15 tys., albo „nie wiem”)", "bot");
      return;
    }

    if (S.step === "askBudget"){
      S.data.budget = text;
      S.step = "askTimeline";
      add("Na kiedy ma być realizacja? (np. ASAP / za 2 miesiące / marzec)", "bot");
      return;
    }

    if (S.step === "askTimeline"){
      S.data.timeline = text;
      S.step = "askContact";
      add("Podaj proszę kontakt (telefon lub email), a oddzwonimy/odpiszemy z wyceną.", "bot");
      return;
    }

    if (S.step === "askContact"){
      if (!isPhone(text) && !isEmail(text)){
        add("To nie wygląda jak telefon ani email 🙂 Podaj proszę numer (np. +48…) albo email.", "bot");
        return;
      }
      S.data.contact = text;
      S.step = "done";
      add(summarize(), "bot");
      const contactLine =
        PHONE ? `📞 <a class="dlink" href="tel:${PHONE}">${PHONE}</a>` : "";
      const mailLine =
        EMAIL ? `✉️ <a class="dlink" href="mailto:${EMAIL}">${EMAIL}</a>` : "";
      add(`✅ Dzięki! Przekazuję zgłoszenie. ${contactLine} ${mailLine}`.trim(), "bot");
      setQuick([{t:"Nowe pytanie",v:"wycena"},{t:"Ile kosztuje?",v:"cena"}]);
      return;
    }

    // fallback (gdy nie jest w flow)
    add("OK 🙂 Napisz proszę: kuchnia / garderoba / łazienka / wycena albo zapytaj o koszt (np. „ile kosztuje szafa 2,5m”).", "bot");
  }

  function sendFromInput(){
    const v = input.value.trim();
    if(!v) return;
    input.value = "";
    handle(v);
  }

  send.onclick = sendFromInput;
  input.addEventListener("keydown", e => { if(e.key === "Enter") sendFromInput(); });

  // auto-otwarcie na mobile nie robimy; użytkownik klika przycisk
  // ale pierwsze kliknięcie przygotuje treść:
  btn.addEventListener("click", openChat, {once:true});
})();
