/* RAI · Governance & Policy — version_2
   1 the wall: talks move to "past" on their own, the wall keeps its order, the filter
   2 entrances  3 the red ASCII field behind everything */
document.documentElement.classList.add("js");
(function(){
  "use strict";
  var root=document.documentElement,nav=document.getElementById("nav");
  var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* the ASCII ramp, light to dense. Each step holds characters of about the same ink: digits, slashes and brackets
     sit beside the punctuation. Which one appears is fixed by position (salt), so the field never flickers */
  var LV=[" ",".,'`","-~:_",";!/\\","=+|[]","(){}17","*2347","#5690$","%&8$0","@&8%#"],N=LV.length-1;
  function pick(lv,salt){var g=LV[lv];return g[Math.min(g.length-1,Math.floor((salt||0)*g.length))]}
  function ch(v,salt){return !(v>=.1)?" ":pick(Math.max(1,Math.min(N,Math.round(v*N))),salt)}
  function hash(x,y){var h=Math.sin(x*127.1+y*311.7)*43758.5453;return h-Math.floor(h)}
  function lerp(a,b,t){return a+(b-a)*t}

  /* ============ 1 · the wall ============ */
  var wall=document.getElementById("wall"),cards=wall?[].slice.call(wall.children):[];
  var TALK_LEN=75*60000;

  /* a talk is upcoming until it ends; once over it becomes a past talk and links to its recap when there is one */
  function classify(){
    var now=Date.now();
    cards.forEach(function(c){
      if(c.dataset.type!=="talk")return;
      var start=Date.parse(c.dataset.start),past=start+TALK_LEN<=now;
      c.dataset.kind=past?"past":"up";
      c.dataset.t=start;
      c.querySelector(".tab").textContent=past?"Past talk":"Upcoming talk";
      if(past&&c.dataset.recap)c.querySelector(".cover").setAttribute("href",c.dataset.recap);
    });
    cards.forEach(function(c){if(c.dataset.type==="post")c.dataset.t=Date.parse(c.dataset.date)});
  }
  /* order: upcoming talks soonest first, then everything else newest first */
  function order(){
    cards.sort(function(a,b){
      var ua=a.dataset.kind==="up",ub=b.dataset.kind==="up";
      if(ua!==ub)return ua?-1:1;
      return ua?a.dataset.t-b.dataset.t:b.dataset.t-a.dataset.t;
    }).forEach(function(c){wall.appendChild(c)});
  }

  /* ASCII stand-ins for talks without a photograph */
  function rng(s){return function(){s|=0;s=s+0x6D2B79F5|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  function fills(){document.querySelectorAll("pre.fill").forEach(function(el,i){
    if(!el.parentElement.clientWidth)return;   /* a card hidden by the filter: drawn when it is shown */
    var s=document.createElement("span");s.textContent="M".repeat(40);el.textContent="";el.appendChild(s);
    var cw=s.getBoundingClientRect().width/40||6.6,chh=parseFloat(getComputedStyle(el).fontSize)||11;el.removeChild(s);
    var P=el.parentElement,c=Math.ceil(P.clientWidth/cw)+1,r=Math.ceil(P.clientHeight/chh)+1,k=el.dataset.k,rand=rng(17+i*31),out=[];
    for(var y=0;y<r;y++){var row="";for(var x=0;x<c;x++){var t=k==="r"?x/(c-1):1-x/(c-1);
      row+=ch(Math.min(.85,Math.pow(t,2.2)*1.05-.06+(rand()-.5)*.55),rand())}out.push(row)}
    el.textContent=out.join("\n")})}

  /* the filter: one choice, by kind or by topic; option counts and a live result line */
  var MATCH={all:function(){return true},talks:function(c){return c.dataset.type==="talk"},
    up:function(c){return c.dataset.type==="talk"&&c.dataset.kind==="up"},
    past:function(c){return c.dataset.type==="talk"&&c.dataset.kind==="past"},
    posts:function(c){return c.dataset.type==="post"}};
  function test(f){return MATCH[f]||function(c){return c.dataset.topic===f}}
  /* the filter: All · Talks (Upcoming, Past) · Articles. Upcoming and Past appear once Talks is chosen */
  var fbtns=[].slice.call(document.querySelectorAll("#filters button")),fsub=document.getElementById("f-sub"),wallF="all";
  var TALKS={talks:1,up:1,past:1};
  function counts(){}
  function setFilter(f){
    wallF=MATCH[f]?f:"all";
    fbtns.forEach(function(x){var on=x.dataset.f===wallF||(x.dataset.f==="talks"&&TALKS[wallF]);x.setAttribute("aria-pressed",on?"true":"false")});
    if(fsub)fsub.hidden=!TALKS[wallF];
    var t=test(wallF),n=0;
    cards.forEach(function(c){var on=t(c);c.hidden=!on;if(on)n++});
    document.getElementById("wall-empty").hidden=n>0;
    document.getElementById("wall-count").textContent=n+" of "+cards.length+" shown";
    fills();relayout();
  }
  fbtns.forEach(function(x){x.addEventListener("click",function(){
    /* choosing Talks again from a subcategory goes back to every talk; choosing a subcategory again does the same */
    var f=x.dataset.f;if((f==="up"||f==="past")&&wallF===f)f="talks";setFilter(f)})});
  document.querySelectorAll("[data-reset]").forEach(function(r){r.addEventListener("click",function(){setFilter("all")})});
  if(wall){classify();order();counts()}
  /* talks change state while the page is open: re-check every minute and when the tab is shown again */
  function refresh(){if(!wall)return;var before=cards.map(function(c){return c.dataset.kind}).join();
    classify();if(before!==cards.map(function(c){return c.dataset.kind}).join()){order();counts();setFilter(wallF)}}
  setInterval(refresh,60000);document.addEventListener("visibilitychange",function(){if(!document.hidden)refresh()});

  /* ============ 2 · entrances: once, staggered by column so each row arrives left to right ============ */
  if(!reduce&&"IntersectionObserver" in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;
      var el=e.target,cols=parseInt(getComputedStyle(root).getPropertyValue("--cols"),10)||1,
          idx=el.parentElement===wall?cards.filter(function(c){return !c.hidden}).indexOf(el):0;
      el.style.transitionDelay=(idx%cols)*90+"ms";el.classList.add("in");io.unobserve(el);
      /* the stagger is for the entrance only; afterwards a hover must respond at once */
      setTimeout(function(){el.style.transitionDelay=""},1000)})},{rootMargin:"0px 0px -6% 0px"});
    document.querySelectorAll(".rise").forEach(function(el){io.observe(el)});
  }else document.querySelectorAll(".rise").forEach(function(el){el.classList.add("in")});

  /* ============ 3 · the red ASCII field ============
     A screen-sized canvas behind the page. It only changes while the page scrolls: the dense side travels
     right → left → right down the page. On touch screens the plain ground is painted along the page instead of fixed,
     so Safari lets the page run under its floating toolbar; the field itself stays a fixed canvas. */
  var DOC=matchMedia("(pointer:coarse)").matches;
  if(DOC)root.classList.add("doc-ground");
  var cv=document.getElementById("ascii-field");
  if(DOC)document.body.insertBefore(cv,document.body.firstChild);
  var ctx=cv.getContext("2d"),INK="rgba(200,16,46,.7)";
  /* one glyph size for all the ASCII: the field, the photo dissolve (and, in CSS, the trace blocks in the cards) */
  var FS=14,FONT='500 '+FS+'px "IBM Plex Mono", monospace',CH=FS,cols=0,rows=0,dpr=1,side=1,stops=[],noise=null,salts=null,drawn="",sizedW=0;
  /* the canvas is as tall as the screen, so Safari's toolbar growing or shrinking never needs a new canvas.
     Per-cell noise is computed once here, so a redraw is only arithmetic */
  function size(){
    dpr=Math.min(2,devicePixelRatio||1);var w=innerWidth,h=Math.max(innerHeight,(screen&&screen.height)||0);
    cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);cv.style.width=w+"px";cv.style.height=h+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.font=FONT;ctx.textBaseline="top";
    cols=Math.ceil(w/(ctx.measureText("M").width||FS*.6))+1;rows=Math.ceil(h/CH)+1;
    noise=new Float32Array(cols*rows);salts=new Float32Array(cols*rows);
    for(var y=0;y<rows;y++)for(var x=0;x<cols;x++){noise[y*cols+x]=(hash(x*1.7,y*1.3)-.5)*.5;salts[y*cols+x]=hash(x*5.3+11,y*7.7+5)}
    drawn="";sizedW=w;
  }
  /* three waypoints down the page; the dense side moves between them with smoothstep */
  var SIDES=[1,0,1];
  /* the waypoints come from the page with every card showing: filtering makes the page shorter, and the background
     must not move when a filter is chosen, so a filtered page keeps the waypoints it had */
  function measure(){if(wallF!=="all"&&stops.length)return;var H=document.documentElement.scrollHeight;stops=[H*.15,H*.5,H*.85]}
  function sideAt(y){
    if(y<=stops[0])return SIDES[0];
    for(var i=0;i<stops.length-1;i++)if(y<stops[i+1]){var t=(y-stops[i])/(stops[i+1]-stops[i]);t=t*t*(3-2*t);return lerp(SIDES[i],SIDES[i+1],t)}
    return SIDES[SIDES.length-1];
  }
  /* the field only changes with `side`; it is drawn in 400 steps, and a scroll that does not move it to a new step
     draws nothing (most scrolling, including the whole intro) */
  function draw(){
    if(cv.height/dpr<innerHeight-1||cv.width/dpr<innerWidth-1)size();
    var sd=Math.round(side*400)/400,key=sd+"|"+cols+"x"+rows;if(key===drawn)return;drawn=key;
    var w=innerWidth,cap=w<760?.6:.95,lut=new Array(cols);
    for(var x=0;x<cols;x++){var u=x/(cols-1),p=sd*u+(1-sd)*(1-u);lut[x]=Math.pow(p,1.9)*1.2-.08}
    ctx.clearRect(0,0,w,cv.height/dpr);ctx.fillStyle=INK;
    for(var y=0;y<rows;y++){var row="",o=y*cols;
      for(x=0;x<cols;x++)row+=ch(Math.min(cap,lut[x]+noise[o+x]),salts[o+x]);
      ctx.fillText(row,0,y*CH)}
  }
  var ticking=false;
  function frame(){side=sideAt(scrollY+innerHeight*.5);draw();updateDissolve(introP());ticking=false}
  function onScroll(){if(ticking)return;ticking=true;requestAnimationFrame(frame)}
  function setup(){size();measure();side=sideAt(scrollY+innerHeight*.5);draw()}
  function relayout(){root.style.setProperty("--nav-h",nav.offsetHeight+"px");measure();onScroll()}

  /* ============ 4 · the intro dissolve ============
     The About text is split into letters (an aria-hidden copy; the real text stays for screen readers).
     Scroll progress p through the pinned stretch turns each letter, line by line from the bottom up and left to right, into the ASCII
     ramp from dense to empty (@ % # 5 * 3 { } [ ] / \ : - .), staying white and fading out. Reversible: it only
     depends on p. Every letter keeps the width of its original glyph, so nothing reflows while it changes. */
  var intro=document.getElementById("about"),dz=[],introOn=!reduce&&!!intro;
  if(introOn)root.classList.add("motion");
  function buildDissolve(){
    if(!introOn)return;
    document.querySelectorAll("[data-dissolve]").forEach(function(el){
      var text=el.textContent.trim(),hid=document.createElement("span"),vis=document.createElement("span");
      hid.className="vh";hid.textContent=text;vis.className="dz";vis.setAttribute("aria-hidden","true");
      text.split(" ").forEach(function(word,wi){
        if(wi)vis.appendChild(document.createTextNode(" "));
        var w=document.createElement("span");w.className="wd";
        for(var k=0;k<word.length;k++){var c=document.createElement("span");c.className="c";c.textContent=word[k];w.appendChild(c);
          dz.push({el:c,ch:word[k],root:el,start:0,key:"",salt:hash(dz.length*1.7,3.1)})}
        vis.appendChild(w)});
      el.textContent="";el.appendChild(hid);el.appendChild(vis);
    });
  }
  /* letter widths and timing. Each letter is timed from the real geometry: the moment the rising wall (its filter row)
     would reach that letter on this screen. The letter is gone a little before then, so on any phone or window the
     wall only ever rises over empty space. Within a line, left goes first, with a little noise */
  /* on touch screens Safari reports the scroll position late during a fling, so the text clears with a wider lead */
  var DUR=.26,LEAD=DOC?.1:.05,lastP=-1,filtersEl=document.getElementById("filters");
  function measureDissolve(){
    if(!introOn)return;
    dz.forEach(function(d){d.el.style.width="";d.el.textContent=d.ch;d.el.classList.remove("g");d.el.style.opacity="";d.key=""});
    var pin=intro.querySelector(".intro-pin").getBoundingClientRect(),ir=intro.getBoundingClientRect(),
        run=Math.max(1,intro.offsetHeight-innerHeight),
        front=(filtersEl?filtersEl.getBoundingClientRect().top:ir.bottom)-ir.top-24;   /* the wall's leading edge, from the intro's top */
    /* left to right is measured within each block (the statement, the paragraph, the photo caption) */
    var boxes=new Map();dz.forEach(function(d){if(!boxes.has(d.root))boxes.set(d.root,d.root.getBoundingClientRect())});
    dz.forEach(function(d){var r=d.el.getBoundingClientRect(),ix=boxes.get(d.root);d.w=r.width;d.bot=r.bottom-pin.top;d.x=Math.max(0,Math.min(1,(r.left-ix.left)/Math.max(1,ix.width)))});
    dz.forEach(function(d,i){d.el.style.width=d.w+"px";
      var cover=(front-d.bot)/run;                         /* progress at which the wall reaches this letter */
      d.start=Math.max(0,Math.min(1-DUR,cover-DUR-LEAD-(1-d.x)*.06+(hash(i*.37,d.bot*.01)-.5)*.03))});
    camMeasure(front,run,pin.top);
    lastP=-1;updateDissolve(introP());
  }
  function introP(){if(!introOn)return 1;var r=intro.getBoundingClientRect(),run=intro.offsetHeight-innerHeight;return Math.max(0,Math.min(1,-r.top/Math.max(1,run)))}
  function smooth(a,b,x){var t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)}
  /* on short screens the intro is not pinned (CSS), so the text simply stays text */
  var SHORT=matchMedia("(max-height:540px)");
  if(SHORT.addEventListener)SHORT.addEventListener("change",function(){lastP=-1;measureDissolve()});
  function updateDissolve(p){
    if(!introOn)return;
    if(SHORT.matches)p=0;
    p=Math.round(p*1000)/1000;if(p===lastP)return;lastP=p;   /* past the intro (p stays 1) this costs nothing */
    intro.style.setProperty("--p",p);camScroll(p);
    for(var i=0;i<dz.length;i++){var d=dz[i],t=Math.max(0,Math.min(1,(p-d.start)/DUR)),key,lv;
      if(t<=0){key="o";if(d.key!==key){d.el.textContent=d.ch;d.el.classList.remove("g");d.el.style.opacity=""}}
      else{lv=Math.max(0,Math.min(N,Math.round((1-t)*N)));key="g"+lv;
        if(d.key!==key){
          var gl=pick(lv,d.salt);d.el.textContent=gl===" "?"\u00a0":gl;d.el.classList.add("g");
          d.el.style.opacity=(1-smooth(.55,1,t)*.75).toFixed(2)}}
      d.key=key}
  }
  buildDissolve();

  /* ============ 5 · the campus photograph ============
     Wide screens only. A canvas draws the photograph; while the page scrolls through the intro it dissolves into white
     ASCII glyphs of its own brightness and then into the field, row by row ahead of the rising wall, like the letters. */
  /* the photograph's glyphs are larger than the field's, so the picture reads as a coarse ASCII image */
  var CFS=20,cam=document.getElementById("campus"),CAM={on:false};
  function camInit(){
    if(!cam)return;
    var frame=cam.querySelector(".frame"),im=frame.querySelector("img");
    CAM={on:true,frame:frame,cv:frame.querySelector("canvas"),imgs:[im],cur:0,p:0,W:0,H:0,cols:0,rows:0,ch:CFS,cw:CFS*.6,lum:[],rowStart:[],salt:null};
    CAM.ctx=CAM.cv.getContext("2d");
    var f=(im.dataset.focus||"50% 50%").split(" ");im.fx=parseFloat(f[0])/100;im.fy=parseFloat(f[1])/100;
    function ready(){camLum(0);camDraw()}
    if(im.complete&&im.naturalWidth)ready();else im.addEventListener("load",ready);
    camSize();
  }
  /* the canvas follows its frame; the glyph grid is a 20px mono cell */
  function camSize(){
    if(!CAM.on)return;
    var W=CAM.frame.clientWidth,H=CAM.frame.clientHeight;if(!W||!H){CAM.W=0;return}
    var d=Math.min(2,devicePixelRatio||1),c=CAM.ctx;
    CAM.cv.width=Math.round(W*d);CAM.cv.height=Math.round(H*d);c.setTransform(d,0,0,d,0,0);
    c.font='500 '+CAM.ch+'px "IBM Plex Mono", monospace';c.textBaseline="top";
    CAM.cw=c.measureText("M").width||CAM.ch*.6;CAM.W=W;CAM.H=H;CAM.cols=Math.ceil(W/CAM.cw);CAM.rows=Math.ceil(H/CAM.ch);
    CAM.salt=new Float32Array(CAM.cols*CAM.rows);
    for(var y=0;y<CAM.rows;y++)for(var x=0;x<CAM.cols;x++)CAM.salt[y*CAM.cols+x]=hash(x*4.1+1,y*6.3+2);
    CAM.imgs.forEach(function(im,i){if(im.complete&&im.naturalWidth)camLum(i)});
    camDraw();
  }
  /* the crop that covers the frame and keeps the focus point in view */
  function camCrop(im,W,H){var iw=im.naturalWidth,ih=im.naturalHeight,sc=Math.max(W/iw,H/ih),sw=W/sc,sh=H/sc;
    return [(iw-sw)*im.fx,(ih-sh)*im.fy,sw,sh]}
  /* brightness per cell, stretched so every photo uses the whole ramp */
  function camLum(i){
    if(!CAM.W)return;var im=CAM.imgs[i],C=CAM.cols,R=CAM.rows,o=document.createElement("canvas"),g,r,px,v=new Float32Array(C*R),s2,lo,hi;
    o.width=C;o.height=R;g=o.getContext("2d",{willReadFrequently:true});
    r=camCrop(im,CAM.W,CAM.H);r[2]*=C*CAM.cw/CAM.W;r[3]*=R*CAM.ch/CAM.H;   /* the grid runs a little past the frame edge */
    g.drawImage(im,r[0],r[1],r[2],r[3],0,0,C,R);
    try{px=g.getImageData(0,0,C,R).data}catch(e){return}
    for(var k=0;k<C*R;k++)v[k]=(.2126*px[k*4]+.7152*px[k*4+1]+.0722*px[k*4+2])/255;
    s2=Array.prototype.slice.call(v).sort(function(a,b){return a-b});lo=s2[Math.floor(s2.length*.03)];hi=s2[Math.floor(s2.length*.97)];
    for(k=0;k<C*R;k++)v[k]=Math.max(0,Math.min(1,(v[k]-lo)/Math.max(.05,hi-lo)));
    CAM.lum[i]=v;
  }
  /* scroll timing per row, from the same geometry as the letters */
  function camMeasure(front,run,pinTop){
    if(!CAM.on||!CAM.W)return;var fr=CAM.frame.getBoundingClientRect().top-pinTop;CAM.rowStart=[];
    for(var y=0;y<CAM.rows;y++){var cover=(front-(fr+(y+1)*CAM.ch))/run;CAM.rowStart[y]=Math.max(0,Math.min(1-DUR,cover-DUR-LEAD))}
    var last=CAM.rowStart[CAM.rows-1]||0;CAM.fadeAt=last;
  }
  function camScroll(p){
    if(!CAM.on)return;var was=CAM.p;CAM.p=p;
    /* the frame's marks and caption go as soon as its lowest row starts to dissolve */
    cam.style.setProperty("--cam",(1-smooth(CAM.fadeAt||0,(CAM.fadeAt||0)+.12,p)).toFixed(3));
    if(p!==was&&(p>0||was>0))camDraw();
  }
  /* one frame: each cell is the photo, a white glyph of its brightness (with its alpha), or empty */
  function camDraw(){
    if(!CAM.on||!CAM.W||!CAM.lum[CAM.cur])return;
    var c=CAM.ctx,W=CAM.W,H=CAM.H,C=CAM.cols,R=CAM.rows,cw=CAM.cw,A=CAM.imgs[CAM.cur],L=CAM.lum[CAM.cur],p=CAM.p,
        pa=new Path2D(),nA=0,BK=[.25,.5,.75,1],rows=[[],[],[],[]],ra=camCrop(A,W,H);
    c.clearRect(0,0,W,H);
    if(p<=0){c.drawImage(A,ra[0],ra[1],ra[2],ra[3],0,0,W,H);return}
    for(var y=0;y<R;y++){
      var st=CAM.rowStart.length?CAM.rowStart[y]:2,sy=Math.max(0,Math.min(1,(p-st)/DUR)),line=[[],[],[],[]],run=-1;
      for(var x=0;x<=C;x++){
        var photo=false,g=" ",al=0;
        if(x<C){var k=y*C+x,sx=Math.max(0,Math.min(1,sy+(CAM.salt[k]-.5)*.25*(sy>0&&sy<1)));
          if(sx<=0)photo=true;
          else{var v=L[k]*(1-sx),lv=Math.round(v*N);
            if(v>.08&&lv>0){g=pick(Math.min(N,lv),CAM.salt[k]);al=1-smooth(.55,1,sx)*.75}}}
        if(photo){if(run<0)run=x}else if(run>=0){pa.rect(run*cw,y*CAM.ch,(x-run)*cw,CAM.ch);nA++;run=-1}
        if(x<C)for(var b=0;b<4;b++)line[b].push(al>0&&al<=BK[b]&&(b===0||al>BK[b-1])?g:" ");
      }
      for(b=0;b<4;b++)rows[b].push(line[b].join(""));
    }
    if(nA){c.save();c.clip(pa);c.drawImage(A,ra[0],ra[1],ra[2],ra[3],0,0,W,H);c.restore()}
    for(b=0;b<4;b++){c.fillStyle="rgba(255,255,255,"+BK[b]+")";
      for(y=0;y<R;y++)if(rows[b][y].trim())c.fillText(rows[b][y],0,y*CAM.ch)}
  }
  camInit();

  /* ============ 6 · a card opened full screen ============
     A click on a card opens it in a modal <dialog>: the media large, then label, speaker, date row, title and
     description. Esc, the close button, a click on the empty sheet or the browser's Back close it. An upcoming
     talk keeps its registration link there; a past talk links to its recap, which opens in the same sheet.
     Ctrl/Cmd/Shift-click still follows the card's own link. */
  var sheet=document.createElement("dialog");
  if(wall&&typeof sheet.showModal==="function"){
    sheet.className="sheet";sheet.setAttribute("aria-labelledby","sheet-title");sheet.tabIndex=-1;
    sheet.innerHTML='<button type="button" class="sheet-close" aria-label="Close"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg></button><div class="sheet-in"></div>';
    document.body.appendChild(sheet);
    var sheetIn=sheet.querySelector(".sheet-in"),sheetPushed=false,opener=null;
    function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
    function fillSheet(card){
      sheetIn.innerHTML="";
      var talk=card.dataset.type==="talk",media=card.querySelector(".media"),body=el("div","sheet-body"),mcol=el("div","sheet-media");
      if(media)mcol.appendChild(media.cloneNode(true));
      body.appendChild(el("p","sheet-tab",card.querySelector(".tab").textContent));
      var by=card.querySelector(".by"),when=card.querySelector(".when");
      if(talk&&by)body.appendChild(by.cloneNode(true));
      if(when)body.appendChild(when.cloneNode(true));
      var h=el("h2",null,card.querySelector("h3").textContent);h.id="sheet-title";body.appendChild(h);
      var q=card.querySelector(".q");if(q)body.appendChild(q.cloneNode(true));
      if(!talk&&by)body.appendChild(by.cloneNode(true));
      var cov=card.querySelector(".cover"),href=cov.getAttribute("href");
      if(talk&&card.dataset.kind==="up"&&/^https?:/.test(href)){
        var reg=el("a","sheet-link","Register for this talk");reg.href=href;reg.target="_blank";reg.rel="noopener";
        reg.insertAdjacentHTML("beforeend",'<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 9 9 3M4.5 3H9v4.5"/></svg>');body.appendChild(reg);
      }else if(talk&&card.dataset.kind==="past"&&card.dataset.recap){
        var rc=document.querySelector(card.dataset.recap);
        if(rc){var b=el("button","sheet-link","Read the recap");b.type="button";
          b.insertAdjacentHTML("beforeend",'<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6h7M6.5 3l3 3-3 3"/></svg>');
          b.addEventListener("click",function(){fillSheet(rc);sheet.scrollTop=0;sheet.focus()});body.appendChild(b)}
      }
      sheetIn.appendChild(mcol);sheetIn.appendChild(body);
      sheet.classList.toggle("no-media",!media);
    }
    function openSheet(card,byKey){
      if(!sheet.open)opener=byKey?card.querySelector(".cover"):null;   /* focus goes back only for keyboard users */
      fillSheet(card);
      if(!sheet.open){root.classList.add("sheet-open");sheet.showModal();sheet.focus();sheet.scrollTop=0;   /* focus the sheet itself: Tab reaches the close button next */
       
        try{history.pushState({sheet:1},"");sheetPushed=true}catch(e){sheetPushed=false}}
    }
    function shut(){
      if(!sheet.open)return;
      if(reduce){sheet.close();return}
      sheet.classList.add("closing");setTimeout(function(){sheet.classList.remove("closing");sheet.close()},240);
    }
    /* closing by hand also takes back the history entry the sheet added, so Back does not land on a closed sheet */
    function closeSheet(){if(sheetPushed){sheetPushed=false;history.back()}else shut()}
    addEventListener("popstate",function(){sheetPushed=false;shut()});
    sheet.addEventListener("close",function(){root.classList.remove("sheet-open");   /* back to the card that opened it */
      if(opener){opener.focus({preventScroll:true});opener=null}});
    sheet.addEventListener("cancel",function(e){e.preventDefault();closeSheet()});
    sheet.querySelector(".sheet-close").addEventListener("click",closeSheet);
    sheet.addEventListener("click",function(e){if(e.target===sheet||e.target===sheetIn)closeSheet()});
    cards.forEach(function(c){var cov=c.querySelector(".cover");cov.setAttribute("aria-haspopup","dialog");
      cov.addEventListener("click",function(e){if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;e.preventDefault();openSheet(c,e.detail===0)})});
  }

  /* ============ start ============ */
  setFilter(location.hash==="#blog"?"posts":"all");
  root.style.setProperty("--nav-h",nav.offsetHeight+"px");
  setup();
  if(document.fonts){document.fonts.ready.then(function(){fills();setup();camSize();measureDissolve()});if(document.fonts.load)document.fonts.load(FONT).then(function(){setup()})}
  addEventListener("load",function(){fills();setup();relayout();camSize();measureDissolve()});
  if("ResizeObserver" in window)new ResizeObserver(function(){relayout()}).observe(document.querySelector("main"));
  /* Phones fire resize all the time while Safari's toolbar slides in and out; only the height changes then, and the
     canvas already covers the full screen height, so nothing is rebuilt mid-scroll. A real change of width
     (rotation, a resized window) rebuilds everything once the resizing settles */
  var rt;addEventListener("resize",function(){
    if(DOC&&innerWidth===sizedW){onScroll();return}
    clearTimeout(rt);rt=setTimeout(function(){root.style.setProperty("--nav-h",nav.offsetHeight+"px");fills();setup();camSize();measureDissolve()},200)});
  addEventListener("scroll",onScroll,{passive:true});
})();
