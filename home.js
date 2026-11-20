// Homepage only. "The throw": a dashed flight path through the [data-throw] anchors, drawn as you scroll,
// with a disc riding its tip and handwritten notes that appear as the disc passes them.
// #throw-at=<0..1> freezes the drawing at that fraction, for checking.
(()=>{
  const main=document.querySelector("main.home"); if(!main)return;
  const NS="http://www.w3.org/2000/svg";
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const freeze=/throw-at=([\d.]+)/.exec(location.hash);
  const anchors=[...main.querySelectorAll("[data-throw]")];
  const notes=[...main.querySelectorAll(".throw-note")];
  const svg=document.createElementNS(NS,"svg");svg.classList.add("throw");svg.setAttribute("aria-hidden","true");
  svg.innerHTML='<defs><mask id="throw-mask" maskUnits="userSpaceOnUse"><path class="throw-reveal"/></mask></defs>'+
    '<path class="throw-line" mask="url(#throw-mask)"/><g class="throw-disc"><ellipse rx="12" ry="5.5"/><ellipse rx="7" ry="3"/></g>';
  main.prepend(svg);
  const line=svg.querySelector(".throw-line"),reveal=svg.querySelector(".throw-reveal"),mask=svg.querySelector("mask"),disc=svg.querySelector(".throw-disc");
  let len=0,samples=[],noteAt=[],ticking=false;

  function point(el){
    const r=el.getBoundingClientRect(),m=main.getBoundingClientRect(),side=el.dataset.throw;
    const x=side==="top"?r.left+r.width/2-m.left:side==="left"?r.left-m.left-28:r.right-m.left+28, y=side==="top"?r.top-m.top-18:r.top+r.height/2-m.top;
    return[x,y];
  }
  function build(){
    const W=main.clientWidth,H=main.scrollHeight,narrow=W<760;
    main.classList.toggle("throw-narrow",narrow);
    svg.setAttribute("viewBox",`0 0 ${W} ${H}`);svg.style.height=H+"px";
    mask.setAttribute("width",W);mask.setAttribute("height",H);
    // it swings between anchors like a hyzer; on phones it keeps to the screen and swings a little less
    const edge=narrow?14:24;
    const P=anchors.map(a=>{const[x,y]=point(a);return[Math.min(Math.max(x,edge),W-edge),y];});
    let d=`M${P[0][0]},${P[0][1]}`;
    for(let i=0;i<P.length-1;i++){
      const[x0,y0]=P[i],[x1,y1]=P[i+1],dy=y1-y0,sw=W*(narrow?.16:.2)*(i%2?-1:1);
      d+=` C${x0+sw},${y0+dy*.35} ${x1+sw*.6},${y1-dy*.4} ${x1},${y1}`;
    }
    line.setAttribute("d",d);reveal.setAttribute("d",d);
    len=reveal.getTotalLength();reveal.style.strokeDasharray=len;
    samples=[];for(let l=0;l<=len;l+=6)samples.push([l,reveal.getPointAtLength(l).y]);samples.push([len,P[P.length-1][1]]);
    // each note sits next to its anchor and switches on once the path has reached that anchor
    // notes live inside their section's content layer, so convert from main's coordinates to their own containing block
    const m=main.getBoundingClientRect();
    noteAt=notes.map(n=>{const i=+n.dataset.at,[x,y]=P[i],o=(n.offsetParent||main).getBoundingClientRect();
      n.style.left=(x-(o.left-m.left)+(+n.dataset.dx||0))+"px";n.style.top=(y-(o.top-m.top)+(+n.dataset.dy||0))+"px";
      return(samples.find(s=>s[1]>=y-1)||[len])[0];});
    update();
  }
  function lengthAtScroll(){
    if(freeze)return len*Math.min(1,+freeze[1]);
    if(reduce)return len;
    const lineY=innerHeight*.72-main.getBoundingClientRect().top;let L=0;
    for(const[l,y]of samples){if(y<=lineY)L=l;else break;}
    return L;
  }
  function update(){
    ticking=false;
    const L=lengthAtScroll();
    reveal.style.strokeDashoffset=len-L;
    const show=L>0;
    disc.style.display=show?"":"none";
    if(show){const p=reveal.getPointAtLength(L),q=reveal.getPointAtLength(Math.max(0,L-4));
      const a=Math.atan2(p.y-q.y,p.x-q.x)*57.3*.25;disc.setAttribute("transform",`translate(${p.x},${p.y}) rotate(${a.toFixed(1)})`);}
    notes.forEach((n,i)=>n.classList.toggle("on",L>=noteAt[i]-2));
  }
  build();
  new ResizeObserver(build).observe(main);
  if(!freeze&&!reduce)addEventListener("scroll",()=>{if(!ticking){ticking=true;requestAnimationFrame(update);}},{passive:true});
})();

// Teams per edition: count up once when the discs come into view (numbers stay final if frames never run)
(()=>{
  const fig=document.querySelector(".growth-discs");
  if(!fig||/throw-at=/.test(location.hash)||matchMedia("(prefers-reduced-motion: reduce)").matches||!("IntersectionObserver" in window))return;
  const nums=[...fig.querySelectorAll("b[data-count]")];
  const io=new IntersectionObserver(es=>{if(!es.some(e=>e.isIntersecting))return;io.disconnect();
    let t0;const run=t=>{t0??=t;const k=Math.min(1,(t-t0)/1100),e=1-Math.pow(1-k,3);
      nums.forEach(n=>n.textContent=Math.round(+n.dataset.count*e));if(k<1)requestAnimationFrame(run);};
    requestAnimationFrame(run);},{threshold:.4});
  io.observe(fig);
})();

// Munnar weather on the film band: one of three at random per visit, set once the intro has gone.
// It does not respond to taps. The animation pauses while the band is off screen.
document.querySelectorAll(".hero-photo").forEach(p=>{
  const order=["sunny","misty","rainy"];if(!p.querySelector(".wx-layer"))return;
  const start=()=>setTimeout(()=>{p.dataset.wx=order[Math.floor(Math.random()*order.length)];});
  const intro=document.querySelector(".intro"),gone=()=>!intro||getComputedStyle(intro).display==="none"||intro.classList.contains("out")||intro.classList.contains("done");
  if(gone())start();else{let t;const go=()=>{mo.disconnect();clearTimeout(t);setTimeout(start,400);};
    const mo=new MutationObserver(()=>{if(gone())go();});mo.observe(intro,{attributes:true,attributeFilter:["class"]});
    t=setTimeout(go,12000);}   // safety net if the intro is removed without a class change
  if("IntersectionObserver" in window)new IntersectionObserver(es=>es.forEach(e=>p.classList.toggle("off",!e.isIntersecting))).observe(p);
});

// One logo at a time: while the hero logo is on screen, the nav shows only "parava '27"; the small nav logo fades in once the hero logo has scrolled away.
(()=>{
  const heroLogo=document.querySelector(".home-hero .logo"),root=document.documentElement;
  if(!heroLogo||!("IntersectionObserver" in window))return;
  new IntersectionObserver(([e])=>root.classList.toggle("hero-logo-on",e.isIntersecting),{rootMargin:"-80px 0px 0px 0px"}).observe(heroLogo);
})();


// The Munnar film: loads only when the band is near the screen (the phone size on narrow screens), plays muted,
// pauses off screen. Reduced motion or data saving keeps the still frame until the viewer presses play.
(()=>{
  const v=document.querySelector(".film-video"),btn=document.querySelector(".film-toggle");if(!v)return;
  const calm=matchMedia("(prefers-reduced-motion: reduce)").matches||(navigator.connection&&navigator.connection.saveData);
  let held=!!calm,loaded=false;
  const show=paused=>{if(!btn)return;btn.hidden=false;btn.classList.toggle("paused",paused);btn.setAttribute("aria-label",paused?"Play the video":"Pause the video");};
  const load=()=>{if(loaded)return;loaded=true;v.src=matchMedia("(max-width: 768px)").matches?v.dataset.srcNarrow:v.dataset.srcWide;};
  const play=()=>{load();const p=v.play();if(p&&p.catch)p.catch(()=>show(true));};
  v.addEventListener("play",()=>show(false));v.addEventListener("pause",()=>show(true));
  if(btn)btn.addEventListener("click",e=>{e.stopPropagation();if(v.paused){held=false;play();}else{held=true;v.pause();}});
  show(true);
  if(!("IntersectionObserver" in window)){if(!held)play();return;}
  new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){if(!held)play();}else if(!v.paused)v.pause();}),{rootMargin:"200px 0px"}).observe(v.closest(".film-band"));
})();
