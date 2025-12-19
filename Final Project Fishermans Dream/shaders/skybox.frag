// Based on https://webglfundamentals.org/webgl/lessons/webgl-skybox.html

precision highp float;
uniform mat4 u_ProjectionCameraInverse;
uniform samplerCube u_CubeMap;

varying vec3 v_Position;

void main() {
    vec4 projectedPosition = u_ProjectionCameraInverse * vec4(v_Position, 1.0);
    vec3 cartPosition = projectedPosition.xyz / projectedPosition.w;
    gl_FragColor = textureCube(u_CubeMap, cartPosition);
}