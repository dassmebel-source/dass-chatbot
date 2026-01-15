(function(){
  if(window.__dassChatLoaded) return;
  window.__dassChatLoaded = true;

  const css = `
#dassBtn{position:fixed;right:18px;bottom:18px;z-index:99999;border:0;border-radius:999px;padding:12px 16px;font-weight:700;cursor:pointer;box-shadow:0 10px 25px rgba(0,0,0,.2)}
#dassBox{position:fixed;right:18px;bottom:78px;width:320px;height:460px;max-width:calc(100vw - 36px);background:#fff;border-radius:14px;box-shadow:0 18px 60px rgba(0,0,0,.25);display:none;z-index:99999;font-family:Arial,sans-serif}
#dassHead{background:#111;color:#fff;padding:10px 12px;border-radius:14px 14px 0 0;font-weight:700}
#dassBody{padding:10px;height:340px;overflow:auto;font-size:14px}
#dassInput{display:flex;border-top:1px solid #eee}
#dassInput input{flex:1;border:0;padding:10px;font-size:14px}
#dassInput button{border:0;padding:10px 12px;cursor:pointer;font-weight:700}
.msg{margin:6px 0}
.bot{color:#000}
.user{color:#444;text-align:right}
  `;
  const style=document.createElement("style");
  style.innerHTML=css;
  document.head.appendChild(style);

  const btn=document.createElement("button");
  btn.id="dassBtn";
  btn.textContent="💬 Zapytaj o meble";
  document.body.appendChild(btn);

  const box=document.createElement("div");
  box.id="dassBox";
  box.innerHTML=`
    <div id="dassHead">DassMebel – szybka wycena</div>
    <div id="dassBody">
      <div class="msg bot">Cześć 👋 W czym mogę pomóc? Napisz: <b>kuchnia</b>, <b>garderoba</b> lub <b>wycena</b>.</div>
    </div>
    <div id="dassInput">
      <input id="dassTxt" placeholder="Napisz tutaj..." />
      <button id="dassSend">OK</button>
    </div>`;
  document.body.appendChild(box);

  btn.onclick=()=>box.style.display=box.style.display==="block"?"none":"block";

  const body=box.querySelector("#dassBody");
  const input=box.querySelector("#dassTxt");
  const send=box.querySelector("#dassSend");

  function add(txt,cls){
    const d=document.createElement("div");
    d.className="msg "+cls;
    d.innerHTML=txt;
    body.appendChild(d);
    body.scrollTop=body.scrollHeight;
  }

  send.onclick=()=>{
    const v=input.value.trim();
    if(!v) return;
    add(v,"user");
    input.value="";
    const t=v.toLowerCase();
    if(t.includes("kuchnia")) add("Świetnie 👍 W jakim mieście i na kiedy potrzebna kuchnia?","bot");
    else if(t.includes("garder")) add("OK 👍 Napisz proszę miasto i orientacyjny termin.","bot");
    else if(t.includes("wycena")) add("Super. Napisz proszę jaki typ mebli i miasto.","bot");
    else add("Dziękuję! Przekażę wiadomość i odezwiemy się z wyceną.","bot");
  };
})();
