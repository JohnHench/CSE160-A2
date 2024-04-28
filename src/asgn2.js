// asgn2.js
// Vertex shader program
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    void main() {
        gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    }`

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;  
    void main() {
        gl_FragColor = u_FragColor;
    }`


// Global vars for setup
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

// ----- SETUP -----
function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    gl.enable(gl.DEPTH_TEST);
}

// Handles click event
function convertCoordinatesEventToGL(click_event) {
    const rectangle = click_event.target.getBoundingClientRect();
    const x = ((click_event.clientX - rectangle.left) - canvas.width / 2) / (canvas.width / 2);
    const y = (canvas.height / 2 - (click_event.clientY - rectangle.top)) / (canvas.height / 2);
    return [x, y];
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_Modelmatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_Modelmatrix');
        return;
    }

    // Get the storage location of u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    // Initialize identity matrix
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}



// Globals for UI
let global_X = 0;
let global_camera = 0;
let global_Y = 0;

let global_ANIMATE = false;
let ctrl_key = false;
let global_poop_ANIMATED = 0;

let global_front_left = 0;
let global_front_right = 0;
let global_back_left = 0;
let global_back_right = 0;

let global_tongue_base = 0;
let global_tongue_mid = 0;
let global_tongue_tip = 0;

var global_Time = performance.now() / 1000.0;
var global_s = performance.now() / 1000.0 - global_Time;

function addActionForHtmlUI() {
    // Buttons
    document.getElementById('on').addEventListener('click', function () { global_ANIMATE = true; });
    document.getElementById('off').addEventListener('click', function () { global_ANIMATE = false; });

    // Slider Events
    document.getElementById('angleSlide').addEventListener('mousemove', function () { global_camera = this.value; renderScene(); }); 
    document.getElementById('base').addEventListener('mousemove', function () { global_tongue_base = this.value; renderScene(); });
    document.getElementById('mid').addEventListener('mousemove', function () { global_tongue_mid = this.value; renderScene(); });
    document.getElementById('end').addEventListener('mousemove', function () { global_tongue_tip = this.value; renderScene(); });
    document.getElementById('front_Left').addEventListener('mousemove', function () { global_front_left = this.value; renderScene(); });
    document.getElementById('front_Right').addEventListener('mousemove', function () { global_front_right = this.value; renderScene(); });
    document.getElementById('back_Left').addEventListener('mousemove', function () { global_back_left = this.value; renderScene(); });
    document.getElementById('back_Right').addEventListener('mousemove', function () { global_back_right = this.value; renderScene(); });
    
}

// Initialize the initial coordinates
let coordinates_X_Y = [0, 0];

// Main function
function main() {
    // Set up WebGL
    setupWebGL();

    // Connect variables to GLSL
    connectVariablesToGLSL();

    // Add actions for HTML UI elements
    addActionForHtmlUI();

    // Add event listeners for mouse actions
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);

    // Set the clear color and request animation frame
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    requestAnimationFrame(tick);
}

// Function to handle mouse down event
function handleMouseDown(event) {
    // If the left mouse button is clicked, call the click function
    if (event.buttons === 1) {
        click(event, 1);
    } else {
        // Reset the initial coordinates if they are not already [0,0]
        if (coordinates_X_Y[0] !== 0) {
            coordinates_X_Y = [0, 0];
        }
    }
}

// Function to handle mouse move event
function handleMouseMove(event) {
    // If the left mouse button is pressed (buttons = 1), call the click function
    if (event.buttons === 1) {
        click(event, 1);
    } else {
        // Reset the initial coordinates if they are not already [0,0]
        if (coordinates_X_Y[0] !== 0) {
            coordinates_X_Y = [0, 0];
        }
    }
}

// Tick function
let time = 0;
function tick() {
    // Calculate the elapsed time
    global_s = (performance.now() - global_Time) / 1000.0;

    // Update animation angles
    updateAnimationAngles();

    // If ctrl_key is true, animate the poop
    if (ctrl_key) {
        global_poop_ANIMATED -= 0.03;
        time += 0.1;
        
        // Reset animation after a certain duration
        if (time >= 4.0) {
            time = 0;
            ctrl_key = false;
        }
    }

    // Render the scene
    renderScene();

    // Request the next frame
    requestAnimationFrame(tick);
}

function click(click_event) {
    // Update ctrl_key based on whether the Ctrl key is pressed
    ctrl_key = click_event.ctrlKey;

    // Convert mouse event coordinates to WebGL coordinates
    let [x, y] = convertCoordinatesEventToGL(click_event);

    // Calculate the difference between current and initial coordinates
    let deltaX = coordinates_X_Y[0] !== 0 ? coordinates_X_Y[0] - x : 0;
    let deltaY = coordinates_X_Y[0] !== 0 ? coordinates_X_Y[1] - y : 0;

    // Update global rotation angles based on mouse movement
    global_X += deltaX;
    global_Y += deltaY;

    // Reset rotation angles if they exceed 360 degrees
    if (Math.abs(global_X / 360) > 1 || Math.abs(global_Y / 360) > 1) {
        global_X = 0;
        global_Y = 0;
    }

    // Store initial coordinates if it's the first click
    coordinates_X_Y = coordinates_X_Y[0] === 0 ? [x, y] : coordinates_X_Y;
}



// Animations
function updateAnimationAngles() {
    if (global_ANIMATE) {
        const legAmplitude = 25;
        const tongueAmplitude = 2;

        // Calculate angles for leg animation
        global_front_left = legAmplitude * Math.sin(global_s);
        global_front_right = legAmplitude * Math.sin(global_s);
        global_back_left = 10 * Math.sin(global_s);
        global_back_right = 10 * Math.sin(global_s);

        // Calculate angle for tongue animation
        global_tongue_base = tongueAmplitude * Math.sin(global_s);
    }
}

// Drawing + Rendering
function renderScene() {
    var red = [0.65, 0.13, 0.10, 1.0];
    var pink = [1.0, 0.55, 0.6, 1.0];
    var light_pink = [.9, 0.55, 0.6, 1.0]; 
    var brown = [0.5, 0.25, 0.1, 1.0];
    var white = [1, 1, 1, 1.0];
    var black = [0, 0, 0, 1];
    var startTime = performance.now();
    var globalRotMat = new Matrix4().rotate(global_X, 0, 1, 0);

    globalRotMat.rotate(global_camera, 0, 1, 0);
    globalRotMat.rotate(global_Y, -1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clears canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Pig drawing lines 271-401

    // HEAD
    var head = new Cube();
    head.color = pink;
    head.matrix.scale(0.4, 0.4, 0.4);
    head.matrix.translate(-0.5, 0.5, -2);
    head.render();
    
    // Body
    var body = new Cube();
    body.color = pink;
    body.matrix.scale(0.8, 0.5, 0.9);
    body.matrix.translate(-0.5, 0, -0.5);
    body.render();

    // Eyes
    var eyelid_Left = new Cube();
    eyelid_Left.color = black;
    eyelid_Left.matrix.scale(0.07, 0.07, 0.05);
    eyelid_Left.matrix.translate(-3, 5.5, -16.5);
    eyelid_Left.render();

    var eye_Left = new Cube();
    eye_Left.color = white;
    eye_Left.matrix.scale(0.07, 0.07, 0.05);
    eye_Left.matrix.translate(-2, 5.5, -16.5);
    eye_Left.render();

    var eyelid_Right = new Cube();
    eyelid_Right.color = black;
    eyelid_Right.matrix.scale(0.07, 0.07, 0.05);
    eyelid_Right.matrix.translate(2, 5.5, -16.5);
    eyelid_Right.render();
    
    var eye_Right = new Cube();
    eye_Right.color = white;
    eye_Right.matrix.scale(0.07, 0.07, 0.05);
    eye_Right.matrix.translate(1, 5.5, -16.5);
    eye_Right.render();

    // Nose
    var nose = new Cube();
    nose.color = pink;
    nose.matrix.scale(0.2, 0.1, 0.05);
    nose.matrix.translate(-0.5, 2.5, -16.75);
    nose.render();

    var nose_Left = new Cube();
    nose_Left.color = brown;
    nose_Left.matrix.scale(0.0499, 0.0499, 0.05);
    nose_Left.matrix.translate(-2, 5.5, -17);
    nose_Left.render();

    var nose_Right = new Cube();
    nose_Right.color = brown;
    nose_Right.matrix.scale(0.0499, 0.0499, 0.05);
    nose_Right.matrix.translate(1, 5.5, -17);
    nose_Right.render();    
    
    // LEGS
    var legL_front = new Cube();
    legL_front.color = pink;
    legL_front.matrix.rotate(global_front_left, 1, 0, 0);
    legL_front.matrix.scale(0.2, 0.45, 0.2);
    legL_front.matrix.translate(-1.5, -0.6, -2);
    legL_front.render();

    var legR_front = new Cube();
    legR_front.color = pink;
    legR_front.matrix.rotate(-global_front_right, 1, 0, 0);
    legR_front.matrix.scale(0.2, 0.45, 0.2);
    legR_front.matrix.translate(0.5, -0.6, -2);
    legR_front.render();

    var legL_Back = new Cube();
    legL_Back.color = pink;
    legL_Back.matrix.rotate(-global_back_left, 1, 0, 0);
    legL_Back.matrix.scale(0.2, 0.45, 0.2);
    legL_Back.matrix.translate(-1.5, -0.6, 1);
    legL_Back.render();

    var legR_Back = new Cube();
    legR_Back.color = pink;
    legR_Back.matrix.rotate(global_back_right, 1, 0, 0);
    legR_Back.matrix.scale(0.2, 0.45, 0.2);
    legR_Back.matrix.translate(0.5, -0.6, 1);
    legR_Back.render();

    // Tongue
    var tongue_Base = new Cube();
    tongue_Base.color = red;
    tongue_Base.matrix.setRotate(180, 1, 0, 0);
    tongue_Base.matrix.rotate(global_tongue_base, 0, 0, 1);
    var middleCoord = new Matrix4(tongue_Base.matrix);
    tongue_Base.matrix.scale(0.05, 0.05, 0.1);
    tongue_Base.matrix.translate(-0.5, -5.5, 8);
    tongue_Base.render();

    var tongue_Mid = new Cube();
    tongue_Mid.color = red;
    tongue_Mid.matrix = middleCoord;
    tongue_Mid.matrix.rotate(global_tongue_mid, 0, 1, 1);
    var tipCoord = new Matrix4(tongue_Mid.matrix);
    tongue_Mid.matrix.scale(0.05, 0.05, 0.15);
    tongue_Mid.matrix.translate(-0.5, -5.5, 6);
    tongue_Mid.render();

    var tongue_End = new Cube();
    tongue_End.color = red;
    tongue_End.matrix = tipCoord;
    tongue_End.matrix.rotate(global_tongue_tip, 0, 1, 1);
    tongue_End.matrix.scale(0.05, 0.05, 0.05);
    tongue_End.matrix.translate(-0.5, -5.5, 21);
    tongue_End.render();

    // Poop
    var poop = new Cube();
    poop.color = brown;
    poop.matrix.scale(0.05, 0.15, 0.05);
    poop.matrix.translate(-0.75, 1.75, 6);
    poop.matrix.translate(0, global_poop_ANIMATED, 0);
    poop.render()

    // Tail
    var tail = new Cone();
    tail.color = light_pink;
    tail.matrix.rotate(-180,1,0,0);
    tail.matrix.translate(-0.014, -.35, -0.54)
    tail.matrix.scale(1, 1, .5)
    tail.render();

    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration) / 10, "numdot");
    }

    function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}