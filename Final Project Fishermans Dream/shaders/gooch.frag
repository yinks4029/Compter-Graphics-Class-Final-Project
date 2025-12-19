precision highp float;

uniform mat4 u_Model;
uniform mat4 u_World;
uniform mat4 u_ModelWorldInverseTranspose;
uniform mat4 u_Camera;

uniform vec3 u_Light;
uniform float u_SpecPower;

varying vec3 v_Position;
varying vec3 v_Normal;

// Drawn from https://rendermeapangolin.wordpress.com/2015/05/07/gooch-shading/

void main() {
    vec3 modelColor = vec3(0.4, 0.0, 0.4);
    vec3 specColor = vec3(1.0, 1.0, 0.7);
    vec3 worldNormal = vec3(u_ModelWorldInverseTranspose * vec4(v_Normal, 0.0));

    // Diffuse constants
    float kd = 1.0;
    float a = 0.2;
    float b = 0.6;

    float NL = dot(normalize(worldNormal), normalize(u_Light));
    
    // Calculate the color based on light direction
    float it = ((1.0 + NL) / 2.0);
    // Linearly interpolate using that direction between warm and cool
    vec3 diffuse = (1.0-it) * (vec3(0.0, 0.0, 0.4) + a*modelColor) 
            + it * (vec3(0.4, 0.4, 0.0) + b*modelColor);
    
    // Usual Specular Highlights
    vec3 R = reflect(-normalize(u_Light), normalize(worldNormal));
    float ER = min(max(dot(normalize(vec3(u_Camera * vec4(u_Light, 1.0))), normalize(R)), 0.0), 1.0);
    
    vec3 spec = specColor * pow(ER, u_SpecPower);

    gl_FragColor = vec4(diffuse+spec, 1.0);
}