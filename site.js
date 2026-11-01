// First pull, Munnar (IST). Date confirmed; 8:00 AM start time is a placeholder.
const FIRST_PULL = new Date("2027-04-02T08:00:00+05:30");
const VOLUNTEER_EMAIL = "paravaultimate@gmail.com";
function tick(){
  let ms=FIRST_PULL-new Date(); const v={d:0,h:0,m:0};
  if(ms>0){v.d=Math.floor(ms/864e5);ms-=v.d*864e5;v.h=Math.floor(ms/36e5);ms-=v.h*36e5;v.m=Math.floor(ms/6e4);}
  document.querySelectorAll("[data-cd]").forEach(el=>{const k=el.dataset.cd;el.textContent=k==="d"?v.d:String(v[k]).padStart(2,"0");});
}
tick();setInterval(tick,30000);
// Mobile menu: full height panel; Escape or any link closes it, and the page behind does not scroll while it is open
document.querySelectorAll(".menu-btn").forEach(btn=>{
  const menu=btn.nextElementSibling;
  const set=o=>{menu.classList.toggle("open",o);btn.setAttribute("aria-expanded",o);btn.setAttribute("aria-label",o?"Close menu":"Menu");
    document.documentElement.classList.toggle("menu-open",o);};
  btn.addEventListener("click",()=>set(!menu.classList.contains("open")));
  menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>set(false)));
  addEventListener("keydown",e=>{if(e.key==="Escape"&&menu.classList.contains("open")){set(false);btn.focus();}});
  matchMedia("(min-width:1041px)").addEventListener("change",e=>{if(e.matches)set(false);});
});
document.querySelectorAll('a[data-ph]').forEach(a=>a.addEventListener("click",e=>e.preventDefault()));
// Page titles: a short dashed throw from the handwritten note, over the title, landing as a disc beside it.
// Drawn once by CSS animation; skipped when the title fills the column and there is no room for the disc.
document.querySelectorAll(".pagehead h1").forEach(h=>{
  const col=h.parentElement,note=col.querySelector(".kicker");if(!note)return;
  const NS="http://www.w3.org/2000/svg",svg=document.createElementNS(NS,"svg");svg.classList.add("title-throw");svg.setAttribute("aria-hidden","true");
  col.append(svg);
  const draw=()=>{
    svg.innerHTML="";
    const c=col.getBoundingClientRect(),r=document.createRange();r.selectNodeContents(note);
    const n=r.getBoundingClientRect(),t=h.getBoundingClientRect(),lh=parseFloat(getComputedStyle(h).lineHeight)||t.height;
    const x0=n.right-c.left+10,y0=n.top-c.top+n.height/2,x1=t.right-c.left+26,y1=t.top-c.top+lh*.45;
    if(x1+14>innerWidth-c.left-8||x1-x0<40)return;
    const d=`M${x0},${y0} C${x0+(x1-x0)*.45},${y0-46} ${x1+8},${y0-34} ${x1},${y1}`;
    svg.innerHTML=`<defs><mask id="tt-${h.textContent.length}" maskUnits="userSpaceOnUse" x="-50" y="-100" width="${c.width+200}" height="${c.height+200}"><path class="reveal-path" d="${d}"/></mask></defs>`+
      `<path d="${d}" mask="url(#tt-${h.textContent.length})"/><ellipse cx="${x1}" cy="${y1}" rx="9" ry="4"/>`;
    const m=svg.querySelector(".reveal-path");m.style.setProperty("--len",Math.ceil(m.getTotalLength()));
  };
  draw();document.fonts&&document.fonts.ready.then(draw);
  let w=innerWidth;addEventListener("resize",()=>{if(innerWidth!==w){w=innerWidth;draw();}});
});
// Volunteer form: inline, specific errors per field; still sends through the visitor's email app
document.querySelectorAll(".vol-form").forEach(f=>{
  const t=f.querySelector(".toast");
  const msg=(input,text)=>{let m=input.parentElement.querySelector(".err");
    if(!m){m=document.createElement("small");m.className="err";m.id="err-"+input.name;m.setAttribute("aria-live","polite");input.insertAdjacentElement("afterend",m);
      input.setAttribute("aria-describedby",m.id);}
    m.textContent=text;input.setAttribute("aria-invalid",text?"true":"false");return !text;};
  const checks={name:v=>v.trim()?"":"Add your name.",email:v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())?"":"Enter a valid email, like name@example.com."};
  Object.keys(checks).forEach(n=>f[n].addEventListener("input",()=>{if(f[n].getAttribute("aria-invalid")==="true")msg(f[n],checks[n](f[n].value));}));
  f.addEventListener("submit",e=>{
    e.preventDefault();t.classList.remove("show");
    const bad=Object.keys(checks).filter(n=>!msg(f[n],checks[n](f[n].value)));
    if(bad.length){f[bad[0]].focus();return;}
    const body=`Name: ${f.name.value}\nPhone: ${f.phone.value}\nEmail: ${f.email.value}\nRole: ${f.role.value}\nAvailability: ${f.days.value}`;
    window.location.href=`mailto:${VOLUNTEER_EMAIL}?subject=${encodeURIComponent("Parava volunteer: "+f.name.value)}&body=${encodeURIComponent(body)}`;
    t.textContent="Your email app should open with the request ready to send.";t.classList.add("show");
  });
});
