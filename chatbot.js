(function () {
  // --- odporność na podwójne wczytanie / cache ---
  try { document.getElementById("dassBox")?.remove(); } catch(e){}
  try { document.getElementById("dassBtn")?.remove(); } catch(e){}
  try { document.getElementById("dassStyle")?.remove(); } catch(e){}

  // ====== USTAWIENIA ======
  const BRAND = "DassMebel";
  const OWNER_NAME = "Pan Krzysztof";
  const PHONE_PRETTY = "534 705 014";
  const PHONE_TEL = "534705014";
  const EMAIL = "dass.mebel@gmail.com";
  const AREA = "Wrocław i okolice";

  // Wklej tutaj swój webhook z Make:
  const WEBHOOK_URL = "https://hook.eu1.make.com/kynppjcki7lx1gx3frnhywtq3g3sfsis";

  // ====== POMOCNICZE ======
  const esc = (s) => String(s || "").replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
  const nowISO = () => new Date().toISOString();

  const isPhone = (s) => /^[0-9 +()-]{7,}$/.test(String(s || "").trim());
  const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());

  function normalizeText(t){
    return String(t||"")
      .trim()
      .toLowerCase()
      .replace(/[ąćęłńóśźż]/g, (c)=>({ą:"a",ć:"c",ę:"e",ł:"l",ń:"n",ó:"o",ś:"s",ź:"z",ż:"z"}[c]));
  }

  function looksHardQuestion(t){
    // Pytania typowo "trudne" / wymagające konsultacji:
    const hard =
      /(dokladna wycena|dokladnie ile|projekt|rysunek|wizualiz|pomiar|montaz|termin realiz|gwaranc|zalicz|faktura|umowa|raty|przyjazd|nietyp|skos|komin|gaz|hydraul|przenies|instalac|agdr w zabudow|blat kamien|spiek|kwarc|lakier|fornir|okap|zlew|plyta|elektryk)/;
    return hard.test(t);
  }

  function topicFromText(t){
    if (/(kuchn)/.test(t)) return "Kuchnia";
    if (/(garder|szafa|wn[eę]ka|drzwi przesuw)/.test(t)) return "Garderoba";
    if (/(lazien|łazien|szafka lazienk|umywalk)/.test(t)) return "Łazienka";
    if (/(biurk|pokoj|salon|sypialn|komod|regal)/.test(t)) return "Inne";
    return "";
  }

  function moneyHint(type){
    // Nie obiecujemy konkretnych cen — dajemy widełki orientacyjnie + co wpływa.
    // Jeśli nie chcesz widełek — mogę to wyłączyć.
    if (type === "Kuchnia") {
      return (
        "Cena kuchni na wymiar zależy głównie od: długości zabudowy, rodzaju frontów (np. laminat/lakier), blatu oraz wyposażenia (szuflady, kosze, cargo) i AGD.\n" +
        "Daj mi: miasto + wymiary (np. 2,5 m + 2,0 m) + preferencje (fronty/blat) — podam orientacyjne widełki."
      );
    }
    if (type === "Garderoba") {
      return (
        "Cena garderoby/szafy zależy od: wymiarów (szer./wys./gł.), ilości drzwi, systemu (przesuwne/uchylne) i wyposażenia (szuflady, kosze, drążki, oświetlenie).\n" +
        "Podaj wymiary + miasto — podam orientacyjne widełki."
      );
    }
    if (type === "Łazienka") {
      return (
        "Zabudowa łazienkowa zależy od: wymiarów, materiałów (wilgocioodporność), rodzaju blatu i osprzętu.\n" +
        "Podaj wymiary + miasto — podam orientacyjne widełki."
      );
    }
    return (
      "Żeby oszacować koszt, potrzebuję: typu mebli + wymiarów + miasta + krótkich preferencji.\n" +
      "Podaj te informacje, a przygotuję orientacyjne widełki."
    );
  }

  function contactCard(){
    return `
<b>Kontakt do ${OWNER_NAME}</b><br>
📞 <a href="tel:${PHONE_TEL}" style="color:inherit;text-decoration:underline">${PHONE_PRETTY}</a><br>
✉️ <a href="mailto:${EMAIL}" style="color:inherit;text-decoration:underline">${EMAIL}</a>
    `.trim();
  }

  async function sendLead(payload){
    if(!WEBHOOK_URL || WEBHOOK_URL.includes("TUTAJ_WKLEJ")) return false;
    try{
      const r = await fetch(WEBHOOK_URL, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(payload)
      });
      return r.ok;
    }catch(e){ return false; }
  }

  // ====== UI / STYLE ======
  const css = `
#dassBtn{
  position:fixed; right:18px; bottom:18px; z-index:99999;
  border:0; border-radius:999px; padding:12px 16px;
  font-weight:800; cursor:pointer;
  box-shadow:0 10px 25px rgba(0,0,0,.20);
  background:#111; color:#fff;
}
#dassBox{
  position:fixed; right:18px; bottom:78px;
  width:360px; height:560px; max-width:calc(100vw - 36px);
  background:#fff; border-radius:16px;
  box-shadow:0 18px 60px rgba(0,0,0,.25);
  display:none; z-index:99999; overflow:hidden;
  font-family: Arial, sans-serif;
}
#dassHead{
  background:linear-gradient(90deg,#111,#222);
  color:#fff; padding:12px 12px;
  display:flex; align-items:center; justify-content:space-between;
}
#dassHead .ttl{font-weight:900; font-size:14px; letter-spacing:.2px}
#dassHead .sub{font-size:12px; opacity:.85; margin-top:2px}
#dassClose{
  border:0; background:transparent; color:#fff;
  font-size:22px; cursor:pointer; line-height:1;
  padding:4px 8px; border-radius:10px;
}
#dassClose:hover{background:rgba(255,255,255,.12)}
#dassBody{
  padding:12px; height:395px; overflow:auto;
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
.bot .b{background:#fff; border:1px solid #e7e7e7}
.user{justify-content:flex-end}
.user .b{background:#111; color:#fff}
.small{font-size:12px; color:#666}
hr.sep{border:0;border-top:1px solid #eee;margin:10px 0}
  `;
  const style = document.createElement("style");
  style.id = "dassStyle";
  style.textContent = css;
  document.head.appendChild(style);

  const btn = document.createElement("button");
  btn.id = "dassBtn";
  btn.textContent = "💬 Szybka wycena";
  document.body.appendChild(btn);

  const box = document.createElement("div");
  box.id = "d
