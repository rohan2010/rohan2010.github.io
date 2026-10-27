// The living paper's shaders. One full-screen triangle pair, one fragment shader: domain-warped
// fbm noise read as a printed page. Most of it is paper; ink and tobacco settle in the low areas
// away from the copy, and one contour of the field is drawn as a thin brass vein. The cursor is a
// soft lens that magnifies the flow and warms it. Colours arrive in linear light from the site's
// tokens and are encoded to sRGB here; the grain goes on after, in display space, so the 8-bit
// output never bands. NAIVE builds the obvious version for comparison.

export const VERT = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const FRAG = /* glsl */ `
precision highp float;

uniform vec2 uRes;      // drawing buffer, in px
uniform float uPhase;   // 0..2pi, one breath of the loop
uniform float uTime;    // seconds since mount; only the naive version reads it
uniform float uGrain;   // a fresh random number each frame
uniform vec2 uPointer;  // eased pointer, in the same space as p below
uniform float uLens;    // 0 when the pointer is away, 1 when it's on the stage
uniform vec4 uCopy;     // the copy block: centre xy, half size zw, in p space
uniform vec3 uPaper;
uniform vec3 uPaper2;
uniform vec3 uInk;
uniform vec3 uBrand;
uniform vec3 uSignal;
uniform float uDark;     // 1 when the paper is darker than the ink

// 2D simplex noise (Ashima Arts, MIT).
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Few octaves: the warp supplies the detail, and every octave is paid for five times a pixel.
float fbm(vec2 p) {
  const mat2 R = mat2(0.8, 0.6, -0.6, 0.8);
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < OCTAVES; i++) {
    s += a * snoise(p);
    p = R * p * 2.02 + 17.1;
    a *= 0.45;
  }
  return s;
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 toSrgb(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  // Height-normalised position: the pointer and the copy block are given in this space.
  vec2 at = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
#ifdef NAIVE
  // Plain uv: the noise stretches with the stage, and time grows without bound.
  vec2 p = uv - 0.5;
  vec2 w1 = vec2(cos(uTime * 0.5), sin(uTime * 0.4));
  vec2 w2 = vec2(sin(uTime * 0.7), cos(uTime * 0.6));
#else
  // Noise in the same space, so a blob is round on a wide stage and a tall one.
  vec2 p = at;
  // Integer multiples of one phase, so the motion loops with no seam.
  float a = uPhase;
  vec2 w1 = 0.55 * vec2(cos(a), sin(a));
  vec2 w2 = 0.45 * vec2(sin(2.0 * a + 1.3), cos(a + 0.7));
#endif

  // The lens: samples near the pointer are drawn in toward it, so the flow there magnifies and
  // bends around it.
  vec2 d = at - uPointer;
  float lens = exp(-dot(d, d) / 0.07) * uLens;
  p -= d * lens * 0.4;

  vec2 s = p * 0.55;
  vec2 q = vec2(fbm(s + w1), fbm(s + vec2(5.2, 1.3) - w1));
  vec2 r = vec2(fbm(s + 1.3 * q + vec2(1.7, 9.2) + w2), fbm(s + 1.3 * q + vec2(8.3, 2.8) - w2));
  float f = 0.5 + 0.5 * fbm(s + 1.3 * r);

#ifdef NAIVE
  float away = 1.0;
#else
  // Distance from the copy block, as a rounded box: 0 under the words, 1 well clear of them.
  vec2 b = abs(at - uCopy.xy) - uCopy.zw;
  float sd = length(max(b, 0.0)) + min(max(b.x, b.y), 0.0);
  float away = smoothstep(0.0, 0.32, sd);
#endif

  // Paper, with its own faint mottling.
  vec3 col = mix(uPaper, uPaper2, smoothstep(0.48, 0.72, f) * 0.4);
  // Ink in the low areas: tobacco in the shallows, ink at the deepest. It's laid on like a
  // wash, multiplied into the paper, so a thin layer stays warm instead of going grey.
  float wash = smoothstep(0.4, 0.14, f) * mix(0.02, 0.34, away);
  vec3 ink = mix(uBrand, uInk, smoothstep(0.3, 0.12, f) * 0.55);
  // On a dark scheme the ink is the lighter colour, and multiplying can't lighten, so it mixes.
  col = uDark > 0.5 ? mix(col, ink, wash) : col * pow(min(ink / max(uPaper, vec3(1e-3)), vec3(1.0)), vec3(wash));
  // One contour of the field as a brass vein, about a pixel and a half wide at any zoom.
  float line = abs(f - 0.56) / max(fwidth(f), 1e-4);
  float vein = (1.0 - smoothstep(0.4, 1.6, line)) * smoothstep(0.42, 0.62, 0.5 + 0.5 * q.y);
  col = mix(col, uSignal, vein * mix(0.1, 0.55, max(away, lens)));
  // The lens is also a little light: it warms what's under it.
  col = mix(col, mix(uPaper, uSignal, 0.4), lens * 0.16);

#ifdef NAIVE
  // Linear colours written straight out: everything comes out darker than the page around it.
  gl_FragColor = vec4(col, 1.0);
#else
  col = toSrgb(col);
  // Film grain, triangular, a few levels either way. It moves every frame and hides banding.
  float n = hash12(gl_FragCoord.xy + uGrain * 97.0) + hash12(gl_FragCoord.yx * 1.37 + uGrain * 59.0) - 1.0;
  gl_FragColor = vec4(col + n * 0.026, 1.0);
#endif
}
`;
