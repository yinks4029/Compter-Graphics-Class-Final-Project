/**
 * Adapted from three-customshadermaterial
 * https://farazzshaikh.github.io/THREE-CustomShaderMaterial/#/waves
 */
precision highp float;
precision highp int;

#define PI 3.14159

uniform float time;
uniform float normalOffset;
uniform float fbmHeight;
uniform float fbmScale;
uniform vec3 pScale;
uniform float waveHeight;
uniform float waveSpeed;
uniform float waveFrequency;
uniform float waveSharpness;

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
attribute vec2 uv2;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vHeight;

// --------------------------

vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

float mod289(float x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
    return mod289(((x*34.0)+1.0)*x);
}

float permute(float x) {
    return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

float taylorInvSqrt(float r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 grad4(float j, vec4 ip) {
    const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
    vec4 p,s;

    p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
    p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
    s = vec4(lessThan(p, vec4(0.0)));
    p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;

    return p;
}

float snoise(vec4 v, float time) {
    const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4
            0.276393202250021,  // 2 * G4
            0.414589803375032,  // 3 * G4
            -0.447213595499958); // -1 + 4 * G4

    // First corner
    vec4 i  = floor(v + dot(v, vec4(0.309016994374947451)) );
    vec4 x0 = v -   i + dot(i, C.xxxx);

    // Other corners

    // Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
    vec4 i0;
    vec3 isX = step( x0.yzw, x0.xxx );
    vec3 isYZ = step( x0.zww, x0.yyz );
    //  i0.x = dot( isX, vec3( 1.0 ) );
    i0.x = isX.x + isX.y + isX.z;
    i0.yzw = 1.0 - isX;
    //  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
    i0.y += isYZ.x + isYZ.y;
    i0.zw += 1.0 - isYZ.xy;
    i0.z += isYZ.z;
    i0.w += 1.0 - isYZ.z;

    // i0 now contains the unique values 0,1,2,3 in each channel
    vec4 i3 = clamp( i0, 0.0, 1.0 );
    vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
    vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

    //  x0 = x0 - 0.0 + 0.0 * C.xxxx
    //  x1 = x0 - i1  + 1.0 * C.xxxx
    //  x2 = x0 - i2  + 2.0 * C.xxxx
    //  x3 = x0 - i3  + 3.0 * C.xxxx
    //  x4 = x0 - 1.0 + 4.0 * C.xxxx
    vec4 x1 = x0 - i1 + C.xxxx;
    vec4 x2 = x0 - i2 + C.yyyy;
    vec4 x3 = x0 - i3 + C.zzzz;
    vec4 x4 = x0 + C.wwww;

    // Permutations
    i = mod289(i);
    float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
    vec4 j1 = permute( permute( permute( permute (
                        i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
                    + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
                + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
            + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));

    // Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
    // 7*7*6 = 294, which is close to the ring size 17*17 = 289.
    vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

    vec4 p0 = grad4(j0,   ip);
    vec4 p1 = grad4(j1.x, ip);
    vec4 p2 = grad4(j1.y, ip);
    vec4 p3 = grad4(j1.z, ip);
    vec4 p4 = grad4(j1.w, ip);

    // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    p4 *= taylorInvSqrt(dot(p4,p4));

    // Mix contributions from the five corners
    vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
    vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
    m0 = m0 * m0;
    m1 = m1 * m1;
    return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
            + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;
}

float surface(vec4 coord, float time) {
	float n = 0.0;

	n += 0.25 * abs( snoise( coord * 4.0, time ) );
	n += 0.5 * abs( snoise( coord * 8.0, time ) );
	n += 0.25 * abs( snoise( coord * 16.0, time ) );
	n += 0.125 * abs( snoise( coord * 32.0, time ) );
	n += 0.125 * abs( snoise( coord * 64.0, time ) );

	return n;
}

// -----------------------------------------

vec3 GerstnerWave(vec4 wave, vec3 p, inout vec3 tangent, inout vec3 binormal, float time) {
  float steepness = wave.z;
  float wavelength = wave.w;
  float k = 2.0 * 3.14159 / wavelength;
  float c = sqrt(9.8 / k);
  vec2 d = normalize(wave.xy);
  float f = k * (dot(d, p.xz) - c * time);
  float a = steepness / k;

  tangent += vec3(
    -d.x * d.x * (steepness * sin(f)),
    d.x * (steepness * cos(f)),
    -d.x * d.y * (steepness * sin(f))
  );
  binormal += vec3(
    -d.x * d.y * (steepness * sin(f)),
    d.y * (steepness * cos(f)),
    -d.y * d.y * (steepness * sin(f))
  );
  return vec3(
    d.x * (a * cos(f)),
    a * sin(f),
    d.y * (a * cos(f))
  );
}

vec3 displace(vec3 point, float time) {
	//vec3 tangent = orthogonal(normal);
	//vec3 binormal = normalize(cross(normal, tangent));

  vec3 tangent = vec3(0.0, 0.0, 1.0);
  vec3 binormal = vec3(0.0, 0.0, 1.0);

  float yScale = clamp(point.y * 2.0, 0.0, 1.0);

  // Undo the flattening of the position scale
  float reset = (1.0 / pScale.y);
  point.y += surface(
    vec4((point + time * 0.1) * fbmScale, 1.0), time
  ) * fbmHeight * reset;

  vec3 wave1 = GerstnerWave(
    // dirx, dir y, steepness, wavelength
    vec4(vec2(-1.0, 0.0), waveSharpness, pScale.x * 0.5 * waveFrequency),
    point,
    tangent,
    binormal,
    time
  );
  vec3 wave2 = GerstnerWave(
    // dirx, dir y, steepness, wavelength
    vec4(vec2(1.0, 0.0), 0.25, 4.0 * waveFrequency),
    point,
    tangent,
    binormal,
    time
  );
  vec3 wave3 = GerstnerWave(
    // dirx, dir y, steepness, wavelength
    vec4(vec2(1.0, 1.0), 0.15, 6.0 * waveFrequency),
    point,
    tangent,
    binormal,
    time
  );
  vec3 wave4 = GerstnerWave(
    // dirx, dir y, steepness, wavelength
    vec4(vec2(1.0, 1.0), 0.4, 2.0 * waveFrequency),
    point,
    tangent,
    binormal,
    time
  );

  vec3 newPos = point;
  float scale = waveHeight * yScale * reset;
  newPos += wave1 * scale;
  newPos += wave2 * scale * 0.5;
  newPos += wave3 * scale * 0.5;
  newPos += wave4 * scale * 0.2;

  //vHeight = newPos.y;

  return newPos;
}

// http://lolengine.net/blog/2013/09/21/picking-orthogonal-vector-combing-coconuts
vec3 orthogonal(vec3 v) {
  return normalize(abs(v.x) > abs(v.z)
    ? vec3(-v.y, v.x, 0.0)
    : vec3(0.0, -v.z, v.y));
}

void main() {
    vUv = uv;

    // Scale the incoming position
    vec3 pos = position * pScale;

    // Compute Y blend factor for flattening near the bottom
    float yScale = clamp(position.y * 2.0, 0.0, 1.0);

    // Apply waves
    float scaledTime = time * waveSpeed;
    vec3 displacedPosition = displace(pos, scaledTime);

    vNormal = normalMatrix * normal;

    //  final = lerp(base, waves, yScale)
    vec3 finalPos = mix(pos, displacedPosition, yScale);

    // Output vertex position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
}