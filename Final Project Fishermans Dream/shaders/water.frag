precision highp float;

uniform vec3 waterColor;
uniform vec3 waterHighlight;

uniform float offset;
uniform float contrast;
uniform float brightness;

varying vec2 vUv;
varying vec3 vNormal;
varying float vHeight;

vec3 calcColor() {
    float mask = (pow(vHeight, 2.0) - offset) * contrast;
    vec3 col = mix(waterColor, waterHighlight, mask);
    return col * brightness;
}

void main() {    
    gl_FragColor = vec4(calcColor(), 1.0);
}
