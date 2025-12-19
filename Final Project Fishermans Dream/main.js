/**
 * Main code
 * @returns idk
 */

/**
 * 
 * @returns if it worked or not
 */
function main() {
    // Keep track of time each frame by starting with our current time
    g_lastFrameMS = Date.now();

    g_canvas = document.getElementById('canvas');

    // Get the rendering context for WebGL
    gl = getWebGLContext(g_canvas, true);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Setup our reactions from keys
    setupKeyBinds();

    // We will call this at the end of most main functions from now on
    loadBoatFiles();
}

async function loadBoatFiles() {
    let data = await fetch('./resources/boat2.obj').then(response => response.text()).then((x) => x);
    let boatMesh = [];
    let boatNormals = [];
    readObjFile(data, boatMesh, boatNormals);

    // Build the boat colors
    let boatColors = buildColorAttributes(boatMesh.length/3, 1);
    g_boatObject = new SceneObject(boatMesh, boatColors, boatNormals);

    loadPlaneFiles();
}

async function loadPlaneFiles() {
    let data = await fetch('./resources/biplane.obj').then(response => response.text()).then((x) => x);
    let meshData = {};
    let normalData = {};
    readObjFileByGroup(data, meshData, normalData);

    // Build the plane colors
    let planeMesh = [];
    let planeNormals = [];
    for (let key in meshData) {
        if (key !== 'Propeller') {
            planeMesh = planeMesh.concat(meshData[key]);
            planeNormals = planeNormals.concat(normalData[key]);
        }
    }
    let propellerMesh = meshData['Propeller'];
    let propellerNormals = normalData['Propeller'];
    let planeColors = myBuildColorAttributes(planeMesh.length/3,[0.3, 0.5, 0.8]);
    let propellerColors = myBuildColorAttributes(propellerMesh.length/3,[0.3, 0.5, 0.8]);

    g_planeObject = new SceneObject(planeMesh, planeColors, planeNormals);
    g_propellerObject = new SceneObject(propellerMesh, propellerColors, propellerNormals);

    loadJellyfishFiles();
}

/*
 * Helper function to load the jellyfish files
 * I made everything sequential for this class to make the logic easier to follow
 */
async function loadJellyfishFiles() {
    let data = await fetch('./resources/jellyfish.obj').then(response => response.text()).then((x) => x);
    let jellyfishMesh = [];
    let jellyfishNormals = [];
    readObjFile(data, jellyfishMesh, jellyfishNormals);

    // Build the jellyfish colors
    let jellyfishColors = myBuildColorAttributes(jellyfishMesh.length/3,[.9,0.1,.6]);
    g_jellyfishObject = new SceneObject(jellyfishMesh, jellyfishColors, jellyfishNormals);

    loadSharkFiles();
}

async function loadSharkFiles() {
    let data = await fetch('./resources/shark.obj').then(response => response.text()).then((x) => x);
    let meshData = {};
    let normalData = {};
    readObjFileByGroup(data, meshData, normalData);

    let sharkBodyMesh = [];
    let sharkBodyNormals = [];

    let sharkHeadMesh = [];
    let sharkHeadNormals = [];

    let sharkTailMesh = [];
    let sharkTailNormals = [];

    let sharkFinMesh = [];
    let sharkFinNormals = [];

    // Sort each group into the right part
    for (let key in meshData) {
        let verts = meshData[key];
        let norms = normalData[key];
        let k = key.toLowerCase();

        if (k.includes("body")) {
            sharkBodyMesh.push(...verts);
            sharkBodyNormals.push(...norms);
        }
        else if (k.includes("head")) {
            sharkHeadMesh.push(...verts);
            sharkHeadNormals.push(...norms);
        }
        else if (k.includes("caudal") || k.includes("tail")) {
            sharkTailMesh.push(...verts);
            sharkTailNormals.push(...norms);
        }
        else if (k.includes("fin")) {
            sharkFinMesh.push(...verts);
            sharkFinNormals.push(...norms);
        }
    }
    let bodyColors =  buildLitColorAttributes(sharkBodyMesh, sharkBodyNormals,[.8,.2,.8]);
    let headColors =  buildLitColorAttributes(sharkHeadMesh, sharkHeadNormals,[.8,.2,.8]);
    let tailColors =  buildLitColorAttributes(sharkTailMesh, sharkTailNormals,[.8,.2,.8]);
    let finColors  =  buildLitColorAttributes(sharkFinMesh, sharkFinNormals,[.8,.2,.8]);


    g_sharkBodyObj = new SceneObject(sharkBodyMesh, bodyColors, sharkBodyNormals);
    g_sharkHeadObj = new SceneObject(sharkHeadMesh, headColors, sharkHeadNormals);
    g_sharkTailObj = new SceneObject(sharkTailMesh, tailColors, sharkTailNormals);
    g_sharkFinObj  = new SceneObject(sharkFinMesh,  finColors,  sharkFinNormals);

    loadDragon();
}


async function loadDragon() {
    let data = await fetch('./resources/dragon_poseglide_flat.obj').then(response => response.text()).then((x) => x);
    let meshData = {};
    let normalData = {};

    // Fill meshData[groupName] = [...]
    readObjFileByGroup(data, meshData, normalData);

  

    let dragonBodyMesh = [];
    let dragonBodyNormals = [];

    let dragonLeftWingMesh = [];
    let dragonLeftWingNormals = [];

    let dragonRightWingMesh = [];
    let dragonRightWingNormals = [];

    // EXACT same loop as shark loader
    for (let key in meshData) {
    let verts = meshData[key];
    let norms = normalData[key];
    let k = key.toLowerCase();

    // Any group with "wing" belongs to a wing
    if (k.includes("wing")) {

        // LEFT WING: ends with "l"
        if (key.endsWith("L")) {
            dragonLeftWingMesh.push(...verts);
            dragonLeftWingNormals.push(...norms);
        }

        // RIGHT WING: ends with "r"
        else if (key.endsWith("R")) {
            dragonRightWingMesh.push(...verts);
            dragonRightWingNormals.push(...norms);
        }

        continue;
    }

    // Everything else is body
    dragonBodyMesh.push(...verts);
    dragonBodyNormals.push(...norms);
}


        
        
    let dragonColorsBody = buildLitColorAttributes(dragonBodyMesh, dragonBodyNormals,[.6,.9,.1]);
    let dragonColorsWing1 = buildLitColorAttributes(dragonLeftWingMesh, dragonLeftWingNormals,[.6,.9,.1]);
    let dragonColorsWing2 = buildLitColorAttributes(dragonRightWingMesh, dragonRightWingNormals,[.6,.9,.1]);
    
    
    g_DragonBodyObj      = new SceneObject(dragonBodyMesh,dragonColorsBody, dragonBodyNormals);
    g_DragonLeftWingObj  = new SceneObject(dragonLeftWingMesh,dragonColorsWing1,  dragonLeftWingNormals);
    g_DragonRightWingObj = new SceneObject(dragonRightWingMesh,dragonColorsWing2, dragonRightWingNormals);
    
    //g_DragonObject = new SceneObject(dragonMesh, dragonColors, dragonNormals);
    loadLighthouse();
}

async function loadLighthouse() {
    let data = await fetch('./resources/lighthouse.obj').then(response => response.text()).then((x) => x);
    let lighthouseMesh = [];
    let lighthouseNormals = [];
    readObjFile(data, lighthouseMesh, lighthouseNormals);

    // Build the jellyfish colors
    let lighthouseColors  = buildColorAttributes(lighthouseMesh.length / 3,3);
    //let lighthouseColors  = buildLitColorAttributes(lighthouseMesh,lighthouseNormals, [.4,.9,.5]);
    g_lighthouseObject = new SceneObject(lighthouseMesh, lighthouseColors , lighthouseNormals );

    loadCube();
}


async function loadCube() {
    let data = await fetch('./resources/cube.obj').then(response => response.text()).then((x) => x);
    let cubeMesh = [];
    let cubeNormals = [];
    readObjFile(data, cubeMesh);
    
        for (let i = 0; i < cubeMesh.length; i += 3) {
            cubeMesh[i]   = (cubeMesh[i]   * 2.0 - 1.0);
            cubeMesh[i+1] = (cubeMesh[i+1] * 2.0 - 1.0);
            cubeMesh[i+2] = (cubeMesh[i+2] * 2.0 - 1.0);
        }
        // Build the jellyfish colors
    let cubeColors  = buildColorAttributes(cubeMesh.length / 3,3);
    g_cubeObject = new SceneObject(cubeMesh, cubeMesh , cubeMesh );

    loadImageFiles();
}


async function loadImageFiles() {
    g_skyPosX = new Image();
    g_skyPosY = new Image();
    g_skyPosZ = new Image();
    g_skyNegX = new Image();
    g_skyNegY = new Image();
    g_skyNegZ = new Image();

    if(g_showBad){
    g_skyPosX.src = "resources/oceanskybox/px1.png";
    g_skyPosY.src = "resources/oceanskybox/py1.png";
    g_skyPosZ.src = "resources/oceanskybox/pz1.png";
    g_skyNegX.src = "resources/oceanskybox/nx1.png";
    g_skyNegY.src = "resources/oceanskybox/ny1.png";
    g_skyNegZ.src = "resources/oceanskybox/nz1.png";
    }
    else{

    g_skyPosX.src = "resources/oceanskybox/px.png";
    g_skyPosY.src = "resources/oceanskybox/py.png";
    g_skyPosZ.src = "resources/oceanskybox/pz.png";
    g_skyNegX.src = "resources/oceanskybox/nx.png";
    g_skyNegY.src = "resources/oceanskybox/ny.png";
    g_skyNegZ.src = "resources/oceanskybox/nz.png";
    }
    await g_skyPosX.decode();
    await g_skyPosY.decode();
    await g_skyPosZ.decode();
    await g_skyNegX.decode();
    await g_skyNegY.decode();
    await g_skyNegZ.decode();
    
    loadGLSLFiles();
}
function updateSkyboxImages() {
    if(g_showBad){
    g_skyPosX.src = "resources/oceanskybox/px1.png";
    g_skyPosY.src = "resources/oceanskybox/py1.png";
    g_skyPosZ.src = "resources/oceanskybox/pz1.png";
    g_skyNegX.src = "resources/oceanskybox/nx1.png";
    g_skyNegY.src = "resources/oceanskybox/ny1.png";
    g_skyNegZ.src = "resources/oceanskybox/nz1.png";
    
    }
    else{
        g_skyPosX.src = "resources/oceanskybox/px.png";
        g_skyPosY.src = "resources/oceanskybox/py.png";
        g_skyPosZ.src = "resources/oceanskybox/pz.png";
        g_skyNegX.src = "resources/oceanskybox/nx.png";
        g_skyNegY.src = "resources/oceanskybox/ny.png";
        g_skyNegZ.src = "resources/oceanskybox/nz.png";
    }

    Promise.all([
        g_skyPosX.decode(),
        g_skyPosY.decode(),
        g_skyPosZ.decode(),
        g_skyNegX.decode(),
        g_skyNegY.decode(),
        g_skyNegZ.decode()
    ]).then(() => {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, g_cubeMap);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, g_skyPosX);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, g_skyPosY);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, g_skyPosZ);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, g_skyNegX);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, g_skyNegY);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, g_skyNegZ);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    });
}


/*
 * Helper function to load our GLSL files for compiling in sequence
 */
async function loadGLSLFiles() {
    g_vshaderMixed = await fetch('shaders/lighting.vert').then(response => response.text()).then((x) => x);
    g_fshaderMixed = await fetch('shaders/lighting.frag').then(response => response.text()).then((x) => x);
    g_vshaderSkybox = await fetch('shaders/skybox.vert').then(response => response.text()).then((x) => x);
    g_fshaderSkybox = await fetch('shaders/skybox.frag').then(response => response.text()).then((x) => x);
    g_vshaderGooch =  await fetch('shaders/gooch.vert').then(response => response.text()).then((x) => x);
    g_fshaderGooch = await fetch('shaders/gooch.frag').then(response => response.text()).then((x) => x);
    g_vshaderPhong =  await fetch('shaders/phong.vert').then(response => response.text()).then((x) => x);
    g_fshaderPhong = await fetch('shaders/phong.frag').then(response => response.text()).then((x) => x);
    
    // wait until everything is loaded before rendering
    startRendering();
}


function startRendering() {


    // Initialize GPU's vertex and fragment shaders programs
    //mixed flat and light shader
    g_programMixed = createProgram(gl,g_vshaderMixed,g_fshaderMixed);
    if (!g_programMixed) {
        console.log('Failed to initialize shaders.');
        return;
    }
    g_programSkybox = createProgram(gl, g_vshaderSkybox, g_fshaderSkybox);
    if (!g_programSkybox) {
        console.log('Failed to initialize shaders.');
        return;
    }
    g_programGooch = createProgram(gl, g_vshaderGooch, g_fshaderGooch);
    if (!g_programGooch) {
        console.log('Failed to initialize shaders.');
        return;
    }
    g_programPhong = createProgram(gl, g_vshaderPhong, g_fshaderPhong);
    if (!g_programPhong) {
        console.log('Failed to initialize shaders.');
        return;
    }
    

    g_terrainObjectRed = new SceneObject(...buildTerrain(buildTerrainColorsRed));
    g_terrainObject    = new SceneObject(...buildTerrain(buildTerrainColors));


    // Build our list of scene objects, updating the offset each time
    let offset = 0;
    

    g_cube = new Model(offset, g_cubeObject, false, 1, new Vector3(0, 0, 0));
    offset += g_cubeObject.mesh.length;

    g_boat = new Model(offset, g_boatObject, true, 32, new Vector3(1, 1, 1));
    offset += g_boatObject.mesh.length;
    g_plane = new Model(offset, g_planeObject, true, 32, new Vector3(1, 1, 1));
    offset += g_planeObject.mesh.length;
    g_propeller = new AssemblyNode(offset, g_propellerObject, g_plane, true, 32, new Vector3(0, 0, 0));
    offset += g_propellerObject.mesh.length;
    g_jellyfish = new Model(offset, g_jellyfishObject, false, 1, new Vector3(0, 0, 0));
    offset += g_jellyfishObject.mesh.length;
    g_jellyfish2 = new Model(offset, g_jellyfishObject, false, 1, new Vector3(0, 0, 0));
    offset += g_jellyfishObject.mesh.length;
    g_jellyfish3 = new Model(offset, g_jellyfishObject, false, 1, new Vector3(0, 0, 0));
    offset += g_jellyfishObject.mesh.length;
    g_jellyfish4 = new Model(offset, g_jellyfishObject, false, 1, new Vector3(0, 0, 0));
    offset += g_jellyfishObject.mesh.length;
    //all shark
    g_sharkBody = new Model(offset, g_sharkBodyObj, false, 1, new Vector3(0, 0, 0));
    offset += g_sharkBodyObj.mesh.length;  
    g_sharkHead = new Model(offset, g_sharkHeadObj, false, 1, new Vector3(0, 0, 0));
    offset += g_sharkHeadObj.mesh.length;
    g_sharkTail = new Model(offset, g_sharkTailObj, false, 1, new Vector3(0, 0, 0));
    offset += g_sharkTailObj.mesh.length;
    g_sharkFin = new Model(offset, g_sharkFinObj, false, 1, new Vector3(0, 0, 0));
    offset += g_sharkFinObj.mesh.length;
    //all shark2
    g_sharkBody2 = new Model(offset, g_sharkBodyObj, false, 1, new Vector3(0, 0, 0));
    offset += g_sharkBodyObj.mesh.length;  
    g_sharkHead2 = new Model(offset, g_sharkHeadObj, false, 1, new Vector3(0, 0, 0));
    offset += g_sharkHeadObj.mesh.length; 
    g_sharkTail2 = new Model(offset, g_sharkTailObj, false, 1, new Vector3(0, 0, 0));
    offset += g_sharkTailObj.mesh.length;
    g_sharkFin2 = new Model(offset, g_sharkFinObj, false, 1, new Vector3(0, 0, 0));
    offset += g_sharkFinObj.mesh.length;
    //dragon
    g_dragonBody= new Model(offset, g_DragonBodyObj, false, 1, new Vector3(0, 0, 0));
    offset += g_DragonBodyObj.mesh.length;
    g_dragonLeftWing= new Model(offset, g_DragonLeftWingObj, false, 1, new Vector3(0, 0, 0));
    offset += g_DragonLeftWingObj.mesh.length;
    g_dragonRightWing= new Model(offset, g_DragonRightWingObj, false, 1, new Vector3(0, 0, 0));
    offset += g_DragonRightWingObj.mesh.length;
    //lighthouse
    g_lighthouse = new Model(offset, g_lighthouseObject, false, 1, new Vector3(0, 0, 0));
    offset += g_lighthouseObject.mesh.length;
    //terrain
    g_terrain = new Model(offset, g_terrainObject, false, 1, new Vector3(0, 0, 0));
    offset += g_terrainObject.mesh.length;

    g_terrainRed= new Model(offset, g_terrainObjectRed, false, 1, new Vector3(0, 0, 0));
    offset += g_terrainObjectRed.mesh.length;

    // Send models and layout to the GPU
    let objects = [g_cubeObject, g_boatObject, g_planeObject,
         g_propellerObject, g_jellyfishObject,g_jellyfishObject,
         g_jellyfishObject,g_jellyfishObject,
        g_sharkBodyObj,g_sharkHeadObj,g_sharkTailObj,
        g_sharkFinObj,
        //shark2
        g_sharkBodyObj,g_sharkHeadObj,g_sharkTailObj,
        g_sharkFinObj,
        g_DragonBodyObj,g_DragonLeftWingObj,g_DragonRightWingObj,
         g_lighthouseObject,  g_terrainObject,g_terrainObjectRed];

    initVBO(objects);
    
    // Get references to GLSL uniforms

    //for skybox
    // Get references to GLSL uniforms
    g_uProjectionCameraInverseSkybox_ref = gl.getUniformLocation(g_programSkybox, 'u_ProjectionCameraInverse');
    g_uCubeMapSkybox_ref = gl.getUniformLocation(g_programSkybox, 'u_CubeMap');

    //for phong
    // Get uniform locations
    g_uModelPhong_ref = gl.getUniformLocation(g_programPhong, 'u_Model')
    g_uWorldPhong_ref = gl.getUniformLocation(g_programPhong, 'u_World')
    g_uCameraPhong_ref = gl.getUniformLocation(g_programPhong, 'u_Camera')
    g_uProjectionPhong_ref = gl.getUniformLocation(g_programPhong, 'u_Projection')
    g_uInverseTransposePhong_ref = gl.getUniformLocation(g_programPhong, 'u_ModelWorldInverseTranspose')
    g_uLightPhong_ref = gl.getUniformLocation(g_programPhong, 'u_Light')
    g_uSpecPowerPhong_ref = gl.getUniformLocation(g_programPhong, 'u_SpecPower')

    //for gooch
    // Get references to GLSL uniforms
   
    g_uModelGooch_ref = gl.getUniformLocation(g_programGooch, 'u_Model');
    g_uWorldGooch_ref = gl.getUniformLocation(g_programGooch, 'u_World');
    g_uCameraGooch_ref = gl.getUniformLocation(g_programGooch, 'u_Camera');
    g_uProjectionGooch_ref = gl.getUniformLocation(g_programGooch, 'u_Projection');
    g_uInverseTransposeGooch_ref = gl.getUniformLocation(g_programGooch, 'u_ModelWorldInverseTranspose');
    g_uLightGooch_ref = gl.getUniformLocation(g_programGooch, 'u_Light');
    g_uSpecPowerGooch_ref = gl.getUniformLocation(g_programGooch, 'u_SpecPower');

    //for light and reg colors
    g_uModel_ref = gl.getUniformLocation(g_programMixed, 'u_Model');
    g_uWorld_ref = gl.getUniformLocation(g_programMixed, 'u_World');
    g_uCamera_ref = gl.getUniformLocation(g_programMixed, 'u_Camera');
    g_uProjection_ref = gl.getUniformLocation(g_programMixed, 'u_Projection');
    g_uWorldModelInverseTranspose_ref = gl.getUniformLocation(g_programMixed, 'u_WorldModelInverseTranspose');
    g_uLight_ref = gl.getUniformLocation(g_programMixed, 'u_Light');
    g_uSpecPower_ref = gl.getUniformLocation(g_programMixed, 'u_SpecPower');
    g_uSpecColor_ref = gl.getUniformLocation(g_programMixed, 'u_SpecColor');
    g_uUseLighting_ref = gl.getUniformLocation(g_programMixed, 'u_UseLighting');

  
   let dragonBase = new Matrix4()
        .translate(-25,15,-15)
        .scale(5,5,5)
        .rotate(45, 0, 1, 0);
    // Place our trees naively cause I'm lazy
    // g_cube.modelMatrix.scale(5, 5, 5);
    // g_cube.worldMatrix.translate(0, 0, 0);

    g_boat.modelMatrix.scale(12, 12,12);
    g_boat.worldMatrix.rotate(0, 1, 0, 0).translate(10, 0, g_boatZShift);

    // Place the plane
    g_plane.modelMatrix.scale(3,3,3);
    g_plane.worldMatrix.rotate(-45, 0, 1, 0).rotate(20, 1, 0, 0).translate(-80, 55, -80);

    // Place the jellyish
    g_jellyfish.modelMatrix.scale(3, 3, 3);
    g_jellyfish.worldMatrix.rotate(0, 1, 0, 0).translate(-30, 0, -7);
    g_jellyfish2.modelMatrix.scale(3, 3, 3);
    g_jellyfish2.worldMatrix.rotate(0, 1, 0, 0).translate(-43, 5, -13);
    g_jellyfish3.modelMatrix.scale(3, 3, 3);
    g_jellyfish3.worldMatrix.rotate(0, 1, 0, 0).translate(-10, 2, 5);
    g_jellyfish4.modelMatrix.scale(3, 3, 3);
    g_jellyfish4.worldMatrix.rotate(0, 1, 0, 0).translate(6, 6, -10);


    //base shark
    
    let sharkBase = new Matrix4()
        .translate(-10, -3, -15)
        .scale(4, 4, 4)
        .rotate(45, 0, 1, 0);


    let sharkBase2 = new Matrix4()
        .translate(30, -3, -15)
        .scale(4, 4, 4)
        .rotate(-45, 0, 1, 0);

    // Copy to each modelMatrix
    g_sharkBody.modelMatrix = new Matrix4(sharkBase);
    g_sharkHead.modelMatrix = new Matrix4(sharkBase);
    g_sharkTail.modelMatrix = new Matrix4(sharkBase);
    g_sharkFin.modelMatrix  = new Matrix4(sharkBase);
    g_sharkBody.worldMatrix = new Matrix4(sharkBase);
    g_sharkHead.worldMatrix = new Matrix4(sharkBase);
    g_sharkTail.worldMatrix = new Matrix4(sharkBase);
    g_sharkFin.worldMatrix  = new Matrix4(sharkBase);
    //second shark
    g_sharkBody2.modelMatrix = new Matrix4(sharkBase2);
    g_sharkHead2.modelMatrix = new Matrix4(sharkBase2);
    g_sharkTail2.modelMatrix = new Matrix4(sharkBase2);
    g_sharkFin2.modelMatrix  = new Matrix4(sharkBase2);
    g_sharkBody2.worldMatrix = new Matrix4(sharkBase2);
    g_sharkHead2.worldMatrix = new Matrix4(sharkBase2);
    g_sharkTail2.worldMatrix = new Matrix4(sharkBase2);
    g_sharkFin2.worldMatrix  = new Matrix4(sharkBase2);


    //dragon
    g_dragonBody.modelMatrix = new Matrix4(dragonBase);
    g_dragonLeftWing.modelMatrix = new Matrix4(dragonBase);
    g_dragonRightWing.modelMatrix = new Matrix4(dragonBase);

    //lighthouse
    g_lighthouse.modelMatrix.scale(20,20,20);
    g_lighthouse.worldMatrix.rotate(0, 1, 0, 0).translate(50, -5, 10);
    // Place the terrain
    g_terrain.modelMatrix.scale(4.5,4.5,4.5);
    g_terrain.worldMatrix.translate(-450, -10, -450);

    g_terrainRed.modelMatrix.scale(4,4,4);
    g_terrainRed.worldMatrix.translate(-450, -10, -450);

    // Place the initially in "front" of the origin a bit
    g_cameraPosition = new Vector3(0, 0, 40);
    g_cameraYaw = 0.0;
    g_cameraPitch = 0.0;

    // Setup a reasonable "basic" perspective projection
    g_projectionMatrix = new Matrix4().setPerspective(90, 1, .2, 475);

    //SKYBOX
    // Setup our cube map
    // https://webglfundamentals.org/webgl/lessons/webgl-cube-maps.html
    g_cubeMap = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, g_cubeMap);

    // Bind a texture to each cube map slot
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, g_skyPosX);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, g_skyPosY);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, g_skyPosZ);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, g_skyNegX);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, g_skyNegY);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, g_skyNegZ);

    // Mipmap our cube texture
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

    // Filter so we don't need a mipmap (linear is fine)
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    // create a framebuffer so we can refer to the data from rendering the scene for each direction
    g_framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, g_framebuffer);

    // create a depth renderbuffer so we get proper depth culling in the framebuffer
    let depth_buffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depth_buffer);
        
    // make a depth buffer and the same size as the targetTexture
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, DATA_TEXTURE_WIDTH, DATA_TEXTURE_HEIGHT);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth_buffer);

    // Enable culling and depth

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // Setup for ticks
    g_lastFrameMS = Date.now();
    
    //move boat
     let zSlider = document.getElementById('Zshift');
    zSlider.addEventListener('input', (event) => {
    let val = parseFloat(event.target.value);
    g_boatZShift = Math.max(-1, val);
    document.getElementById('ZLabel').textContent =
        `ZShift: ${g_boatZShift.toFixed(2)}`;
});

    tick();
}


function animateShark(deltaMS) {
    g_sharkTime += deltaMS * 0.002;

    // vertical bobbing motion
    const sharkY = -Math.sin(g_sharkTime) * 2;

    // animations
    const tailYaw = Math.sin(g_sharkTime * 3);
    const headPitch = Math.sin(g_sharkTime * 1.5);

    // base transform for the whole shark
    const base = new Matrix4()
        .translate(0, 0, -15 + g_boatZShift*5)
        .translate(0, sharkY, 0)
        .scale(2, 2, 2);

    g_sharkBody.modelMatrix = new Matrix4(base);
 
    const headPivotZ = 2.0;
    g_sharkHead.modelMatrix = new Matrix4(base)
        .translate(0, 0, headPivotZ)
        .rotate(headPitch, 1, 0, 0)
        .translate(0, 0, -headPivotZ);

    const tailPivotZ = -0.50;
    g_sharkTail.modelMatrix = new Matrix4(base)
        .translate(0, 0, tailPivotZ)
        .rotate(tailYaw, 0, 1, 0)
        .translate(0, 0, -tailPivotZ);

    g_sharkFin.modelMatrix = new Matrix4(base);
}

function animateSharkSec(deltaMS) {
    g_sharkTime += deltaMS * 0.002;

    // vertical bobbing motion
    const sharkY = -Math.sin(g_sharkTime) * 2;

    // animations
    const tailYaw = Math.sin(g_sharkTime * 3);
    const headPitch = Math.sin(g_sharkTime * 1.5);

    // base transform for the whole shark
    const base = new Matrix4()
        .translate(0, 0, -15 + g_boatZShift*5)
        .translate(0, sharkY, 0)
        .scale(2, 2, 2);

    g_sharkBody2.modelMatrix = new Matrix4(base);
 
    const headPivotZ = 2.0;
    g_sharkHead2.modelMatrix = new Matrix4(base)
        .translate(0, 0, headPivotZ)
        .rotate(headPitch, 1, 0, 0)
        .translate(0, 0, -headPivotZ);

    const tailPivotZ = -0.50;
    g_sharkTail2.modelMatrix = new Matrix4(base)
        .translate(0, 0, tailPivotZ)
        .rotate(tailYaw, 0, 1, 0)
        .translate(0, 0, -tailPivotZ);

    g_sharkFin2.modelMatrix = new Matrix4(base);
}


currFocus = 0;
isFocusing = false;
focusTarget = new Vector3([0,0,0]);    

let NewfocusTargets = [
    () => getMatrixPosition(g_lighthouse.worldMatrix),
    () => getMatrixPosition(g_plane.worldMatrix),
    () => getMatrixPosition(g_boat.worldMatrix),
    () => getMatrixPosition(g_jellyfish.worldMatrix)
];

function refreshFocusTargets() {
    if (g_showBad) {
        NewfocusTargets = [
            () => getMatrixPosition(g_lighthouse.worldMatrix),
            () => getMatrixPosition(g_plane.worldMatrix),
            () => getMatrixPosition(g_boat.worldMatrix),
            () => getMatrixPosition(g_sharkBody.worldMatrix),
            () => getMatrixPosition(g_sharkBody2.worldMatrix),
            () => getMatrixPosition(g_dragonBody.worldMatrix)
        ];
    } else {
        NewfocusTargets = [
    () => getMatrixPosition(g_lighthouse.worldMatrix),
    () => getMatrixPosition(g_plane.worldMatrix),
    () => getMatrixPosition(g_boat.worldMatrix),
    () => getMatrixPosition(g_jellyfish.worldMatrix)
        ];
    }
    
}

function updateCameraFocus(deltaMS) {
    if (!isFocusing) return false;

        refreshFocusTargets();


    // On first frame of focus: record the start & target directions
    if (focusProgress === 0) {
        startFront = new Vector3(cameraFront.elements).normalize();

        // compute target direction
        let pos = NewfocusTargets[currFocus](); 
        let tx = pos.elements[0] - cameraPos.elements[0];
        let ty = pos.elements[1] - cameraPos.elements[1];
        let tz = pos.elements[2] - cameraPos.elements[2];

        targetFront = new Vector3([tx, ty, tz]).normalize();
    }

    focusProgress += 0.0015 * deltaMS;
    if (focusProgress > 1) focusProgress = 1;

    // SLERP between startFront → targetFront
    let dot = clamp(startFront.dot(targetFront), -1, 1);

    // If almost identical, snap to target
    if (dot > 0.9995 || focusProgress >= 1) {
        cameraFront = targetFront;
        isFocusing = false;
        focusProgress = 0;
    } else {
        // Compute axis & angle
        let axis = startFront.cross(targetFront).normalize();
        let angle = Math.acos(dot);

        // Build quaternions
        let q0 = new Quaternion().setFromAxisAngle(axis, 0);
        let q1 = new Quaternion().setFromAxisAngle(axis, angle * 180 / Math.PI);

        // SLERP from q0->q1
        let qs = Quaternion.slerp(q0, q1, focusProgress);

        // Rotate the start vector
        cameraFront = qs.multiplyVector3(startFront).normalize();
    }

    // Recompute camera basis
    camRight = new Vector3([0, 1, 0]).cross(cameraFront).normalize();
    camUp = cameraFront.cross(camRight).normalize();

    // Update yaw/pitch
    yaw = Math.atan2(cameraFront.elements[2], cameraFront.elements[0]) * 180 / Math.PI;
    pitch = Math.asin(clamp(cameraFront.elements[1], -1, 1)) * 180 / Math.PI;

    return true;
}

// function to apply all the logic for a single frame tick
function tick() {
    // Calculate time since the last frame
    let currentTime = Date.now();
    let deltaMS = currentTime - g_lastFrameMS;
    g_lastFrameMS = currentTime;
    //Jellyfish Movement
    g_jellyfishTime += deltaMS * 0.002;
    let jellyfishY = Math.sin(g_jellyfishTime)*JELLYFISH_AMPLITUDE ;

   
    g_jellyfish.worldMatrix.setIdentity()
        .translate(-20, 10 + jellyfishY, -27);

    g_jellyfish2.worldMatrix.setIdentity()
        .translate(-24, -5 + jellyfishY, 13);

    g_jellyfish3.worldMatrix.setIdentity()
        .translate(-15, 9 + jellyfishY, 25);

    g_jellyfish4.worldMatrix.setIdentity()
        .translate(26, 6 + jellyfishY, -20);
     
        g_boat.worldMatrix.setIdentity()
        .translate(10, -2, g_boatZShift*10);

    updateCameraPosition(deltaMS, CAMERA_SPEED);
    updateCameraRotation(deltaMS, CAMERA_ROTATION_SPEED);
    updateCameraFocus(deltaMS);
    animateShark(deltaMS);
    animateSharkSec(deltaMS);
    //animateDragon(deltaMS);

    // Move the plane and the propeller
    g_plane.worldMatrix.rotate(PLANE_ROTATION_SPEED * deltaMS, 0, 1, 0);
    g_propeller.modelMatrix.rotate(PROPELLER_ROTATION_SPEED * deltaMS, 0, 0, 1)

    g_dragonBody.worldMatrix.rotate(PLANE_ROTATION_SPEED * deltaMS, 0, 1, 0);
    g_dragonLeftWing.worldMatrix.rotate(PLANE_ROTATION_SPEED * deltaMS, 0, 1, 0);

    g_dragonRightWing.worldMatrix.rotate(PLANE_ROTATION_SPEED * deltaMS, 0, 1, 0);



    newDraw();

    requestAnimationFrame(tick, g_canvas);
}

let currentShader = "mixed"; 

// Button click handler
const shaders = ["gooch", "phong", "mixed"];


//new draw
// draw to the screen on the next frame
function newDraw() {
     gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, g_canvas.width, g_canvas.height);

    gl.clearColor(0.2, 0.0, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let cameraMatrix = calculateCameraMatrix();

    gl.depthMask(false);
    drawSkybox(cameraMatrix, 1);
    gl.depthMask(true);

switch (currentShader) {
    case "gooch":
        drawGooch(cameraMatrix);
        break;
    case "phong":
        drawPhong(cameraMatrix);
        break;
    case "mixed":
        drawMixed(cameraMatrix);
        break;
    default:
        drawGooch(cameraMatrix);
        break;
}

}


// skybox

function drawSkybox(cameraMatrix, index) {
    
    // Switch to using the skybox shader for our skybox
    gl.useProgram(g_programSkybox);

    // Communicate our data layout for the skybox shader
    if (!setupVec(3, g_programSkybox, 'a_Position', 0, 0)) {
        return;
    }

    // Set our texture pointer to our skybox location
    gl.uniform1i(g_uCubeMapSkybox_ref, index);
    let scaleMatrix = new Matrix4().scale(5000, 5000, 5000);
    // Remove any translation from the camera
    let adjustedCameraMatrix = new Matrix4(cameraMatrix);
    adjustedCameraMatrix.elements[12] = 0.0;
    adjustedCameraMatrix.elements[13] = 0.0;
    adjustedCameraMatrix.elements[14] = 0.0;
    //adjustedCameraMatrix.multiply(scaleMatrix);

    // Use this to calculate the camera projection Inverse
    let projectionCameraInverse = new Matrix4(g_projectionMatrix).multiply(adjustedCameraMatrix).invert();
    gl.uniformMatrix4fv(g_uProjectionCameraInverseSkybox_ref, false, projectionCameraInverse.elements);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, g_cubeMap);
    gl.uniform1i(g_uCubeMapSkybox_ref, 1);
    // Draw the skybox
    gl.drawArrays(gl.TRIANGLES, 0, 
        g_cubeObject.mesh.length / 3);
}

function communicateAttributesGooch(objects, program) {
    let meshLength = 0;
    
    objects.forEach(o => {
        meshLength += o.mesh.length;
    });

    // Position
    setupVec(3, program, "a_Position", 0, 0);


    // Normal
    setupVec(3, program, "a_Normal", 0,
        (meshLength) * FLOAT_SIZE
    );
}

function drawPhong(cameraMatrix) {
    // Set global camera & projection uniforms
     objects = [g_cubeObject, g_boatObject, g_planeObject,
         g_propellerObject, g_jellyfishObject,g_jellyfishObject,
         g_jellyfishObject,g_jellyfishObject,
        g_sharkBodyObj,g_sharkHeadObj,g_sharkTailObj,
        g_sharkFinObj,
        g_sharkBodyObj,g_sharkHeadObj,g_sharkTailObj,
        g_sharkFinObj,
        g_DragonBodyObj,g_DragonLeftWingObj,
        g_DragonRightWingObj,g_lighthouseObject,  g_terrainObject,g_terrainObjectRed];
        
     gl.useProgram(g_programPhong);   
    communicateAttributesGooch(objects, g_programGooch);
    
    
    gl.uniformMatrix4fv(g_uCameraPhong_ref, false, cameraMatrix.elements);
    gl.uniformMatrix4fv(g_uProjectionPhong_ref, false, g_projectionMatrix.elements);

    // Draw everything manually
   
    g_boat.drawPhong(g_uModelPhong_ref, g_uWorldPhong_ref, g_uInverseTransposePhong_ref, g_uLightPhong_ref, g_uSpecPowerPhong_ref);
    
   
   if(g_showBad){
    g_sharkBody.drawPhong(g_uModelPhong_ref, g_uWorldPhong_ref, g_uInverseTransposePhong_ref, g_uLightPhong_ref, g_uSpecPowerPhong_ref);
    g_sharkHead.drawPhong(g_uModelPhong_ref, g_uWorldPhong_ref, g_uInverseTransposePhong_ref, g_uLightPhong_ref, g_uSpecPowerPhong_ref);
    g_sharkTail.drawPhong(g_uModelPhong_ref, g_uWorldPhong_ref, g_uInverseTransposePhong_ref, g_uLightPhong_ref, g_uSpecPowerPhong_ref);
    g_sharkFin.drawPhong(g_uModelPhong_ref, g_uWorldPhong_ref, g_uInverseTransposePhong_ref, g_uLightPhong_ref, g_uSpecPowerPhong_ref);
    
    g_sharkBody2.drawPhong(g_uModelPhong_ref, g_uWorldPhong_ref, g_uInverseTransposePhong_ref, g_uLightPhong_ref, g_uSpecPowerPhong_ref);
    g_sharkHead2.drawPhong(g_uModelPhong_ref, g_uWorldPhong_ref, g_uInverseTransposePhong_ref, g_uLightPhong_ref, g_uSpecPowerPhong_ref);
    g_sharkTail2.drawPhong(g_uModelPhong_ref, g_uWorldPhong_ref, g_uInverseTransposePhong_ref, g_uLightPhong_ref, g_uSpecPowerPhong_ref);
    g_sharkFin2.drawPhong(g_uModelPhong_ref, g_uWorldPhong_ref, g_uInverseTransposePhong_ref, g_uLightPhong_ref, g_uSpecPowerPhong_ref);
    

    g_dragonBody.drawPhong(g_uModelPhong_ref, g_uWorldPhong_ref, g_uInverseTransposePhong_ref, g_uLightPhong_ref, g_uSpecPowerPhong_ref);
    g_dragonLeftWing.drawPhong(g_uModelPhong_ref, g_uWorldPhong_ref, g_uInverseTransposePhong_ref, g_uLightPhong_ref, g_uSpecPowerPhong_ref);
    g_dragonRightWing.drawPhong(g_uModelPhong_ref, g_uWorldPhong_ref, g_uInverseTransposePhong_ref, g_uLightPhong_ref, g_uSpecPowerPhong_ref);
    g_terrainRed.drawPhong(g_uModelPhong_ref, g_uWorldPhong_ref, g_uInverseTransposePhong_ref, g_uLightPhong_ref, g_uSpecPowerPhong_ref);
   }
   else{

    g_plane.drawPhong(g_uModelPhong_ref, g_uWorldPhong_ref, g_uInverseTransposePhong_ref, g_uLightPhong_ref, g_uSpecPowerPhong_ref);
    g_propeller.drawPhong(g_uModelPhong_ref, g_uWorldPhong_ref, g_uInverseTransposePhong_ref, g_uLightPhong_ref, g_uSpecPowerPhong_ref);
   
    g_jellyfish.drawPhong(g_uModelPhong_ref, g_uWorldPhong_ref, g_uInverseTransposePhong_ref, g_uLightPhong_ref, g_uSpecPowerPhong_ref);
    g_jellyfish2.drawPhong(g_uModelPhong_ref, g_uWorldPhong_ref, g_uInverseTransposePhong_ref, g_uLightPhong_ref, g_uSpecPowerPhong_ref);
    g_jellyfish3.drawPhong(g_uModelPhong_ref, g_uWorldPhong_ref, g_uInverseTransposePhong_ref, g_uLightPhong_ref, g_uSpecPowerPhong_ref);
    g_jellyfish4.drawPhong(g_uModelPhong_ref, g_uWorldPhong_ref, g_uInverseTransposePhong_ref, g_uLightPhong_ref, g_uSpecPowerPhong_ref);
    g_terrain.drawPhong(g_uModelPhong_ref, g_uWorldPhong_ref, g_uInverseTransposePhong_ref, g_uLightPhong_ref, g_uSpecPowerPhong_ref);
   
   }
    g_lighthouse.drawPhong(g_uModelPhong_ref, g_uWorldPhong_ref, g_uInverseTransposePhong_ref, g_uLightPhong_ref, g_uSpecPowerPhong_ref);
    
}

function drawGooch(cameraMatrix) {
    objects = [g_cubeObject, g_boatObject, g_planeObject,
         g_propellerObject, g_jellyfishObject,g_jellyfishObject,
         g_jellyfishObject,g_jellyfishObject,
        g_sharkBodyObj,g_sharkHeadObj,g_sharkTailObj,
        g_sharkFinObj,
        g_sharkBodyObj,g_sharkHeadObj,g_sharkTailObj,
        g_sharkFinObj,
        g_DragonBodyObj,g_DragonLeftWingObj,g_DragonRightWingObj
        ,g_lighthouseObject,  g_terrainObject,g_terrainObjectRed];
        
        gl.useProgram(g_programGooch);
    communicateAttributesGooch(objects, g_programGooch);
    // Camera uniforms
    
    gl.uniformMatrix4fv(g_uCameraGooch_ref, false, cameraMatrix.elements);
    gl.uniformMatrix4fv(g_uProjectionGooch_ref, false, g_projectionMatrix.elements);


    let normalizedLight = g_light.normalize(); // If Vector3 has normalize
    gl.uniform3fv(g_uLightGooch_ref, normalizedLight.elements);
    //gl.uniform3fv(g_uLightGooch_ref, g_light.elements);
    gl.uniform1f(g_uSpecPowerGooch_ref, g_specPower);
    // Light position
    let LighthouseLocation =
        new Matrix4(g_lighthouse.worldMatrix)
            .multiply(g_lighthouse.modelMatrix)
            .multiplyVector3(new Vector3(0, 0, 0));

    gl.uniform3fv(g_uLightGooch_ref, LighthouseLocation.elements);

    // Draw everything
    g_boat.drawGooch(g_uModelGooch_ref, g_uWorldGooch_ref, g_uInverseTransposeGooch_ref);
   
    if(g_showBad){
    g_sharkBody2.drawGooch(g_uModelGooch_ref, g_uWorldGooch_ref, g_uInverseTransposeGooch_ref);
    g_sharkHead2.drawGooch(g_uModelGooch_ref, g_uWorldGooch_ref, g_uInverseTransposeGooch_ref);
    g_sharkTail2.drawGooch(g_uModelGooch_ref, g_uWorldGooch_ref, g_uInverseTransposeGooch_ref);
    g_sharkFin2.drawGooch(g_uModelGooch_ref, g_uWorldGooch_ref, g_uInverseTransposeGooch_ref);

    g_sharkBody.drawGooch(g_uModelGooch_ref, g_uWorldGooch_ref, g_uInverseTransposeGooch_ref);
    g_sharkHead.drawGooch(g_uModelGooch_ref, g_uWorldGooch_ref, g_uInverseTransposeGooch_ref);
    g_sharkTail.drawGooch(g_uModelGooch_ref, g_uWorldGooch_ref, g_uInverseTransposeGooch_ref);
    g_sharkFin.drawGooch(g_uModelGooch_ref, g_uWorldGooch_ref, g_uInverseTransposeGooch_ref);


    
    g_dragonBody.drawGooch(g_uModelGooch_ref, g_uWorldGooch_ref, g_uInverseTransposeGooch_ref);
    g_dragonLeftWing.drawGooch(g_uModelGooch_ref, g_uWorldGooch_ref, g_uInverseTransposeGooch_ref);
    g_dragonRightWing.drawGooch(g_uModelGooch_ref, g_uWorldGooch_ref, g_uInverseTransposeGooch_ref);
    g_terrainRed.drawGooch(g_uModelGooch_ref, g_uWorldGooch_ref, g_uInverseTransposeGooch_ref);
}
    else{
    g_plane.drawGooch(g_uModelGooch_ref, g_uWorldGooch_ref, g_uInverseTransposeGooch_ref);
    g_propeller.drawGooch(g_uModelGooch_ref, g_uWorldGooch_ref);

    g_jellyfish.drawGooch(g_uModelGooch_ref, g_uWorldGooch_ref, g_uInverseTransposeGooch_ref);
    g_jellyfish2.drawGooch(g_uModelGooch_ref, g_uWorldGooch_ref, g_uInverseTransposeGooch_ref);
    g_jellyfish3.drawGooch(g_uModelGooch_ref, g_uWorldGooch_ref, g_uInverseTransposeGooch_ref);
    g_jellyfish4.drawGooch(g_uModelGooch_ref, g_uWorldGooch_ref, g_uInverseTransposeGooch_ref);
    g_terrain.drawGooch(g_uModelGooch_ref, g_uWorldGooch_ref, g_uInverseTransposeGooch_ref);

    }
    g_lighthouse.drawGooch(g_uModelGooch_ref, g_uWorldGooch_ref, g_uInverseTransposeGooch_ref);
    
}



function drawMixed(cameraMatrix) {
    objects = [g_cubeObject, g_boatObject, g_planeObject,
         g_propellerObject, g_jellyfishObject,g_jellyfishObject,
         g_jellyfishObject,g_jellyfishObject,
        g_sharkBodyObj,g_sharkHeadObj,g_sharkTailObj,
        g_sharkFinObj,
        g_sharkBodyObj,g_sharkHeadObj,g_sharkTailObj,
        g_sharkFinObj,
        g_DragonBodyObj,g_DragonLeftWingObj,g_DragonRightWingObj,
        ,g_lighthouseObject,  g_terrainObject,g_terrainObjectRed];
        communicateAttributesFlat(objects, g_programMixed);
        gl.useProgram(g_programMixed);

    // Camera uniforms
    gl.uniformMatrix4fv(g_uCamera_ref, false, cameraMatrix.elements);
    gl.uniformMatrix4fv(g_uProjection_ref, false, g_projectionMatrix.elements);

    // Light position
    let LighthouseLocation =
        new Matrix4(g_lighthouse.worldMatrix)
            .multiply(g_lighthouse.modelMatrix)
            .multiplyVector3(new Vector3(0, 0, 0));

    gl.uniform3fv(g_uLight_ref, LighthouseLocation.elements);

    // Draw everything
    
    g_boat.draw(g_uModel_ref, g_uWorld_ref, g_uWorldModelInverseTranspose_ref);
    

    if(g_showBad){
    g_sharkBody.draw(g_uModel_ref, g_uWorld_ref, g_uWorldModelInverseTranspose_ref);
    g_sharkHead.draw(g_uModel_ref, g_uWorld_ref, g_uWorldModelInverseTranspose_ref);
    g_sharkTail.draw(g_uModel_ref, g_uWorld_ref, g_uWorldModelInverseTranspose_ref);
    g_sharkFin.draw(g_uModel_ref, g_uWorld_ref, g_uWorldModelInverseTranspose_ref);

    g_sharkBody2.draw(g_uModel_ref, g_uWorld_ref, g_uWorldModelInverseTranspose_ref);
    g_sharkHead2.draw(g_uModel_ref, g_uWorld_ref, g_uWorldModelInverseTranspose_ref);
    g_sharkTail2.draw(g_uModel_ref, g_uWorld_ref, g_uWorldModelInverseTranspose_ref);
    g_sharkFin2.draw(g_uModel_ref, g_uWorld_ref, g_uWorldModelInverseTranspose_ref);


    g_dragonBody.draw(g_uModel_ref, g_uWorld_ref, g_uWorldModelInverseTranspose_ref);
    g_dragonLeftWing.draw(g_uModel_ref, g_uWorld_ref, g_uWorldModelInverseTranspose_ref);
    g_dragonRightWing.draw(g_uModel_ref, g_uWorld_ref, g_uWorldModelInverseTranspose_ref);
    g_terrainRed.draw(g_uModel_ref, g_uWorld_ref, g_uWorldModelInverseTranspose_ref);
    }
    else{
    g_plane.draw(g_uModel_ref, g_uWorld_ref, g_uWorldModelInverseTranspose_ref);
    g_propeller.draw(g_uModel_ref, g_uWorld_ref);

    g_jellyfish.draw(g_uModel_ref, g_uWorld_ref, g_uWorldModelInverseTranspose_ref);
    g_jellyfish2.draw(g_uModel_ref, g_uWorld_ref, g_uWorldModelInverseTranspose_ref);
    g_jellyfish3.draw(g_uModel_ref, g_uWorld_ref, g_uWorldModelInverseTranspose_ref);
    g_jellyfish4.draw(g_uModel_ref, g_uWorld_ref, g_uWorldModelInverseTranspose_ref);
    g_terrain.draw(g_uModel_ref, g_uWorld_ref, g_uWorldModelInverseTranspose_ref);
    }
    g_lighthouse.draw(g_uModel_ref, g_uWorld_ref, g_uWorldModelInverseTranspose_ref);
    
}