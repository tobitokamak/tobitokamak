/* Background: a tiny hand-rolled 3D scene on a 2D canvas (no libraries).
   - wireframe terrain rolling toward the camera (WipEout / Arkand dunes)
   - floating low-poly crystals (flat shaded + wireframe + vertex dots)
   - data-point crosses, an orbiting ring + disc ("two suns")
   Motion comes from time and from SCROLL (works on phones). The mouse only
   adds a small tilt on desktop. Reduce-motion: same scene, much slower. */
(function () {
  'use strict';

  var cv = document.getElementById('sky'), cx = cv.getContext('2d');
  var body = document.body;
  var still = /[?&]still/.test(location.search);
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.35 : 1;

  var VS = .74;   /* keeps floating things below the nav / date line */
  var EMBER = [255, 107, 61], CREAM = [241, 230, 214], TEAL = [130, 171, 157];
  var rgba = function (c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + Math.max(0, Math.min(1, a)).toFixed(3) + ')'; };

  var ps = 1, W = 0, H = 0, f = 700, camY = 2.1, LOOP = 44;
  var ptr = { x: 0, y: 0, tx: 0, ty: 0 }, sy = 0, frame = 0;

  /* ---------- geometry ---------- */
  var PHI = (1 + Math.sqrt(5)) / 2;
  function norm(vs) { return vs.map(function (v) { var l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; }); }
  var hexRing = [0, 1, 2, 3, 4, 5].map(function (i) { var a = i * Math.PI / 3; return [Math.cos(a), 0, Math.sin(a)]; });
  var SHAPES = {
    octa: { v: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]],
      f: [[0, 2, 4], [2, 1, 4], [1, 3, 4], [3, 0, 4], [2, 0, 5], [1, 2, 5], [3, 1, 5], [0, 3, 5]] },
    icosa: { v: norm([[-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0], [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI], [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]]),
      f: [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]] },
    tetra: { v: norm([[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]]), f: [[0, 1, 2], [0, 3, 1], [0, 2, 3], [1, 3, 2]] },
    bipyr: { v: [[0, 1.6, 0], [0, -1.6, 0]].concat(hexRing),
      f: [0, 1, 2, 3, 4, 5].reduce(function (a, i) { var j = (i + 1) % 6; a.push([0, 2 + i, 2 + j], [1, 2 + j, 2 + i]); return a; }, []) }
  };
  Object.keys(SHAPES).forEach(function (k) {
    var s = SHAPES[k], seen = {}; s.e = [];
    s.f.forEach(function (fc) { for (var i = 0; i < 3; i++) { var a = fc[i], b = fc[(i + 1) % 3], key = a < b ? a + '_' + b : b + '_' + a; if (!seen[key]) { seen[key] = 1; s.e.push([a, b]); } } });
  });

  /* floating crystals, placed by SCREEN position so the spacing holds on any screen:
     [shape, u (-1 left .. 1 right), v (height above the horizon, 0..0.55 of screen), depth, radius px, spinX, spinY, colour] */
  var OBJS = [
    ['icosa', .16, .42, 20, 66, .00021, .00032, CREAM],
    ['octa', .62, .50, 27, 54, .00017, -.00026, EMBER],
    ['tetra', .34, .10, 9, 34, -.00031, .00040, TEAL],
    ['bipyr', -.80, .30, 33, 60, .00012, .00022, EMBER],
    ['octa', .90, .20, 15, 40, .00042, -.00036, CREAM],
    ['icosa', -.36, .50, 39, 46, -.00014, .00018, TEAL],
    ['tetra', .76, .07, 31, 28, .00022, .00030, CREAM]
  ].map(function (o, i) { return { s: SHAPES[o[0]], u: o[1], v: o[2] * VS, z: o[3], px: o[4], sx: o[5], sy: o[6], c: o[7], ph: i * 1.7 }; });

  /* little fighters: delta-wing mesh flying lissajous routes (screen-relative) with analytic trails */
  var SHIP = {
    v: [[0, 0, 1.3], [-.9, 0, -.7], [.9, 0, -.7], [0, .38, -.5], [0, -.12, -.35]],
    f: [[0, 3, 1], [0, 2, 3], [0, 1, 4], [0, 4, 2], [1, 3, 4], [2, 4, 3]]
  };
  (function () { var seen = {}; SHIP.e = []; SHIP.f.forEach(function (fc) { for (var i = 0; i < 3; i++) { var a = fc[i], b = fc[(i + 1) % 3], k = a < b ? a + '_' + b : b + '_' + a; if (!seen[k]) { seen[k] = 1; SHIP.e.push([a, b]); } } }); })();
  /* [centre u, amp u, centre v, amp v, centre depth, amp depth, speed, phase, size px, colour] */
  var SHIPS = [
    [.10, .78, .30, .12, 16, 5, .00033, 0.0, 24, EMBER],
    [.10, .78, .30, .12, 16, 5, .00033, -.42, 20, CREAM],     /* wingman, same route a beat behind */
    [-.15, .92, .43, .07, 30, 6, .00027, 2.1, 17, CREAM],
    [.00, .88, .14, .05, 11, 3, .00055, 4.0, 22, TEAL],
    [.35, .70, .22, .10, 22, 6, .00041, 1.2, 19, EMBER]
  ].map(function (s) { return { cu: s[0], au: s[1], cv: s[2] * VS, av: s[3] * VS, cz: s[4], az: s[5], sp: s[6], ph: s[7], px: s[8], c: s[9] }; });

  /* ">" symbols that slide across the sky in groups of 2-4, front one brightest */
  var CHEVS = [
    [.50, 24, 1, 1.0, 3, EMBER, 14], [.36, 12, -1, 1.5, 3, CREAM, 18], [.20, 18, 1, 1.2, 2, EMBER, 16], [.45, 34, -1, .8, 3, EMBER, 10],
    [.12, 9, 1, 1.8, 3, EMBER, 20], [.28, 40, 1, .7, 4, CREAM, 9], [.54, 15, -1, .9, 2, EMBER, 12], [.07, 26, -1, 1.1, 3, EMBER, 14]
  ].map(function (c) { return { v: c[0] * VS, z: c[1], dir: c[2], sp: c[3], n: c[4], c: c[5], px: c[6], u0: Math.random() * 2.6 - 1.3 }; });

  /* data-point crosses */
  var PTS = []; for (var i = 0; i < 70; i++) PTS.push({ x: (Math.random() - .5) * 34, y: .4 + Math.random() * 9, z: Math.random() * LOOP, e: Math.random() < .22 });

  /* terrain grid (static vertices, travelling height field) */
  var NX = 27, NZ = 24, XS = [], ZS = [];
  for (i = 0; i < NX; i++) XS.push(-17 + i * (34 / (NX - 1)));
  for (i = 0; i < NZ; i++) ZS.push(2.4 + Math.pow(i / (NZ - 1), 1.5) * 44);
  function height(x, z, tt) {
    var ax = Math.abs(x), amp = .12 + 1.15 * Math.pow(Math.min(1, ax / 11), 1.4);   /* calm corridor in the middle, dunes at the sides */
    return amp * (Math.sin(x * .42 + z * .16 + tt * .0004) * .6 + Math.sin(x * .19 - z * .31 - tt * .0006) * .4);
  }
  var GRID = []; for (i = 0; i < NZ; i++) GRID.push(new Array(NX));

  /* ---------- camera ---------- */
  var yaw = 0, cyaw = 1, syaw = 0, horizon = 0;
  function proj(x, y, z) {
    var X = x * cyaw - z * syaw, Z = x * syaw + z * cyaw, k = f / Z;
    return [W / 2 + X * k, horizon - (y - camY) * k, Z];
  }

  function size() {
    var dpr = Math.min(window.devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 2);
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ps = Math.max(.55, Math.min(1, W / 1100));            /* shrink floating things on small screens */
    f = Math.max(520, Math.min(W * .85, 1100));
    if (H > W) f = Math.max(f, H * .62);
  }

  /* ---------- drawing ---------- */
  function drawTerrain(tt, a) {
    var i, j, p;
    for (j = 0; j < NZ; j++) for (i = 0; i < NX; i++) GRID[j][i] = proj(XS[i], height(XS[i], ZS[j], tt), ZS[j]);
    cx.lineWidth = 1;
    for (i = 0; i < NX; i += 1) {                       /* lines running away from the camera */
      cx.strokeStyle = rgba(EMBER, .2 * a); cx.beginPath();
      for (j = 0; j < NZ; j++) { p = GRID[j][i]; j ? cx.lineTo(p[0], p[1]) : cx.moveTo(p[0], p[1]); }
      cx.stroke();
    }
    for (j = 0; j < NZ; j++) {                          /* rings across the terrain */
      cx.strokeStyle = rgba(EMBER, (.7 - ZS[j] / 80) * a); cx.beginPath();
      for (i = 0; i < NX; i++) { p = GRID[j][i]; i ? cx.lineTo(p[0], p[1]) : cx.moveTo(p[0], p[1]); }
      cx.stroke();
    }
    cx.fillStyle = rgba(CREAM, .55 * a);                /* vertex dots near the camera */
    for (j = 0; j < 10; j++) for (i = 0; i < NX; i += 2) { p = GRID[j][i]; cx.fillRect(p[0] - 1, p[1] - 1, 2, 2); }
    /* fog: hide the far end and let rows melt into the horizon */
    var g = cx.createLinearGradient(0, horizon - 2, 0, horizon + H * .3);
    g.addColorStop(0, 'rgba(11,10,11,1)'); g.addColorStop(1, 'rgba(11,10,11,0)');
    cx.fillStyle = g; cx.fillRect(0, horizon - 2, W, H * .3 + 2);
    var h = cx.createLinearGradient(0, horizon - 150, 0, horizon + 70);
    h.addColorStop(0, rgba(EMBER, 0)); h.addColorStop(.7, rgba(EMBER, .16 * a)); h.addColorStop(1, rgba(EMBER, 0));
    cx.fillStyle = h; cx.fillRect(0, horizon - 150, W, 220);
  }

  var LX = -.45, LY = .75, LZ = -.5, LL = Math.hypot(LX, LY, LZ); LX /= LL; LY /= LL; LZ /= LL;
  function drawObj(o, t, camZ, a) {
    var z0 = (((o.z - camZ) % LOOP) + LOOP) % LOOP + 1.5;
    var fade = Math.min(1, (LOOP + 1.5 - z0) / 12) * Math.min(1, (z0 - 1.5) / 3) * a;
    if (fade < .02) return;
    var s = o.s, ry = t * o.sy + o.ph, rx = t * o.sx + o.ph * .6, cyy = Math.cos(ry), syy = Math.sin(ry), cxx = Math.cos(rx), sxx = Math.sin(rx);
    var k = z0 / f, ox = o.u * (W / 2) * k, oy = camY + o.v * H * k, rr = o.px * ps * k;
    var bob = Math.sin(t * .0006 + o.ph) * .25 * rr, i, V = [], P = [];
    for (i = 0; i < s.v.length; i++) {
      var v = s.v[i], x = v[0] * rr, y = v[1] * rr, z = v[2] * rr;
      var x1 = x * cyy + z * syy, z1 = -x * syy + z * cyy, y2 = y * cxx - z1 * sxx, z2 = y * sxx + z1 * cxx;
      V.push([ox + x1, oy + bob + y2, z0 + z2]); P.push(proj(ox + x1, oy + bob + y2, z0 + z2));
    }
    var faces = s.f.map(function (fc) { return { fc: fc, d: (P[fc[0]][2] + P[fc[1]][2] + P[fc[2]][2]) / 3 }; }).sort(function (p, q) { return q.d - p.d; });
    faces.forEach(function (it) {
      var A = V[it.fc[0]], B = V[it.fc[1]], C = V[it.fc[2]];
      var ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2], vx = C[0] - A[0], vy = C[1] - A[1], vz = C[2] - A[2];
      var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, nl = Math.hypot(nx, ny, nz) || 1;
      if (nx * (A[0]) + ny * (A[1] - camY) + nz * A[2] > 0) { nx = -nx; ny = -ny; nz = -nz; }
      var shade = .25 + .75 * Math.max(0, (nx * LX + ny * LY + nz * LZ) / nl);
      cx.fillStyle = rgba(o.c, (.04 + .13 * shade) * fade);
      cx.beginPath(); cx.moveTo(P[it.fc[0]][0], P[it.fc[0]][1]); cx.lineTo(P[it.fc[1]][0], P[it.fc[1]][1]); cx.lineTo(P[it.fc[2]][0], P[it.fc[2]][1]); cx.closePath(); cx.fill();
    });
    cx.strokeStyle = rgba(o.c === EMBER ? EMBER : CREAM, .5 * fade); cx.lineWidth = 1; cx.beginPath();
    s.e.forEach(function (e) { cx.moveTo(P[e[0]][0], P[e[0]][1]); cx.lineTo(P[e[1]][0], P[e[1]][1]); });
    cx.stroke();
    cx.fillStyle = rgba(EMBER, .95 * fade);
    for (i = 0; i < P.length; i++) cx.fillRect(P[i][0] - 1.5, P[i][1] - 1.5, 3, 3);
  }

  function drawPoints(t, camZ, a) {
    cx.lineWidth = 1;
    for (var pass = 0; pass < 2; pass++) {
      cx.strokeStyle = rgba(pass ? EMBER : CREAM, (pass ? .7 : .4) * a); cx.beginPath();
      for (var i = 0; i < PTS.length; i++) {
        var p = PTS[i]; if (p.e !== !!pass) continue;
        var z = (((p.z - camZ - t * .0016) % LOOP) + LOOP) % LOOP + 1.5, q = proj(p.x, p.y, z), k = Math.min(1, (LOOP - z) / 12) * Math.min(1, (z - 1.5) / 3), d = 2 + 4 * (1 - z / LOOP);
        if (k < .1) continue;
        cx.moveTo(q[0] - d * k, q[1]); cx.lineTo(q[0] + d * k, q[1]); cx.moveTo(q[0], q[1] - d * k); cx.lineTo(q[0], q[1] + d * k);
      }
      cx.stroke();
    }
  }

  /* ---------- ships ---------- */
  function shipAt(s, t) {
    var tt = t * s.sp + s.ph, u = s.cu + s.au * Math.sin(tt), v = s.cv + s.av * Math.sin(tt * 1.7 + 1), z = Math.max(4, s.cz + s.az * Math.sin(tt * .7 + 2)), k = z / f;
    return [u * (W / 2) * k, camY + v * H * k, z];
  }
  function drawShip(s, t, a) {
    var p0 = shipAt(s, t), p1 = shipAt(s, t + 60), p2 = shipAt(s, t + 120), i, q;
    var heading = Math.atan2(p1[0] - p0[0], p1[2] - p0[2]), pitch = Math.atan2(p1[1] - p0[1], Math.hypot(p1[0] - p0[0], p1[2] - p0[2]));
    var dh = Math.atan2(p2[0] - p1[0], p2[2] - p1[2]) - heading; if (dh > Math.PI) dh -= 6.2832; if (dh < -Math.PI) dh += 6.2832;
    var roll = -Math.max(-.9, Math.min(.9, dh * 40)), rr = s.px * ps * (p0[2] / f);
    var cr = Math.cos(roll), sr = Math.sin(roll), cp = Math.cos(pitch), sp = Math.sin(pitch), ch = Math.cos(heading), sh = Math.sin(heading), P = [];
    for (i = 0; i < SHIP.v.length; i++) {
      var v = SHIP.v[i], x = v[0] * rr, y = v[1] * rr, z = v[2] * rr;
      var x1 = x * cr - y * sr, y1 = x * sr + y * cr;                    /* roll */
      var y2 = y1 * cp + z * sp, z2 = -y1 * sp + z * cp;                  /* pitch */
      var x3 = x1 * ch + z2 * sh, z3 = -x1 * sh + z2 * ch;                /* heading */
      P.push(proj(p0[0] + x3, p0[1] + y2, p0[2] + z3));
    }
    var fade = Math.min(1, (p0[2] - 3) / 4) * a;
    for (i = 1; i <= 6; i++) {                                            /* trail: where the ship was a moment ago */
      var pp = shipAt(s, t - i * 110); q = proj(pp[0], pp[1], pp[2]);
      if (i === 1) { cx.beginPath(); cx.moveTo((P[1][0] + P[2][0]) / 2, (P[1][1] + P[2][1]) / 2); }
      cx.lineTo(q[0], q[1]);
      if (i === 6) { cx.strokeStyle = rgba(s.c, .45 * fade); cx.lineWidth = 1.5; cx.stroke(); }
    }
    cx.fillStyle = rgba(s.c, .2 * fade);
    SHIP.f.forEach(function (fc) { cx.beginPath(); cx.moveTo(P[fc[0]][0], P[fc[0]][1]); cx.lineTo(P[fc[1]][0], P[fc[1]][1]); cx.lineTo(P[fc[2]][0], P[fc[2]][1]); cx.closePath(); cx.fill(); });
    cx.strokeStyle = rgba(s.c === EMBER ? EMBER : CREAM, .85 * fade); cx.lineWidth = 1; cx.beginPath();
    SHIP.e.forEach(function (e) { cx.moveTo(P[e[0]][0], P[e[0]][1]); cx.lineTo(P[e[1]][0], P[e[1]][1]); });
    cx.stroke();
    cx.fillStyle = rgba(EMBER, fade); cx.beginPath(); cx.arc((P[1][0] + P[2][0]) / 2, (P[1][1] + P[2][1]) / 2, 2, 0, 6.2832); cx.fill();   /* engine glow */
  }

  /* ---------- ">" symbols ---------- */
  function drawChevs(t, a) {
    CHEVS.forEach(function (c) {
      var k = c.z / f, uu = (((c.u0 + c.dir * c.sp * t * .0001 + 1.3) % 2.6) + 2.6) % 2.6 - 1.3, fade = Math.min(1, (60 - c.z) / 30) * a;
      for (var i = 0; i < c.n; i++) {
        var q = proj(uu * (W / 2) * k - c.dir * i * c.px * ps * 1.9 * k, camY + c.v * H * k, c.z), h = c.px * ps;
        if (q[0] < -40 || q[0] > W + 40) continue;
        cx.strokeStyle = rgba(c.c, (i === 0 ? 1 : i === 1 ? .55 : .3) * fade); cx.lineWidth = 1.6;
        cx.beginPath(); cx.moveTo(q[0] - c.dir * h * .5, q[1] - h); cx.lineTo(q[0] + c.dir * h * .5, q[1]); cx.lineTo(q[0] - c.dir * h * .5, q[1] + h); cx.stroke();
      }
    });
  }

  /* ---------- spinning glyphs: + x o triangles squares, flat shapes turning in 3D ---------- */
  function ngon(n, r, rot) { var a = []; for (var i = 0; i <= n; i++) { var an = rot + i * 6.2832 / n; a.push([Math.cos(an) * r, Math.sin(an) * r]); } return a; }
  var G = {
    plus: [[[-1, 0], [1, 0]], [[0, -1], [0, 1]]],
    xmark: [[[-.7, -.7], [.7, .7]], [[-.7, .7], [.7, -.7]]],
    ring: [ngon(18, 1, 0)],
    tri: [ngon(3, 1, -1.5708)],
    square: [ngon(4, 1.05, .7854)],
    chev: [[[-.5, 1], [.5, 0], [-.5, -1]]]
  };
  /* [glyph, u, v, depth, size px, spin about Y, tilt speed, colour] */
  var GLYPHS = [
    ['plus', -.62, .18, 12, 15, .0016, .0004, EMBER], ['plus', .46, .36, 17, 13, -.0013, .0003, CREAM], ['plus', .94, .44, 22, 12, .0011, .0005, EMBER],
    ['plus', -.1, .06, 8, 18, .0019, .0002, CREAM], ['xmark', -.9, .42, 19, 13, .0012, -.0004, CREAM], ['xmark', .2, .24, 26, 11, -.0016, .0003, EMBER],
    ['ring', -.48, .34, 14, 12, .0010, .0005, EMBER], ['ring', .7, .14, 20, 14, -.0011, .0004, CREAM], ['tri', -.74, .08, 10, 13, .0014, .0004, TEAL],
    ['tri', .58, .27, 30, 12, -.0012, .0006, EMBER], ['square', -.26, .46, 24, 12, .0009, .0007, CREAM], ['square', .82, .30, 13, 11, -.0015, .0003, TEAL],
    ['chev', -.55, .50, 28, 12, .0013, .0003, EMBER], ['plus', .32, .52, 34, 10, .0012, .0004, TEAL]
  ].map(function (g, i) { return { sh: G[g[0]], u: g[1], v: g[2] * VS, z: g[3], px: g[4], sy: g[5], sx: g[6], c: g[7], ph: i * 2.3 }; });

  function drawGlyphs(t, camZ, a) {
    cx.lineWidth = 1.5; cx.lineJoin = 'round'; cx.lineCap = 'round';
    GLYPHS.forEach(function (g) {
      var z0 = (((g.z - camZ * .8) % LOOP) + LOOP) % LOOP + 1.5, k = z0 / f;
      var fade = Math.min(1, (LOOP + 1.5 - z0) / 12) * Math.min(1, (z0 - 1.5) / 3) * a; if (fade < .03) return;
      var ox = (g.u + Math.sin(t * .00025 + g.ph) * .05) * (W / 2) * k, oy = camY + (g.v + Math.sin(t * .0003 + g.ph * 1.3) * .02) * H * k, rr = g.px * ps * k;
      var ry = t * g.sy + g.ph, rx = Math.sin(t * g.sx + g.ph) * .9, cyy = Math.cos(ry), syy = Math.sin(ry), cxx = Math.cos(rx), sxx = Math.sin(rx);
      cx.strokeStyle = rgba(g.c, .85 * fade);
      g.sh.forEach(function (line) {
        cx.beginPath();
        line.forEach(function (pt, j) {
          var x = pt[0] * rr, y = pt[1] * rr, x1 = x * cyy, z1 = -x * syy, y2 = y * cxx - z1 * sxx, z2 = y * sxx + z1 * cxx, q = proj(ox + x1, oy + y2, z0 + z2);
          j ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1]);
        });
        cx.stroke();
      });
    });
  }

  function render(now) {
    requestAnimationFrame(render);
    if (document.hidden) return;
    var t = still ? 5200 : now * motion;
    var scrolled = window.scrollY || 0; sy += (scrolled - sy) * (still ? 1 : .12);
    var home = body.classList.contains('is-home'), pj = body.classList.contains('is-pj');
    var a = home ? 1 - Math.min(1, Math.max(0, (sy - H * .5) / (H * .7))) * .72 : pj ? .4 : .5;
    if (a < .5 && (++frame & 1)) return;                      /* ease the load when it is only a faint backdrop */
    ptr.x += (ptr.tx - ptr.x) * .05; ptr.y += (ptr.ty - ptr.y) * .05;
    yaw = ptr.x * .1 + Math.sin(t * .00012) * .045 + sy * .00006; cyaw = Math.cos(yaw); syaw = Math.sin(yaw);
    horizon = H * .6 - sy * .16 + ptr.y * H * .03;
    var camZ = sy * .012, tt = t + sy * 14;

    cx.clearRect(0, 0, W, H);
    drawTerrain(tt, a);
    drawPoints(t, camZ, a);
    drawChevs(t, a);
    drawGlyphs(t, camZ, a);
    OBJS.slice().sort(function (p, q) { return ((q.z - camZ) % LOOP + LOOP) % LOOP - ((p.z - camZ) % LOOP + LOOP) % LOOP; }).forEach(function (o) { drawObj(o, t, camZ, a); });
    SHIPS.forEach(function (s) { drawShip(s, t, a); });
  }

  addEventListener('resize', size);
  addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; ptr.tx = e.clientX / innerWidth - .5; ptr.ty = e.clientY / innerHeight - .5; });
  size(); requestAnimationFrame(render);
})();
