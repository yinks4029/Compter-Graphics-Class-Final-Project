precision highp float;

uniform mat4 u_Model;
uniform mat4 u_World;
uniform mat4 u_WorldModelInverseTranspose;
uniform mat4 u_Camera;

uniform vec3 u_Light;
uniform vec3 u_SpecColor;
uniform float u_SpecPower;
uniform bool u_UseLighting;

varying vec3 v_Position;
varying vec3 v_Normal;
varying vec3 v_Color;

void main() {
    // Calculate our world position and normals
    vec3 worldPosition = vec3(u_World * u_Model * vec4(v_Position, 1.0));
    vec3 worldNormal = normalize(vec3(u_WorldModelInverseTranspose * vec4(v_Normal, 0.0)));

    // Calculate diffuse "amount"
    vec3 lightDir = normalize(u_Light);
    float diffuse = max(dot(lightDir, worldNormal), 0.0);

    // Calculate our reflection across the normal and convert it into camera space
    // see https://learnopengl.com/Lighting/Basic-Lighting for more details
    vec3 reflectDir = normalize(reflect(-lightDir, worldNormal));
    vec3 cameraReflectDir = vec3(u_Camera * vec4(reflectDir, 0.0));

    // Calculate our camera position and direction
    vec3 cameraSpacePosition = vec3(u_Camera * vec4(worldPosition, 1.0));
    vec3 cameraDir = normalize(vec3(0.0, 0.0, 0.0) - cameraSpacePosition);

    // Calculate specular based on the reflection into the camera
    float angle = max(dot(cameraDir, cameraReflectDir), 0.0);
    float specular = max(pow(angle, u_SpecPower), 0.0);

    // set constant colors for this demo
    vec3 ambientColor = vec3(0.02, 0.0, 0.05);

    // add up our components
    vec3 color = ambientColor + diffuse * v_Color + specular * u_SpecColor;
    if (u_UseLighting) {
        gl_FragColor = vec4(color, 1.0);
    } else {
        gl_FragColor = vec4(v_Color, 1.0);
    }
}