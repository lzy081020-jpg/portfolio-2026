(() => {
  const $ = (s, p=document) => p.querySelector(s);
  const $$ = (s, p=document) => [...p.querySelectorAll(s)];

  // page transition
  const transition = $('.page-transition');
  if (transition) {
    transition.classList.add('entering');
    setTimeout(() => transition.classList.remove('entering'), 800);
  }
  $$('a[data-transition]').forEach(a => {
    a.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')) return;
      const target = new URL(href, location.href);
      if (target.pathname === location.pathname && target.search === location.search) {
        if (target.hash) {
          e.preventDefault();
          document.body.classList.remove('is-leaving');
          transition?.classList.remove('leaving', 'entering');
          const section = document.getElementById(decodeURIComponent(target.hash.slice(1)));
          section?.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el => el.classList.add('visible'));
          location.hash = target.hash;
          section?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
        }
        return;
      }
      e.preventDefault();
      document.body.classList.add('is-leaving');
      if (transition) transition.classList.add('leaving');
      setTimeout(() => { location.href = href; }, 520);
    });
  });

  addEventListener('pageshow', () => {
    document.body.classList.remove('is-leaving');
    transition?.classList.remove('leaving');
  });

  // nav
  const nav = $('.nav');
  const onScroll = () => nav?.classList.toggle('scrolled', scrollY > 18);
  onScroll();
  addEventListener('scroll', onScroll, {passive:true});

  const menuBtn = $('.menu-btn');
  const navLinks = $('.nav-links');
  menuBtn?.addEventListener('click', () => navLinks?.classList.toggle('open'));
  $$('.nav-links a').forEach(a => a.addEventListener('click', () => navLinks?.classList.remove('open')));

  // theme
  const themeBtn = $('#themeBtn');
  const stored = localStorage.getItem('portfolio-theme');
  if (stored) document.documentElement.dataset.theme = stored;
  themeBtn?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('portfolio-theme', next);
  });

  // desktop cursor
  if (matchMedia('(pointer:fine)').matches) {
    const dot = $('.cursor-dot'), ring = $('.cursor-ring');
    if (dot && ring) {
      document.body.classList.add('cursor-ready');
      let rx=0, ry=0, mx=0, my=0;
      addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; dot.style.transform=`translate(${mx-3.5}px,${my-3.5}px)`; });
      const loop = () => { rx += (mx-rx)*.16; ry += (my-ry)*.16; ring.style.transform=`translate(${rx-17}px,${ry-17}px)`; requestAnimationFrame(loop); };
      loop();
      $$('a,button,.tilt,.video-card').forEach(el => {
        el.addEventListener('mouseenter',()=>ring.classList.add('active'));
        el.addEventListener('mouseleave',()=>ring.classList.remove('active'));
      });
    }
  }

  // reveal observer
  const revealEls = $$('.reveal,.reveal-left,.reveal-right,.skill-row,.math-panel');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, {threshold:.12});
    revealEls.forEach(el => io.observe(el));
  } else revealEls.forEach(el => el.classList.add('visible'));

  // card pointer glow
  $$('.card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r=card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX-r.left}px`);
      card.style.setProperty('--my', `${e.clientY-r.top}px`);
    });
  });

  // tilt cards
  if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $$('.tilt').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        card.style.transform=`perspective(900px) rotateX(${y*-5}deg) rotateY(${x*7}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave',()=> card.style.transform='');
    });
  }

  // typewriter
  const typed = $('#typed');
  if (typed) {
    const words = ['AI + 编程开发者','自媒体创作者','持续学习者','Vibe Coding 实践者'];
    let wi=0, ci=0, deleting=false;
    const tick=()=>{
      const w=words[wi];
      typed.textContent = deleting ? w.slice(0,ci--) : w.slice(0,ci++);
      let t = deleting ? 46 : 85;
      if(!deleting && ci>w.length){deleting=true;t=1100;ci=w.length;}
      else if(deleting && ci<0){deleting=false;wi=(wi+1)%words.length;ci=0;t=280;}
      setTimeout(tick,t);
    }; tick();
  }

  // Matrix canvas - inspired by reference video
  const canvas = $('#matrix');
  if (canvas && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx=canvas.getContext('2d');
    let w,h,cols,drops,font=14,dpr=Math.min(devicePixelRatio,2);
    const chars='01AI<>/{}[]PYTHONC++MLDATA'.split('');
    const resize=()=>{
      w=canvas.clientWidth;h=canvas.clientHeight;
      canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
      cols=Math.floor(w/font);drops=Array.from({length:cols},()=>Math.random()*-40);
    };
    resize(); addEventListener('resize',resize);
    const draw=()=>{
      ctx.fillStyle='rgba(5,8,7,.11)';ctx.fillRect(0,0,w,h);
      ctx.font=`${font}px ui-monospace,Consolas,monospace`;
      for(let i=0;i<drops.length;i++){
        const ch=chars[(Math.random()*chars.length)|0];
        ctx.fillStyle=Math.random()>.96?'#42e8ff':'#43f78f';
        ctx.globalAlpha=.25+Math.random()*.48;
        ctx.fillText(ch,i*font,drops[i]*font);
        if(drops[i]*font>h && Math.random()>.975)drops[i]=0; drops[i]+=.45+Math.random()*.45;
      }
      ctx.globalAlpha=1;requestAnimationFrame(draw);
    }; draw();
  }

  // floating particles
  $$('.particle-field').forEach(field => {
    const colors=['#42e8ff','#ff3d92','#f1d54a','#80ffb7'];
    const count=innerWidth<700?12:26;
    for(let i=0;i<count;i++){
      const p=document.createElement('i');p.className='particle';
      p.style.left=Math.random()*100+'%';p.style.top=Math.random()*-30+'%';
      p.style.setProperty('--c',colors[i%colors.length]);
      p.style.animationDuration=(3+Math.random()*6)+'s';p.style.animationDelay=(-Math.random()*7)+'s';
      p.style.transform=`rotate(${(Math.random()-.5)*16}deg)`;
      field.appendChild(p);
    }
  });

  // video cards
  $$('.video-card').forEach(card => {
    const video=$('video',card), cover=$('.video-cover',card);
    if(!video||!cover)return;
    cover.addEventListener('click',()=>{
      $$('.video-card video').forEach(v=>{if(v!==video){v.pause();v.closest('.video-card')?.classList.remove('playing')}});
      card.classList.add('playing'); video.play().catch(()=>card.classList.remove('playing'));
    });
    video.addEventListener('play',()=>card.classList.add('playing'));
    video.addEventListener('ended',()=>card.classList.remove('playing'));
  });

  // counters
  $$('.count').forEach(el => {
    const end=Number(el.dataset.end||0), suffix=el.dataset.suffix||'';
    let started=false;
    const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&!started){started=true;const start=performance.now();const dur=900;const run=n=>{const p=Math.min((n-start)/dur,1),v=Math.round(end*(1-Math.pow(1-p,3)));el.textContent=v+suffix;if(p<1)requestAnimationFrame(run)};requestAnimationFrame(run);obs.disconnect()}}),{threshold:.5});obs.observe(el);
  });

  // print resume
  $('#printBtn')?.addEventListener('click',()=>window.print());


  // click-to-reveal text blocks
  $$('.info-reveal .reveal-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const box = btn.closest('.info-reveal');
      const open = box.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  // image-first story cards: click/keyboard to reveal quote
  $$('.story-click').forEach(card => {
    const toggle = () => {
      const open = card.classList.toggle('open');
      card.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); } });
  });

  // expandable math milestones
  $$('.milestone').forEach(item => item.addEventListener('click', () => {
    const open = item.classList.toggle('open');
    item.setAttribute('aria-expanded', open ? 'true' : 'false');
  }));

  // math hover tooltip (heatmap + recovery points)
  const tipTargets = $$('[data-tip]');
  if (tipTargets.length) {
    const tip = document.createElement('div');
    tip.className = 'math-tooltip'; document.body.appendChild(tip);
    const move = e => { tip.style.left = `${Math.min(e.clientX + 12, innerWidth - 280)}px`; tip.style.top = `${Math.min(e.clientY + 12, innerHeight - 90)}px`; };
    tipTargets.forEach(el => {
      el.addEventListener('pointerenter', e => { tip.textContent = el.dataset.tip || ''; tip.classList.add('show'); move(e); });
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', () => tip.classList.remove('show'));
      el.addEventListener('focus', () => { tip.textContent = el.dataset.tip || ''; tip.classList.add('show'); const r=el.getBoundingClientRect(); tip.style.left=`${Math.min(r.left, innerWidth-280)}px`; tip.style.top=`${Math.min(r.bottom+8, innerHeight-90)}px`; });
      el.addEventListener('blur', () => tip.classList.remove('show'));
    });
  }

  // editable CURRENT CHALLENGE: saved locally, so the portfolio can show real progress without hard-coding fake milestones
  const challengeTitle = $('#challengeTitle');
  const challengeProgress = $('#challengeProgress');
  const challengeUpdated = $('#challengeUpdated');
  const challengeKey = 'lzy-math-current-challenge-v1';
  const renderChallenge = data => {
    if (!challengeTitle || !challengeProgress) return;
    challengeTitle.textContent = data?.title || '大学数学前置学习：微积分 × 线性代数 × AI 表示';
    challengeProgress.textContent = data?.progress || '尚未填写具体书名 / 页码 / 习题 / 论文引理。点击“更新挑战”后可写入真实进度，浏览器会自动保存。';
    if (challengeUpdated) challengeUpdated.textContent = data?.updated ? `· 更新 ${data.updated}` : '';
  };
  if (challengeTitle) {
    try { renderChallenge(JSON.parse(localStorage.getItem(challengeKey) || 'null')); } catch { renderChallenge(null); }
    $('#editChallenge')?.addEventListener('click', () => {
      const currentTitle = challengeTitle.textContent.trim();
      const currentProgress = challengeProgress.textContent.trim();
      const title = prompt('当前正在啃什么？可填书名 / 专题 / 论文，例如：高等数学·极限与连续', currentTitle);
      if (title === null) return;
      const progress = prompt('真实进度是什么？可填页码 / 习题号 / 引理 / 当前卡点', currentProgress);
      if (progress === null) return;
      const now = new Date();
      const data = { title: title.trim() || currentTitle, progress: progress.trim() || currentProgress, updated: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}` };
      localStorage.setItem(challengeKey, JSON.stringify(data));
      renderChallenge(data);
      toastMessage('当前数学挑战已更新并保存在本机浏览器');
    });
    $('#copyChallenge')?.addEventListener('click', async () => {
      const text = `当前挑战：${challengeTitle.textContent.trim()}｜${challengeProgress.textContent.trim()}`;
      try { await navigator.clipboard.writeText(text); }
      catch { const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
      toastMessage(`已复制：${text}`);
    });
  }

  // copy contact/challenge text
  const toast = $('#siteToast') || (()=>{ const t=document.createElement('div'); t.className='site-toast'; t.id='siteToast'; document.body.appendChild(t); return t; })();
  let toastTimer;
  const toastMessage = message => { toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove('show'),1800); };
  $$('[data-copy]').forEach(el => el.addEventListener('click', async () => {
    const text = el.dataset.copy || '';
    try { await navigator.clipboard.writeText(text); }
    catch { const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    toastMessage(`已复制：${text}`);
  }));

})();


// certificate lightbox (added 2026-09)
(() => {
  const box = document.getElementById('certLightbox');
  if (!box) return;
  const big = box.querySelector('img');
  const close = () => { box.classList.remove('open'); box.setAttribute('aria-hidden','true'); big.removeAttribute('src'); };
  document.querySelectorAll('.cert-open img').forEach(img => img.closest('.cert-open')?.addEventListener('click', () => {
    big.src = img.src; big.alt = img.alt; box.classList.add('open'); box.setAttribute('aria-hidden','false');
  }));
  box.querySelector('.cert-close')?.addEventListener('click', close);
  box.addEventListener('click', e => { if (e.target === box) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && box.classList.contains('open')) close(); });
})();

// motto: 金句「于曲折处跋涉，于荒芜见繁花」逐字动效
(() => {
  const mottos = document.querySelectorAll('.motto');
  if (!mottos.length) return;
  mottos.forEach(el => {
    let i = 0;
    // 只拆分文本节点，保留 <br> 等子元素；索引跨行连续，让光浪顺流而下
    [...el.childNodes].forEach(node => {
      if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) return;
      const frag = document.createDocumentFragment();
      [...node.textContent].forEach(ch => {
        if (/\s/.test(ch)) { frag.appendChild(document.createTextNode(ch)); return; }
        const s = document.createElement('span');
        s.className = 'motto-char';
        s.style.setProperty('--i', i++);
        s.textContent = ch;
        frag.appendChild(s);
      });
      node.replaceWith(frag);
    });
    el.classList.add('motto-ready');
  });
})();

/* =========================================================
   2026-09-19 动态效果升级（参考：描边巨字 / 解码文字 / 萤火粒子 /
   证书3D飞入 / 终端联系卡 / 水面波纹）——只做增量，不删除原有组成
   ========================================================= */

// ---- 1. scramble decode: [data-scramble="最终文字"] 进入视口时解码 ----
(() => {
  const GLYPHS = '!<>-_\\/[]{}=+*^?#01ABCDEF$%&01';
  const $$ = (s, p=document) => [...p.querySelectorAll(s)];
  const run = el => {
    if (el.dataset.done === '1') return;
    const final = el.dataset.scramble || el.textContent || '';
    const chars = [...final];
    let frame = 0;
    const total = 22 + Math.floor(chars.length * 1.7);
    const queue = chars.map(ch => {
      const start = Math.floor(Math.random() * total * 0.5);
      return { ch, start, end: start + 6 + Math.floor(Math.random() * 14) };
    });
    const update = () => {
      let out = '';
      for (const q of queue) {
        if (frame >= q.end) out += q.ch;
        else if (frame >= q.start) out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        else out += q.ch.trim() ? '\u00A0' : q.ch;
      }
      el.textContent = out;
      if (frame < total) { frame++; requestAnimationFrame(update); }
      else { el.textContent = final; el.dataset.done = '1'; }
    };
    update();
  };
  const els = $$('[data-scramble]').filter(el => !el.closest('.contact-terminal'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
    }), { threshold: .7 });
    els.forEach(el => io.observe(el));
  } else els.forEach(run);
  window.__scrambleRun = run;
})();

// ---- 2. site-wide glowing dust (萤火粒子，缓慢上升+呼吸闪烁) ----
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('canvas');
  c.className = 'dust-canvas';
  c.setAttribute('aria-hidden', 'true');
  document.body.appendChild(c);
  const ctx = c.getContext('2d');
  const dpr = Math.min(devicePixelRatio, 2);
  let w, h, parts;
  const make = () => ({
    x: Math.random() * w, y: Math.random() * h,
    r: .6 + Math.random() * 1.9,
    vx: (Math.random() - .5) * .16,
    vy: -.04 - Math.random() * .26,
    a: .1 + Math.random() * .5,
    tw: Math.random() * Math.PI * 2,
    cyan: Math.random() < .25
  });
  const resize = () => {
    w = innerWidth; h = innerHeight;
    c.width = w * dpr; c.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = w < 700 ? 20 : 48;
    parts = Array.from({ length: n }, make);
  };
  resize();
  addEventListener('resize', resize);
  const tick = () => {
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy; p.tw += .02;
      if (p.y < -8) { p.y = h + 8; p.x = Math.random() * w; }
      if (p.x < -8) p.x = w + 8; else if (p.x > w + 8) p.x = -8;
      const fl = .5 + .5 * Math.sin(p.tw);
      const col = p.cyan ? '66,232,255' : '128,255,183';
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 7);
      g.addColorStop(0, `rgba(${col},${(p.a * fl).toFixed(3)})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 7, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(tick);
  };
  tick();
})();

// ---- 3. certificate cards: 3D mouse tilt (灯箱/点击仍然生效) ----
(() => {
  if (!matchMedia('(pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const $$ = (s, p=document) => [...p.querySelectorAll(s)];
  $$('.cert-item').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(1000px) rotateX(${y * -6}deg) rotateY(${x * 8}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

// ---- 4. contact terminal: TAP_TO_REVEAL 解码 + 再点复制 ----
(() => {
  const term = document.getElementById('contactTerminal');
  if (!term) return;

  // 顶部小型字符雨
  const mc = document.getElementById('miniMatrix');
  if (mc && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = mc.getContext('2d');
    const dpr = Math.min(devicePixelRatio, 2);
    let w, h, cols, drops, font = 13;
    const chars = '01AI<>/{}[]#@$%'.split('');
    const resize = () => {
      w = mc.clientWidth; h = mc.clientHeight;
      mc.width = w * dpr; mc.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.floor(w / font);
      drops = Array.from({ length: cols }, () => Math.random() * -30);
    };
    resize(); addEventListener('resize', resize);
    const draw = () => {
      ctx.fillStyle = 'rgba(3,8,6,.18)'; ctx.fillRect(0, 0, w, h);
      ctx.font = `${font}px ui-monospace,Consolas,monospace`;
      for (let i = 0; i < drops.length; i++) {
        ctx.fillStyle = Math.random() > .95 ? '#42e8ff' : '#43f78f';
        ctx.globalAlpha = .25 + Math.random() * .5;
        ctx.fillText(chars[(Math.random() * chars.length) | 0], i * font, drops[i] * font);
        if (drops[i] * font > h && Math.random() > .97) drops[i] = 0;
        drops[i] += .4 + Math.random() * .4;
      }
      ctx.globalAlpha = 1; requestAnimationFrame(draw);
    };
    draw();
  }

  const toast = document.getElementById('siteToast');
  const sayToast = msg => {
    if (!toast) return;
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(sayToast._t); sayToast._t = setTimeout(() => toast.classList.remove('show'), 1800);
  };
  const copyText = async text => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta);
      ta.select(); document.execCommand('copy'); ta.remove();
    }
  };

  term.querySelectorAll('.term-row').forEach(row => {
    const out = row.querySelector('.term-out');
    row.addEventListener('click', async () => {
      const value = row.dataset.value || '';
      if (row.dataset.open !== '1') {
        row.dataset.open = '1';
        out.dataset.scramble = value;
        out.dataset.done = '';
        window.__scrambleRun?.(out);
        await copyText(value);
        sayToast(`已解码并复制：${value}`);
      } else {
        await copyText(value);
        sayToast(`已复制：${value}`);
      }
    });
  });
})();

// ============================================================
// 2026-09-20 打印 / PDF 支持
// 1) 每个页面导航栏注入「打印 / PDF」按钮（样式见 style.css）
// 2) beforeprint 时自动：展开全部折叠/证书/时间线、填好统计数字与
//    联系方式、视频换成封面图 —— 打印出来的是完整内容
// 3) URL 带 ?printpdf=1 时直接进入打印就绪状态（供无头浏览器批量导 PDF）
// ============================================================
(() => {
  const $ = (s, p=document) => p.querySelector(s);
  const $$ = (s, p=document) => [...p.querySelectorAll(s)];

  // 导航栏注入按钮（打印时随 .nav 一起隐藏）
  const actions = $('.nav-actions');
  if (actions && !$('#navPrintBtn')) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'navPrintBtn';
    btn.className = 'icon-btn nav-print-btn';
    btn.textContent = '打印 / PDF';
    btn.addEventListener('click', () => window.print());
    const themeBtn = $('#themeBtn');
    if (themeBtn) actions.insertBefore(btn, themeBtn); else actions.appendChild(btn);
  }
  // 关于页原有的 #printBtn 已绑定 window.print()，beforeprint 会自动完成下面的准备，无需重复绑定

  function lzyPreparePrint() {
    // 滚动显现元素（含证书墙 3D 卡片、技能行）全部显现
    $$('.reveal,.reveal-left,.reveal-right,.skill-row,.math-panel,.cert-item').forEach(el => el.classList.add('visible'));
    // 折叠面板（自述/学习路线/数学图说明/时间线）全部展开
    $$('.info-reveal').forEach(w => {
      w.classList.add('open');
      const b = $('.reveal-toggle', w);
      if (b) b.setAttribute('aria-expanded', 'true');
    });
    // 数学板块四个里程碑展开详情
    $$('.milestone').forEach(m => { m.classList.add('open'); m.setAttribute('aria-expanded', 'true'); });
    // 运动照片 / 名言大图显示引言
    $$('.story-click').forEach(c => { c.classList.add('open'); c.setAttribute('aria-expanded', 'true'); });
    // 联系终端：直接显示真实微信号 / 电话 / 邮箱，而不是 [ TAP_TO_REVEAL ]
    $$('.term-row').forEach(r => {
      r.dataset.open = '1';
      const out = $('.term-out', r);
      if (out) out.textContent = r.dataset.value || '';
    });
    // 首页统计数字直接填最终值
    $$('.count').forEach(el => el.textContent = (el.dataset.end || '') + (el.dataset.suffix || ''));
    // 打字机身份固定为完整文字，避免截在半个字
    const typed = $('#typed');
    if (typed) typed.textContent = 'AI + 编程开发者';
    // 解码文字直接显示最终文本
    $$('[data-scramble]').forEach(el => {
      if (el.dataset.scramble) { el.textContent = el.dataset.scramble; el.dataset.done = '1'; }
    });
    // 懒加载图片立即加载
    $$('img[loading="lazy"]').forEach(img => {
      img.loading = 'eager';
      if (img.dataset.src && !img.getAttribute('src')) img.src = img.dataset.src;
    });
    // 视频：去掉原生控件，把 poster 封面注入外壳背景（打印 CSS 隐藏 video 本体、显示该背景）
    $$('.video-shell').forEach(sh => {
      const v = $('video', sh);
      if (!v) return;
      v.removeAttribute('controls');
      if (v.poster) sh.style.setProperty('--lzy-poster', `url("${v.poster}")`);
    });
  }

  function lzyRestoreAfterPrint() {
    // 打印结束后恢复视频控件；其余展开状态与“用户手动点开”效果一致，无需收回
    $$('.video-shell video').forEach(v => v.setAttribute('controls', ''));
  }

  addEventListener('beforeprint', lzyPreparePrint);
  addEventListener('afterprint', lzyRestoreAfterPrint);
  if (new URLSearchParams(location.search).get('printpdf') !== null) lzyPreparePrint();
})();
