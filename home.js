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
    // on phones the throw hugs the left gutter; on wider screens it swings between anchors like a hyzer
    const P=anchors.map(a=>{const[x,y]=point(a);return[narrow?10:Math.min(Math.max(x,24),W-24),y];});
    let d=`M${P[0][0]},${P[0][1]}`;
    for(let i=0;i<P.length-1;i++){
      const[x0,y0]=P[i],[x1,y1]=P[i+1],dy=y1-y0,sw=narrow?(i%2?6:-6):W*.2*(i%2?-1:1);
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
