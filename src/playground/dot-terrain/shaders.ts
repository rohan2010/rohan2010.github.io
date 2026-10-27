// The terrain's shaders. The vertex shader lifts each dot of a flat grid by a few slow sines and
// by the cursor's ripples; the fragment shader draws it round and soft, and lets it go
// transparent toward the horizon, so it fades into the paper behind the canvas.

// How many ripples are alive at once. The oldest is replaced by the newest.
export const RIPPLES = 4;

export const vertex = /* glsl */ `
uniform float uTime;
uniform float uScale;   // drawing-buffer px per world unit at distance 1
uniform float uSize;    // dot size in world units
uniform float uFloor;   // smallest dot, in drawing-buffer px
uniform vec2 uPointer;  // eased pointer on the plane (x, z)
uniform float uHover;   // 0..1, eased: is the pointer over the stage
uniform vec4 uRipples[${RIPPLES}]; // x, z, start time, strength (0 = unused)
uniform float uNear;
uniform float uFar;

varying float vFade;
varying float vHeat;

void main() {
  vec3 p = position;
  float t = uTime;

  // The resting swell: three sines at different scales and speeds, small enough to read as
  // breathing, not weather.
  float h = 0.22 * sin(p.x * 0.32 + t * 0.45) * cos(p.z * 0.26 - t * 0.32)
          + 0.10 * sin((p.x + p.z) * 0.62 + t * 0.7)
          + 0.04 * sin(p.x * 1.4 - p.z * 0.9 + t * 1.1);

  // A low mound that follows the pointer.
  float dp = distance(p.xz, uPointer);
  float lift = uHover * exp(-dp * dp * 0.35);
  h += 0.28 * lift;
  float heat = 0.55 * lift;

  // Rings: a band moving outward from where the pointer touched, losing height as it goes.
  for (int i = 0; i < ${RIPPLES}; i++) {
    vec4 r = uRipples[i];
    float age = t - r.z;
    if (r.w <= 0.0 || age < 0.0 || age > 5.0) continue;
    float k = distance(p.xz, r.xy) - age * 3.0;
    float band = exp(-k * k * 0.9) * exp(-age * 0.85) * r.w;
    h += 0.32 * band * sin(k * 2.6 + 1.2);
    heat += band;
  }
  p.y += h;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float depth = -mv.z;
  gl_Position = projectionMatrix * mv;

  vHeat = clamp(heat, 0.0, 1.0);
  vFade = 1.0 - smoothstep(uNear, uFar, depth);
  // Size falls off with depth like any object would; warm dots swell a little.
  gl_PointSize = max(uFloor, uSize * (1.0 + 0.7 * vHeat) * uScale / depth);
}
`;

export const fragment = /* glsl */ `
uniform vec3 uInk;
uniform vec3 uBrass;

varying float vFade;
varying float vHeat;

void main() {
  // Round and soft: full inside, falling to nothing at the edge of the point sprite.
  float d = length(gl_PointCoord - 0.5);
  float a = 1.0 - smoothstep(0.22, 0.5, d);
  vec3 c = mix(uInk, uBrass, smoothstep(0.05, 0.6, vHeat));
  float alpha = a * vFade * mix(0.34, 0.95, vHeat);
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(c, alpha);
  #include <colorspace_fragment>
}
`;
