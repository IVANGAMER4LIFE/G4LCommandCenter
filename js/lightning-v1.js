(() => {
  'use strict';
  const layer = document.getElementById('bodyLightningV1');
  if (!layer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const mainGlow = layer.querySelector('#bodyBoltGlow');
  const mainCore = layer.querySelector('#bodyBoltCore');
  const branchA = layer.querySelector('#bodyBoltBranchA');
  const branchB = layer.querySelector('#bodyBoltBranchB');

  // Origins sit on visible neck/chest/shoulder seams in the locked 1536×1024 artwork.
  const routes = [
    [[686,306],[638,326],[596,348],[548,365]],       // left neck -> left shoulder
    [[850,307],[900,326],[944,346],[1000,366]],      // right neck -> right shoulder
    [[760,350],[730,374],[690,398],[646,421]],       // chest -> left upper chest
    [[780,350],[812,375],[852,398],[898,421]],       // chest -> right upper chest
    [[590,341],[548,326],[515,307],[480,292]],       // left shoulder -> outward
    [[946,342],[987,326],[1021,307],[1056,291]],     // right shoulder -> outward
    [[700,324],[675,290],[650,262],[628,236]],       // left neck -> upward air
    [[836,324],[862,289],[886,260],[908,234]]        // right neck -> upward air
  ];

  const jittered = (route, amount = 10) => {
    const pts = [];
    for (let i = 0; i < route.length - 1; i++) {
      const [x1,y1] = route[i], [x2,y2] = route[i+1];
      pts.push([x1,y1]);
      const segments = 3;
      for (let s = 1; s < segments; s++) {
        const t = s / segments;
        const x = x1 + (x2-x1)*t + (Math.random()-.5)*amount*2;
        const y = y1 + (y2-y1)*t + (Math.random()-.5)*amount*2;
        pts.push([x,y]);
      }
    }
    pts.push(route[route.length-1]);
    return pts;
  };
  const dFrom = pts => 'M' + pts.map((p,i)=>`${i?'L':''}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

  const makeBranch = (pts, side) => {
    const index = Math.min(pts.length-2, 2 + Math.floor(Math.random()*Math.max(1,pts.length-3)));
    const [x,y] = pts[index];
    const length = 22 + Math.random()*34;
    const angle = (side * (0.45 + Math.random()*.55)) + (Math.random()-.5)*.3;
    const end = [x + Math.cos(angle)*length, y + Math.sin(angle)*length];
    return jittered([[x,y],[(x+end[0])/2,(y+end[1])/2],end],6);
  };

  const strike = () => {
    const route = routes[Math.floor(Math.random()*routes.length)];
    const points = jittered(route, 9);
    const path = dFrom(points);
    mainGlow.setAttribute('d', path);
    mainCore.setAttribute('d', path);
    branchA.setAttribute('d', dFrom(makeBranch(points, -1)));
    branchB.setAttribute('d', dFrom(makeBranch(points, 1)));
    layer.classList.remove('strike');
    void layer.offsetWidth;
    layer.classList.add('strike');
    window.setTimeout(() => layer.classList.remove('strike'), 520);
    schedule();
  };

  const schedule = () => {
    const delay = 1900 + Math.random()*3100;
    window.setTimeout(strike, delay);
  };
  window.setTimeout(strike, 900 + Math.random()*900);
})();
