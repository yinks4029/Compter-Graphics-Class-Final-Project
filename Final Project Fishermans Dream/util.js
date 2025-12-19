
function buildLitColorAttributes(vertices, normals, baseColor) {
    let colors = [];
    let lightDir = [0.5, 0.5, 1.0]; // example light
    let mag = Math.sqrt(lightDir[0]**2 + lightDir[1]**2 + lightDir[2]**2);
    lightDir = lightDir.map(v => v / mag);

    for (let i = 0; i < vertices.length; i += 3) {
        let nx = normals[i], ny = normals[i + 1], nz = normals[i + 2];
        let dot = Math.max(0, nx * lightDir[0] + ny * lightDir[1] + nz * lightDir[2]);

        let r = baseColor[0] * dot;
        let g = baseColor[1] * dot;
        let b = baseColor[2] * dot;

        colors.push(r, g, b);
    }
    return colors;
}

/**
 * util.js
 * 
 * Utility functions
 * 
 * Last modified by Dietrich Geisler, Fall 2025
 * 
 */

/**
 * Helper to construct colors to make meshes look more 3D
 * Hacked to make three colors (blue, brown, green)
 * @param {int} vertexCount how many vertices to build colors for
 * @param {int} choice 0 = blue, 1 = brown, 2 = green
 * @returns {Array<float>} a flat array of colors
 */
function buildColorAttributes(vertexCount, choice) {
    let colors = [];
    for (let i = 0; i < vertexCount / 3; i++) {
        // three vertices per triangle
        for (let vert = 0; vert < 3; vert++) {
            let shade = (i * 3) / vertexCount;
            if (choice === 0) {
                colors.push(shade, shade, 1.0);
            }
            if (choice === 1) {
                colors.push(0.3, 0.2, shade / 10);
            }
            if (choice === 2) {
                colors.push(shade / 2, 1.0, shade / 2);
            }
            if (choice === 3) {
                colors.push(1.0, 1.0, 1.0);
            }
        }
    }
    return colors;
}



/*
 * Helper function to build terrain
 */
//to allow color changes
function buildTerrain(colorFn) {
    let terrainGenerator = new TerrainGenerator();
    let seed = 12398123;

    let options = { 
        width: 200,
        height: 10,
        depth: 200,
        seed: seed,
        noisefn: "perlin",
        roughness: 3
    };

    // Build terrain vertices
    let terrain = terrainGenerator.generateTerrainMesh(options);

    // Apply provided color function
    let terrainColors = colorFn(terrain, options.height);

    // Flatten vertices
    let terrainMesh = [];
    for (let i = 0; i < terrain.length; i++) {
        terrainMesh.push(...terrain[i]);
    }

    return [terrainMesh, terrainColors];
}

/*
 * Helper to construct _basic_ per-vertex terrain colors
 * We use the height of the terrain to select a color between white and blue
 * Requires that we pass in the height of the terrain (as a number), but feel free to change this
 * TODO: you should expect to modify this helper with custom (or more interesting) colors
 */
function buildTerrainColors(terrain, height) {
    let colors = [];
    for (let i = 0; i < terrain.length; i++) {
        // calculates the vertex color for each vertex independent of the triangle
        // the rasterizer can help make this look "smooth"

        // we use the y axis of each vertex alone for color
        // higher "peaks" have more shade
        relativeHeight = terrain[i][1] / height + 1/2;
        let shade = (terrain[i][1] / height) + 1/2
        let color = [shade, shade, 1.0]


        // give each triangle 3 colors
        colors.push(...color);
    }

    return colors;
}

function buildTerrainColorsRed(terrain, height) {
    let colors = [];
    for (let i = 0; i < terrain.length; i++) {
   
        let relativeHeight = (terrain[i][1] / height + 0.5);  
        let red = relativeHeight;           
        let green = 0.2;                    
        let blue = 0.2;                     
        let color = [red, green, blue];

        colors.push(...color);
    }
    return colors;
}

/**
 * Helper function to setup key binding logic
 */
function setupKeyBinds() {
    // Setup the dictionary of keys we're tracking
    KEYS_TO_TRACK.forEach(key => {
        g_keysPressed[key] = false;
    });

    // Set key flag to true when key starts being pressed
    document.addEventListener('keydown', function (event) {
        KEYS_TO_TRACK.forEach(key => {
            if (event.key == key) {
                g_keysPressed[key] = true;
            }
        });
    })

    // Set key flag to false when key starts being pressed
    document.addEventListener('keyup', function (event) {
        KEYS_TO_TRACK.forEach(key => {
            if (event.key == key) {
                g_keysPressed[key] = false;
            }
        });
    })
}

/**
 * Initialize the VBO with the provided models, looping over each object
 * Assumes we are going to have "static" (unchanging) data
 * @param {Float32Array} data 
 * @return {Boolean} true if the VBO was setup successfully, and false otherwise
 */
function initVBO(objects) {
    // Combine all of our data
    let data = []
    // First get the meshes
    objects.forEach(obj => {
        data = data.concat(obj.mesh);
    });

    // Then get the colors
    objects.forEach(obj => {
        data = data.concat(obj.colors);
    });

    // Then get the normals
    objects.forEach(obj => {
        data = data.concat(obj.normals);
    });

    // get the VBO handle
    let VBOloc = gl.createBuffer();
    if (!VBOloc) {
        throw 'Failed to create the vertex buffer object';
    }

    // Bind the VBO to the GPU array and copy `data` into that VBO
    gl.bindBuffer(gl.ARRAY_BUFFER, VBOloc);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

    return;
}
function communicateAttributesSkybox(program) {
    if (!setupVec(3, program, 'a_Position', 0, 0)) {
        throw 'Skybox vec setup failed.';
    }
}

/**
 * Communicate all attributes to the flat color shader
 * 
 * @param {*} objects a list of objects to communicate
 */
function communicateAttributesFlat(objects,program) {
    let objectsMeshLength = 0;
    objects.forEach(obj => {
        objectsMeshLength += obj.mesh.length;
    });
    let objectsColorLength = 0;
    objects.forEach(obj => {
        objectsColorLength += obj.colors.length;
    });
    if (!setupVec(3,program, 'a_Position', 0, 0)) {
        throw `Bad setup`;
    }
    if (!setupVec(3,program, 'a_Color', 0, objectsMeshLength * FLOAT_SIZE)) {
        throw `Bad setup`;
    }
    if (!setupVec(3,program, 'a_Normal', 0, (objectsMeshLength + objectsColorLength) * FLOAT_SIZE)) {
        throw `Bad setup`;
    }
}

/**
 * Specifies properties of the given attribute on the GPU
 * @param {Number} length : the length of the vector (e.g. 3 for a Vector3);
 * @param {String} name : the name of the attribute in GLSL
 * @param {Number} stride : the stride in bytes
 * @param {Number} offset : the offset in bytes
 * @return {Boolean} true if the attribute was setup successfully, and false otherwise
 */
function setupVec(length, program, name, stride, offset) {
    // Get the attribute by name
    let attributeID = gl.getAttribLocation(program, `${name}`);
    if (attributeID < 0) {
        console.error(`Failed to get the storage location of ${name}`);
        return false;
    }

    // Set how the GPU fills the a_Position letiable with data from the GPU 
    gl.vertexAttribPointer(attributeID, length, gl.FLOAT, false, stride, offset);
    gl.enableVertexAttribArray(attributeID);

    return true;
}
