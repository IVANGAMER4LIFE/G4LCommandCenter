
(() => {
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalTitle = document.getElementById('modalTitle');
  const modalText = document.getElementById('modalText');
  const toast = document.getElementById('toast');
  const soundToggle = document.getElementById('soundToggle');
  const statusCover = document.getElementById('statusCover');
  const liveStatusText = document.getElementById('liveStatusText');
  let toastTimer;
  let soundEnabled = false;
  let audioContext = null;
  let demoStatusIndex = 0;

  const panels = {
    home:['WELCOME TO G4L','<p>Your headquarters for gaming, live streams, community, and official G4L merchandise.</p><p>Explore the Command Center and choose your next mission.</p>'],
    about:['ABOUT G4L','<p>IVANGAMER4LIFE is a gaming and streaming brand built around entertainment, community, creativity, and long-term growth.</p><p>The Command Center connects every G4L mission in one place.</p>'],
    schedule:['STREAM SCHEDULE','<p>Your confirmed weekly streaming schedule will be connected here before launch.</p>'],
    streams:['STREAMS','<p>Watch live missions, previous broadcasts, videos, and highlights across the G4L network.</p>'],
    community:['G4L COMMUNITY','<p>The best moments are shared together. Community events, challenges, and milestones will connect here.</p>'],
    merch:['OFFICIAL G4L SUPPLY DEPOT','<p class="depot-intro">Gear up with official G4L merchandise created for the community.</p><div class="depot-grid"><article><strong>APPAREL</strong><span>Hoodies, T-shirts, caps and future limited collections.</span><button type="button" class="modal-buy-now" data-product="G4L Apparel">BUY NOW</button></article><article><strong>GAMING GEAR</strong><span>Mouse mats, desk accessories and future gaming equipment.</span><button type="button" class="modal-buy-now" data-product="G4L Gaming Gear">BUY NOW</button></article><article><strong>COMMAND ESSENTIALS</strong><span>Mugs, bottles, tumblers and everyday G4L items.</span><button type="button" class="modal-buy-now" data-product="G4L Command Essentials">BUY NOW</button></article></div><p class="depot-note"><b>SUPPLY STATUS:</b> Preparing for launch. Product links will activate when the official shop is connected.</p>'],
    gallery:['G4L GALLERY','<p>Gaming clips, highlights, artwork, and community moments will be collected here.</p>'],
    discord:['DISCORD COMMAND NETWORK','<p>Meet the community and prepare for future events, challenges, and missions.</p><p>A permanent invitation link will be connected before launch.</p>'],
    contact:['CONTACT','<p>A dedicated public contact address will be connected before launch.</p>'],
    commander:['COMMANDER IVANGAMER4LIFE','<p>Creator of the G4L Command Center and the Gamer4Life community.</p><p>Mission: build an entertaining, welcoming gaming brand where every follower can become part of the journey.</p>']
  };

  function openPanel(key){
    const panel = panels[key];
    if(!panel) return;
    modalTitle.textContent = panel[0];
    modalText.innerHTML = panel[1];
    modalBackdrop.hidden = false;
  }

  document.querySelectorAll('[data-panel]').forEach(el => {
    el.addEventListener('click', () => openPanel(el.dataset.panel));
  });

  document.getElementById('modalClose').addEventListener('click', () => modalBackdrop.hidden = true);
  modalBackdrop.addEventListener('click', event => {
    if(event.target === modalBackdrop) modalBackdrop.hidden = true;
  });
  addEventListener('keydown', event => {
    if(event.key === 'Escape') modalBackdrop.hidden = true;
  });

  function showToast(message){
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2300);
  }

  // Real moving countdown. Default begins at the artwork's displayed duration
  // and persists across refreshes on the same device.
  const existingTarget = Number(localStorage.getItem('g4l-stream-target'));
  const defaultDuration = (((1 * 24 + 15) * 60 + 45) * 60 + 30) * 1000;
  const targetTime = existingTarget > Date.now() ? existingTarget : Date.now() + defaultDuration;
  localStorage.setItem('g4l-stream-target', String(targetTime));

  function updateCountdown(){
    let remaining = Math.max(0, targetTime - Date.now());
    const days = Math.floor(remaining / 86400000);
    remaining %= 86400000;
    const hours = Math.floor(remaining / 3600000);
    remaining %= 3600000;
    const minutes = Math.floor(remaining / 60000);
    remaining %= 60000;
    const seconds = Math.floor(remaining / 1000);

    document.getElementById('days').textContent = String(days).padStart(2,'0');
    document.getElementById('hours').textContent = String(hours).padStart(2,'0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2,'0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2,'0');
  }
  updateCountdown();
  setInterval(updateCountdown,1000);

  document.addEventListener('click', event => {
    const button = event.target.closest('.modal-buy-now');
    if(!button) return;
    showToast(`${button.dataset.product} is preparing for launch. The official shop link will be connected when ready.`);
  });

  document.getElementById('reminderButton').addEventListener('click', () => {
    const enabled = localStorage.getItem('g4l-reminder') === 'on';
    localStorage.setItem('g4l-reminder', enabled ? 'off' : 'on');
    showToast(enabled ? 'Stream reminder removed.' : 'Stream reminder saved on this device.');
  });

  // Original G4L interface sound generated in-browser.
  function getAudioContext(){
    if(!audioContext){
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
  }

  function tone(frequency,duration,gain,type='sine',delay=0){
    if(!soundEnabled) return;
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const volume = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    volume.gain.setValueAtTime(gain,ctx.currentTime + delay);
    volume.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime + delay + duration);
    oscillator.connect(volume);
    volume.connect(ctx.destination);
    oscillator.start(ctx.currentTime + delay);
    oscillator.stop(ctx.currentTime + delay + duration);
  }

  function clickSound(){
    tone(155,.075,.025,'square');
    tone(320,.08,.014,'sine',.035);
  }

  soundToggle.addEventListener('click', async () => {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = soundEnabled ? 'Sound: On' : 'Sound: Off';
    soundToggle.setAttribute('aria-pressed',String(soundEnabled));
    if(soundEnabled){
      await getAudioContext().resume();
      tone(170,.12,.028,'sawtooth');
      tone(360,.10,.016,'sine',.075);
    }
  });

  document.querySelectorAll('.hotspot').forEach(el => {
    el.addEventListener('mouseenter',() => tone(480,.022,.006,'sine'));
    el.addEventListener('click',clickSound);
  });

  function setStatus(status){
    if(status !== 'online' && status !== 'offline'){
      statusCover.hidden = true;
      liveStatusText.hidden = true;
      return;
    }
    statusCover.hidden = false;
    liveStatusText.hidden = false;
    liveStatusText.textContent = status.toUpperCase();
    liveStatusText.className = 'live-status-text ' + status;
  }

  // Local preview control does not alter the approved artwork file.
  document.getElementById('statusDemo').addEventListener('click',event => {
    const options = ['artwork','online','offline'];
    demoStatusIndex = (demoStatusIndex + 1) % options.length;
    const status = options[demoStatusIndex];
    event.currentTarget.textContent = 'Preview status: ' + status[0].toUpperCase() + status.slice(1);
    setStatus(status === 'artwork' ? null : status);
  });

  // Twitch detection activates only on a hosted domain. Until confirmed,
  // the approved artwork remains visible with no CHECKING overlay.
  function startTwitchDetection(){
    if(!window.location.hostname || !window.Twitch || !window.Twitch.Player) return;
    try{
      const player = new Twitch.Player('twitchStatusPlayer',{
        width:400,height:300,channel:'ivangamer4life',
        parent:[window.location.hostname],autoplay:false,muted:true
      });
      player.addEventListener(Twitch.Player.ONLINE,() => setStatus('online'));
      player.addEventListener(Twitch.Player.OFFLINE,() => setStatus('offline'));
    }catch(error){
      console.warn('Twitch status unavailable:',error);
    }
  }
  startTwitchDetection();
})();


// =====================================================
// G4L WEBSITE ENHANCEMENT v1.2 — WOW LAYER CONTROLS
// =====================================================
(() => {
  const center = document.getElementById('commandCenter');
  const sparksLayer = document.getElementById('sparksLayer');
  const particleToggle = document.getElementById('effectsToggle');
  

  // Populate subtle ambient particles as an independent layer.
  if (sparksLayer && !sparksLayer.children.length) {
    for (let i = 0; i < 78; i++) {
      const spark = document.createElement('i');
      spark.style.left = `${9 + Math.random() * 79}%`;
      spark.style.top = `${24 + Math.random() * 69}%`;
      spark.style.animationDuration = `${6.5 + Math.random() * 8.5}s`;
      spark.style.animationDelay = `${-Math.random() * 12}s`;
      const scale = .65 + Math.random() * 1.15;
      spark.style.transform = `scale(${scale})`;
      sparksLayer.appendChild(spark);
    }
  }

  particleToggle?.addEventListener('click', () => {
    const isOff = center.classList.toggle('particles-off');
    particleToggle.textContent = isOff ? 'Particles: Off' : 'Particles: On';
    particleToggle.setAttribute('aria-pressed', String(!isOff));
  });

  // React to live/offline status established by the existing website logic.
  const statusText = document.getElementById('liveStatusText');
  if (statusText) {
    const updateLiveClass = () => {
      center.classList.toggle('stream-online', statusText.textContent.trim() === 'ONLINE');
    };
    updateLiveClass();
    new MutationObserver(updateLiveClass).observe(statusText, {
      childList:true,
      subtree:true,
      attributes:true
    });
  }
})();

(() => {
  const center=document.getElementById('commandCenter');
  const boot=document.getElementById('g4lBoot');
  const bootMessage=document.getElementById('bootMessage');
  const bootDetail=document.getElementById('bootDetail');
  const bootBar=document.getElementById('bootBar');
  const skipBoot=document.getElementById('skipBoot');
  const replayBoot=document.getElementById('replayBoot');
  
  const ambienceToggle=document.getElementById('ambienceToggle');
  const dustLayer=document.getElementById('dustLayer');
  const powerFlash=document.getElementById('powerFlash');

  document.querySelectorAll('.hotspot').forEach(el=>{
    if(!el.querySelector('.gloss')){
      const gloss=document.createElement('span');
      gloss.className='gloss';
      el.appendChild(gloss);
    }
  });

  if(dustLayer&&!dustLayer.children.length){
    for(let i=0;i<88;i++){
      const dot=document.createElement('i');
      const size=1+Math.random()*2.5;
      dot.style.width=size+'px';
      dot.style.height=size+'px';
      dot.style.left=(Math.random()*100)+'%';
      dot.style.top=(16+Math.random()*80)+'%';
      dot.style.animationDuration=(9+Math.random()*16)+'s';
      dot.style.animationDelay=(-Math.random()*18)+'s';
      dustLayer.appendChild(dot);
    }
  }

  function flash(){
    powerFlash.classList.remove('active');
    void powerFlash.offsetWidth;
    powerFlash.classList.add('active');
  }

  let bootTimers=[];
  function clearBoot(){bootTimers.forEach(clearTimeout);bootTimers=[]}
  function hideBoot(){boot.classList.add('hidden');flash()}
  function runBoot(){
    clearBoot();
    boot.classList.remove('hidden');
    bootBar.style.width='0%';
    const steps=[
      [120,'INITIALIZING COMMAND CENTER','CORE SYSTEMS STANDBY',16],
      [560,'CALIBRATING NEON INTERFACE','CYBERPUNK UI ONLINE',39],
      [1040,'AUTHENTICATING COMMANDER','IDENTITY VERIFIED',63],
      [1510,'CONNECTING G4L NETWORK','SOCIAL LINKS SECURED',84],
      [1990,'ACCESS GRANTED','WELCOME, COMMANDER',100]
    ];
    steps.forEach(([delay,msg,detail,pct])=>{
      bootTimers.push(setTimeout(()=>{
        bootMessage.textContent=msg;
        bootDetail.textContent=detail;
        bootBar.style.width=pct+'%';
      },delay));
    });
    bootTimers.push(setTimeout(hideBoot,2600));
  }

  if(!matchMedia('(prefers-reduced-motion: reduce)').matches) runBoot();
  else hideBoot();

  skipBoot?.addEventListener('click',hideBoot);
  replayBoot?.addEventListener('click',runBoot);

  const status=document.getElementById('liveStatusText');
  if(status){
    const update=()=>center.classList.toggle('stream-online',status.textContent.trim()==='ONLINE');
    update();
    new MutationObserver(update).observe(status,{childList:true,subtree:true,attributes:true});
  }
})();


// =========================================================
// G4L PHASE 2 — PREMIUM INTERFACE
// =========================================================
(() => {
  const center = document.getElementById('commandCenter');
  const phase2Toggle = document.getElementById('phase2Toggle');
  const buttonFxToggle = document.getElementById('buttonFxToggle');
  const heartbeatToggle = document.getElementById('heartbeatToggle');

  document.querySelectorAll('.hotspot').forEach((el) => {
    if (!el.querySelector('.phase2-gloss')) {
      const gloss = document.createElement('span');
      gloss.className = 'phase2-gloss';
      el.appendChild(gloss);
    }

    el.addEventListener('click', () => {
      el.classList.remove('phase2-click');
      void el.offsetWidth;
      el.classList.add('phase2-click');
      setTimeout(() => el.classList.remove('phase2-click'), 380);
    });
  });

  phase2Toggle?.addEventListener('click', () => {
    const off = center.classList.toggle('phase2-off');
    phase2Toggle.textContent = off ? 'Phase 2: Off' : 'Phase 2: On';
    phase2Toggle.setAttribute('aria-pressed', String(!off));
  });

  buttonFxToggle?.addEventListener('click', () => {
    const off = center.classList.toggle('button-fx-off');
    buttonFxToggle.textContent = off ? 'Button FX: Off' : 'Button FX: On';
    buttonFxToggle.setAttribute('aria-pressed', String(!off));
  });

  heartbeatToggle?.addEventListener('click', () => {
    const off = center.classList.toggle('heartbeat-off');
    heartbeatToggle.textContent = off ? 'Heartbeat: Off' : 'Heartbeat: On';
    heartbeatToggle.setAttribute('aria-pressed', String(!off));
  });

  // Animate only digits that actually change.
  const digitIds = ['days','hours','minutes','seconds'];
  const previous = {};
  setInterval(() => {
    digitIds.forEach(id => {
      const node = document.getElementById(id);
      if (!node) return;
      const value = node.textContent;
      if (previous[id] !== undefined && previous[id] !== value) {
        node.classList.remove('tick');
        void node.offsetWidth;
        node.classList.add('tick');
      }
      previous[id] = value;
    });
  }, 180);

  // Make the live card pulse when status is ONLINE.
  const status = document.getElementById('liveStatusText');
  if (status) {
    const syncStatus = () => {
      center.classList.toggle('stream-online', status.textContent.trim() === 'ONLINE');
    };
    syncStatus();
    new MutationObserver(syncStatus).observe(status, {
      childList:true,
      subtree:true,
      attributes:true
    });
  }
})();


// =========================================================
// PHASE 3 — STEP 1: PREMIUM BUTTONS
// =========================================================
(() => {
  const center = document.getElementById('commandCenter');
  const toggle = document.getElementById('step1ButtonToggle');

  document.querySelectorAll('.hotspot').forEach((button) => {
    if (!button.querySelector('.premium-glass')) {
      const glass = document.createElement('span');
      glass.className = 'premium-glass';
      button.appendChild(glass);
    }

    if (!button.querySelector('.corner-spark')) {
      const spark = document.createElement('span');
      spark.className = 'corner-spark';
      button.appendChild(spark);
    }

    button.addEventListener('click', () => {
      button.classList.remove('premium-press');
      void button.offsetWidth;
      button.classList.add('premium-press');
      setTimeout(() => button.classList.remove('premium-press'), 360);
    });
  });

  toggle?.addEventListener('click', () => {
    const off = center.classList.toggle('premium-buttons-off');
    toggle.textContent = off ? 'Premium Buttons: Off' : 'Premium Buttons: On';
    toggle.setAttribute('aria-pressed', String(!off));
  });
})();


// =========================================================
// PHASE 3 — STEP 2: LIVE COMMAND SYSTEM
// =========================================================
(() => {
  const center = document.getElementById('commandCenter');
  const liveSystemToggle = document.getElementById('liveSystemToggle');
  const previewToggle = document.getElementById('livePreviewToggle');
  const statusText = document.getElementById('liveStatusText');
  const statusCover = document.getElementById('statusCover');
  let previewIndex = 0;

  function animateStatusText(){
    if (!statusText || statusText.hidden) return;
    statusText.classList.remove('status-enter');
    void statusText.offsetWidth;
    statusText.classList.add('status-enter');
  }

  function applyLiveState(state){
    center.classList.remove('stream-online','stream-offline');

    if (state === 'online') {
      center.classList.add('stream-online');
      if (statusCover) statusCover.hidden = false;
      if (statusText) {
        statusText.hidden = false;
        statusText.textContent = 'ONLINE';
        statusText.className = 'live-status-text online';
      }
    } else if (state === 'offline') {
      center.classList.add('stream-offline');
      if (statusCover) statusCover.hidden = false;
      if (statusText) {
        statusText.hidden = false;
        statusText.textContent = 'OFFLINE';
        statusText.className = 'live-status-text offline';
      }
    } else {
      if (statusCover) statusCover.hidden = true;
      if (statusText) statusText.hidden = true;
    }

    animateStatusText();
  }

  liveSystemToggle?.addEventListener('click', () => {
    const off = center.classList.toggle('live-system-off');
    liveSystemToggle.textContent = off ? 'Live System: Off' : 'Live System: On';
    liveSystemToggle.setAttribute('aria-pressed', String(!off));
  });

  previewToggle?.addEventListener('click', () => {
    const states = ['artwork','online','offline'];
    previewIndex = (previewIndex + 1) % states.length;
    const state = states[previewIndex];
    previewToggle.textContent =
      state === 'artwork' ? 'Preview: Artwork' :
      state === 'online' ? 'Preview: Online' : 'Preview: Offline';

    applyLiveState(state === 'artwork' ? null : state);
  });

  // Synchronize with Twitch status events from the existing website logic.
  if (statusText) {
    const syncFromStatus = () => {
      if (statusText.hidden) return;
      const value = statusText.textContent.trim().toLowerCase();
      if (value === 'online') {
        center.classList.add('stream-online');
        center.classList.remove('stream-offline');
      } else if (value === 'offline') {
        center.classList.add('stream-offline');
        center.classList.remove('stream-online');
      }
    };
    new MutationObserver(syncFromStatus).observe(statusText,{
      childList:true,
      subtree:true,
      attributes:true
    });
  }
})();


// =========================================================
// PHASE 3 — STEP 3: PREMIUM COUNTDOWN SYSTEM
// =========================================================
(() => {
  const center = document.getElementById('commandCenter');
  const countdown = document.getElementById('countdown');
  const fxToggle = document.getElementById('countdownFxToggle');
  const previewToggle = document.getElementById('countdownDemoToggle');

  const ids = ['days','hours','minutes','seconds'];
  const previousValues = {};
  let previewMode = 'normal';

  function animateChangedDigits(){
    ids.forEach((id) => {
      const node = document.getElementById(id);
      if (!node) return;

      const value = node.textContent;
      if (previousValues[id] !== undefined && previousValues[id] !== value) {
        node.classList.remove('countdown-tick');
        void node.offsetWidth;
        node.classList.add('countdown-tick');
      }
      previousValues[id] = value;
    });
  }

  function getRemainingSeconds(){
    const d = Number(document.getElementById('days')?.textContent || 0);
    const h = Number(document.getElementById('hours')?.textContent || 0);
    const m = Number(document.getElementById('minutes')?.textContent || 0);
    const s = Number(document.getElementById('seconds')?.textContent || 0);
    return (((d * 24 + h) * 60 + m) * 60 + s);
  }

  function applyUrgencyState(){
    if (!countdown) return;

    countdown.classList.remove('countdown-urgent','countdown-final-minute');
    countdown.querySelectorAll('span').forEach((node) => {
      node.classList.remove('countdown-warning');
    });

    let remaining = getRemainingSeconds();

    if (previewMode === 'urgent') remaining = 9 * 60 + 30;
    if (previewMode === 'final') remaining = 45;

    if (remaining <= 60) {
      countdown.classList.add('countdown-final-minute');
      countdown.querySelectorAll('span').forEach((node) => {
        node.classList.add('countdown-warning');
      });
    } else if (remaining <= 600) {
      countdown.classList.add('countdown-urgent');
      countdown.querySelectorAll('span').forEach((node) => {
        node.classList.add('countdown-warning');
      });
    }
  }

  fxToggle?.addEventListener('click', () => {
    const off = center.classList.toggle('countdown-fx-off');
    fxToggle.textContent = off ? 'Countdown FX: Off' : 'Countdown FX: On';
    fxToggle.setAttribute('aria-pressed', String(!off));
  });

  previewToggle?.addEventListener('click', () => {
    previewMode =
      previewMode === 'normal' ? 'urgent' :
      previewMode === 'urgent' ? 'final' : 'normal';

    previewToggle.textContent =
      previewMode === 'normal' ? 'Countdown Preview: Normal' :
      previewMode === 'urgent' ? 'Countdown Preview: Under 10 Min' :
      'Countdown Preview: Final Minute';

    applyUrgencyState();
  });

  setInterval(() => {
    animateChangedDigits();
    applyUrgencyState();
  }, 180);
})();

// =========================================================
// PHASE 3 — STEP 4: LIVING ATMOSPHERE
// =========================================================
(() => {
  const center=document.getElementById('commandCenter');
  const toggle=document.getElementById('atmosphereToggle');
  const intensity=document.getElementById('sparkIntensityToggle');
  const back=document.getElementById('atmoBack');
  const mid=document.getElementById('atmoMid');
  const front=document.getElementById('atmoFront');
  function addParticles(layer,count,cls){
    if(!layer||layer.children.length)return;
    for(let i=0;i<count;i++){
      const p=document.createElement('i');
      p.style.left=(Math.random()*100)+'%';
      p.style.top=(12+Math.random()*84)+'%';
      if(cls==='back'){p.style.animationDuration=(15+Math.random()*16)+'s';p.style.animationDelay=(-Math.random()*26)+'s'}
      if(cls==='mid'){p.style.animationDuration=(8+Math.random()*11)+'s';p.style.animationDelay=(-Math.random()*16)+'s'}
      if(cls==='front'){p.style.animationDuration=(7+Math.random()*10)+'s';p.style.animationDelay=(-Math.random()*14)+'s'}
      layer.appendChild(p);
    }
  }
  addParticles(back,54,'back'); addParticles(mid,42,'mid'); addParticles(front,18,'front');
  toggle?.addEventListener('click',()=>{const off=center.classList.toggle('atmosphere-off');toggle.textContent=off?'Living Atmosphere: Off':'Living Atmosphere: On';toggle.setAttribute('aria-pressed',String(!off))});
  let level=1;
  intensity?.addEventListener('click',()=>{level=(level+1)%3;center.classList.remove('atmosphere-subtle','atmosphere-vivid');if(level===0){center.classList.add('atmosphere-subtle');intensity.textContent='Atmosphere: Subtle'}else if(level===1){intensity.textContent='Atmosphere: Balanced'}else{center.classList.add('atmosphere-vivid');intensity.textContent='Atmosphere: Vivid'}});
  const groups=[
    ['.nav-home,.nav-about,.nav-live,.nav-schedule,.nav-streams,.nav-community,.nav-merch,.nav-gallery,.nav-discord,.nav-contact','hover-nav'],
    ['.card-live,.button-live','hover-live'],
    ['.card-upcoming,.button-reminder','hover-countdown'],
    ['.commander-card','hover-commander']
  ];
  groups.forEach(([selector,cls])=>document.querySelectorAll(selector).forEach(el=>{el.addEventListener('mouseenter',()=>center.classList.add(cls));el.addEventListener('mouseleave',()=>center.classList.remove(cls));el.addEventListener('focus',()=>center.classList.add(cls));el.addEventListener('blur',()=>center.classList.remove(cls))}));
})();
