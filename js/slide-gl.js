/* EXPERIMENT: the hero slideshow drawn in WebGL onto a concave "bowl" instead of a flat plane.
   The image is mapped onto a curved mesh: the edges come towards you, the centre sits further back.
   The camera slowly moves in (the old zoom), so the curvature gives real parallax inside the picture.
   - SLIDEGL.attach(frame, imgs) is called by app.js; SLIDEGL.show(k) on every slide change
   - curvature / zoom / depth were tuned by eye with a slider panel (since removed) and are fixed below
   - if WebGL is missing, nothing happens and the normal flat images stay */
(function () {
  'use strict';

  var DEFAULTS = { curvature: 1.83, zoom: 0.5, depth: 5 };   /* chosen with the tuning sliders */
  var P = Object.assign({}, DEFAULTS);
  var SLIDE_MS = 4800, WIPE_MS = 1100, GRID = 48;
  var still = /[?&]still/.test(location.search);
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var cv, gl, prog, buf, ibuf, nIdx, frameEl, tex = [], sizes = [], cur = 0, prev = -1, tSwitch = 0, prevProgress = 0, raf = 0;
  var loc = {};


  var VS = [
    'attribute vec2 aXY;',                       /* grid position, -1..1 */
    'uniform float uAspect, uCurv, uDepth, uCam;',
    'uniform vec2 uUvScale;',
    'varying vec2 vUv;',
    'void main() {',
    '  vec2 p = aXY * vec2(uAspect, 1.0);',
    '  float r2 = aXY.x * aXY.x + aXY.y * aXY.y;',                       /* 0 at the centre, 1 at the middle of each edge, 2 in the corners */
    '  float z = uDepth + uCurv * (1.0 - r2);',                           /* bowl: centre pushed back, edges stay on the frame, corners come forward */
    '  float zc = max(z - uCam, 0.3);',
    '  gl_Position = vec4(p.x * uDepth / (uAspect * zc), p.y * uDepth / zc, 0.0, 1.0);',   /* perspective: flat plane at uDepth fills the frame */
    '  vUv = (aXY * 0.5) * uUvScale + 0.5;',
    '  vUv.y = 1.0 - vUv.y;',
    '}'
  ].join('\n');
  var FS = [
    'precision mediump float;',
    'uniform sampler2D uTex;',
    'varying vec2 vUv;',
    'void main() { gl_FragColor = texture2D(uTex, vUv); }'
  ].join('\n');

  function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }

  function init() {
    cv = document.createElement('canvas');
    cv.className = 'slide-gl';
    gl = cv.getContext('webgl', { antialias: true, premultipliedAlpha: false });
    if (!gl) return false;
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
    gl.useProgram(prog);
    ['uAspect', 'uCurv', 'uDepth', 'uCam', 'uUvScale', 'uTex'].forEach(function (n) { loc[n] = gl.getUniformLocation(prog, n); });
    /* grid mesh */
    var v = [], idx = [], i, j;
    for (j = 0; j <= GRID; j++) for (i = 0; i <= GRID; i++) v.push(i / GRID * 2 - 1, j / GRID * 2 - 1);
    for (j = 0; j < GRID; j++) for (i = 0; i < GRID; i++) { var a = j * (GRID + 1) + i, b = a + 1, c = a + GRID + 1, d = c + 1; idx.push(a, b, c, b, d, c); }
    buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);
    ibuf = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    nIdx = idx.length;
    var aXY = gl.getAttribLocation(prog, 'aXY'); gl.enableVertexAttribArray(aXY); gl.vertexAttribPointer(aXY, 2, gl.FLOAT, false, 0, 0);
    return true;
  }

  function loadTex(img, k) {
    function up() {
      var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      tex[k] = t; sizes[k] = [img.naturalWidth, img.naturalHeight];
    }
    if (img.complete && img.naturalWidth) up(); else img.addEventListener('load', up, { once: true });
  }

  function size() {
    var r = frameEl.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  }

  /* camera travel for a slide that has been showing for ms */
  function camAt(ms) { if (reduce) return 0; var p = Math.min(ms / 7000, 1); return p * P.zoom * 7000 / SLIDE_MS * P.depth; }

  function drawSlide(k, cam, scissorH) {
    if (!tex[k]) return;
    var aspect = cv.width / cv.height, s = sizes[k], ia = s[0] / s[1];
    /* object-fit: cover (the bowl keeps the middle of each edge on the frame, so there are no gaps) */
    var su = ia > aspect ? aspect / ia : 1, sv = ia > aspect ? 1 : ia / aspect;
    gl.uniform1f(loc.uAspect, aspect); gl.uniform1f(loc.uCurv, P.curvature); gl.uniform1f(loc.uDepth, P.depth); gl.uniform1f(loc.uCam, cam);
    gl.uniform2f(loc.uUvScale, su, sv);
    gl.bindTexture(gl.TEXTURE_2D, tex[k]); gl.uniform1i(loc.uTex, 0);
    if (scissorH < cv.height) { gl.enable(gl.SCISSOR_TEST); gl.scissor(0, 0, cv.width, Math.max(0, Math.round(scissorH))); }
    gl.drawElements(gl.TRIANGLES, nIdx, gl.UNSIGNED_SHORT, 0);
    gl.disable(gl.SCISSOR_TEST);
  }

  function ease(x) { x = Math.max(0, Math.min(1, x)); return 1 - Math.pow(1 - x, 3); }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (document.hidden || !frameEl.isConnected) return;
    size();
    gl.viewport(0, 0, cv.width, cv.height);
    gl.clearColor(0.07, 0.07, 0.07, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    var since = still ? 3000 : now - tSwitch;
    var wipe = still ? 1 : ease(since / WIPE_MS);
    if (prev >= 0 && wipe < 1) drawSlide(prev, camAt(prevProgress + since), cv.height);   /* outgoing slide keeps zooming in underneath the wipe */
    drawSlide(cur, camAt(since), wipe * cv.height);                                     /* incoming slide, revealed from the bottom up */
  }

  window.SLIDEGL = {
    params: P,
    attach: function (frame_, imgs) {
      if (frameEl === frame_) return;
      cancelAnimationFrame(raf);
      frameEl = frame_; tex = []; sizes = []; prev = -1; cur = 0; tSwitch = performance.now();
      if (!gl && !init()) return;
      frameEl.insertBefore(cv, frameEl.firstChild ? imgs[imgs.length - 1].nextSibling : null);
      frameEl.classList.add('gl-on');
      imgs.forEach(loadTex);
      raf = requestAnimationFrame(frame);
    },
    show: function (k) {
      if (!gl || k === cur) return;
      prevProgress = performance.now() - tSwitch; prev = cur; cur = k; tSwitch = performance.now();
    }
  };
})();
