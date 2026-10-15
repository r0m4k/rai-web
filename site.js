
document.documentElement.classList.add("js");
(function(){
  var RAMP=" .,-~:;=!*#$@",N=RAMP.length-1;
  function rng(s){return function(){s|=0;s=s+0x6D2B79F5|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  function ch(v){return v<.1?" ":RAMP[Math.max(1,Math.min(N,Math.round(v*N)))]}
  function cell(el){var s=document.createElement("span");s.textContent="M".repeat(40);el.textContent="";el.appendChild(s);var w=s.getBoundingClientRect().width/40||6.6;el.removeChild(s);return [w,parseFloat(getComputedStyle(el).fontSize)||11]}

  /* A · block fill: always covers its block, dense end away from text */
  function fills(){document.querySelectorAll("pre.fill").forEach(function(el,i){
    var m=cell(el),P=el.parentElement,c=Math.ceil(P.clientWidth/m[0])+1,r=Math.ceil(P.clientHeight/m[1])+1,k=el.dataset.k,rand=rng(17+i*31),out=[];
    for(var y=0;y<r;y++){var row="";for(var x=0;x<c;x++){
      var t=k==="r"?x/(c-1):k==="l"?1-x/(c-1):y/(r-1);
      row+=ch(Math.min(.85,Math.pow(t,2.2)*1.05-.06+(rand()-.5)*.55))}out.push(row)}
    el.textContent=out.join("\n");});}

  /* B and C · floating forms live only in the side margins, at least 40px clear of the content column */
  function margins(){
    var host=document.getElementById("ascii-bg");host.innerHTML="";
    var wrap=document.querySelector("main .wrap"),side=wrap.getBoundingClientRect().left+parseFloat(getComputedStyle(wrap).paddingLeft)-40;
    if(side<110)return;
    var rand=rng(2026),H=document.body.scrollHeight,y=240,last="",n=0,cw=6.6;
    var skip=[].map.call(document.querySelectorAll(".hero,.about-field,.writing,.close,.band,.nav,.gallery"),function(e){var r=e.getBoundingClientRect();return [r.top+scrollY,r.bottom+scrollY]});
    while(y<H-300){
      var k=rand(),kind=k<.38?"l":k<.76?"r":"c";if(kind==="c"&&side<200)kind="l";if(kind===last)kind=kind==="l"?"r":"l";
      var rows,cols,pre=document.createElement("pre"),out=[];
      if(kind==="c"){var d=Math.min(side-20,240);cols=Math.round(d/cw);rows=Math.round(d/11);}
      else{cols=Math.round(Math.min(side,360)/cw);rows=24+Math.floor(rand()*14);}
      var top=y,bot=y+rows*11,blocked=skip.some(function(s){return bot>s[0]-40&&top<s[1]+40});
      if(!blocked){
        for(var yy=0;yy<rows;yy++){var row="";for(var x=0;x<cols;x++){var u=x/(cols-1),w=yy/(rows-1),v;
          if(kind==="c"){var dx=(u-.5)*2,dy=(w-.5)*2,d2=dx*dx+dy*dy;v=d2>=1?0:Math.max(0,-dx*.45-dy*.55+Math.sqrt(1-d2)*.7)*Math.pow(1-d2,.6)*1.1+(rand()-.5)*.18}
          else v=(kind==="l"?1-u:u)*Math.pow(Math.sin(Math.PI*w),1.3)*1.05-.06+(rand()-.5)*.6;
          row+=ch(v)}out.push(row)}
        pre.className=kind+(n++%2?"":" red");pre.textContent=out.join("\n");pre.style.top=y+"px";
        if(kind==="c"){var xpos=Math.round((side-cols*cw)/2);if(rand()<.5)pre.style.left=xpos+"px";else pre.style.right=xpos+"px"}
        host.appendChild(pre);last=kind;
      }
      y+=rows*11+220+rand()*420;
    }
  }

  /* rounding filter for the pixel voice: blur = 1.6% of the rendered size, then an alpha threshold */
  var NS="http://www.w3.org/2000/svg",defs=document.getElementById("rnd-defs"),made={};
  function round(){document.querySelectorAll("[data-round]").forEach(function(el){
    var b=Math.max(.2,Math.round(parseFloat(getComputedStyle(el).fontSize)*.016*10)/10),id="rd"+String(b).replace(".","_");
    if(!made[id]){var f=document.createElementNS(NS,"filter");f.setAttribute("id",id);f.setAttribute("x","-5%");f.setAttribute("y","-20%");f.setAttribute("width","110%");f.setAttribute("height","140%");f.setAttribute("color-interpolation-filters","sRGB");
      f.innerHTML='<feGaussianBlur in="SourceGraphic" stdDeviation="'+b+'" result="b"/><feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11"/>';defs.appendChild(f);made[id]=1;}
    el.style.filter="url(#"+id+")";});}

  /* C · standalone spheres placed in open space: <pre class="sphere" data-sphere="diameter"> */
  function spheres(){document.querySelectorAll("pre[data-sphere]").forEach(function(el,i){
    var m=cell(el),d=+el.dataset.sphere,c=Math.round(d/m[0]),r=Math.round(d/m[1]),rand=rng(301+i*7),out=[];
    for(var y=0;y<r;y++){var row="";for(var x=0;x<c;x++){var dx=((x+.5)/c-.5)*2,dy=((y+.5)/r-.5)*2,d2=dx*dx+dy*dy;
      row+=d2>=1?" ":ch(Math.max(0,-dx*.45-dy*.55+Math.sqrt(1-d2)*.7)*Math.pow(1-d2,.6)*1.1+(rand()-.5)*.18)}out.push(row)}
    el.textContent=out.join("\n");});}

  function all(){fills();spheres();round();}
  all();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(all);
  var rt;addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(all,200)});

  /* live: countdown to the next talk. The schedule is read from the talk boxes (data-start), so it can never
     disagree with the page; the next-event card follows the same talk, and a talk counts as next until it ends. */
  var LEN=75*60000,card=document.querySelector(".nextcard"),shown=card&&card.dataset.start;
  function talks(){return [].map.call(document.querySelectorAll(".case[data-start]"),function(c){return {el:c,t:new Date(c.dataset.start).getTime()}})
    .filter(function(x){return !isNaN(x.t)}).sort(function(a,b){return a.t-b.t})}
  function fillCard(c){ /* copy the talk's date box, title, speaker, photo and link into the card */
    if(!card)return;var q=function(r,s){return r.querySelector(s)};
    var box=q(card,".date"),src=q(c,".date");box.innerHTML=src.innerHTML;
    var loc=q(box,".loc");if(loc)loc.textContent=loc.textContent+", Boston";
    q(card,".nc-title").textContent=q(c,"h3").textContent;
    var img=q(card,".ph img"),cimg=q(c,".spk img");if(cimg){img.src=cimg.src;img.alt="Portrait of "+cimg.alt;img.style.objectPosition=cimg.style.objectPosition}
    var who=q(card,".nc-who"),nm=q(c,".spk b"),af=q(c,".spk span");who.innerHTML="";var b=document.createElement("b");b.textContent=nm.textContent;who.appendChild(b);who.appendChild(document.createTextNode(af.textContent));
    q(card,".btn").href=q(c,".btn").href;card.dataset.start=c.dataset.start;shown=c.dataset.start;round();
  }
  /* the countdown spells its number: Pixelify's 5 reads as an S, and words never show one */
  var ONES="zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" "),
      TENS=",,twenty,thirty,forty,fifty,sixty,seventy,eighty,ninety".split(",");
  function words(n){if(n<20)return ONES[n];if(n<100)return TENS[Math.floor(n/10)]+(n%10?"-"+ONES[n%10]:"");
    return ONES[Math.floor(n/100)]+" hundred"+(n%100?" and "+words(n%100):"")}
  var tickTimer;
  function tick(){
    clearTimeout(tickTimer);
    var el=document.getElementById("count");if(!el)return;
    var now=Date.now(),all=talks(),next=all.filter(function(x){return x.t+LEN>now})[0];
    if(!next){var last=all[all.length-1];if(last&&last.el.dataset.start!==shown)fillCard(last.el);el.textContent="This semester’s talks are complete";return}
    if(next.el.dataset.start!==shown)fillCard(next.el);
    /* whole calendar days in Boston time: 21 days, then "tomorrow", then "today" */
    var left=next.t-now,wait=Math.min(Math.max(left,1000),60000);
    var et=function(t){return new Date(t).toLocaleDateString("en-CA",{timeZone:"America/New_York"})};
    var days=Math.round((Date.parse(et(next.t))-Date.parse(et(now)))/86400000);
    if(left<=0){el.textContent="Happening now";wait=Math.min(next.t+LEN-now,60000)}
    else el.textContent=days>1?"Starts in "+words(days)+" days":days===1?"Starts tomorrow":"Starts today";
    tickTimer=setTimeout(tick,Math.min(wait+50,60000));
  }
  tick();
  /* background tabs throttle timers: re-check when the page is shown again */
  document.addEventListener("visibilitychange",function(){if(!document.hidden)tick()});
  addEventListener("pageshow",tick);

  /* live: docket filter */
  var btns=document.querySelectorAll(".filter button");
  btns.forEach(function(b){b.addEventListener("click",function(){
    var f=b.dataset.f;btns.forEach(function(o){o.setAttribute("aria-pressed",o===b?"true":"false")});
    document.querySelectorAll(".case").forEach(function(c){c.hidden=!(f==="all"||c.classList.contains(f));if(!c.hidden)c.classList.add("in")});
    all();relayout();
  })});

  /* add to calendar: a real .ics for each scheduled case */
  function pad(n){return String(n).padStart(2,"0")}
  function stamp(d){return d.getUTCFullYear()+pad(d.getUTCMonth()+1)+pad(d.getUTCDate())+"T"+pad(d.getUTCHours())+pad(d.getUTCMinutes())+"00Z"}
  document.querySelectorAll("[data-ics]").forEach(function(a){
    var c=a.closest("[data-start]"),st=new Date(c.dataset.start),en=new Date(st.getTime()+75*60000);
    var ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//RAI GP Series//EN","BEGIN:VEVENT","UID:"+stamp(st)+"@rai-gp","DTSTAMP:"+stamp(new Date()),"DTSTART:"+stamp(st),"DTEND:"+stamp(en),
      "SUMMARY:"+c.dataset.title,"DESCRIPTION:"+c.dataset.sub+" · Responsible AI, Governance & Policy speaker series","LOCATION:ISEC 102, 805 Columbus Ave, Boston","END:VEVENT","END:VCALENDAR"].join("\r\n");
    a.href="data:text/calendar;charset=utf-8,"+encodeURIComponent(ics);a.setAttribute("download",c.dataset.title.replace(/[^a-z0-9]+/gi,"-").toLowerCase()+".ics");
  });

  /* motion: staggered entrances (60–90ms), once; content never hidden without script */
  if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&"IntersectionObserver" in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var sib=[].indexOf.call(e.target.parentElement.children,e.target);
      e.target.style.transitionDelay=Math.min(sib,6)*75+"ms";e.target.classList.add("in");io.unobserve(e.target)}})},{rootMargin:"0px 0px -8% 0px"});
    document.querySelectorAll(".rise,.lines").forEach(function(el){io.observe(el)});
    /* slow scroll drift on the art band */
    var band=document.getElementById("band-img");
    if(band)addEventListener("scroll",function(){var r=band.parentElement.getBoundingClientRect(),p=(r.top+r.height/2-innerHeight/2)/innerHeight;band.style.transform="translateY("+(p*-6)+"%)"},{passive:true});
  }else{document.querySelectorAll(".rise,.lines").forEach(function(el){el.classList.add("in")})}

  /* artwork carousel: sticker controls, keyboard scroll, slow auto-advance that stops on interaction */
  var track=document.getElementById("g-track");
  if(track){
    function step(dir){var s=track.querySelector(".slide"),w=s?s.getBoundingClientRect().width+parseFloat(getComputedStyle(track).columnGap||24):400;
      var end=track.scrollLeft+track.clientWidth>=track.scrollWidth-4;
      if(dir>0&&end)track.scrollTo({left:0,behavior:"smooth"});else track.scrollBy({left:dir*w,behavior:"smooth"});}
    document.getElementById("g-prev").addEventListener("click",function(){stop();step(-1)});
    document.getElementById("g-next").addEventListener("click",function(){stop();step(1)});
    var timer=null;function stop(){clearInterval(timer);timer=null}
    if(!matchMedia("(prefers-reduced-motion: reduce)").matches){timer=setInterval(function(){step(1)},5000);
      ["pointerdown","wheel","touchstart","focusin","mouseenter"].forEach(function(e){track.addEventListener(e,stop,{passive:true})});}
  }

  /* ================= chapters: one fixed stage, colours blended by scroll position ================= */
  var STOPS=[ /* ground (two gradient stops) and ASCII ink per chapter: About · Events · Blog */
    {g1:[200,16,46], g2:[94,6,20],  ink:[255,255,255], a:.42, side:1},
    {g1:[94,6,20],   g2:[42,3,9],   ink:[201,209,218], a:.42, side:0},
    {g1:[11,11,11],  g2:[11,11,11], ink:[200,16,46],   a:.85, side:1}
  ];
  /* touch screens (phones, tablets): Safari keeps a solid bar under its toolbar whenever a fixed layer reaches the
     bottom edge, so there the ground and the field are painted once along the whole page and scroll with it */
  var DOC=matchMedia("(pointer:coarse)").matches;
  if(DOC)document.documentElement.classList.add("doc-ground");
  var stage=document.getElementById("stage"),nav=document.getElementById("nav"),root=document.documentElement;
  var chapters=[].slice.call(document.querySelectorAll(".chapter"));
  var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  function lerp(a,b,t){return a+(b-a)*t}
  function mix(a,b,t){return [0,1,2].map(function(k){return Math.round(lerp(a[k],b[k],t))})}
  function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}           /* ease-in-out cubic */
  var tops=[],cur={v:0};
  function measure(){tops=chapters.map(function(c){return c.getBoundingClientRect().top+scrollY})}
  /* v runs 0 → 2 continuously; each change happens over the 70vh around a chapter boundary */
  function valueAt(p,vh){
    var W=vh*.35,v=0;
    for(var i=1;i<tops.length;i++){var t=(p-(tops[i]-W))/(2*W);v+=ease(Math.max(0,Math.min(1,t)))}
    return v;
  }
  function chapterValue(){return valueAt(scrollY+innerHeight*.55,innerHeight)}
  /* the dense side travels continuously from chapter centre to chapter centre: right → left → right */
  var SIDES=[1,0,1];
  function sideValue(){return sideAt(scrollY+innerHeight*.5)}
  function sideAt(mid){
    var c=chapters.map(function(el,i){return tops[i]+el.offsetHeight/2});
    if(mid<=c[0])return SIDES[0];
    for(var i=0;i<c.length-1;i++)if(mid<c[i+1]){var t=(mid-c[i])/(c[i+1]-c[i]);t=t*t*(3-2*t);return lerp(SIDES[i],SIDES[i+1],t)}
    return SIDES[SIDES.length-1];
  }
  function paint(v){
    var i=Math.min(STOPS.length-2,Math.floor(v)),t=v-i,A=STOPS[i],B=STOPS[i+1];
    var g1=mix(A.g1,B.g1,t),g2=mix(A.g2,B.g2,t),ink=mix(A.ink,B.ink,t),al=lerp(A.a,B.a,t);
    root.style.setProperty("--g1","rgb("+g1+")");if(!DOC)root.style.backgroundColor="rgb("+g1+")";root.style.setProperty("--g2","rgb("+g2+")");
    field.ink="rgba("+ink+","+al.toFixed(3)+")";field.side=sideValue();
    /* touch screens: Safari fills the status bar with one solid colour taken from the header (and the page behind it).
       The header starts as exactly that colour at its top edge and blends into the page's ground at its bottom edge,
       so status bar, header and page read as one piece that follows the chapters as you scroll */
    if(DOC&&tops.length){var gc=groundAt(scrollY+nav.offsetHeight),C=mix(gc[0],gc[1],.5);
      nav.style.background="linear-gradient(180deg,"+rgb(C)+" 0%,rgba("+C+",0) 90%),linear-gradient(90deg,"+rgb(gc[0])+","+rgb(gc[1])+")";
      nav.style.backgroundColor=rgb(C);root.style.backgroundColor=rgb(C)}
  }

  /* ================= animated ASCII field (canvas) ================= */
  var cv=document.getElementById("ascii-field"),ctx=cv.getContext("2d"),field={ink:"rgba(255,255,255,.34)",side:1};
  var CW=6.6,CH=11,cols=0,rows=0,dpr=1,vel=0,lastY=scrollY;
  function hash(x,y){var h=Math.sin(x*127.1+y*311.7)*43758.5453;return h-Math.floor(h)}
  function noise(x,y){var xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),w=yf*yf*(3-2*yf);
    return lerp(lerp(hash(xi,yi),hash(xi+1,yi),u),lerp(hash(xi,yi+1),hash(xi+1,yi+1),u),w)}
  function size(){
    dpr=Math.min(2,devicePixelRatio||1);var w=innerWidth,h=Math.max(innerHeight,(screen&&screen.height)||0);
    cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);cv.style.width=w+"px";cv.style.height=h+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.font='500 11px "IBM Plex Mono", monospace';ctx.textBaseline="top";
    CW=ctx.measureText("M").width||7.2;cols=Math.ceil(w/CW)+1;rows=Math.ceil(h/CH)+1;
  }
  /* even block fill across the whole viewport, as on the theme sheet: sparse on the left, dense on the right */
  var seed=1;
  function draw(){
    if(cv.height/dpr<innerHeight-1||cv.width/dpr<innerWidth-1)size();
    /* the dense side travels with the chapters: right (About) → left (Events) → right (Blog); nothing moves vertically */
    var w=innerWidth,narrow=w<760,cap=narrow?.6:.95,sd=field.side;
    ctx.clearRect(0,0,w,cv.height/dpr);ctx.fillStyle=field.ink;
    for(var y=0;y<rows;y++){var row="";
      for(var x=0;x<cols;x++){var u=x/(cols-1),p=sd*u+(1-sd)*(1-u);
        var v=Math.min(cap,Math.pow(p,1.9)*1.2-.08+(hash(x*1.7,y*1.3)-.5)*.5);
        row+=ch(v)}
      ctx.fillText(row,0,y*CH);}
  }
  /* the field only moves while the page scrolls: each scroll frame shifts it and stirs it in proportion to speed */
  var ticking=false;
  function onScroll(){
    if(ticking)return;ticking=true;
    requestAnimationFrame(function(){
      cur.v=chapterValue();paint(cur.v);if(!DOC)draw();markNav();ticking=false;
    });
  }
  var settle;
  /* the page-long version of the stage: tiles of canvas stacked down the page. Each row takes the chapter blend and the
     dense side at its own position, so scrolling shows the same right → left → right travel and colour change */
  var tiles=[],docKey="",VH=0;
  function rgb(c){return "rgb("+c+")"}
  function at(Y){var v=valueAt(Y,VH||innerHeight),i=Math.min(STOPS.length-2,Math.floor(v)),t=v-i;return [STOPS[i],STOPS[i+1],t]}
  /* left and right colour of the ground at page position Y: g1 → g2 across the width, leaning like the 135° ground.
     The lean is a triangle wave over two screen heights, so it never jumps where one chapter meets the next */
  function groundAt(Y){var m=at(Y),g1=mix(m[0].g1,m[1].g1,m[2]),g2=mix(m[0].g2,m[1].g2,m[2]),q=(Y/(VH||innerHeight))%2,f=q<1?q:2-q;
    return [mix(g1,g2,.35*f),mix(g1,g2,.65+.35*f)]}
  function paintDoc(force){
    measure();
    var W=innerWidth,H=document.documentElement.scrollHeight;
    if(!VH||W+"" !== docKey.split("x")[0])VH=Math.max(innerHeight,document.documentElement.clientHeight);
    var key=W+"x"+H+"x"+tops.join(",");if(!force&&key===docKey)return;docKey=key;
    var d=Math.min(2,devicePixelRatio||1),T=1024,n=Math.ceil(H/T),FONT='500 11px "IBM Plex Mono", monospace';
    stage.style.height=H+"px";
    while(tiles.length<n){var c=document.createElement("canvas");c.className="tile";stage.appendChild(c);tiles.push(c)}
    while(tiles.length>n)stage.removeChild(tiles.pop());
    var cap=W<760?.6:.95;
    tiles.forEach(function(c,k){
      var top=k*T,h=Math.min(T,H-top),g;
      c.width=Math.round(W*d);c.height=Math.round(h*d);
      c.style.cssText="position:absolute;left:0;top:"+top+"px;width:"+W+"px;height:"+h+"px;display:block";
      g=c.getContext("2d");g.setTransform(d,0,0,d,0,0);
      /* ground: g1 → g2 across the width, leaning with the position in the chapter (the 135° ground, laid along the page) */
      for(var y=0;y<h;y+=4){var gc=groundAt(top+y),lg=g.createLinearGradient(0,0,W,0);
        lg.addColorStop(0,rgb(gc[0]));lg.addColorStop(1,rgb(gc[1]));g.fillStyle=lg;g.fillRect(0,y,W,4.5)}
      /* field: the website formula, row by row */
      g.font=FONT;g.textBaseline="top";var cw=g.measureText("M").width||6.6,cols=Math.ceil(W/cw)+1;
      for(var r=Math.floor(top/CH);r<Math.ceil((top+h)/CH);r++){
        var Yr=r*CH+CH/2,mm=at(Yr),ink=mix(mm[0].ink,mm[1].ink,mm[2]),al=lerp(mm[0].a,mm[1].a,mm[2]),sd=sideAt(Yr),row="";
        for(var x=0;x<cols;x++){var u=x/(cols-1),pp=sd*u+(1-sd)*(1-u);row+=ch(Math.min(cap,Math.pow(pp,1.9)*1.2-.08+(hash(x*1.7,r*1.3)-.5)*.5))}
        g.fillStyle="rgba("+ink+","+al.toFixed(3)+")";g.fillText(row,0,r*CH-top)}
    });
  }
  /* force: repaint the page-long ground even if nothing moved (first paint, fonts, load); resizes from the iPhone toolbar
     collapsing change neither the width nor the page height, so they reuse the painted tiles */
  function setup(force){size();measure();cur.v=chapterValue();paint(cur.v);if(DOC)paintDoc(!!force);else draw()}
  function relayout(){root.style.setProperty("--nav-h",nav.offsetHeight+"px");measure();if(DOC)paintDoc();onScroll()}
  setup(true);if(document.fonts){document.fonts.ready.then(setup);if(document.fonts.load)document.fonts.load('500 11px "IBM Plex Mono"').then(setup)}
  addEventListener("load",function(){setup();relayout()});
  /* late images, fonts or the filter change the page height: keep chapter tops current */
  if("ResizeObserver" in window)new ResizeObserver(function(){relayout()}).observe(document.querySelector("main"));
  addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(function(){all();setup()},200)});
  addEventListener("scroll",onScroll,{passive:true});

  /* ================= nav: current chapter, smooth jump that respects the fixed header ================= */
  var links=[].slice.call(document.querySelectorAll(".nav a.l"));
  /* a tapped link keeps focus on phones; let go of it so only the current chapter stays underlined */
  links.forEach(function(a){a.addEventListener("click",function(){setTimeout(function(){a.blur()},0)})});
  root.style.setProperty("--nav-h",nav.offsetHeight+"px");
  /* current section = the last chapter whose top has passed 40% of the viewport */
  function markNav(){var mid=scrollY+innerHeight*.4,id=chapters[0].id;
    chapters.forEach(function(c,i){if(tops[i]<=mid)id=c.id});
    links.forEach(function(a){if(a.dataset.to===id)a.setAttribute("aria-current","true");else a.removeAttribute("aria-current")})}
  markNav();
  addEventListener("resize",function(){root.style.setProperty("--nav-h",nav.offsetHeight+"px")});
})();
