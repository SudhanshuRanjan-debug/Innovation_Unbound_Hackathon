"use client";
import React, { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { SceneCanvas } from "./SceneCanvas";
import { INDIA_NATIONAL_BORDER, INDIA_STATE_BORDERS } from "./indiaBorderData";

// ── 1. DEEP SPACE UNIVERSE STARFIELD (PINPOINT COSMIC STARS) ──
function UniverseStarfield({ count = 1400 }: { count?: number }) {
  const starsRef = useRef<THREE.Points>(null);

  const { starPositions, starColors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);

    const palette = [
      new THREE.Color("#FFFFFF"),
      new THREE.Color("#E0F2FE"),
      new THREE.Color("#BAE6FD"),
      new THREE.Color("#93C5FD"),
      new THREE.Color("#FEF3C7"),
      new THREE.Color("#DDD6FE"),
    ];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 42;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 32;
      pos[i * 3 + 2] = -24 + Math.random() * 28;

      const c = palette[Math.floor(Math.random() * palette.length)];
      const lum = 0.35 + Math.random() * 0.65;
      cols[i * 3] = c.r * lum;
      cols[i * 3 + 1] = c.g * lum;
      cols[i * 3 + 2] = c.b * lum;
    }

    return { starPositions: pos, starColors: cols };
  }, [count]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (starsRef.current) {
      starsRef.current.rotation.y = t * 0.004;
      starsRef.current.rotation.x = Math.sin(t * 0.0025) * 0.005;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
        <bufferAttribute attach="attributes-color" args={[starColors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.016}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ── 2. HIGH QUALITY LIVE EARTH GLOBE AS SEEN FROM SPACE ──
// Sun direction: natural orbital solar illumination with dynamic atmospheric depth
const SUN_DIRECTION = new THREE.Vector3(0.55, 0.35, 0.75).normalize();

// Helper: Convert Geographic Coordinates (lat, lon) to 3D Sphere Vector
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

// Helper: Compute Elevated Great-Circle Arc Segments between two cities
const ARC_SEGMENTS = 36;
function computeArcSegments(start: THREE.Vector3, end: THREE.Vector3, numSegments = ARC_SEGMENTS): {
  segmentsArray: Float32Array;
  curvePoints: THREE.Vector3[];
} {
  const v1 = start.clone().normalize();
  const v2 = end.clone().normalize();
  const angle = v1.angleTo(v2);
  const qTarget = new THREE.Quaternion().setFromUnitVectors(v1, v2);

  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= numSegments; i++) {
    const u = i / numSegments;
    const q = new THREE.Quaternion().slerp(qTarget, u);
    const p = v1.clone().applyQuaternion(q);

    // Elevated curve closely hugging the terrain of India
    const baseRadius = 2.194;
    const arch = Math.sin(u * Math.PI) * Math.max(0.012, angle * 0.08);
    p.multiplyScalar(baseRadius + arch);
    points.push(p);
  }

  const segments = new Float32Array(numSegments * 2 * 3);
  for (let i = 0; i < numSegments; i++) {
    const pA = points[i];
    const pB = points[i + 1];
    const idx = i * 6;
    segments[idx] = pA.x;
    segments[idx + 1] = pA.y;
    segments[idx + 2] = pA.z;
    segments[idx + 3] = pB.x;
    segments[idx + 4] = pB.y;
    segments[idx + 5] = pB.z;
  }

  return { segmentsArray: segments, curvePoints: points };
}

// Recognized Indian Banking Hub Cities: Sequential appearance synchronized with red line arrival
const INDIAN_CITIES = [
  { id: "mumbai", name: "Mumbai", lat: 19.0760, lon: 72.8777, appearTime: 8.3 },
  { id: "bengaluru", name: "Bengaluru", lat: 12.9716, lon: 77.5946, appearTime: 9.6 },
  { id: "chennai", name: "Chennai", lat: 13.0827, lon: 80.2707, appearTime: 10.8 },
  { id: "hyderabad", name: "Hyderabad", lat: 17.3850, lon: 78.4867, appearTime: 12.0 },
  { id: "pune", name: "Pune", lat: 18.5204, lon: 73.8567, appearTime: 13.2 },
  { id: "ahmedabad", name: "Ahmedabad", lat: 23.0225, lon: 72.5714, appearTime: 14.4 },
  { id: "delhi", name: "Delhi", lat: 28.6139, lon: 77.2090, appearTime: 15.6 },
  { id: "kolkata", name: "Kolkata", lat: 22.5726, lon: 88.3639, appearTime: 16.8 },
];

// Sequential Red Tracing Routes: Traces from city to city, connecting each pointer through lines only
const FINANCIAL_ROUTES = [
  { id: "r1", from: "mumbai", to: "bengaluru", startTime: 8.6, duration: 1.0 },
  { id: "r2", from: "bengaluru", to: "chennai", startTime: 9.8, duration: 1.0 },
  { id: "r3", from: "chennai", to: "hyderabad", startTime: 11.0, duration: 1.0 },
  { id: "r4", from: "hyderabad", to: "pune", startTime: 12.2, duration: 1.0 },
  { id: "r5", from: "pune", to: "ahmedabad", startTime: 13.4, duration: 1.0 },
  { id: "r6", from: "ahmedabad", to: "delhi", startTime: 14.6, duration: 1.0 },
  { id: "r7", from: "delhi", to: "kolkata", startTime: 15.8, duration: 1.0 },
  { id: "r8", from: "kolkata", to: "mumbai", startTime: 17.0, duration: 1.2 },
];

// Shaders for Photorealistic Earth Surface
const EarthSurfaceShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewDirection;

    void main() {
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      vViewDirection = normalize(cameraPosition - worldPos.xyz);
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    uniform sampler2D uDayMap;
    uniform sampler2D uNightMap;
    uniform sampler2D uSpecularMap;
    uniform sampler2D uNormalMap;
    uniform sampler2D uCloudsMap;
    uniform vec3 uSunDirection;
    uniform float uZoomProgress;

    varying vec2 vUv;
    varying vec3 vWorldNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewDirection;

    void main() {
      vec3 normal = normalize(vWorldNormal);
      vec3 viewDir = normalize(vViewDirection);

      // Normal map perturbation for mountain ranges and topographical relief
      vec3 normalTex = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
      vec3 perturbedNormal = normalize(normal + normalTex * 0.35);

      // Diffuse sunlight calculation
      float sunDot = dot(perturbedNormal, uSunDirection);
      float rawSunDot = dot(normal, uSunDirection);

      // Smooth terminator transition
      float dayFactor = smoothstep(-0.06, 0.22, sunDot);
      float nightFactor = smoothstep(0.12, -0.15, rawSunDot);

      // Textures
      vec3 dayColor = texture2D(uDayMap, vUv).rgb;
      vec3 nightColor = texture2D(uNightMap, vUv).rgb;
      float specMask = texture2D(uSpecularMap, vUv).r;

      // Realistic soft foggy cloud shadows cast onto the planet surface
      vec2 shadowOffset = vec2(-uSunDirection.x, -uSunDirection.y) * 0.006;
      float cloudVal = texture2D(uCloudsMap, vUv + shadowOffset).r;
      float cloudShadow = smoothstep(0.08, 0.65, cloudVal) * 0.35 * max(sunDot, 0.0);
      dayColor *= (1.0 - cloudShadow);

      // Satellite Clarity & Geographic Enhancement over India (U: 0.680 - 0.775, V: 0.290 - 0.460)
      vec2 indiaUvCenter = vec2(0.725, 0.372);
      vec2 deltaUv = (vUv - indiaUvCenter) * vec2(1.8, 1.0);
      float distToIndiaUv = length(deltaUv);
      float indiaRegionMask = smoothstep(0.13, 0.02, distToIndiaUv);

      if (indiaRegionMask > 0.001) {
        // Vibrant satellite enhancement: enhance vegetation greens, Thar desert gold, and Himalayan snow
        vec3 satEnhanced = dayColor;
        float luminance = dot(satEnhanced, vec3(0.299, 0.587, 0.114));
        satEnhanced = mix(vec3(luminance), satEnhanced, 1.30);
        satEnhanced.g *= 1.14; // Lush Western Ghats & Gangetic river plains
        satEnhanced.r = mix(satEnhanced.r, satEnhanced.r * 1.08, smoothstep(0.33, 0.38, vUv.y)); // Thar desert warmth

        // Himalayan alpine snow peak clarity in the north (V in 0.30 - 0.335, U in 0.69 - 0.76)
        float himalayaSnow = smoothstep(0.335, 0.300, vUv.y) * smoothstep(0.690, 0.720, vUv.x) * smoothstep(0.765, 0.735, vUv.x);
        satEnhanced = mix(satEnhanced, vec3(0.98, 0.99, 1.0), himalayaSnow * 0.50);

        // Coastal Continental Shelf Water: turquoise reef glow along Arabian Sea and Bay of Bengal coasts
        float coastalShelf = specMask * smoothstep(0.11, 0.035, distToIndiaUv);
        vec3 shelfColor = vec3(0.06, 0.68, 0.82);
        satEnhanced = mix(satEnhanced, shelfColor, coastalShelf * 0.55);

        // Smoothly blend in satellite clarity as camera penetrates through clouds
        float groundClarity = indiaRegionMask * (0.35 + uZoomProgress * 0.65);
        dayColor = mix(dayColor, satEnhanced, groundClarity);
      }

      // Ocean Specular Glint (crisp, dynamic sun mirror reflection on water)
      vec3 halfVector = normalize(uSunDirection + viewDir);
      float NdotH = max(dot(perturbedNormal, halfVector), 0.0);
      float specPower = pow(NdotH, 80.0);
      vec3 specular = vec3(0.90, 0.95, 1.0) * specPower * specMask * max(sunDot, 0.0) * 0.90;

      // Atmospheric Rayleigh scattering haze on the sunlit surface
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.2);
      vec3 atmosHaze = vec3(0.24, 0.65, 1.0) * fresnel * max(rawSunDot, 0.0) * 1.35;

      // Warm golden-amber sunset/sunrise band along the terminator
      float twilight = smoothstep(0.2, -0.02, rawSunDot) * smoothstep(-0.25, 0.02, rawSunDot);
      vec3 twilightGlow = vec3(0.95, 0.45, 0.12) * twilight * 0.42;

      // Glowing city lights (strictly illuminated on the night hemisphere)
      vec3 cityLights = nightColor * nightFactor * 2.4;

      // Final composite: photorealistic Earth as seen from orbit
      vec3 finalColor = dayColor * dayFactor + specular + cityLights + atmosHaze + twilightGlow;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
};

// ── LAYER 1: ULTRA-HIGH RESOLUTION TROPOSPHERIC CLOUDS WITH DYNAMIC FOG BREAK ──
const EarthCloudsShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldNormal;
    varying vec3 vViewDirection;

    void main() {
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      vViewDirection = normalize(cameraPosition - worldPos.xyz);
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    uniform sampler2D uCloudsMap;
    uniform vec3 uSunDirection;
    uniform float uTime;
    uniform float uZoomProgress;

    varying vec2 vUv;
    varying vec3 vWorldNormal;
    varying vec3 vViewDirection;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      v += 0.500 * noise(p);
      v += 0.250 * noise(p * 2.02);
      v += 0.125 * noise(p * 4.04);
      return v;
    }

    void main() {
      float rawCloud = texture2D(uCloudsMap, vUv).r;
      float microFog = fbm(vUv * 50.0 + vec2(uTime * 0.012, 0.0)) * 0.24 - 0.12;
      float cloudVal = clamp(rawCloud + microFog * rawCloud, 0.0, 1.0);

      float alpha = smoothstep(0.04, 0.68, cloudVal);
      if (alpha < 0.005) discard;

      vec3 normal = normalize(vWorldNormal);
      vec3 viewDir = normalize(vViewDirection);

      float sunDot = dot(normal, uSunDirection);
      float sunLit = smoothstep(-0.25, 0.28, sunDot);

      vec3 dayColor = vec3(1.0, 1.0, 1.0);
      vec3 nightColor = vec3(0.02, 0.035, 0.065);
      vec3 cloudColor = mix(nightColor, dayColor, sunLit);

      float rim = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.6);
      vec3 rimFog = vec3(0.28, 0.72, 1.0) * rim * (sunLit * 0.8 + 0.18);

      float twilight = smoothstep(0.22, -0.04, sunDot) * smoothstep(-0.28, 0.04, sunDot);
      vec3 duskFog = vec3(0.96, 0.48, 0.16) * twilight * 0.52;

      cloudColor += rimFog + duskFog;

      // Cloud penetration effect: as camera descends into India, the cloud ceiling
      // parts directly over the subcontinent so the ground map is crystal clear!
      vec3 indiaCenter = vec3(0.0, 0.20, 0.98);
      float distToIndia = distance(normal, indiaCenter);
      float cloudPart = smoothstep(0.14, 0.52, distToIndia);
      float localCloudClear = mix(1.0, cloudPart, smoothstep(0.20, 0.90, uZoomProgress));

      float finalAlpha = alpha * (sunLit * 0.52 + 0.22) * 0.72 * localCloudClear;

      gl_FragColor = vec4(cloudColor, finalAlpha);
    }
  `,
};

// ── LAYER 2: HIGH-ALTITUDE CIRRUS & DRIFTING ATMOSPHERIC FOG VEIL ──
const EarthFogVeilShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldNormal;
    varying vec3 vViewDirection;

    void main() {
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      vViewDirection = normalize(cameraPosition - worldPos.xyz);
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    uniform sampler2D uCloudsMap;
    uniform vec3 uSunDirection;
    uniform float uTime;
    uniform float uZoomProgress;

    varying vec2 vUv;
    varying vec3 vWorldNormal;
    varying vec3 vViewDirection;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
    }

    void main() {
      vec2 fogUv = vUv * 1.25 + vec2(uTime * 0.006, uTime * 0.002);
      float mist = noise(fogUv * 32.0) * 0.6 + noise(fogUv * 64.0) * 0.3;

      float baseClouds = texture2D(uCloudsMap, vUv + vec2(0.04, 0.015)).r;
      float fogDensity = baseClouds * mist * 1.4;

      float alpha = smoothstep(0.12, 0.62, fogDensity) * 0.16;
      if (alpha < 0.005) discard;

      vec3 normal = normalize(vWorldNormal);
      vec3 viewDir = normalize(vViewDirection);

      float sunDot = dot(normal, uSunDirection);
      float sunLit = smoothstep(-0.2, 0.32, sunDot);

      vec3 fogColor = mix(vec3(0.03, 0.06, 0.12), vec3(0.94, 0.98, 1.0), sunLit);

      float rim = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.2);
      fogColor += vec3(0.32, 0.78, 1.0) * rim * (sunLit * 0.9 + 0.22);

      // Dissolve veil over India during close camera descent
      vec3 indiaCenter = vec3(0.0, 0.20, 0.98);
      float distToIndia = distance(normal, indiaCenter);
      float veilPart = smoothstep(0.14, 0.52, distToIndia);
      float localVeilClear = mix(1.0, veilPart, smoothstep(0.20, 0.90, uZoomProgress));

      gl_FragColor = vec4(fogColor, alpha * localVeilClear);
    }
  `,
};

// ── LAYER 3: RAZOR-THIN ATMOSPHERIC HORIZON LIMB GLOW ──
const EarthAtmosphereShader = {
  vertexShader: `
    varying vec3 vWorldNormal;
    varying vec3 vViewDirection;

    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      vViewDirection = normalize(cameraPosition - worldPos.xyz);
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    uniform vec3 uSunDirection;

    varying vec3 vWorldNormal;
    varying vec3 vViewDirection;

    void main() {
      vec3 normal = normalize(vWorldNormal);
      vec3 viewDir = normalize(vViewDirection);
      float viewDot = max(dot(normal, viewDir), 0.0);

      float limb = pow(1.0 - viewDot, 3.5);

      float sunDot = dot(normal, uSunDirection);
      float sunFactor = smoothstep(-0.35, 0.45, sunDot);

      vec3 dayAtmosphere = vec3(0.24, 0.72, 1.0);
      vec3 sunsetAtmosphere = vec3(0.96, 0.48, 0.16);
      float twilightFactor = smoothstep(0.25, -0.05, sunDot) * smoothstep(-0.3, 0.05, sunDot);

      vec3 nightAtmosphere = vec3(0.02, 0.08, 0.24);

      vec3 atmosColor = mix(nightAtmosphere, dayAtmosphere, sunFactor);
      atmosColor = mix(atmosColor, sunsetAtmosphere, twilightFactor * 0.75);

      float alpha = limb * (sunFactor * 0.85 + 0.14);
      gl_FragColor = vec4(atmosColor, alpha);
    }
  `,
};

// ── LAYER 4: OUTER ATMOSPHERIC CORONA HALO ──
const EarthCoronaShader = {
  vertexShader: `
    varying vec3 vWorldNormal;
    varying vec3 vViewDirection;

    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      vViewDirection = normalize(cameraPosition - worldPos.xyz);
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    uniform vec3 uSunDirection;

    varying vec3 vWorldNormal;
    varying vec3 vViewDirection;

    void main() {
      vec3 outwardNormal = -normalize(vWorldNormal);
      vec3 viewDir = normalize(vViewDirection);

      float rim = pow(max(dot(outwardNormal, viewDir), 0.0), 3.0);
      float sunDot = dot(outwardNormal, uSunDirection);
      float sunFactor = smoothstep(-0.25, 0.5, sunDot);

      vec3 glowColor = vec3(0.18, 0.65, 1.0) * (sunFactor * 0.88 + 0.12);
      float alpha = rim * 0.48 * (sunFactor * 0.88 + 0.15);

      gl_FragColor = vec4(glowColor, alpha);
    }
  `,
};

// ── 3. REALISTIC VOLUMETRIC CLOUD DESCENT & PENETRATION ──
// Renders:
// 1. 3D Volumetric Cloud Strata in space along the dive path (z = 4.3, 3.6, 3.1)
// 2. High-speed swirling lens vapor wisps during entry (1.4s - 3.8s)
// 3. Dramatic "Cloud Break" & ground sunburst bloom (3.3s - 4.0s)
function AtmosphericCloudDescent() {
  const groupRef = useRef<THREE.Group>(null);
  const lensMeshRef = useRef<THREE.Mesh>(null);
  const lensMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const cloudDeck1Ref = useRef<THREE.Mesh>(null);
  const cloudDeck2Ref = useRef<THREE.Mesh>(null);
  const cloudDeck3Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const cam = state.camera;

    // Atmospheric entry clouds ONLY appear during camera descent (t in [4.7s, 8.1s])
    // During initial space rotation (t < 4.7s), this is 100% hidden to preserve true, dynamic Earth colors
    if (t < 4.7 || t > 8.1) {
      if (groupRef.current) groupRef.current.visible = false;
      return;
    }
    if (groupRef.current) groupRef.current.visible = true;

    // 1. In-lens condensation and cloud break
    if (lensMeshRef.current && lensMaterialRef.current) {
      lensMeshRef.current.visible = true;
      const progress = THREE.MathUtils.smoothstep(t, 4.7, 7.8);
      // Bell curve density peaking as camera plunges into clouds
      const mistDensity = Math.sin(progress * Math.PI);
      lensMaterialRef.current.uniforms.uOpacity.value = mistDensity * 0.65;
      lensMaterialRef.current.uniforms.uTime.value = t;
      lensMaterialRef.current.uniforms.uBreakProgress.value = THREE.MathUtils.smoothstep(t, 7.0, 8.0);

      // Fixed right in front of camera view frustum
      lensMeshRef.current.position.copy(cam.position);
      lensMeshRef.current.quaternion.copy(cam.quaternion);
      lensMeshRef.current.translateZ(-0.85);
    }

    // 2. Volumetric 3D Cloud Deck 1 (passed at z = 4.8)
    if (cloudDeck1Ref.current) {
      const mat = cloudDeck1Ref.current.material as THREE.ShaderMaterial;
      if (mat) {
        mat.uniforms.uTime.value = t;
        const distFromDeck = cam.position.z - 4.8;
        mat.uniforms.uOpacity.value =
          distFromDeck > -0.15 && distFromDeck < 0.6
            ? THREE.MathUtils.smoothstep(0.6, 0.1, distFromDeck) *
              THREE.MathUtils.smoothstep(-0.15, 0.05, distFromDeck) *
              0.65
            : 0.0;
      }
    }

    // 3. Volumetric 3D Cloud Deck 2 (passed at z = 4.2)
    if (cloudDeck2Ref.current) {
      const mat = cloudDeck2Ref.current.material as THREE.ShaderMaterial;
      if (mat) {
        mat.uniforms.uTime.value = t;
        const distFromDeck = cam.position.z - 4.2;
        mat.uniforms.uOpacity.value =
          distFromDeck > -0.15 && distFromDeck < 0.6
            ? THREE.MathUtils.smoothstep(0.6, 0.1, distFromDeck) *
              THREE.MathUtils.smoothstep(-0.15, 0.05, distFromDeck) *
              0.70
            : 0.0;
      }
    }

    // 4. Volumetric 3D Cloud Deck 3 (passed at z = 3.75)
    if (cloudDeck3Ref.current) {
      const mat = cloudDeck3Ref.current.material as THREE.ShaderMaterial;
      if (mat) {
        mat.uniforms.uTime.value = t;
        const distFromDeck = cam.position.z - 3.75;
        mat.uniforms.uOpacity.value =
          distFromDeck > -0.15 && distFromDeck < 0.5
            ? THREE.MathUtils.smoothstep(0.5, 0.08, distFromDeck) *
              THREE.MathUtils.smoothstep(-0.15, 0.05, distFromDeck) *
              0.60
            : 0.0;
      }
    }
  });

  // Lens Condensation & Cloud Break Shader
  const lensShader = useMemo(() => ({
    uniforms: {
      uOpacity: { value: 0 },
      uTime: { value: 0 },
      uBreakProgress: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uOpacity;
      uniform float uTime;
      uniform float uBreakProgress;
      varying vec2 vUv;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        v += 0.50 * noise(p);
        v += 0.25 * noise(p * 2.02);
        v += 0.125 * noise(p * 4.04);
        return v;
      }

      void main() {
        vec2 centeredUv = (vUv - 0.5) * 2.0;
        float dist = length(centeredUv);

        // High-speed divergent cloud billows rushing outward from screen center
        vec2 radialDir = normalize(centeredUv + vec2(0.001));
        vec2 flowUv = vUv + radialDir * (uTime * 0.35);

        float billow = fbm(flowUv * 6.0) * 0.65 + fbm(flowUv * 14.0 - vec2(uTime * 0.2)) * 0.35;

        // Cloud break effect: vapor parts down the middle and swirls away
        float breakPart = smoothstep(0.1 + uBreakProgress * 1.6, 0.7 + uBreakProgress * 1.8, dist);
        float alpha = smoothstep(1.35, 0.12, dist) * billow * uOpacity * breakPart;
        if (alpha < 0.005) discard;

        // Sunlit white-gold cloud vapor with gentle blue atmospheric rim
        vec3 sunlitWhite = vec3(0.98, 0.99, 1.0);
        vec3 atmosHaze = vec3(0.78, 0.90, 1.0);
        vec3 sunburstGold = vec3(1.0, 0.96, 0.88);
        vec3 mistColor = mix(sunlitWhite, atmosHaze, dist * 0.45);
        mistColor = mix(mistColor, sunburstGold, uBreakProgress * 0.4);

        gl_FragColor = vec4(mistColor, alpha);
      }
    `,
  }), []);

  // 3D Procedural Stratocumulus Cloud Deck Shader
  const createDeckShader = () => ({
    uniforms: {
      uOpacity: { value: 0 },
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uOpacity;
      uniform float uTime;
      varying vec2 vUv;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        v += 0.52 * noise(p);
        v += 0.26 * noise(p * 2.03);
        v += 0.13 * noise(p * 4.07);
        return v;
      }

      void main() {
        vec2 uv = vUv * 3.5 + vec2(uTime * 0.015, uTime * 0.008);
        float cloud = fbm(uv);
        float alpha = smoothstep(0.38, 0.72, cloud) * uOpacity;
        if (alpha < 0.005) discard;

        // Realistic atmospheric altitude shading (soft sky blues and warm sunlight)
        vec3 sunlit = vec3(0.92, 0.95, 1.0);
        vec3 shaded = vec3(0.42, 0.64, 0.88);
        vec3 col = mix(shaded, sunlit, smoothstep(0.42, 0.68, cloud));

        gl_FragColor = vec4(col, alpha);
      }
    `,
  });

  const deckShader1 = useMemo(() => createDeckShader(), []);
  const deckShader2 = useMemo(() => createDeckShader(), []);
  const deckShader3 = useMemo(() => createDeckShader(), []);

  return (
    <group ref={groupRef} visible={false}>
      {/* Volumetric Cloud Deck 1 (High Altitude Cirrus: z = 4.8) */}
      <mesh ref={cloudDeck1Ref} position={[0, 0.12, 4.8]}>
        <planeGeometry args={[4.8, 3.2]} />
        <shaderMaterial
          vertexShader={deckShader1.vertexShader}
          fragmentShader={deckShader1.fragmentShader}
          uniforms={deckShader1.uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Volumetric Cloud Deck 2 (Mid Altitude Stratocumulus: z = 4.2) */}
      <mesh ref={cloudDeck2Ref} position={[0, 0.12, 4.2]}>
        <planeGeometry args={[4.2, 2.8]} />
        <shaderMaterial
          vertexShader={deckShader2.vertexShader}
          fragmentShader={deckShader2.fragmentShader}
          uniforms={deckShader2.uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Volumetric Cloud Deck 3 (Low Altitude Cloud Ceiling: z = 3.75) */}
      <mesh ref={cloudDeck3Ref} position={[0, 0.12, 3.75]}>
        <planeGeometry args={[3.6, 2.4]} />
        <shaderMaterial
          vertexShader={deckShader3.vertexShader}
          fragmentShader={deckShader3.fragmentShader}
          uniforms={deckShader3.uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Lens Condensation & Cloud Break Vapor Sheet */}
      <mesh ref={lensMeshRef} visible={false}>
        <planeGeometry args={[3.2, 2.0]} />
        <shaderMaterial
          ref={lensMaterialRef}
          vertexShader={lensShader.vertexShader}
          fragmentShader={lensShader.fragmentShader}
          uniforms={lensShader.uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// ── 4. INDIA SOVEREIGN VECTOR BOUNDARIES (NATIONAL CONTOUR & 37 STATES) ──
function IndiaMapBoundaries() {
  const nationalMatRef = useRef<THREE.LineBasicMaterial>(null);
  const stateMatRef = useRef<THREE.LineBasicMaterial>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Fades in smoothly as camera breaks through clouds (starts at progress 0.25, full at 0.85)
    const zoomProgress = THREE.MathUtils.smoothstep(t, 4.5, 8.0);
    const fade = THREE.MathUtils.smoothstep(zoomProgress, 0.25, 0.85);
    if (nationalMatRef.current) {
      nationalMatRef.current.opacity = fade * 0.95;
    }
    if (stateMatRef.current) {
      stateMatRef.current.opacity = fade * 0.55;
    }
  });

  return (
    <group>
      {/* 1. Sovereign National Border of India (Razor-sharp luminous cyan contour) */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[INDIA_NATIONAL_BORDER, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          ref={nationalMatRef}
          color="#38BDF8"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          linewidth={2}
          depthWrite={false}
        />
      </lineSegments>

      {/* 2. Internal State Boundaries of all 37 Indian States/UTs (Subtle architectural digital grid) */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[INDIA_STATE_BORDERS, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          ref={stateMatRef}
          color="#0284C7"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          linewidth={1}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

// ── 5. CITY LOCATION MARKER WITH ANCHOR DOT & DIGITAL MAP PIN ──
function CityMarker({
  city,
  position,
}: {
  city: (typeof INDIAN_CITIES)[0];
  position: THREE.Vector3;
}) {
  const markerGroupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Surface normal at this city to lay beacon ring flat against the globe
  const normal = useMemo(() => position.clone().normalize(), [position]);
  const ringQuaternion = useMemo(() => {
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
  }, [normal]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!markerGroupRef.current) return;

    if (t < city.appearTime) {
      markerGroupRef.current.visible = false;
    } else {
      markerGroupRef.current.visible = true;
      const age = t - city.appearTime;
      const scale = Math.min(1.0, age * 4.0);
      markerGroupRef.current.scale.set(scale, scale, scale);

      // Subtle expanding radar beacon pulse
      if (ringRef.current) {
        const pulseCycle = (age * 1.6) % 1.0;
        const ringScale = 1.0 + pulseCycle * 0.9;
        ringRef.current.scale.set(ringScale, ringScale, 1.0);
        const mat = ringRef.current.material as THREE.MeshBasicMaterial;
        if (mat) {
          mat.opacity = (1.0 - pulseCycle) * 0.8;
        }
      }
    }
  });

  return (
    <group ref={markerGroupRef} position={[position.x, position.y, position.z]} visible={false}>
      {/* Sleek Micro-Pinpoint Node (Smaller in size, connected through lines only) */}
      <mesh>
        <sphereGeometry args={[0.0045, 12, 12]} />
        <meshBasicMaterial color="#FF3B30" depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.002, 8, 8]} />
        <meshBasicMaterial color="#FFFFFF" depthWrite={false} />
      </mesh>

      {/* Subtle Micro Pulse Ring */}
      <mesh ref={ringRef} quaternion={ringQuaternion}>
        <ringGeometry args={[0.0055, 0.011, 24]} />
        <meshBasicMaterial
          color="#FF3B30"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ── 5. ANIMATED RED TRACING ROUTE LINE WITH TRAVELING PULSE ──
function AnimatedRouteLine({
  route,
  startPos,
  endPos,
}: {
  route: (typeof FINANCIAL_ROUTES)[0];
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
}) {
  const lineRef = useRef<THREE.LineSegments>(null);
  const tracerDotRef = useRef<THREE.Group>(null);

  const { segmentsArray, curvePoints } = useMemo(() => {
    return computeArcSegments(startPos, endPos, ARC_SEGMENTS);
  }, [startPos, endPos]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!lineRef.current) return;

    const elapsed = t - route.startTime;
    if (elapsed <= 0) {
      lineRef.current.geometry.setDrawRange(0, 0);
      if (tracerDotRef.current) tracerDotRef.current.visible = false;
      return;
    }

    const progress = Math.min(1.0, elapsed / route.duration);
    // Draw segments progressively (2 vertices per segment)
    const visibleSegments = Math.floor(progress * ARC_SEGMENTS);
    lineRef.current.geometry.setDrawRange(0, visibleSegments * 2);

    // Glowing tracer dot leading the path or continuously pulsing along route
    if (tracerDotRef.current) {
      tracerDotRef.current.visible = true;
      const pulseProgress = progress < 1.0 
        ? progress 
        : ((t - route.startTime) * 0.5) % 1.0;

      const floatIdx = pulseProgress * ARC_SEGMENTS;
      const idx0 = Math.floor(floatIdx);
      const idx1 = Math.min(ARC_SEGMENTS, idx0 + 1);
      const frac = floatIdx - idx0;

      const p0 = curvePoints[idx0];
      const p1 = curvePoints[idx1];
      if (p0 && p1) {
        tracerDotRef.current.position.lerpVectors(p0, p1, frac);
      }
    }
  });

  return (
    <group>
      {/* Thin Red Tracing Great-Circle Route Line */}
      <lineSegments ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[segmentsArray, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color="#FF3B30"
          transparent
          opacity={0.92}
          blending={THREE.AdditiveBlending}
          linewidth={2}
          depthWrite={false}
        />
      </lineSegments>

      {/* Leading Red Tracer Dot */}
      <group ref={tracerDotRef} visible={false}>
        <mesh>
          <sphereGeometry args={[0.0035, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" depthWrite={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.007, 8, 8]} />
          <meshBasicMaterial
            color="#FF3B30"
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

// ── 6. INDIA BANKING NETWORK (GEOGRAPHIC CITY NODES & ROUTES) ──
function IndiaBankingNetwork() {
  const cityPositions = useMemo(() => {
    const map = new Map<string, THREE.Vector3>();
    INDIAN_CITIES.forEach((c) => {
      map.set(c.id, latLonToVector3(c.lat, c.lon, 2.200));
    });
    return map;
  }, []);

  return (
    <group>
      {/* 1. Animated Sequential City-to-City Red Tracing Routes */}
      {FINANCIAL_ROUTES.map((route) => {
        const start = cityPositions.get(route.from);
        const end = cityPositions.get(route.to);
        if (!start || !end) return null;
        return (
          <AnimatedRouteLine
            key={route.id}
            route={route}
            startPos={start}
            endPos={end}
          />
        );
      })}

      {/* 2. City Markers (Pins and Labels appearing one by one) */}
      {INDIAN_CITIES.map((city) => {
        const pos = cityPositions.get(city.id);
        if (!pos) return null;
        return <CityMarker key={city.id} city={city} position={pos} />;
      })}
    </group>
  );
}

// ── 7. CAMERA RIG: GO INSIDE GLOBE THROUGH CLOUDS & COMPLETE STOP OVER INDIA ──
function CameraRig() {
  const { camera } = useThree();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // 1. Initial global view: show globe rotating normally, slowly, and smoothly for 4.5 seconds
    // 2. Smooth zoom down through clouds: t in [4.5s, 8.0s]
    // 3. Settle and complete stop over India: t >= 8.0s
    const zoomProgress = THREE.MathUtils.smoothstep(t, 4.5, 8.0);
    // Smooth Quintic easing for cinematic acceleration and deceleration
    const ease = zoomProgress * zoomProgress * zoomProgress * (zoomProgress * (zoomProgress * 6 - 15) + 10);

    const aspect = state.size.width / Math.max(state.size.height, 1);
    // Dimension fits webpage size:
    // On desktop widescreen (aspect >= 1.4): Z = 3.68, Y = 0.12 frames India cleanly with ~24% top and ~42% bottom breathing room
    // On narrower / portrait screens: scales distance dynamically so India never clips the viewport edges
    const targetZ = aspect < 1.0 ? 2.0 + 1.68 / aspect : (aspect < 1.4 ? 3.85 : 3.68);
    const targetY = 0.12;

    camera.position.z = THREE.MathUtils.lerp(5.8, targetZ, ease);
    camera.position.y = THREE.MathUtils.lerp(0.0, targetY, ease);
    camera.lookAt(0, targetY * ease, 1.97 * ease);
  });

  return null;
}

// ── 8. MAIN LIVE EARTH GLOBE WITH INDIA FOCUS ──
function LiveEarthGlobe() {
  const tiltGroupRef = useRef<THREE.Group>(null);
  const earthSurfaceRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const fogVeilRef = useRef<THREE.Mesh>(null);
  const indiaBordersRef = useRef<THREE.Group>(null);
  const indiaNetworkRef = useRef<THREE.Group>(null);

  // Load all 5 official NASA 2K Blue Marble, Clouds, Night Lights, Specular, and Normal maps
  const [colorMap, cloudsMap, nightMap, specularMap, normalMap] = useTexture([
    "/earth-blue-marble.jpg",
    "/earth-clouds.png",
    "/earth-night.jpg",
    "/earth-specular.jpg",
    "/earth-normal.jpg",
  ]);

  useMemo(() => {
    colorMap.colorSpace = THREE.SRGBColorSpace;
    colorMap.anisotropy = 8;
    nightMap.colorSpace = THREE.SRGBColorSpace;
    nightMap.anisotropy = 8;
    cloudsMap.colorSpace = THREE.SRGBColorSpace;
    cloudsMap.anisotropy = 8;
    cloudsMap.wrapS = THREE.RepeatWrapping;
    cloudsMap.wrapT = THREE.ClampToEdgeWrapping;
    specularMap.anisotropy = 8;
    normalMap.anisotropy = 8;
  }, [colorMap, cloudsMap, nightMap, specularMap, normalMap]);

  // Shader Uniforms
  const surfaceUniforms = useMemo(() => ({
    uDayMap: { value: colorMap },
    uNightMap: { value: nightMap },
    uSpecularMap: { value: specularMap },
    uNormalMap: { value: normalMap },
    uCloudsMap: { value: cloudsMap },
    uSunDirection: { value: SUN_DIRECTION },
    uZoomProgress: { value: 0 },
  }), [colorMap, nightMap, specularMap, normalMap, cloudsMap]);

  const cloudsUniforms = useMemo(() => ({
    uCloudsMap: { value: cloudsMap },
    uSunDirection: { value: SUN_DIRECTION },
    uTime: { value: 0 },
    uZoomProgress: { value: 0 },
  }), [cloudsMap]);

  const fogVeilUniforms = useMemo(() => ({
    uCloudsMap: { value: cloudsMap },
    uSunDirection: { value: SUN_DIRECTION },
    uTime: { value: 0 },
    uZoomProgress: { value: 0 },
  }), [cloudsMap]);

  const atmosphereUniforms = useMemo(() => ({
    uSunDirection: { value: SUN_DIRECTION },
  }), []);

  const coronaUniforms = useMemo(() => ({
    uSunDirection: { value: SUN_DIRECTION },
  }), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pointer = state.pointer;

    // Target angle to center India (lon 78.96° E) in local frame: 3.334 rad
    const targetRotY = 3.334;
    const zoomProgress = THREE.MathUtils.smoothstep(t, 4.5, 8.0);
    const ease = zoomProgress * zoomProgress * zoomProgress * (zoomProgress * (zoomProgress * 6 - 15) + 10);

    // Pass zoom progress to shaders for dynamic cloud penetration and terrain clarity
    surfaceUniforms.uZoomProgress.value = ease;
    cloudsUniforms.uTime.value = t;
    cloudsUniforms.uZoomProgress.value = ease;
    fogVeilUniforms.uTime.value = t;
    fogVeilUniforms.uZoomProgress.value = ease;

    // Initial rotation: free spin before zoom
    // During initial 4.5s: Earth rotates normally, slowly, and smoothly at 0.035 rad/s
    // During zoom (4.5s - 8.0s): decelerates smoothly to center India
    // After 8.0s: STOPS completely on India!
    const spinSpeed = 0.035;
    const startRot = 4.5 * spinSpeed;
    let currentRotY = 0;
    if (t < 4.5) {
      currentRotY = t * spinSpeed;
    } else {
      currentRotY = THREE.MathUtils.lerp(startRot + (t - 4.5) * spinSpeed, targetRotY, ease);
    }

    // Interactive mouse parallax (subtle and stable, keeps India front and center)
    const parallaxX = pointer.x * (1.0 - ease * 0.75) * 0.12;
    const parallaxY = pointer.y * (1.0 - ease * 0.75) * 0.08;

    // 1. Earth surface rotation
    if (earthSurfaceRef.current) {
      earthSurfaceRef.current.rotation.y = currentRotY + parallaxX;
    }

    // 2. India sovereign vector boundaries in exact lockstep
    if (indiaBordersRef.current) {
      indiaBordersRef.current.rotation.y = currentRotY + parallaxX;
    }

    // 3. India banking network locked in exact step with Earth surface
    if (indiaNetworkRef.current) {
      indiaNetworkRef.current.rotation.y = currentRotY + parallaxX;
    }

    // 4. Clouds independent atmospheric drift
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = currentRotY * 0.8 + t * 0.012 + parallaxX;
    }

    // 5. High-altitude cirrus fog veil drift
    if (fogVeilRef.current) {
      fogVeilRef.current.rotation.y = currentRotY * 0.6 + t * 0.018 + parallaxX;
    }

    // Axial tilt: transitions smoothly from 0.41 to 0.28 so India faces directly forward
    if (tiltGroupRef.current) {
      tiltGroupRef.current.rotation.x = THREE.MathUtils.lerp(0.41, 0.28, ease) - parallaxY;
      tiltGroupRef.current.rotation.z = -0.1 * (1.0 - ease);
    }
  });

  return (
    <group position={[0, 0, -0.2]}>
      {/* 23.4° Axial Tilt Container */}
      <group ref={tiltGroupRef}>
        {/* 1. Photorealistic Earth Surface (Day Continents, Night Cities, Ocean Sun Glint) */}
        <mesh ref={earthSurfaceRef}>
          <sphereGeometry args={[2.18, 64, 64]} />
          <shaderMaterial
            vertexShader={EarthSurfaceShader.vertexShader}
            fragmentShader={EarthSurfaceShader.fragmentShader}
            uniforms={surfaceUniforms}
          />
        </mesh>

        {/* 2. Main Tropospheric Cloud System (With cloud penetration parting over India) */}
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[2.198, 64, 64]} />
          <shaderMaterial
            vertexShader={EarthCloudsShader.vertexShader}
            fragmentShader={EarthCloudsShader.fragmentShader}
            uniforms={cloudsUniforms}
            transparent
            depthWrite={false}
          />
        </mesh>

        {/* 3. High-Altitude Cirrus & Drifting Atmospheric Fog Veil */}
        <mesh ref={fogVeilRef}>
          <sphereGeometry args={[2.215, 64, 64]} />
          <shaderMaterial
            vertexShader={EarthFogVeilShader.vertexShader}
            fragmentShader={EarthFogVeilShader.fragmentShader}
            uniforms={fogVeilUniforms}
            transparent
            depthWrite={false}
          />
        </mesh>

        {/* 4. India Sovereign Vector Boundaries (National Contour + 37 States) */}
        <group ref={indiaBordersRef}>
          <IndiaMapBoundaries />
        </group>

        {/* 5. India Banking Network (Geographically Anchored City Markers & Routes) */}
        <group ref={indiaNetworkRef}>
          <IndiaBankingNetwork />
        </group>

        {/* 6. Razor-Thin Atmospheric Horizon Limb Glow (Rayleigh scattering) */}
        <mesh>
          <sphereGeometry args={[2.27, 64, 64]} />
          <shaderMaterial
            vertexShader={EarthAtmosphereShader.vertexShader}
            fragmentShader={EarthAtmosphereShader.fragmentShader}
            uniforms={atmosphereUniforms}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* 7. Outer Atmospheric Corona Halo (Soft blue boundary fading into space) */}
        <mesh>
          <sphereGeometry args={[2.34, 48, 48]} />
          <shaderMaterial
            vertexShader={EarthCoronaShader.vertexShader}
            fragmentShader={EarthCoronaShader.fragmentShader}
            uniforms={coronaUniforms}
            transparent
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

// ── 9. LONG NON-CONTINUOUS LIGHT STREAKS SHOOTING OUT OF SCREEN ──
function OutwardLightStreaks({
  numRays = 58,
  dashesPerRay = 3,
}: {
  numRays?: number;
  dashesPerRay?: number;
}) {
  const lineSegmentsRef = useRef<THREE.LineSegments>(null);
  const totalDashes = numRays * dashesPerRay;

  const { rays, linePositions, lineColors } = useMemo(() => {
    const posArr = new Float32Array(totalDashes * 2 * 3);
    const colArr = new Float32Array(totalDashes * 2 * 3);
    const rayList: {
      start: THREE.Vector3;
      end: THREE.Vector3;
      speed: number;
      offset: number;
      baseColor: THREE.Color;
      tipColor: THREE.Color;
    }[] = [];

    const baseR = 2.22;
    const palette = [
      { base: new THREE.Color("#06B6D4"), tip: new THREE.Color("#FFFFFF") },
      { base: new THREE.Color("#10B981"), tip: new THREE.Color("#E0F2FE") },
      { base: new THREE.Color("#0EA5E9"), tip: new THREE.Color("#BAE6FD") },
      { base: new THREE.Color("#14B8A6"), tip: new THREE.Color("#F0FDFA") },
      { base: new THREE.Color("#818CF8"), tip: new THREE.Color("#FFFFFF") },
    ];

    for (let i = 0; i < numRays; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / numRays);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const dirX = Math.sin(phi) * Math.cos(theta);
      const dirY = Math.cos(phi);
      const dirZ = Math.sin(phi) * Math.sin(theta);

      const start = new THREE.Vector3(dirX * baseR, dirY * baseR, dirZ * baseR - 0.2);

      const isFront = dirZ > -0.25;
      const lengthMult = isFront ? 2.8 + (i % 5) * 0.4 : 1.9 + (i % 4) * 0.3;
      const forwardPush = isFront ? 2.7 + (i % 4) * 0.6 : 0.4;

      const endX = dirX * (baseR + lengthMult * 1.5);
      const endY = dirY * (baseR + lengthMult * 1.5);
      const endZ = Math.min(5.2, start.z + dirZ * lengthMult + forwardPush);

      const end = new THREE.Vector3(endX, endY, endZ);
      const pal = palette[i % palette.length];

      rayList.push({
        start,
        end,
        speed: 0.35 + (i % 5) * 0.12,
        offset: (i * 0.618033) % 1.0,
        baseColor: pal.base,
        tipColor: pal.tip,
      });
    }

    return { rays: rayList, linePositions: posArr, lineColors: colArr };
  }, [numRays, totalDashes]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pointer = state.pointer;

    if (lineSegmentsRef.current) {
      lineSegmentsRef.current.rotation.y = t * 0.08 + pointer.x * 0.25;
      lineSegmentsRef.current.rotation.x = Math.sin(t * 0.05) * 0.05 - pointer.y * 0.15;

      const posAttr = lineSegmentsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const colAttr = lineSegmentsRef.current.geometry.attributes.color as THREE.BufferAttribute;
      const pArr = posAttr.array as Float32Array;
      const cArr = colAttr.array as Float32Array;

      let dashIndex = 0;

      for (let i = 0; i < numRays; i++) {
        const ray = rays[i];
        const dx = ray.end.x - ray.start.x;
        const dy = ray.end.y - ray.start.y;
        const dz = ray.end.z - ray.start.z;

        for (let j = 0; j < dashesPerRay; j++) {
          const phase = j / dashesPerRay + ray.offset;
          const u = (t * ray.speed + phase) % 1.0;

          const dashLen = 0.09 + u * 0.13;
          const uStart = u;
          const uEnd = Math.min(1.0, u + dashLen);

          const p1x = ray.start.x + dx * uStart;
          const p1y = ray.start.y + dy * uStart;
          const p1z = ray.start.z + dz * uStart;

          const p2x = ray.start.x + dx * uEnd;
          const p2y = ray.start.y + dy * uEnd;
          const p2z = ray.start.z + dz * uEnd;

          const vIdx = dashIndex * 6;
          pArr[vIdx] = p1x;
          pArr[vIdx + 1] = p1y;
          pArr[vIdx + 2] = p1z;
          pArr[vIdx + 3] = p2x;
          pArr[vIdx + 4] = p2y;
          pArr[vIdx + 5] = p2z;

          const intensity = 0.4 + u * 0.6;
          const r1 = ray.baseColor.r * intensity;
          const g1 = ray.baseColor.g * intensity;
          const b1 = ray.baseColor.b * intensity;

          const r2 = THREE.MathUtils.lerp(r1, ray.tipColor.r, u);
          const g2 = THREE.MathUtils.lerp(g1, ray.tipColor.g, u);
          const b2 = THREE.MathUtils.lerp(b1, ray.tipColor.b, u);

          cArr[vIdx] = r1;
          cArr[vIdx + 1] = g1;
          cArr[vIdx + 2] = b1;
          cArr[vIdx + 3] = r2;
          cArr[vIdx + 4] = g2;
          cArr[vIdx + 5] = b2;

          dashIndex++;
        }
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, -0.2]}>
      <lineSegments ref={lineSegmentsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          linewidth={1.5}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

// ── 10. COMPLETE LIVE EARTH IN SPACE SCENE ──
export function DimensionalGlobeScene() {
  return (
    <>
      {/* Space Lighting Architecture */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[4, 3, 5]} intensity={2.8} color="#FFFDF0" />
      <pointLight position={[-8, -4, -6]} color="#0c2340" intensity={0.4} distance={30} />

      {/* Camera Rig (Dives inside through clouds & stops over India) */}
      <CameraRig />

      {/* Atmospheric Cloud Descent Penetration Vapor */}
      <AtmosphericCloudDescent />

      {/* Infinite Universe Starfield */}
      <UniverseStarfield count={1400} />

      {/* Live High-Quality Earth as Seen From Space with India Banking Network */}
      <LiveEarthGlobe />

      {/* Long Non-Continuous Light Streaks Shooting Out of Screen */}
      <OutwardLightStreaks numRays={58} dashesPerRay={3} />
    </>
  );
}

// ── 11. FULL-SCREEN BACKGROUND CONTAINER (CRYSTAL CLEAR, ZERO BLUR) ──
export function DimensionalGlobeBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-[#02040a]"
    >
      <SceneCanvas
        className="w-full h-full"
        camera={{ position: [0, 0, 5.8], fov: 48 }}
        fallback2D={<div className="w-full h-full bg-[#02040a]" />}
        interactive={true}
      >
        <DimensionalGlobeScene />
      </SceneCanvas>
    </div>
  );
}
