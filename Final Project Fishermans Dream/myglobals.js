

// Global reference to the webGL context, canvas, and shaders
let g_canvas;
let gl;
let g_vshader;
let g_fshader;

// Global to keep track of the time of the _previous_ frame
let g_lastFrameMS = 0;

// Globals to track if the given list of keys are pressed
let g_keysPressed = {};

// GLSL uniform references
let g_uModel_ref;
let g_uWorld_ref;
let g_uCamera_ref;
let g_uProjection_ref;
let g_uUseTexture_ref;
// Usual Matrices
let g_terrainModelMatrix;
let g_terrainWorldMatrix;
let g_projectionMatrix;

// Keep track of the camera position, always looking at the center of the world
let g_cameraDistance;
let g_cameraAngle;
let g_cameraHeight;

// Terrain Mesh definition
let g_terrainMesh;

// Project 1 objects

//boat object
let g_objMeshBoat;
let g_modelMatrixBoat;
let g_boatZShift = 0.0;

// plane
let g_objMeshBiplane;
let g_biplaneBodyMatrix;
let g_propMatrix;


let g_biplaneBodyMesh;
let g_biplanePropMesh

let g_planeAngle = 0;
let g_planeHeight = 0;   
let g_planeRadius = 1.0; 

//light house
let g_objMeshLighthouse;
let g_modelMatrixLighthouse;

//jellyfish
let g_objMeshJellyfish;
let g_modelMatrixJellyfish;
let g_jellyfishTime = 0;

// shark
//let g_objMeshShark;
let g_objMeshSharkBody;
let g_objMeshSharkTail;
let g_objMeshSharkHead;
let g_objMeshSharkFins;
let g_modelMatrixShark;
let g_modelMatrixSharkBody;
let g_modelMatrixSharkTail;
let g_modelMatrixSharkHead;
let g_modelMatrixSharkFins;
let g_objMeshShark = {
            body: [],       
            tail: [],      
            head: [],   
            fins: []        
        };

//textures
let g_uTexture_ref;
let terrainTexture;
let biplaneTexture;
let lighthouseTexture;
let sharkTexture;
let g_objTexShark;
let g_objTexBiplaneBody;
let g_objTexBiplaneProp;
let g_objTexLighthouse;
let g_biplaneNormals;
let g_sharkNormals;
let g_lighthouseNormals;
let g_biplaneTexture; 
let g_lighthouseTexture;
let g_sharkTexture;
let g_sharkTime = 0;
let g_texturePointerLight;
let g_boatVert, g_biplaneBodyVert, g_biplanePropVert, 
    g_lighthouseVert, g_jellyfishVert, g_jellyfish2Vert,
    g_jellyfish3Vert, sharkVert;
let isFocusing = false;

let g_boatNormals;
let g_objTexBoat;




let g_objTexBiplane;
let g_jellyfishNormals;
let g_objTexJellyfish;

let g_terrainTexPointer;
let g_objTextureCoords = [];


//new lighting

let g_vshaderLight;
let g_fshaderLight;
let g_programLight;

let g_lighting;
let lighthouseLocation;
let g_uUseLighting_ref;
let g_uLight_ref;
let sharkNormalsFlat = [];

//lighting pointers
let g_uModelLight_ref;     
let g_uWorldLight_ref;      
let g_uCameraLight_ref;     
let g_uProjectionLight_ref; 
let g_uColorLight_ref;

let g_uLightLight_ref;      
let g_uUseLightingLight_ref; 
let g_uSpecPowerLight_ref; 
let g_uInverseTransposeLight_ref; 
let g_uWorldModelInverseTranspose_ref;

///camera funcs

let lighthouseTexPointer;
//Animation constants
const ROTATION_SPEED = 0.05;
const PROP_ROTATION_SPEED = 1.0;
const CAMERA_SPEED = .003;
const CAMERA_ROTATION_SPEED = .1;
const CAMERA_ZOOM_SPEED = .05;
const JELLYFISH_AMPLITUDE = 15.0;
// new camera
let cameraPos = new Vector3([0, 3, 5]); 
let cameraFront = new Vector3([0, 0, -1]); 
let cameraUp = new Vector3([0, 1, 0]);
let yaw = -90;  
let pitch = 0;   
const camSpeed = 0.1;
const sensitivity = 0.2; 
let camRight   = new Vector3([1, 0, 0]);
let camUp      = new Vector3([0, 1, 0]);

let focusProgress = 0;  
let startFront = null;
let targetFront = null;

let firstMouse = true;
let lastMouseX = 0;
let lastMouseY = 0;

let driveYaw = 0;
let driveSpeed = 0.05;
let cameraHeightOffset = 1.25;
const DRIVE_HEIGHT = 4;


//flats
let g_uModelFlat_ref;
let g_uWorldFlat_ref;
let g_uCameraFlat_ref;
let g_uProjectionFlat_ref;

// The size in bytes of a floating point
const FLOAT_SIZE = 4;

const KEYS_TO_TRACK = ['w', 'a', 's', 'd', 'r', 'f', 'i', 'j', 'k', 'l'];


const CAMERA_MAX_PITCH = 60;
const CAMERA_MIN_PITCH = -60;
const PLANE_ROTATION_SPEED = .05;
const PROPELLER_ROTATION_SPEED = 1;


// Objects
let g_treeObject;
let g_planeObject;
let g_propellerObject;
let g_jellyfishObject;
let g_terrainObject;

// Models
let g_trees;
let g_plane;
let g_propeller;
let g_jellyfish;
let g_terrain;

// Keep track of the camera position, always looking at the center of the world
let g_cameraPosition;
let g_cameraYaw;
let g_cameraPitch;

let g_boat;
let g_sharkBody;
let g_sharkHead;
let g_sharkTail;
let g_sharkFin;


let g_jellyfish2;
let g_jellyfish3;
let g_jellyfish4;

//skybox 
// Skybox images
let g_skyPosX;
let g_skyPosY;
let g_skyPosZ;
let g_skyNegX;
let g_skyNegY;
let g_skyNegZ;
let g_cubeObject;
let g_cubemapObject;
let g_cubeMesh;

// GLSL uniform references
let g_uProjectionCameraInverseSkybox_ref;
let g_uCubeMapSkybox_ref;
let g_uModelReflection_ref;
let g_uWorldReflection_ref;
let g_uCameraReflection_ref;
let g_uProjectionReflection_ref;
let g_uCubeMapReflection_ref;
let g_uCameraWorldModelInverseTranspose_ref;
let g_uCameraInverse_ref;
let g_cubeMap;
let g_programWater;
let g_uWaterResolution;
let g_uWaterTime;
let g_uWaterMouse;

let g_waterVBO;
let waterPlaneObject;
let g_waterPlane;
let g_waterPlaneObject ;
//toon shaders
  let g_uModel_ref_toon;
    let g_uWorld_ref_toon;
    let g_uCamera_ref_toon;
    let g_uProjection_ref_toon;
    let g_uWMITranspose_ref_toon;
    let g_uLight_ref_toon;
    let g_uToonThreshold_ref;

     let g_uModelGooch_ref;
    let g_uWorldGooch_ref;
    let g_uCameraGooch_ref;
    let g_uProjectionGooch_ref;
    let g_uInverseTransposeGooch_ref;
    let g_uLightGooch_ref;
    let g_uSpecPowerGooch_ref;
    let g_programGooch;
    let g_uWarmColor_ref;
let g_uCoolColor_ref;
let g_uAlpha_ref;
let g_uBeta_ref;
let g_uSpecPower_ref;

//phong

let g_programPhong;
let g_uModelPhong_ref;
let g_uWorldPhong_ref;
let g_uCameraPhong_ref;
let g_uProjectionPhong_ref ;
let g_uModelWorldInverseTransposePhong_ref;
let g_uLightPhong_ref ;

// Get attribute locations
let g_aPositionPhong_ref ;
let g_aNormalPhong_ref ;
let g_DragonObject;
let g_dragon;
let g_DragonBodyObj;
let g_DragonLeftWingObj;
let g_DragonRightWingObj;

let g_dragonBody;
let g_dragonLeftWing;
let f_dragonRightWing;
let g_showBad = false;

let g_sharkBody2;
let g_sharkHead2;
let g_sharkTail2;
let g_sharkFin2;


let g_skyPosX2;
let g_skyPosY2;
let g_skyPosZ2;
let g_skyNegX2;
let g_skyNegY2;
let g_skyNegZ2;

let g_light = new Vector3(10, 10, 10); // initial light position
let g_specPower = 32.0;     
const DATA_TEXTURE_WIDTH = 256;
const DATA_TEXTURE_HEIGHT = 256;

let g_terrainObjectRed;
let g_terrainRed;
