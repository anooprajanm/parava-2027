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
// Scroll reveals: sections below the first screen rise and fade in once; grid items follow each other
// (the homepage opts out: its one moving element is the throw path in home.js)
if(!document.querySelector("main.home")&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&"IntersectionObserver" in window){
  // also reveal anything already scrolled past (fast flicks, anchor jumps), so nothing can stay hidden above the viewport
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting||e.boundingClientRect.top<0){e.target.classList.add("in");io.unobserve(e.target);}}),{rootMargin:"0px 0px -8% 0px"});
  const GRIDS=".cards,.gallery,.days,.tiers,.crew,.contact-grid,.stats,.feat";
  document.querySelectorAll("main section > .wrap").forEach(w=>{
    const targets=[...w.children].flatMap(c=>c.matches(GRIDS)?[...c.children]:[c]);
    targets.forEach(el=>{
      if(el.getBoundingClientRect().top<innerHeight)return;   // already on screen: never hide it
      const g=el.parentElement.matches(GRIDS)?[...el.parentElement.children].indexOf(el):0;
      el.style.setProperty("--rd",Math.min(g*80,400)+"ms");el.classList.add("reveal");io.observe(el);
    });
  });
  // backstop for when the observer is late or throttled: once per finished scroll (not per frame), show anything on or above the screen
  const sweep=()=>document.querySelectorAll(".reveal:not(.in)").forEach(el=>{if(el.getBoundingClientRect().top<innerHeight){el.classList.add("in");io.unobserve(el);}});
  addEventListener("scrollend",sweep,{passive:true});addEventListener("hashchange",sweep);addEventListener("load",sweep);
}
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
