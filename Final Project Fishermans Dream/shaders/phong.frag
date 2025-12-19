precision highp float;
varying vec3 v_Normal;
varying vec3 v_Position;

uniform mat4 u_Model;
uniform mat4 u_World;
uniform mat4 u_Camera;
uniform mat4 u_ModelWorldInverseTranspose;
uniform vec3 u_Light;

void main() {
    // set constant colors and specular power for this demo
    vec3 diffuseColor = vec3(0.7, 0.7, 0.8);
    vec3 specularColor = vec3(1.0, 1.0, 1.0);
    vec3 ambientColor = vec3(0.0, 0.0, 0.0);
    float specPower = 16.0;

    // Calculate our world position and normals
    vec3 worldPosition = vec3(u_World * u_Model * vec4(v_Position, 1.0));
    vec3 worldNormal = normalize(vec3(u_ModelWorldInverseTranspose * vec4(v_Normal, 0.0)));

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
    float specular = max(pow(angle, specPower), 0.0);

    // add up our components
    vec3 color = ambientColor + 
        diffuse * diffuseColor +
        specular * specularColor;

    gl_FragColor = vec4(color, 1.0);
}