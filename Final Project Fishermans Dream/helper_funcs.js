
//helper functions from class: 
/*
 * 
 * @param {Float32Array} mesh source data
 * @param {Float32Array|undefined} colors source data or junk if undefined
 */



//lock camera
let cameraLocked = false;

document.addEventListener('keydown',(e) =>{
    if (e.key === 'c'){
        cameraLocked = !cameraLocked;
    }
});

function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }


function getMatrixPosition(mat) {
    return new Vector3([
        mat.elements[12],
        mat.elements[13],
        mat.elements[14]
    ]);
}


// const focusTargets = [
//     () => getMatrixPosition(g_modelMatrixLighthouse),
//     () => getMatrixPosition(g_biplaneBodyMatrix),
//     () => getMatrixPosition(g_modelMatrixBoat),
//     () => getMatrixPosition(g_modelMatrixSharkBody),   // moves!
//     () => getMatrixPosition(g_modelMatrixJellyfish2)
// ];
// let currFocus = 0;
// isFocusing = false;
// let focusTarget = new Vector3([0,0,0]);    

// function updateCameraFocus(deltaMS) {
//     if (!isFocusing) return false;

//     // On first frame of focus: record the start & target directions
//     if (focusProgress === 0) {
//         startFront = new Vector3(cameraFront.elements).normalize();

//         // compute target direction
//         let pos = focusTargets[currFocus](); 
//         let tx = pos.elements[0] - cameraPos.elements[0];
//         let ty = pos.elements[1] - cameraPos.elements[1];
//         let tz = pos.elements[2] - cameraPos.elements[2];

//         targetFront = new Vector3([tx, ty, tz]).normalize();
//     }

//     focusProgress += 0.0015 * deltaMS;
//     if (focusProgress > 1) focusProgress = 1;

//     // SLERP between startFront → targetFront
//     let dot = clamp(startFront.dot(targetFront), -1, 1);

//     // If almost identical, snap to target
//     if (dot > 0.9995 || focusProgress >= 1) {
//         cameraFront = targetFront;
//         isFocusing = false;
//         focusProgress = 0;
//     } else {
//         // Compute axis & angle
//         let axis = startFront.cross(targetFront).normalize();
//         let angle = Math.acos(dot);

//         // Build quaternions
//         let q0 = new Quaternion().setFromAxisAngle(axis, 0);
//         let q1 = new Quaternion().setFromAxisAngle(axis, angle * 180 / Math.PI);

//         // SLERP from q0->q1
//         let qs = Quaternion.slerp(q0, q1, focusProgress);

//         // Rotate the start vector
//         cameraFront = qs.multiplyVector3(startFront).normalize();
//     }

//     // Recompute camera basis
//     camRight = new Vector3([0, 1, 0]).cross(cameraFront).normalize();
//     camUp = cameraFront.cross(camRight).normalize();

//     // Update yaw/pitch
//     yaw = Math.atan2(cameraFront.elements[2], cameraFront.elements[0]) * 180 / Math.PI;
//     pitch = Math.asin(clamp(cameraFront.elements[1], -1, 1)) * 180 / Math.PI;

//     return true;
// }


function calculateCameraMatrix() {
    let target = cameraPos.add(cameraFront);
    return new Matrix4().setLookAt(
        cameraPos,   // camera position
        target,      // look at target
        camUp     // up vector
    );
}
//new camera stuff: 
function updateCameraRotation() {
    if (cameraLocked) return;  
    // Update cameraFront based on yaw/pitch
    let radYaw = yaw * Math.PI / 180;
    let radPitch = pitch * Math.PI / 180;

    cameraFront = new Vector3([
    Math.cos(radYaw) * Math.cos(radPitch),
    Math.sin(radPitch),
    Math.sin(radYaw) * Math.cos(radPitch)
]).normalize();

    // Recompute right/up for movement
    camRight = cameraFront.cross(new Vector3([0,1,0])).normalize();
    camUp = camRight.cross(cameraFront).normalize();
    //console.log(cameraUp);
}



function updateCameraPosition(deltaMS) {
    const velocity = camSpeed * deltaMS;

    // WASD movement
    if (g_keysPressed['w'])
        { 
            cameraPos = cameraPos.add(cameraFront.scaled(velocity));
        }
    if (g_keysPressed['s']) 
        {
            cameraPos = cameraPos.add(cameraFront.scaled(-velocity));
        }
    if (g_keysPressed['a']) 
        {
            cameraPos = cameraPos.add(camRight.scaled(-velocity));
        }
    if (g_keysPressed['d'])
        {
         cameraPos = cameraPos.add(camRight.scaled(velocity));
        }
    if (g_keysPressed['r'])
        {
            cameraPos = cameraPos.add(new Vector3([0,1,0]).scaled(velocity));
        }
    if (g_keysPressed['f']) 
        {
            cameraPos = cameraPos.add(new Vector3([0,1,0]).scaled(-velocity));
        } 
        updateCameraRotation();
    }



document.addEventListener('mousemove', function(event) {
    if (cameraLocked) return;  
    if (firstMouse) {
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
        firstMouse = false;
    }

    let offsetX = (event.clientX - lastMouseX) * sensitivity;
    let offsetY = (lastMouseY - event.clientY) * sensitivity; // y inverted

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;

    yaw += offsetX;
    pitch += offsetY;

    if (pitch > 89) pitch = 89;
    if (pitch < -89) pitch = -89;

     updateCameraRotation();
    //console.log('Yaw:', yaw.toFixed(2), 'Pitch:', pitch.toFixed(2));
});
document.addEventListener('keydown', function(event){
    if (event.key === 'x') {
        isFocusing = false;       
    }
});


const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);


document.addEventListener('keydown',function(event){
    if (event.key === 'v'){
        currFocus = (currFocus + 1) % NewfocusTargets.length;
        focusTarget = NewfocusTargets[currFocus]();
        isFocusing = true;
        focusProgress = 0;   
    }
});
function updatePageColors() {
    if (g_showBad) {
        document.body.style.backgroundColor = "black";
        document.body.style.color = "white";
    } else {
        document.body.style.backgroundColor = "white";
        document.body.style.color = "black";
    }
}

document.getElementById("toggleObjectsBtn").addEventListener("click", () => {
    g_showBad = !g_showBad;
    updatePageColors();
    updateSkyboxImages();
    refreshFocusTargets();
});

function toggleShader() {
    let currentIndex = shaders.indexOf(currentShader);
    currentIndex = (currentIndex + 1) % shaders.length;
    currentShader = shaders[currentIndex];
    //console.log("Current shader:", currentShader);
}


function myBuildColorAttributes(vertexCount, baseColor = [0.0,0.0,0.0]) {
    let colors = [];
    for (let i = 0; i < vertexCount / 3; i++) {
        let shade = (i * 3)/vertexCount;

        let r = baseColor[0]* (0.5 +0.5 * shade);
        let g = baseColor[1]* (0.5 +0.5 * shade);
        let b = baseColor[2]* (0.5 +0.5 * shade);

        // three vertices per triangle
        for (let vert = 0; vert < 3; vert++) {
            colors.push(r, g, b);
        }
    }
    return colors;
}

//proffessor helper funcs:
/**
 * data_class.js
 * 
 * Core class declarations for data storage
 * 
 * Last modified by Dietrich Geisler, Fall 2025
 * 
 */


//mycolors


/**
 * Constructs a rigit scene object with the following fields:
 * mesh: an ordered list of the 3d positions of this object
 * colors: an ordered list of the colors associated with this object
 * 
 * @param {Float32Array} mesh source data
 * @param {Float32Array|undefined} colors source data or junk if undefined
 */
let SceneObject = function (mesh, colors = undefined, normals = undefined) {
    if (typeof mesh === "undefined") {
        throw `Invalid source of data ${mesh}`;
    }
    this.mesh = mesh;
    // Fill colors and normals with nonsense if needed
    if (typeof colors === "undefined") {
        this.colors = [];
        mesh.forEach(point => {
            this.colors.push(point);
        });
    }
    else {
        this.colors = colors;
    }
    if (typeof normals === "undefined") {
        this.normals = [];
        mesh.forEach(point => {
            this.normals.push(point);
        });
    }
    else {
        this.normals = normals;
    }
}

/**
 * Represents a single model in the scene with the following additional properties
 * modelMatrix: any transformations done to the model
 * worldMatrix: any movement or rotations done in the world
 * 
 * NOTE: realistically, useLighting, specPower, and specColor should just inherit from the parent probably
 *       but I was too lazy to set this up, so make of that what you will
 * 
 * @param {Number} offset the offset as a positive number
 * @param {SceneObject} sceneObject source data
 * @param {Boolean} useLighting whether to use lighting 
 * @param {Number} specPower the power of specular on this object
 * @param {Vec3} specColor the spec color on this object
 */
let Model = function(offset, sceneObject, useLighting, specPower, specColor) {
    if (typeof offset === "undefined" || offset < 0) {
        throw `Invalid offset ${offset}`;
    }
    if (!(typeof sceneObject === "object" && sceneObject.hasOwnProperty("mesh"))) {
        throw `Invalid sceneObject ${sceneObject}`;
    }
    if (typeof useLighting === "undefined") {
        throw `Invalid useLighting ${useLighting}`;
    }
    if (typeof specPower === "undefined" || specPower < 0) {
        throw `Invalid specPower ${specPower}`;
    }
    if (typeof specColor === "undefined") {
        throw `Invalid specColor ${specColor}`;
    }

    this.offset = offset;
    this.sceneObject = sceneObject;
    this.useLighting = useLighting;
    this.specPower = specPower;
    this.specColor = specColor;
    this.modelMatrix = new Matrix4();
    this.worldMatrix = new Matrix4();
}

/**
 * Draws this model into the scene, setting model and world matrices appropriately
 * 
 * @param {*} uModel_ref 
 * @param {*} uWorld_ref 
 * @param {*} uModelWorldInverseTranspose_ref
 */
Model.prototype.draw = function(uModel_ref, uWorld_ref, uWorldModelInverseTranspose_ref) {
    let wmIT = new Matrix4(this.worldMatrix).multiply(this.modelMatrix).invert().transpose();
    gl.uniformMatrix4fv(uWorldModelInverseTranspose_ref, false, wmIT.elements);
    gl.uniform1i(g_uUseLighting_ref, this.useLighting);
    gl.uniform1f(g_uSpecPower_ref, this.specPower);
    gl.uniform3fv(g_uSpecColor_ref, new Float32Array(this.specColor.elements));
    gl.uniformMatrix4fv(uModel_ref, false, this.modelMatrix.elements);
    gl.uniformMatrix4fv(uWorld_ref, false, this.worldMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, this.offset / 3, this.sceneObject.mesh.length / 3);
}

/**
 * Represents a node of an asseembly in the scene with the following properties
 * NOTE: this is moderately unoptimized, in ways that might actually matter
 * offset: the offset of this object within the list of all objects
 * sceneObject: the scene object attached to this model
 * parent: the parent of this node in the scene graph
 * nodeMatrix: the matrix to apply before the parent calculations
 * @param {int} offset 
 * @param {SceneObject} sceneObject 
 * @param {Model|AssemblyNode} parent 
 */
let AssemblyNode = function(offset, sceneObject, parent, useLighting, specPower, specColor) {
    if (typeof offset === "undefined" || offset < 0) {
        throw `Invalid offset ${offset}`;
    }
    if (!(typeof sceneObject === "object" && sceneObject.hasOwnProperty("mesh"))) {
        throw `Invalid sceneObject ${sceneObject}`;
    }
    if (!(typeof parent === "object" && parent.hasOwnProperty("modelMatrix"))) {
        throw `Invalid parent ${parent}`;
    }
    if (typeof useLighting === "undefined") {
        throw `Invalid useLighting ${useLighting}`;
    }
    if (typeof specPower === "undefined" || specPower < 0) {
        throw `Invalid specPower ${specPower}`;
    }
    if (typeof specColor === "undefined") {
        throw `Invalid specColor ${specColor}`;
    }

    this.offset = offset;
    this.sceneObject = sceneObject;
    this.parent = parent;
    this.useLighting = useLighting;
    this.specPower = specPower;
    this.specColor = specColor;
    this.modelMatrix = new Matrix4();
}

/**
 * Returns the matrix result of "placing" this assembly node in the world
 * @returns {[Matrix4, Matrix4]} the model, world matrix of this assembly node
 */
AssemblyNode.prototype.place = function() {
    let result = new Matrix4();
    // Dirty way to check if the parent is a Model or an Assembly Node
    if (this.parent.hasOwnProperty("worldMatrix")) {
        result.multiply(this.parent.modelMatrix);
        result.multiply(this.modelMatrix);
        return [result, this.parent.worldMatrix];
    }
    let [model, world] = this.parent.place();
    result.multiply(model);
    result.multiply(this.modelMatrix);
    return [result, world];
}

/**
 * Draws this node into the scene, setting model and world matrices appropriately
 * 
 * @param {*} uModel_ref 
 * @param {*} uWorld_ref 
 */
AssemblyNode.prototype.draw = function(uModel_ref, uWorld_ref, uWorldModelInverseTranspose_ref) {
    let [modelMatrix, worldMatrix] = this.place();
    let wmIT = new Matrix4(worldMatrix).multiply(modelMatrix).invert().transpose();
    gl.uniformMatrix4fv(uWorldModelInverseTranspose_ref, false, wmIT.elements);
    gl.uniform1i(g_uUseLighting_ref, this.useLighting);
    gl.uniform1f(g_uSpecPower_ref, this.specPower);
    gl.uniform3fv(g_uSpecColor_ref, this.specColor.elements);
    gl.uniformMatrix4fv(uModel_ref, false, modelMatrix.elements);
    gl.uniformMatrix4fv(uWorld_ref, false, worldMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, this.offset / 3, this.sceneObject.mesh.length / 3);
}
//draw gooch

Model.prototype.drawGooch = function(uModel_ref, uWorld_ref, uInverseTranspose_ref) {
    let wmIT = new Matrix4(this.worldMatrix).multiply(this.modelMatrix).invert().transpose();
    gl.uniformMatrix4fv(uInverseTranspose_ref, false, wmIT.elements);
    gl.uniformMatrix4fv(uModel_ref, false, this.modelMatrix.elements);
    gl.uniformMatrix4fv(uWorld_ref, false, this.worldMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, this.offset / 3, this.sceneObject.mesh.length / 3);
}

AssemblyNode.prototype.drawGooch = function(uModel_ref, uWorld_ref, uInverseTranspose_ref) {
    let [modelMatrix, worldMatrix] = this.place();
    let wmIT = new Matrix4(worldMatrix).multiply(modelMatrix).invert().transpose();
    gl.uniformMatrix4fv(uInverseTranspose_ref, false, wmIT.elements);
    gl.uniformMatrix4fv(uModel_ref, false, modelMatrix.elements);
    gl.uniformMatrix4fv(uWorld_ref, false, worldMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, this.offset / 3, this.sceneObject.mesh.length / 3);
}

//draw phong 

// Model draw for Phong
Model.prototype.drawPhong = function(uModel_ref, uWorld_ref, uInverseTranspose_ref, uLight_ref, uSpecPower_ref) {
    // Compute inverse transpose for normals
    let wmIT = new Matrix4(this.worldMatrix).multiply(this.modelMatrix).invert().transpose();

    gl.uniformMatrix4fv(uInverseTranspose_ref, false, wmIT.elements);
    gl.uniformMatrix4fv(uModel_ref, false, this.modelMatrix.elements);
    gl.uniformMatrix4fv(uWorld_ref, false, this.worldMatrix.elements);

    gl.uniform3fv(uLight_ref, g_light.elements);
    gl.uniform1f(uSpecPower_ref, this.specPower || g_specPower);

    gl.drawArrays(gl.TRIANGLES, this.offset / 3, this.sceneObject.mesh.length / 3);
};

// AssemblyNode draw for Phong
AssemblyNode.prototype.drawPhong = function(uModel_ref, uWorld_ref, uInverseTranspose_ref, uLight_ref, uSpecPower_ref) {
    let [modelMatrix, worldMatrix] = this.place();
    let wmIT = new Matrix4(worldMatrix).multiply(modelMatrix).invert().transpose();

    gl.uniformMatrix4fv(uInverseTranspose_ref, false, wmIT.elements);
    gl.uniformMatrix4fv(uModel_ref, false, modelMatrix.elements);
    gl.uniformMatrix4fv(uWorld_ref, false, worldMatrix.elements);

    gl.uniform3fv(uLight_ref, g_light.elements);
    gl.uniform1f(uSpecPower_ref, this.specPower || g_specPower);

    gl.drawArrays(gl.TRIANGLES, this.offset / 3, this.sceneObject.mesh.length / 3);
};






Model.prototype.drawWithProgram = function(prog, uModel, uWorld, uWMIT) {
    gl.useProgram(prog);
    let wmIT = new Matrix4(this.worldMatrix).multiply(this.modelMatrix).invert().transpose();
    gl.uniformMatrix4fv(uWMIT, false, wmIT.elements);
    gl.uniformMatrix4fv(uModel, false, this.modelMatrix.elements);
    gl.uniformMatrix4fv(uWorld, false, this.worldMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, this.offset / 3, this.sceneObject.mesh.length / 3);
};

AssemblyNode.prototype.drawWithProgram = function(prog, uModel_ref, uWorld_ref, uWorldModelInverseTranspose_ref) {
    gl.useProgram(prog);
    let [modelMatrix, worldMatrix] = this.place();
    let wmIT = new Matrix4(worldMatrix).multiply(modelMatrix).invert().transpose();
    gl.uniformMatrix4fv(uWorldModelInverseTranspose_ref, false, wmIT.elements);
    gl.uniformMatrix4fv(uModel_ref, false, modelMatrix.elements);
    gl.uniformMatrix4fv(uWorld_ref, false, worldMatrix.elements);
    if (prog === g_programToon) {
        gl.uniform1f(g_uToonThreshold_ref, 0.3);
    } else {
        gl.uniform1i(g_uUseLighting_ref, this.useLighting);
        gl.uniform1f(g_uSpecPower_ref, this.specPower);
        gl.uniform3fv(g_uSpecColor_ref, this.specColor.elements);
    }
    gl.drawArrays(gl.TRIANGLES, this.offset / 3, this.sceneObject.mesh.length / 3);
};

