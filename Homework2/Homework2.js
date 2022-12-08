"use strict";
//Paolo Tarantino 1666228

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var texCoordsArray = [];

var bFoliageTexture = false;
var bTreeTexture = false;
var bHeadTexture = false;

var imageFur, imageFoliage, imageTree, imageHead;

//texture
var texture1;
var texture2;
var texture3;
var texture4;
var texCoord = [
    vec2(0, 0),
	vec2(0, 1),
	vec2(1, 1),
	vec2(1, 0), 
	vec2(0.35, 0), 
	vec2(0.5, 1), 
	vec2(0.65, 0)
	
];

var animation = false;
var animation1 = true;
var animation2 = false;
var animation3 = false;

var angleUpper1 = 90.0;
var angleUpper2 = 90.0;
var angleUpper3 = 85.0;
var angleUpper4 = 85.0;
var angleUpper5 = 90.0;
var angleLower1 = 5.0;
var angleLower2 = 5.0;

var v = 0;
var down = false;

var incremento1 = 0.4;
var incremento2 = 0.25;
var incremento3 = 2*incremento1 / 3;
var incremento4 = 0.03;
var incremento5 = 1;
var incremento6 = 0.6;
var incremento7 = 0.2;
var incremento9 = 1.7;
var incremento0 = 0.5;

var angleHead1 = 20;
var angleHead2 = 0;
var angleTail = -30;


var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ), //0
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),  
    vec4( 0.5, -0.5,  0.5, 1.0 ),  //3
    vec4( -0.5, -0.5, -0.5, 1.0 ), //4
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 ),  //7
    vec4( 0.0, 0.5, 0.0, 1.0)
];


var torso1Id = 0;
var torso2Id = 12;
var torso3Id = 13;
var headId  = 1;
var head1Id = 1;
var head2Id = 11;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;
var tailId = 10;

var torsoHeight = 5.5;
var torsoWidth = 3.0;
var upperArmHeight = 3.0;
var lowerArmHeight = 2.6;
var upperArmWidth  = 1.0;
var lowerArmWidth  = 0.7;
var upperLegWidth  = 1.5;
var lowerLegWidth  = 0.9;
var lowerLegHeight = 2.6;
var upperLegHeight = 3.0;
var headHeight = 2.5;
var headWidth = 1.5;
var tailHeight = 1.0;
var tailWidth = 0.5;

var numNodes = 11;

var theta = [75,  20, 85,   0,  85,   0,  95,   0,  95,   0, -30, 0, 90, 0];
		//    t1, h, lua, lla, rua, rla, lul, lll, rul, rll, h2, t2  t3, ta 

var translateArray = [-18.0, 0.6];
var translateArrayY = [-10, torsoHeight-0.5*headHeight-0.3];


var stack = [];

var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var pointsArray = [];

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
		transform: transform,
		render: render,
		sibling: sibling,
		child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();

    switch(Id) {

		case torso1Id:
		case torso2Id:
		case torso3Id:
			m = translate(translateArray[torso1Id], translateArrayY[torso1Id], 0.5);
			m = mult(m, rotate(theta[torso1Id], vec3(1, 0, 0) ));
			m = mult(m, rotate(theta[torso2Id], vec3(0, 0, 1) ));
			m = mult(m, rotate(theta[torso3Id], vec3(1, 0, 0) ));
			figure[torso1Id] = createNode( m, torso, null, headId );
			break;

		case headId:
		case head1Id:
		case head2Id:
			m = translate(0.0, translateArrayY[headId], translateArray[headId]);
			m = mult(m, rotate(theta[head1Id], vec3(1, 0, 0)))
			m = mult(m, rotate(theta[head2Id], vec3(0, 0, 1)));
			figure[headId] = createNode( m, head, leftUpperArmId, null);
			break;
		
		case leftUpperArmId:
			m = translate(-(0.7*torsoWidth), 0.9*torsoHeight, 0.0); 
			m = mult(m, rotate(theta[leftUpperArmId], vec3(1, 0, 0)));
			figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
			break;

		case rightUpperArmId:
			m = translate(0.7*torsoWidth, 0.9*torsoHeight, 0.0);   //posiziona l'oggetto
			m = mult(m, rotate(theta[rightUpperArmId], vec3(1, 0, 0)));
			figure[rightUpperArmId] = createNode( m, rightUpperArm, leftUpperLegId, rightLowerArmId );
			break;

		case leftUpperLegId:
			m = translate(-(0.5*torsoWidth), 0.1*upperLegHeight, 0.0);
			m = mult(m , rotate(theta[leftUpperLegId], vec3(1, 0, 0)));
			figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
			break;

		case rightUpperLegId:
			m = translate(0.5*torsoWidth, 0.1*upperLegHeight, 0.0);
			m = mult(m, rotate(theta[rightUpperLegId], vec3(1, 0, 0)));
			figure[rightUpperLegId] = createNode( m, rightUpperLeg, tailId, rightLowerLegId );
			break;

		case leftLowerArmId:
			m = translate(0.0, upperArmHeight, 0.0);
			m = mult(m, rotate(theta[leftLowerArmId], vec3(1, 0, 0)));
			figure[leftLowerArmId] = createNode( m, leftLowerArm, null, null );
			break;

		case rightLowerArmId:
			m = translate(0.0, upperArmHeight, 0.0);
			m = mult(m, rotate(theta[rightLowerArmId], vec3(1, 0, 0)));
			figure[rightLowerArmId] = createNode( m, rightLowerArm, null, null );
			break;

		case leftLowerLegId:
			m = translate(0.0, upperLegHeight, 0.0);
			m = mult(m, rotate(theta[leftLowerLegId],vec3(1, 0, 0)));
			figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
			break;

		case rightLowerLegId:
			m = translate(0.0, upperLegHeight, 0.0);
			m = mult(m, rotate(theta[rightLowerLegId], vec3(1, 0, 0)));
			figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
			break;
			
		case tailId:
			m = translate(0.0, 0.0, 0.8);
			m = mult(m , rotate(theta[tailId], vec3(1, 0, 0)));
			figure[tailId] = createNode(m, tail, null, null);
			break;
    }

}

function traverse(Id) {

   if(Id == null)
	   return;
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child);
   modelViewMatrix = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function torso() {
	bFoliageTexture = false;
	gl.uniform1f(gl.getUniformLocation(program, "bFoliageTexture"), bFoliageTexture);
	
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale( torsoWidth+1.0, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {
	bHeadTexture = true;
	gl.uniform1f(gl.getUniformLocation(program, "bHeadTexture"), bHeadTexture);
	
    instanceMatrix = mult(modelViewMatrix, translate(0.0, headHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftUpperArm() {
	bHeadTexture = false;
	gl.uniform1f(gl.getUniformLocation(program, "bHeadTexture"), bHeadTexture);
	
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) ); //punto di rotazione spostato alla spalla
	instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight-0.9, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth) );
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight-0.9, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight-0.9, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight-0.9, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function tail(){
	
	instanceMatrix = mult(modelViewMatrix, translate(0.0, -0.5*tailHeight, 0.0));
	instanceMatrix = mult(instanceMatrix, scale(tailWidth, tailHeight, tailWidth));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	for(var i=0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function tree(){
	
	bTreeTexture = true;
	gl.uniform1f(gl.getUniformLocation(program, "bTreeTexture"), bTreeTexture);
	
	instanceMatrix = mult(modelViewMatrix, translate(20.5, -2.0, 0.0));
	instanceMatrix = mult(instanceMatrix, rotate(-15, vec3(1, 0, 0)));
	instanceMatrix = mult(instanceMatrix, scale(2.5, 24, 2.5));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	for(var i=0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function foliage(){
	
	bTreeTexture = false;
	gl.uniform1f(gl.getUniformLocation(program, "bTreeTexture"), bTreeTexture);
	bFoliageTexture = true;
	gl.uniform1f(gl.getUniformLocation(program, "bFoliageTexture"), bFoliageTexture);
	
	instanceMatrix = mult(modelViewMatrix, translate(20.5, 9.0, 10.0));
	instanceMatrix = mult(instanceMatrix, rotate(-15, vec3(1, 0, 0)));
	instanceMatrix = mult(instanceMatrix, scale(9, 15, 9));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.drawArrays(gl.TRIANGLE_FAN, 24, 3);
	gl.drawArrays(gl.TRIANGLE_FAN, 27, 3);
	gl.drawArrays(gl.TRIANGLE_FAN, 30, 3);
	gl.drawArrays(gl.TRIANGLE_FAN, 33, 3);
	
	instanceMatrix = mult(modelViewMatrix, translate(0.0, -14.7, 0.0));
	instanceMatrix = mult(instanceMatrix, rotate(-15, vec3(1, 0, 0)));
	instanceMatrix = mult(instanceMatrix, scale(70, 1, 21));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	for(var i=0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function quad(a, b, c, d) {
    pointsArray.push(vertices[a]);
    pointsArray.push(vertices[b]);
    pointsArray.push(vertices[c]);
    pointsArray.push(vertices[d]);
    
    texCoordsArray.push(texCoord[0]);	
	texCoordsArray.push(texCoord[1]);
	texCoordsArray.push(texCoord[2]);
	texCoordsArray.push(texCoord[3]);
}

function tri(a, b, c){
	pointsArray.push(vertices[a]);
    pointsArray.push(vertices[b]);
    pointsArray.push(vertices[c]);
    
    texCoordsArray.push(texCoord[4]);
	texCoordsArray.push(texCoord[5]);
	texCoordsArray.push(texCoord[6]);
}


function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
    
    tri( 0, 8, 3);
    tri( 3, 8, 7);
    tri( 7, 8, 4);
    tri( 4, 8, 0);
}

function configureTexture( ) { //load the texture
    texture1 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imageFur);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    texture2 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imageFoliage);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
    texture3 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture3);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imageTree);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	
	texture4 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture4);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imageHead);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.6, 0.8, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-30.0, 30.0, -18.0, 18.0, -20.0, 20.0);
    modelViewMatrix = mat4();
	
    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix)  );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix)  );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    cube();

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );
	
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);
	
	imageFur = document.getElementById("texImage1"); //takes the texture from html
    imageFoliage = document.getElementById("texImage2"); //takes the texture from html
    imageTree = document.getElementById("texImage3"); //takes the texture from html
    imageHead = document.getElementById("texImage4"); //takes the texture from html
	
    configureTexture(); //configure the image loaded as a texture for the object
    
    gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture1);
	gl.uniform1i(gl.getUniformLocation(program, "uFurTextureMap"), 0);

	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, texture2);
	gl.uniform1i(gl.getUniformLocation(program, "uFoliageTextureMap"), 1);
	
	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, texture3);
	gl.uniform1i(gl.getUniformLocation(program, "uTreeTextureMap"), 2);
	
	gl.activeTexture(gl.TEXTURE3);
	gl.bindTexture(gl.TEXTURE_2D, texture4);
	gl.uniform1i(gl.getUniformLocation(program, "uHeadTextureMap"), 3);


    for(i=0; i<numNodes; i++) initNodes(i);
	
	document.getElementById("Button0").onclick = function(){ 
		animation = !animation;
		if(animation)
			document.getElementById("Button0").innerText = 'StopAnimation';
		else
			document.getElementById("Button0").innerText = 'StartAnimation';
	};
	
    render();
}

function fWalking(){
	
	if(translateArray[torso1Id] < 15){
		
		translateArray[torso1Id] += 0.035;  //moving bear translating torso
		initNodes(torso1Id);
		
		theta[tailId] = angleTail;   //tail movement
		initNodes(tailId);
		angleTail += incremento2;
		
		theta[leftUpperArmId] = angleUpper1;  // left front up
		initNodes(leftUpperArmId);
		theta[leftLowerArmId] = angleLower1;
		initNodes(leftLowerArmId);
		
		theta[rightUpperArmId] = angleUpper2;  //right front up
		initNodes(rightUpperArmId);
		theta[rightLowerArmId] = angleLower2;
		initNodes(rightLowerArmId);
		
		theta[leftUpperLegId] = angleUpper2;  //left back up
		initNodes(leftUpperLegId);
		theta[leftLowerLegId] = angleLower2;
		initNodes(leftLowerLegId);
		
		theta[rightUpperLegId] = angleUpper1; //right back up
		initNodes(rightUpperLegId);
		theta[rightLowerLegId] = angleLower1;
		initNodes(rightLowerLegId);
		
		angleUpper1 += incremento1;  // front and back are rotated differently
		angleUpper2 -= incremento1;
		
		angleLower1 -= incremento2;
		angleLower2 += incremento2;
		
		if(angleUpper1 < 75 || angleUpper1 > 105){
			incremento1 = -incremento1;
			incremento2 = -incremento2;
		}
		
		theta[head1Id] = angleHead1;  //head movement
		initNodes(head1Id);
		theta[head2Id] = angleHead2;
		initNodes(head2Id);
		
		angleHead1 -= incremento3;
		angleHead2 += incremento3;
		
		if(angleHead1 < 0 || angleHead1 > 20)
			incremento3 = -incremento3;
			
		if(translateArray[torso1Id] >= 15){  //bear under the three, stop translation
			
			animation1 = false;
			animation2 = true;
			
			incremento1 = 0.4;
			
			theta[leftUpperLegId] = 90;
			initNodes(leftUpperLegId);
			theta[leftLowerLegId] = 0;
			initNodes(leftLowerLegId);
			
			theta[rightUpperLegId] = 90;
			initNodes(rightUpperLegId);
			theta[rightLowerLegId] = 0;
			initNodes(rightLowerLegId);
		}
		
	}
	if(translateArray[torso1Id] > 11.5){  //start rotating if next the bear, but still walking
		theta[torso2Id] += 0.6;
		initNodes(torso2Id);
	}
}

function fStandingUp(){  //standing up with the back at the tree
	
	if(theta[torso3Id] > -95 ){      //standing up
		theta[torso3Id] -= incremento1;
		initNodes(torso3Id);
		
		if(translateArray[torso1Id] < 18){     //still translate a bit towards the tree
			translateArray[torso1Id] += 0.04;
			initNodes(torso1Id);
		}
		
		theta[leftUpperLegId] += incremento6;
		initNodes(leftUpperLegId);
		theta[rightUpperLegId] += incremento7;
		initNodes(rightUpperLegId);
		v++;
		if(v==30){
			var inc = incremento6;
			incremento6 = incremento7;
			incremento7 = inc;
			v = 0;
		}
		
		if(theta[leftUpperArmId] < 150){ //positioning front arm
		
			theta[leftUpperArmId] += 1.0;
			initNodes(leftUpperArmId);
			
			theta[rightUpperArmId] += 1.0;
			initNodes(rightUpperArmId);
		}
		
		if(theta[torso3Id] <= -95){  // stood up
			animation3 = true;
			animation2 = false;
			
			theta[leftLowerArmId] = 5;
			initNodes(leftLowerArmId);
			theta[rightLowerArmId] = 5;
			initNodes(rightLowerArmId);
			
			theta[rightUpperArmId] = theta[leftUpperArmId];
			initNodes(rightUpperArmId);
		}
	}
	
	if(theta[torso2Id] < 250){ //rotating with the back at the tree
		
		theta[torso2Id] += 0.8;
		initNodes(torso2Id);
		
		if(angleHead1 < 40){ //positioning the head
			
			theta[head1Id] += 0.4;
			translateArray[headId] += 0.008;
			translateArrayY[headId] += 0.01;
			initNodes(head1Id);
			
			theta[head2Id] = 0;
			initNodes(head2Id);
		}
	}
}

function fScratching(){ //start scratching
	
	theta[leftUpperLegId] -= incremento5;  //rotating leg
	initNodes(leftUpperLegId);
	
	theta[rightUpperLegId] -= incremento5;
	initNodes(rightUpperLegId);
	
	theta[leftLowerLegId] += incremento9;
	initNodes(leftLowerLegId);
	
	theta[rightLowerLegId] += incremento9;
	initNodes(rightLowerLegId);
	
	translateArrayY[torso1Id] -= incremento4;  //up and down of torso
	initNodes(torso1Id);
	
	theta[torso2Id] -= incremento0;   //rotating torso
	initNodes(torso2Id);
	
	theta[leftLowerArmId] += incremento5/2;  //moving "hands"
	initNodes(leftLowerArmId);
	theta[rightLowerArmId] += incremento5/2;
	initNodes(rightLowerArmId);
	
	if(translateArrayY[torso1Id] < -10.5 && !down)
		down=true;
	
	if(down){
		if(translateArrayY[torso1Id] > -10.5 || translateArrayY[torso1Id] < -11.8){
			incremento4 = -incremento4;
			incremento5 = -incremento5;
			incremento9 = -incremento9;
		}
	}
	
	theta[leftUpperArmId] += incremento0;   //moving arms
	initNodes(leftUpperArmId);
	theta[rightUpperArmId] -= incremento0;
	initNodes(rightUpperArmId);
	
	if(theta[torso2Id] < 240 ||  theta[torso2Id] > 260)
		incremento0 = -incremento0;

	theta[head2Id] += 2*incremento0/3;  //rotaing head
	initNodes(head2Id);
}
	

var render = function() {

    gl.clear( gl.COLOR_BUFFER_BIT );
    traverse(torso1Id);
    tree();
    foliage();
	
	if(animation){
		
		if(animation1){
			fWalking();
		}
		
		if(animation2){
			fStandingUp();
		}
		
		if(animation3){
			fScratching();
		}
	}
		
    requestAnimationFrame(render);
}
