/* Background: a flight through impossible architecture, drawn as outlines + nodes on a 2D canvas.
   - the camera follows an endless winding path that climbs, dives and slowly rolls:
     there is no fixed ground or ceiling
   - on the path stand gates you fly through: archways, arched windows, short arch tunnels,
     hexagonal rings of arches (Arkand)
   - around the path float fragments at any angle: arcades, stairs that end in the air,
     bridges with an arch underneath, walls of windows, domed pavilions (POOLS)
   Motion: time + scroll (works on phones). The mouse only nudges the view.
   Uses the #sky canvas and the body classes is-home / is-pj. */
(function () {
  'use strict';

  var cv = document.getElementById('sky'), cx = cv.getContext('2d'), body = document.body;
  var still = /[?&]still/.test(location.search);
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.35 : 1;

  var CREAM = [241, 230, 214], EMBER = [255, 107, 61], TEAL = [130, 171, 157];
  var COLORS = [CREAM, EMBER, TEAL, CREAM, EMBER, CREAM, CREAM, EMBER], ALPHA = [0.55, 0.7, 0.5, 1, 1, 0.35, 0.8, 0.9];   /* 3-5: intro facade solids (exact page lines), 6-7: facade decor */
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a < 0 ? 0 : a > 1 ? 1 : a).toFixed(3) + ')'; }
  function rng(seed) { var s = (seed >>> 0) || 1; return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }

  /* ---------- small vector kit ---------- */
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function add(a, b, k) { return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function rot(a, b, t) { var c = Math.cos(t), s = Math.sin(t); return [[a[0] * c + b[0] * s, a[1] * c + b[1] * s, a[2] * c + b[2] * s], [b[0] * c - a[0] * s, b[1] * c - a[1] * s, b[2] * c - a[2] * s]]; }

  /* ---------- the path ---------- */
  function path(s) { return [3.2 * Math.sin(s * 0.04) + 1 * Math.sin(s * 0.1 + 2), 4 * Math.sin(s * 0.03 + 1) + 0.8 * Math.sin(s * 0.08), s]; }
  function roll(s) { return (s / 5) * 0.22 * 0.55 + 0.25 * Math.sin(s * 0.019); }   /* the camera turns with the hall, but only half as fast, so the hall visibly twists */
  function frameAt(s, withRoll) {
    var p = path(s), fw = norm(sub(path(s + 0.6), p)), rt = norm(cross([0, 1, 0], fw)), up = cross(fw, rt);
    if (withRoll) { var r = rot(rt, up, roll(s)); rt = r[0]; up = r[1]; }
    return { p: p, fw: fw, rt: rt, up: up };
  }

  /* ---------- building fragments (geometry is baked into world space once) ---------- */
  var FR, M, TA = [0, 0, 0], TB = [0, 0, 0];
  function setM(o, X, Y, Z) { M = [o[0], o[1], o[2], X[0], X[1], X[2], Y[0], Y[1], Y[2], Z[0], Z[1], Z[2]]; }
  function tp(x, y, z, o) { o[0] = M[0] + x * M[3] + y * M[6] + z * M[9]; o[1] = M[1] + x * M[4] + y * M[7] + z * M[10]; o[2] = M[2] + x * M[5] + y * M[8] + z * M[11]; }
  function L(x1, y1, z1, x2, y2, z2) { tp(x1, y1, z1, TA); tp(x2, y2, z2, TB); FR.s.push(TA[0], TA[1], TA[2], TB[0], TB[1], TB[2]); }
  function N(x, y, z) { tp(x, y, z, TA); FR.n.push(TA[0], TA[1], TA[2]); }

  /* square column standing on local y, at (x, z) */
  function col(x, z, y0, h, r) {
    var c = [[-r, -r], [r, -r], [r, r], [-r, r]], a = 1.55, i, n;
    for (i = 0; i < 4; i++) {
      n = (i + 1) % 4;
      L(x + c[i][0], y0, z + c[i][1], x + c[i][0], y0 + h, z + c[i][1]);
      L(x + c[i][0], y0, z + c[i][1], x + c[n][0], y0, z + c[n][1]);
      L(x + c[i][0] * a, y0 + h, z + c[i][1] * a, x + c[n][0] * a, y0 + h, z + c[n][1] * a);
    }
    N(x, y0 + h, z);
  }
  /* round arch in the plane z = zz, springing at y = spring, from x = cx0 - w to cx0 + w */
  function arch(cx0, spring, w, thick, zz, segs) {
    var j, i, rr, px, py;
    for (j = -1; j <= 1; j += 2) {
      rr = w + j * thick / 2; px = cx0 - rr; py = spring;
      for (i = 1; i <= segs; i++) { var t = Math.PI * i / segs, qx = cx0 - rr * Math.cos(t), qy = spring + rr * Math.sin(t); L(px, py, zz, qx, qy, zz); px = qx; py = qy; }
    }
    L(cx0 - w - thick / 2, spring, zz, cx0 - w + thick / 2, spring, zz); L(cx0 + w - thick / 2, spring, zz, cx0 + w + thick / 2, spring, zz);
    N(cx0, spring + w + thick / 2, zz);
  }
  /* archway: two columns + arch, opening in the local xy plane */
  function portal(w, h) { col(-w, 0, 0, h, 0.28); col(w, 0, 0, h, 0.28); arch(0, h, w, 0.55, 0, 16); L(-w, 0, 0, w, 0, 0); }
  /* arched window with mullions and some depth */
  function windowFrame(w, h) {
    var d, i;
    for (d = 0; d <= 0.4; d += 0.4) {
      L(-w, 0, d, w, 0, d); L(-w, 0, d, -w, h, d); L(w, 0, d, w, h, d); arch(0, h, w, 0.001, d, 14);
      L(0, 0, d, 0, h + w, d); L(-w, h * 0.55, d, w, h * 0.55, d);
    }
    for (i = -1; i <= 1; i += 2) { L(i * w, 0, 0, i * w, 0, 0.4); L(i * w, h, 0, i * w, h, 0.4); }
    N(-w, 0, 0); N(w, 0, 0);
  }
  /* a short barrel of arches you pass through */
  function tunnel(w, h, n, gap) {
    for (var i = 0; i < n; i++) { var z = i * gap; col(-w, z, 0, h, 0.24); col(w, z, 0, h, 0.24); arch(0, h, w, 0.45, z, 14); }
    L(-w, h, 0, -w, h, (n - 1) * gap); L(w, h, 0, w, h, (n - 1) * gap); L(0, h + w + 0.22, 0, 0, h + w + 0.22, (n - 1) * gap);
    L(-w, 0, 0, -w, 0, (n - 1) * gap); L(w, 0, 0, w, 0, (n - 1) * gap);
  }
  /* hexagonal ring of arches (Arkand), axis along local y */
  function ring(R, h) {
    var pts = [], i;
    for (i = 0; i < 6; i++) { var a = i * Math.PI / 3; pts.push([Math.cos(a) * R, Math.sin(a) * R]); }
    for (i = 0; i < 6; i++) {
      var p = pts[i], q = pts[(i + 1) % 6], mx = (p[0] + q[0]) / 2, mz = (p[1] + q[1]) / 2, w = Math.hypot(q[0] - p[0], q[1] - p[1]) / 2, ux = (q[0] - p[0]) / (2 * w), uz = (q[1] - p[1]) / (2 * w), j, k, rr, px, py, pz;
      col(p[0], p[1], 0, h, 0.3);
      L(p[0], 0, p[1], q[0], 0, q[1]);
      for (k = -1; k <= 1; k += 2) {                      /* arch between two columns of the ring */
        rr = w + k * 0.25; px = mx - ux * rr; pz = mz - uz * rr; py = h;
        for (j = 1; j <= 10; j++) { var t = Math.PI * j / 10, qx = mx - ux * rr * Math.cos(t), qz = mz - uz * rr * Math.cos(t), qy = h + rr * Math.sin(t); L(px, py, pz, qx, qy, qz); px = qx; py = qy; pz = qz; }
      }
      N(mx, h + w + 0.25, mz);
    }
  }
  /* row of arches along local x */
  function arcade(n, sp, h) {
    for (var i = 0; i <= n; i++) { col(i * sp, 0, 0, h, 0.25); if (i < n) arch(i * sp + sp / 2, h, sp / 2, 0.42, 0, 12); }
    L(0, h + sp / 2 + 0.6, 0, n * sp, h + sp / 2 + 0.6, 0); L(0, 0, 0, n * sp, 0, 0);
  }
  /* stairs climbing along local z, ending in nothing */
  function stairs(n, w) {
    for (var i = 0; i < n; i++) {
      var z = i * 0.5, y1 = i * 0.4, y2 = y1 + 0.4;
      L(-w, y1, z, -w, y2, z); L(w, y1, z, w, y2, z); L(-w, y2, z, w, y2, z);
      L(-w, y2, z, -w, y2, z + 0.5); L(w, y2, z, w, y2, z + 0.5);
    }
    N(0, n * 0.4, n * 0.5);
  }
  /* bridge along local z with railings and an arch underneath */
  function bridge(len, w) {
    var i;
    for (i = -1; i <= 1; i += 2) {
      L(i * w, 0, 0, i * w, 0, len); L(i * w, -0.35, 0, i * w, -0.35, len); L(i * w, 0.95, 0, i * w, 0.95, len);
      for (var z = 0; z <= len; z += 1.2) L(i * w, 0, z, i * w, 0.95, z);
    }
    L(-w, 0, 0, w, 0, 0); L(-w, 0, len, w, 0, len);
    var r = len / 2, px = 0, py = -0.35, pz = 0;                    /* the arch under the deck */
    for (i = 1; i <= 16; i++) { var t = Math.PI * i / 16, qz = r - r * Math.cos(t), qy = -0.35 - Math.sin(t) * r * 0.6; L(0, py, pz, 0, qy, qz); py = qy; pz = qz; }
    N(0, 0, 0); N(0, 0, len);
  }
  /* a wall pierced by a grid of arched windows */
  function windowWall(cols, rows) {
    var cw = 2.2, rh = 3.2, W2 = cols * cw, H2 = rows * rh, i, j;
    L(0, 0, 0, W2, 0, 0); L(0, H2, 0, W2, H2, 0); L(0, 0, 0, 0, H2, 0); L(W2, 0, 0, W2, H2, 0);
    for (i = 0; i < cols; i++) for (j = 0; j < rows; j++) {
      var x = i * cw + cw / 2, y = j * rh + 0.4, w = 0.55, h = 1.6;
      L(x - w, y, 0, x - w, y + h, 0); L(x + w, y, 0, x + w, y + h, 0); L(x - w, y, 0, x + w, y, 0); arch(x, y + h, w, 0.001, 0, 8);
    }
  }
  /* domed pavilion (POOLS) */
  function pavilion(R, h) {
    var n = 8, i, j;
    for (i = 0; i < n; i++) {
      var a = i * Math.PI * 2 / n, b = (i + 1) * Math.PI * 2 / n;
      col(Math.cos(a) * R, Math.sin(a) * R, 0, h, 0.16);
      L(Math.cos(a) * R * 1.12, h + 0.3, Math.sin(a) * R * 1.12, Math.cos(b) * R * 1.12, h + 0.3, Math.sin(b) * R * 1.12);
      L(Math.cos(a) * R * 1.12, 0, Math.sin(a) * R * 1.12, Math.cos(b) * R * 1.12, 0, Math.sin(b) * R * 1.12);
    }
    var D = R * 1.08, base = h + 0.3;
    for (i = 0; i < 8; i++) {
      var m = i * Math.PI / 4, p = [Math.cos(m) * D, base, Math.sin(m) * D];
      for (j = 1; j <= 6; j++) { var e = j * Math.PI / 12, q = [Math.cos(m) * Math.cos(e) * D, base + Math.sin(e) * D, Math.sin(m) * Math.cos(e) * D]; L(p[0], p[1], p[2], q[0], q[1], q[2]); p = q; }
    }
    N(0, base + D, 0);
  }

  /* ---------- the world: one continuous twisting hall, built bay by bay along the path ---------- */
  var CH = 5, FAR = 64, chunks = {};
  var HW = 3.5, FL = -1.6, SP = 1.4;              /* half width, floor height, arch springing height (path = eye height) */
  function twistAt(k) { return k * 0.22; }         /* each bay is turned a little further around the direction of travel */
  /* frame of bay k; which = 1 is the twin hall: offset in the twisted frame (so it spirals around) and turned 90° (sideways gravity) */
  function bayFrame(k, which) {
    var F = frameAt(k * CH, false), g = rot(F.rt, F.up, twistAt(k)), X = g[0], Y = g[1], o = F.p;
    if (which === 1) { o = add(add(o, X, 16), Y, 6); var X2 = Y; Y = [-X[0], -X[1], -X[2]]; X = X2; }
    return { o: o, X: X, Y: Y, Z: F.fw };
  }
  function use(m) { setM(m.o, m.X, m.Y, m.Z); }
  /* points that run continuously from bay to bay: floor edges, column tops, crown of the vault */
  var RAILS = [[-HW, FL, 0], [HW, FL, 0], [-HW, SP, 0], [HW, SP, 0], [0, SP + HW + 0.25, 0], [-HW, FL - 0.35, 0], [HW, FL - 0.35, 0]];
  function railPts(m) { use(m); return RAILS.map(function (q) { var o = [0, 0, 0]; tp(q[0], q[1], q[2], o); return o; }); }
  /* one bay of the hall in local space (z from 0 to CH) */
  function bay(k, floorTiles) {
    var s;
    for (s = -1; s <= 1; s += 2) col(s * HW, 0, FL, SP - FL, 0.28);   /* side arches are built in world space by sideArches() */
    arch(0, SP, HW, 0.5, 0, 16);                                   /* the vault you pass under */
    L(-HW, FL, 0, HW, FL, 0); L(-HW, FL - 0.35, 0, HW, FL - 0.35, 0);
    if (floorTiles) { L(-HW, FL, CH / 2, HW, FL, CH / 2); L(0, FL, 0, 0, FL, CH); }
  }
  /* the arches along each side wall. Each bay is twisted and turned a little more than the last, so an arch drawn
     inside one bay's frame lands beside the next column instead of on it. Instead, each arch is built in world
     space from this bay's column top to the next bay's column top, curving up along the average "up" of the two. */
  function sideArches(m, m1) {
    var keep = M, s, j, i, segs = 14, thick = 0.42;
    setM([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    for (s = -1; s <= 1; s += 2) {
      var A = add(add(m.o, m.X, s * HW), m.Y, SP), B = add(add(m1.o, m1.X, s * HW), m1.Y, SP);
      var mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2], span = sub(B, A), r = Math.hypot(span[0], span[1], span[2]) / 2;
      var d = norm(span), upAvg = norm(add(m.Y, m1.Y, 1)), u = norm(add(upAvg, d, -dot(upAvg, d)));   /* up, made square to the span */
      for (j = -1; j <= 1; j += 2) {
        var rr = r + j * thick / 2, p = add(mid, d, -rr);
        for (i = 1; i <= segs; i++) {
          var t = Math.PI * i / segs, q = add(add(mid, d, -rr * Math.cos(t)), u, rr * Math.sin(t));
          L(p[0], p[1], p[2], q[0], q[1], q[2]); p = q;
        }
      }
      var top = add(mid, u, r + thick / 2); N(top[0], top[1], top[2]);
    }
    M = keep;
  }
  function connect(a, b) {                          /* raw world-space lines between two bays */
    var keep = M; setM([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    for (var i = 0; i < a.length; i++) L(a[i][0], a[i][1], a[i][2], b[i][0], b[i][1], b[i][2]);
    M = keep;
  }
  function buildChunk(k) {
    var r = rng(k * 9301 + 49297), frags = [], m = bayFrame(k, 0), m1 = bayFrame(k + 1, 0), h = r(), side = r() < 0.5 ? -1 : 1;
    /* the main hall */
    FR = { s: [], n: [], c: 0 }; use(m); bay(k, k % 2 === 0); sideArches(m, m1); connect(railPts(m), railPts(m1)); frags.push(FR);
    /* things attached to this bay (ember) */
    FR = { s: [], n: [], c: 1 };
    var sideX = m.X.map(function (v) { return v * side; });
    if (h < 0.2) {                                   /* stairs climbing out through the wall, ending in the air */
      use(m); var o = [0, 0, 0]; tp(side * HW, FL, 1.2, o); setM(o, m.Z, m.Y, sideX); stairs(12, 0.8);
    } else if (h < 0.34) {                           /* a dome sitting on the roof (upside down when the hall has turned over) */
      use(m); var od = [0, 0, 0]; tp(0, SP + HW + 0.25, CH / 2, od); setM(od, m.X, m.Y, m.Z); pavilion(1.5, 1.3);
    } else if (h < 0.46) {                           /* a big hexagonal ring of arches the hall passes through (Arkand) */
      use(m); var oc = [0, 0, 0]; tp(0, (FL + SP + HW) / 2, CH / 2 - 1.6, oc); setM(oc, m.X, m.Z, cross(m.X, m.Z)); ring(7.5, 3.2);
    } else if (h < 0.6) {                            /* a bridge leaving through the side arches, to a lone archway */
      use(m); var ob = [0, 0, 0]; tp(side * HW, FL, CH / 2, ob); setM(ob, m.Z, m.Y, sideX); bridge(9, 0.9);
      var oe = add(ob, sideX, 9); setM(oe, m.Z, m.Y, sideX); portal(1.6, 2.6);
    }
    frags.push(FR);
    /* the twin hall, spiralling around with its own sideways gravity (teal) */
    var t0 = bayFrame(k, 1), t1 = bayFrame(k + 1, 1);
    FR = { s: [], n: [], c: 2 }; use(t0); bay(k, false); sideArches(t0, t1); connect(railPts(t0), railPts(t1)); frags.push(FR);
    /* dust in the void */
    FR = { s: [], n: [], c: 0 }; setM([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    for (var i = 0; i < 8; i++) {
      var p = add(add(add(m.o, m.X, (r() - 0.5) * 60), m.Y, (r() - 0.5) * 50), m.Z, r() * CH), d = 0.12;
      L(p[0] - d, p[1], p[2], p[0] + d, p[1], p[2]); L(p[0], p[1] - d, p[2], p[0], p[1] + d, p[2]);
    }
    frags.push(FR);
    return frags;
  }
  /* ---------- projection with depth buckets ---------- */
  var W = 0, H = 0, f = 700, NEAR = 0.3;
  /* depth fade, continuous: lines fade in just ahead of the camera and dissolve into the haze far away.
     Each line is put in one of NB fine opacity steps (by its middle point), so changes in depth never show as a jump */
  var NB = 48;
  function fadeOf(z) { return Math.max(0, Math.min(1, (z - 1) / 8)) * Math.pow(Math.max(0, 1 - z / FAR), 1.25); }

  function size() {
    var dpr = Math.min(window.devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 2);
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    f = Math.min(H * 0.8, W * 1.05);
  }

  /* Liang-Barsky: clip a 2D segment to the screen (plus a margin); result in CL, false if fully outside */
  var CL = [0, 0, 0, 0];
  function clip2(x1, y1, x2, y2) {
    var m = 40, dx = x2 - x1, dy = y2 - y1, t0 = 0, t1 = 1, p = [-dx, dx, -dy, dy], q = [x1 + m, W + m - x1, y1 + m, H + m - y1];
    for (var i = 0; i < 4; i++) {
      if (p[i] === 0) { if (q[i] < 0) return false; }
      else { var t = q[i] / p[i]; if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; } }
    }
    CL[0] = x1 + dx * t0; CL[1] = y1 + dy * t0; CL[2] = x1 + dx * t1; CL[3] = y1 + dy * t1;
    return true;
  }

  /* ---------- intro ----------
     The page is laid out as a facade of windows standing across the end of the hall, straight ahead
     (one shape per hero element). It is there from the first frame, far away in the haze.
     The camera dives fast and decelerates smoothly (no stop, no bounce) to its normal cruise speed,
     arriving at the exact spot where the facade lines up pixel-for-pixel with the page at LAND.
     It never stops: it keeps gliding at cruise speed, through the fading windows, forever.
     timeline (ms): 0-600 ignition · 0-5000 dive, easing to cruise · 5000 aligned + handoff (page assembles)
     · 5000-5300 facade cross-fades into the page · 7200 done */
  var INTRO = null, extra = 0, lastNow = 0, FAC = null;
  var SKIPTO = 2500, LAND = 5000, HANDOFF = 5000, DONE = 7200, EX = 22 * 0.0016;   /* EX: dive boost, 22x the cruise speed at the start */
  function smooth(x) { x = x < 0 ? 0 : x > 1 ? 1 : x; return x * x * (3 - 2 * x); }
  /* dive boost: starts at full speed and falls off quickly (ease-out, boost = (1 - x)^POW with x = t / LAND),
     so the first moments rush and the whole second half is a long, slow cinematic approach to the facade.
     Its slope is zero at the end, so the speed lands softly on cruise. diveF is its exact integral (distance gained). */
  var POW = 3;
  function diveF(t) {
    var x = Math.min(Math.max(t, 0), LAND) / LAND;
    return LAND * (1 - Math.pow(1 - x, POW + 1)) / (POW + 1);
  }
  window.SKY = {
    /* opts: targets() -> [{ r: DOMRect, kind }], onHandoff(), onDone(), quick (reduced motion: start late) */
    playIntro: function (opts) {
      var fz = location.search.match(/[?&]introAt=(\d+)/);   /* debug: ?intro&introAt=2800 freezes the intro at that moment */
      ROFF = 0; YOFF = 0;
      INTRO = { o: opts, t0: performance.now() - (opts.quick ? SKIPTO : 0), handed: false, freeze: fz ? +fz[1] : -1 };
      FAC = null;
    },
    skip: function () { if (INTRO) { var t = performance.now() - INTRO.t0; if (t < SKIPTO) INTRO.t0 = performance.now() - SKIPTO; } },
    playing: function () { return !!INTRO; }
  };

  /* the facade: camera pose at the landing point, the facade stands D ahead of it, square to the view */
  /* The facade must stand on the hall's floor, square across it. So instead of tilting the facade, the camera
     is quietly rolled and raised during the dive until, at the landing, it is upright in the hall at the height
     where the bottom of the screen meets the floor. Those offsets then stay for good, so the flight carries on
     unchanged afterwards. D is chosen so the facade also fits between the hall's walls. */
  var ROFF = 0, YOFF = 0;
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function wrapAngle(a) { return a - Math.PI * 2 * Math.round(a / (Math.PI * 2)); }
  function buildFacade(sBaseLand) {
    var D = Math.min(4, 2 * HW * 0.95 * f / W);
    /* land so the facade stands exactly in the plane of one of the hall's arch rings (bay k starts at k*CH):
       the dive length is nudged a few percent to make that happen, so nobody can see the adjustment */
    var k = Math.round((sBaseLand + EX * diveF(LAND) + D) / CH), sLand = k * CH - D, EXI = (sLand - sBaseLand) / diveF(LAND);
    while (EXI < EX * 0.85) { k++; sLand = k * CH - D; EXI = (sLand - sBaseLand) / diveF(LAND); }
    var bay = bayFrame(k, 0), U = frameAt(sLand, false);
    /* upright = the camera's right axis lies along that ring's floor (its X axis), seen across the view */
    var rollT = wrapAngle(Math.atan2(dot(bay.X, U.up), dot(bay.X, U.rt)) - roll(sLand));
    var C = frameAt(sLand, true), r = rot(C.rt, C.up, rollT), upE = r[1];
    /* camera height so the screen's bottom edge, D ahead, sits on the ring's floor */
    var h2 = H * D / (2 * f), foot = add(C.p, C.fw, D);
    var yT = (FL - dot(sub(foot, bay.o), bay.Y)) / dot(upE, bay.Y) + h2;
    return { sLand: sLand, EXI: EXI, pos: add(C.p, upE, yT), fw: C.fw, up: upE, rt: r[0], D: D, rollT: rollT, yT: yT };
  }
  /* the facade, rebuilt every frame from the live page layout.
     targets() gives two kinds of items, all in screen pixels:
     - solid: exactly the lines the page really shows (date rule, footer rule, slideshow edge, its corner brackets
       and progress ticks, the portrait circle). These land pixel-perfect and cross-fade into the page.
     - decor: shapes for things without a visible outline (tagline, wordmark, nav). They are architecture in the
       distance and dissolve before the landing, so nothing is left that the page does not have. */
  var SOLID_COL = { cream: 3, ember: 4, faint: 5 };
  function facadeGeom(F, hw, hh, TG) {
    var D = F.D, kk = f / D, center = add(F.pos, F.fw, D);
    var out = [3, 4, 5, 6, 7].map(function (c) { return { s: [], n: [], c: c, fac: true }; });
    setM(center, F.rt, F.up, F.fw);
    var X = function (px) { return (px - hw) / kk; }, Y = function (py) { return (hh - py) / kk; };
    var arc = function (cxx, cyy, r, a0, a1, segs) {
      var px = cxx + Math.cos(a0) * r, py = cyy + Math.sin(a0) * r;
      for (var i = 1; i <= segs; i++) { var a = a0 + (a1 - a0) * i / segs, qx = cxx + Math.cos(a) * r, qy = cyy + Math.sin(a) * r; L(px, py, 0, qx, qy, 0); px = qx; py = qy; }
    };
    TG.forEach(function (t) {
      var a = t.a, i, n;
      if (t.t !== 'decor') {
        FR = out[SOLID_COL[t.c] - 3];
        if (t.t === 'circle') arc(X(a[0]), Y(a[1]), a[2] / kk, 0, Math.PI * 2, 64);
        else for (i = 0; i + 3 < a.length; i += 2) L(X(a[i]), Y(a[i + 1]), 0, X(a[i + 2]), Y(a[i + 3]), 0);   /* polyline (a closed rect repeats its first point) */
        return;
      }
      var r = t.r; if (!r || !r.width) return;
      var x0 = X(r.left), x1 = X(r.right), yT = Y(r.top), yB = Y(r.bottom), w = x1 - x0, h = yT - yB;
      if (t.kind === 'arcade') {                     /* the tagline: a row of arched openings */
        FR = out[3]; n = 3; var bw = w / n, sp = yB + h * 0.55;
        L(x0, yB, 0, x1, yB, 0);
        for (i = 0; i <= n; i++) { L(x0 + i * bw, yB, 0, x0 + i * bw, sp, 0); N(x0 + i * bw, sp, 0); }
        for (i = 0; i < n; i++) arc(x0 + i * bw + bw / 2, sp, bw / 2, Math.PI, 0, 12);
      } else if (t.kind === 'colonnade') {          /* the wordmark: a colonnade under a lintel */
        FR = out[3]; n = 9; L(x0, yB, 0, x1, yB, 0); L(x0, yT, 0, x1, yT, 0);
        for (i = 0; i <= n; i++) { L(x0 + w * i / n, yB, 0, x0 + w * i / n, yT, 0); N(x0 + w * i / n, yT, 0); }
      } else if (t.kind === 'hex') {                 /* a hexagon ring around the portrait (Arkand) */
        FR = out[4]; var rc = Math.min(w, h) / 2 * 1.25, cxr = (x0 + x1) / 2, cyr = (yT + yB) / 2;
        for (i = 0; i < 6; i++) { var a1 = i * Math.PI / 3, a2 = (i + 1) * Math.PI / 3; L(cxr + Math.cos(a1) * rc, cyr + Math.sin(a1) * rc, 0, cxr + Math.cos(a2) * rc, cyr + Math.sin(a2) * rc, 0); }
      } else if (t.kind === 'window') {              /* depth of the slideshow window and the arch seen through it */
        FR = out[3]; var dz = 0.45;
        [[x0, yB], [x1, yB], [x0, yT], [x1, yT]].forEach(function (c) { L(c[0], c[1], 0, c[0], c[1], dz); });
        L(x0, yB, dz, x1, yB, dz); L(x1, yB, dz, x1, yT, dz); L(x1, yT, dz, x0, yT, dz); L(x0, yT, dz, x0, yB, dz);
        FR = out[4]; var aw = w * 0.36, ac = (x0 + x1) / 2, spring = yT - h * 0.18 - aw;
        L(ac - aw, yB, dz, ac - aw, spring, dz); L(ac + aw, yB, dz, ac + aw, spring, dz);
        var px = ac - aw, py = spring;
        for (i = 1; i <= 16; i++) { var an = Math.PI - Math.PI * i / 16, qx = ac + Math.cos(an) * aw, qy = spring + Math.sin(an) * aw; L(px, py, dz, qx, qy, dz); px = qx; py = qy; }
      } else if (t.kind === 'beam') {                /* the nav: a thin lintel */
        FR = out[3]; L(x0, yB, 0, x1, yB, 0); L(x0, yT, 0, x1, yT, 0); L(x0, yB, 0, x0, yT, 0); L(x1, yB, 0, x1, yT, 0);
      }
    });
    return out;
  }
  /* after the landing the solid shapes are drawn flat, pinned to the page, so they stay put while the camera
     keeps moving, and fade as the identical page elements fade in underneath */
  function drawPinned(TG, a) {
    if (a <= 0.01) return;
    TG.forEach(function (t) {
      if (t.t === 'decor') return;
      var col = t.c === 'ember' ? EMBER : CREAM, al = t.c === 'faint' ? 0.35 : 1;
      cx.strokeStyle = rgba(col, al * a); cx.lineWidth = t.c === 'ember' ? 1.5 : 1; cx.beginPath();
      if (t.t === 'circle') cx.arc(t.a[0], t.a[1], t.a[2], 0, Math.PI * 2);
      else { cx.moveTo(t.a[0], t.a[1]); for (var i = 2; i + 1 < t.a.length; i += 2) cx.lineTo(t.a[i], t.a[i + 1]); }
      cx.stroke();
    });
    cx.lineWidth = 1;
  }

  var ptr = { x: 0, y: 0, tx: 0, ty: 0 }, sy = 0, frame = 0, T = 0, idle = false;
  function render(now) {
    requestAnimationFrame(render);
    var dt = Math.min(50, now - (lastNow || now)); lastNow = now;
    if (document.hidden) return;
    T = still ? 9000 : now * motion;
    var scrolled = window.scrollY || 0; sy += (scrolled - sy) * (still ? 1 : 0.1);
    var home = body.classList.contains('is-home'), pj = body.classList.contains('is-pj');
    /* on the home page the hall fades out completely as you scroll past the hero (gone by 1.2 screens down) */
    var A = home ? 1 - smooth((sy - H * 0.5) / (H * 0.7)) : pj ? 0.4 : 0.5, it = -1;
    /* fully faded: clear once, hide the canvas and skip all the work until you scroll back up */
    if (!INTRO && A <= 0.005) {
      if (!idle) { cx.clearRect(0, 0, W, H); cv.style.visibility = 'hidden'; idle = true; }
      return;
    }
    if (idle) { cv.style.visibility = ''; idle = false; }
    var hw = W / 2, hh = H / 2, FA = 0, pw = 1;
    if (INTRO) {
      it = INTRO.freeze >= 0 ? INTRO.freeze : now - INTRO.t0;
      if (INTRO.freeze >= 0) T = 9000;               /* frozen debug frames: time stands still */
      A = Math.min(A, it / 350);                     /* same brightness rule as after the intro (incl. scroll dimming), just faded in */
      FA = Math.min(1, it / 600);                     /* facade fades in from the haze at the start */
      pw = smooth((it - LAND) / (DONE - LAND));      /* the mouse tilt comes back slowly once the page is up */
      if (!INTRO.handed && it >= HANDOFF) { INTRO.handed = true; INTRO.o.onHandoff && INTRO.o.onHandoff(); }
    }
    else if (A < 0.5 && (++frame & 1)) return;
    ptr.x += (ptr.tx - ptr.x) * 0.05; ptr.y += (ptr.ty - ptr.y) * 0.05;

    if (INTRO && !FAC) FAC = buildFacade(T * 0.0016 + sy * 0.012 + 0.0016 * motion * Math.max(0, LAND - it));   /* the facade exists from the first frame */
    if (INTRO) extra = FAC.EXI * diveF(it);         /* the dive: exact, so the landing point is known in advance */
    var s = T * 0.0016 + sy * 0.012 + extra;
    /* the facade exists from the first frame, at the point the camera will reach at LAND */
    var near = FAC ? 1 - smooth((FAC.sLand - s) / 100) : 0;   /* facade brightens as you approach */
    var FS = it < LAND ? FA * (0.25 + 0.75 * near) : 0;            /* solid lines in 3D, until the exact landing frame */
    var FD = FA * (0.25 + 0.75 * near) * (1 - smooth((it - LAND + 900) / 800));   /* decor dissolves before the landing */
    var PIN = it >= LAND ? 1 - smooth((it - LAND) / 300) : 0;     /* then the solids, pinned flat, cross-fade into the page */
    /* the hall dims while you approach the facade, then brightens back gradually after the landing,
       reaching full well before the intro ends, so nothing changes when it hands over to the normal background */
    var DIM = INTRO ? 0.45 * FA * near * (1 - smooth((it - LAND) / 1500)) : 0;
    var FAN = FD, TG = INTRO && FAC ? INTRO.o.targets() : null;
    if (INTRO && FAC) { var wl = smooth(it / LAND); ROFF = FAC.rollT * wl; YOFF = FAC.yT * wl; }   /* ease into the upright, floor-level pose */
    var C = frameAt(s, true), cp = C.p, rt = C.rt, up = C.up, fw = C.fw;
    if (ROFF || YOFF) { var ro = rot(rt, up, ROFF); rt = ro[0]; up = ro[1]; cp = add(cp, up, YOFF); }
    var py = ptr.x * 0.16 * pw, pp = -ptr.y * 0.12 * pw, cyw = Math.cos(py), syw = Math.sin(py), cpp = Math.cos(pp), spp = Math.sin(pp);

    /* keep the chunks around the camera (and around the facade while it exists) */
    var s0 = s;
    var k0 = Math.floor(s0 / CH) - 1, k1 = Math.floor(s / CH) + Math.ceil(FAR / CH) + 2, k;
    for (k in chunks) if (k < k0 || k > k1) delete chunks[k];
    for (k = k0; k <= k1; k++) if (!chunks[k]) chunks[k] = buildChunk(k);

    var paths = COLORS.map(function () { var a = []; for (var b = 0; b <= NB; b++) a.push(new Path2D()); return a; }), nodes = [];
    function V(x, y, z, o) {                         /* world -> view */
      var dx = x - cp[0], dy = y - cp[1], dz = z - cp[2];
      var vx = dx * rt[0] + dy * rt[1] + dz * rt[2], vy = dx * up[0] + dy * up[1] + dz * up[2], vz = dx * fw[0] + dy * fw[1] + dz * fw[2];
      var x2 = vx * cyw - vz * syw, z2 = vx * syw + vz * cyw;
      o[0] = x2; o[1] = vy * cpp - z2 * spp; o[2] = vy * spp + z2 * cpp;
    }
    var P1 = [0, 0, 0], P2 = [0, 0, 0];
    function drawFrag(fr) {
      var S = fr.s, bucketPaths = paths[fr.c];
      for (var i = 0; i < S.length; i += 6) {
        V(S[i], S[i + 1], S[i + 2], P1); V(S[i + 3], S[i + 4], S[i + 5], P2);
        var z1 = P1[2], z2 = P2[2];
        if ((z1 < NEAR && z2 < NEAR) || (!fr.fac && z1 > FAR && z2 > FAR)) continue;   /* the facade is visible at any distance */
        var x1 = P1[0], y1 = P1[1], x2 = P2[0], y2 = P2[1];
        if (z1 < NEAR) { var u = (NEAR - z1) / (z2 - z1); x1 += (x2 - x1) * u; y1 += (y2 - y1) * u; z1 = NEAR; }
        else if (z2 < NEAR) { var v = (NEAR - z2) / (z1 - z2); x2 += (x1 - x2) * v; y2 += (y1 - y2) * v; z2 = NEAR; }
        var a1 = f / z1, a2 = f / z2;
        if (!clip2(hw + x1 * a1, hh - y1 * a1, hw + x2 * a2, hh - y2 * a2)) continue;   /* trim to the screen: huge off-screen lines kill the frame rate */
        var pth = bucketPaths[fr.fac ? NB : Math.round(fadeOf((z1 + z2) / 2) * NB)];
        pth.moveTo(CL[0], CL[1]); pth.lineTo(CL[2], CL[3]);
      }
      var Nn = fr.n;
      for (var j = 0; j < Nn.length; j += 3) {
        V(Nn[j], Nn[j + 1], Nn[j + 2], P1);
        if (P1[2] > NEAR && (fr.fac || P1[2] < FAR)) { var kk = f / P1[2]; nodes.push(hw + P1[0] * kk, hh - P1[1] * kk, Math.max(1.2, Math.min(3.2, kk * 0.05)), fr.fac ? FAN / A : fadeOf(P1[2])); }
      }
    }
    for (k = k0; k <= k1; k++) for (var q = 0; q < chunks[k].length; q++) drawFrag(chunks[k][q]);
    if (TG && (FS > 0.01 || FD > 0.01)) facadeGeom(FAC, hw, hh, TG).forEach(drawFrag);

    cx.clearRect(0, 0, W, H);
    /* a faint glow where the path leads */
    var g = cx.createRadialGradient(hw, hh, 0, hw, hh, Math.max(W, H) * 0.55);
    g.addColorStop(0, rgba(EMBER, 0.07 * A)); g.addColorStop(1, rgba(EMBER, 0));
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    cx.lineWidth = 1; cx.lineJoin = 'round';
    for (var c = 0; c < COLORS.length; c++) for (var b = NB; b >= 1; b--) {
      var al = c >= 6 ? ALPHA[c] * FD : c >= 3 ? ALPHA[c] * FS : ALPHA[c] * (b / NB) * A * (1 - DIM);   /* the facade is drawn crisp; the hall dims as you reach it */
      if (al < 0.01) continue;
      cx.lineWidth = c === 4 ? 1.5 : 1;             /* same widths as the page: 1px rules, 1.5px brackets */
      cx.strokeStyle = rgba(COLORS[c], al); cx.stroke(paths[c][b]);
    }
    cx.lineWidth = 1;
    for (var m = 0; m < nodes.length; m += 4) {
      if (nodes[m + 3] < 0.02) continue;
      cx.fillStyle = rgba(EMBER, 0.95 * nodes[m + 3] * A);
      cx.fillRect(nodes[m] - nodes[m + 2] / 2, nodes[m + 1] - nodes[m + 2] / 2, nodes[m + 2], nodes[m + 2]);
    }
    if (INTRO) {
      if (TG && PIN > 0) drawPinned(TG, PIN);
      /* ignition: one node blinking where the path leads */
      if (it < 600) { var bl = (1 - smooth(it / 600)) * (0.6 + 0.4 * Math.sin(it / 45)); cx.fillStyle = rgba(EMBER, bl); cx.fillRect(hw - 2.5, hh - 2.5, 5, 5); }
      if (it >= DONE && INTRO.freeze < 0) { var o = INTRO.o; INTRO = null; FAC = null; o.onDone && o.onDone(); }
    }
  }

  addEventListener('resize', size);
  size(); requestAnimationFrame(render);
})();
