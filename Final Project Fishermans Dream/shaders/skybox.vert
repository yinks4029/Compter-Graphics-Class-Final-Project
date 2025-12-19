// Based on https://webglfundamentals.org/webgl/lessons/webgl-skybox.html

// We only need the position of the cube
attribute vec3 a_Position;
varying vec3 v_Position;
void main() {
    // Use a fixed Z as far away as possible (without hitting the edge of clip space)
    gl_Position = vec4(a_Position.xy, 0.999, 1.0);
    v_Position = a_Position;
}