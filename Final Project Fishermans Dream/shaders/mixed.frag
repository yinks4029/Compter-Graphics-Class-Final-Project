precision highp float;
varying vec3 v_Color;
varying vec2 v_TexCoord;

uniform sampler2D u_Texture;
uniform bool u_UseTexture;

uniform mat4 u_Model;
uniform mat4 u_World;
uniform mat4 u_WorldModelInverseTranspose;
uniform mat4 u_Camera;

uniform vec3 u_Light;
uniform vec3 u_SpecColor;
uniform float u_SpecPower;
uniform bool u_UseLighting;



void main() {
    
    if (u_UseTexture) {
        gl_FragColor = texture2D(u_Texture, v_TexCoord);
    } else {
        gl_FragColor = vec4(v_Color, 1.0);
    }
}
