import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.144.0/three.module.min.js';
// import { DecalGeometry } from 'https://unpkg.com/three@0.144.0/examples/jsm/geometries/DecalGeometry.js'
import { DecalGeometry } from './DecalGeometry.js'
import OrbitControls from 'https://cdn.jsdelivr.net/npm/threejs-orbit-controls@1.0.3/+esm'

const boxSize = 10
const thickness = 0.4
const boxOW = boxSize + (thickness * 2)
const lidHeight = 2
const boxSideOffset = (boxSize + thickness) / 2
const lidSideOffset = (boxOW + thickness) / 2
const lidOW =	boxOW + (thickness * 2)
const DEGTORAD = Math.PI / 180;

const boxSides = [
	{ rotation: [0, DEGTORAD * 0, 0], position: [0, 0, boxSideOffset] },
	{ rotation: [0, DEGTORAD * 90, 0], position: [boxSideOffset, 0, 0] },
	{ rotation: [0, DEGTORAD * 180, 0], position: [0, 0, boxSideOffset * -1] },
	{ rotation: [0, DEGTORAD * 270, 0], position: [boxSideOffset * -1, 0, 0] }
]
const boxBottom = { 
	rotation: [DEGTORAD * 90, 0, 0], 
	position: [0, (boxSize + thickness) / -2, 0] 
}

const lidSides = [
	{ rotation: [0, DEGTORAD * 0, 0], position: [0, 0, lidSideOffset] },
	{ rotation: [0, DEGTORAD * 90, 0], position: [lidSideOffset, 0, 0] },
	{ rotation: [0, DEGTORAD * 180, 0], position: [0, 0, lidSideOffset * -1] },
	{ rotation: [0, DEGTORAD * 270, 0], position: [lidSideOffset * -1, 0, 0] }
]

const lidTop = { 
	rotation: [DEGTORAD * 90, 0, 0], 
	position: [0, lidHeight / 2, 0] 
}

const offsets = {
	lid: { x: 0, y: boxSize / -2, z: 0 }
}

let camera, scene, renderer, OC;
let mesh;
let box, lid, giftbox
let objects = {}


// ===========================================================


function createBoxSide(boxSide, i) {
	const geometry = new THREE.BoxGeometry(
		i % 2 === 0 ? boxSize : boxOW, 
		boxSize, 
		thickness
	)
	const material = new THREE.MeshLambertMaterial({ color: 0x123456 });

	mesh = new THREE.Mesh( geometry, material );
	mesh.position.set(...boxSide.position)
	mesh.rotation.set(...boxSide.rotation)
	box.add( mesh );
}

function createBoxBottom() {
	const geometry = new THREE.BoxGeometry(boxOW, boxOW, thickness)
	const material = new THREE.MeshLambertMaterial({ color: 0x123456 });

	mesh = new THREE.Mesh( geometry, material );
	mesh.position.set(...boxBottom.position)
	mesh.rotation.set(...boxBottom.rotation)
	box.add( mesh );
}

function createLidSide(lidSide, i) {
	const geometry = new THREE.BoxGeometry(
		i % 2 === 0 ? boxOW : lidOW, 
		lidHeight,
		thickness
	)
	const material = new THREE.MeshLambertMaterial({ color: 0xabcdef });

	mesh = new THREE.Mesh( geometry, material );
	mesh.position.set(...lidSide.position)
	mesh.rotation.set(...lidSide.rotation)
	lid.add( mesh );
}

function createLidTop() {
	const geometry = new THREE.BoxGeometry(lidOW, lidOW, thickness)
	const material = new THREE.MeshLambertMaterial({ color: 0xabcdef });

	mesh = new THREE.Mesh( geometry, material );
	mesh.position.set(...lidTop.position)
	mesh.rotation.set(...lidTop.rotation)
	lid.add( mesh );
}

export function init() {
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xbbbbbb)

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set(10, 10, 20);

	const ambLight = new THREE.AmbientLight()
	scene.add(ambLight)

	const dirLight = new THREE.DirectionalLight()
	dirLight.position.set(10, 10, 10)
	scene.add(dirLight)

	OC = new OrbitControls( camera, renderer.domElement );
	OC.maxPolarAngle = Math.PI * 0.99
	OC.minDistance = 1
	OC.maxDistance = 200
	OC.enableDamping = true
	OC.dampingFactor = 0.33
	OC.zoomSpeed = 0.5
	OC.update();

	giftbox = new THREE.Group()
	box = new THREE.Group()
	box.userData.name = 'box'
	lid = new THREE.Group()
	lid.position.set(0, boxSize / 2, 0)
	lid.userData.name = 'lid'

	giftbox.add(box)
	giftbox.add(lid)
	scene.add(giftbox)

	objects['box'] = box
	objects['lid'] = lid

	boxSides.forEach(createBoxSide)
	createBoxBottom()
	lidSides.forEach(createLidSide)
	createLidTop()
	
	document.body.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize );
}

export function animate() {
	requestAnimationFrame( animate );
	OC.update();
	render()
}

function render() {
	renderer.render( scene, camera );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

export function setColor(object, color) {
	objects[object].traverse(child => {
	  if(child.isMesh) {
	    child.material.color.set(color)
		}
	})
}


// ===========================================================


const stickerNames = [
	'celebrate-svgrepo-com',
	'celebration-entertainment-svgrepo-com',
	'celebration-spark-svgrepo-com',
	'trophy-svgrepo-com'
]
const stickers = {}

const textureLoader = new THREE.TextureLoader()
stickerNames.forEach(name => {
	// does adding onLoad func makes it synchronous?
	textureLoader.load(`./images/${name}.svg`, (image) => {
		stickers[name] = image
		console.log(image)
	})
})

document.addEventListener('alpine:init', () => {
	Alpine.data('colors', () => ({
		boxColor: '#123456',
		lidColor: '#abcdef'
	}))
	Alpine.data('sticker', () => ({
		stickerNames,
		currentSticker: '',
		stickerSize: 0.5
	}))
	console.log('alpine:init')
})

document.addEventListener('mousedown', onMouseDown)
document.addEventListener('mouseup', onMouseUp)


// ===========================================================


const raycaster = new THREE.Raycaster()

// let localPosition = new THREE.Vector3()
let decalSize = new THREE.Vector3(0, 0, 0)
let pointer = { x: 0, y: 0 }
let drawing = false
let currentSticker

export function setDecalSize(_size) {
	decalSize.set(_size, _size, _size)
}

export function setCurrentSticker(sticker) {
	currentSticker = sticker
}

function setPointer(e) {
	pointer.x = ( e.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
}

function getHits(e) {
	setPointer(e)
	raycaster.setFromCamera(pointer, camera)
	return raycaster.intersectObject(giftbox)
}

function onMouseDown(e) {
	if(e.button !== 0 || !currentSticker || e.target.tagName !== 'CANVAS') { return }

	const hits = getHits(e)

	if(hits.length) {
		// console.log(hits)
		drawing = true
		OC.enabled = false
		addDecal(hits[0])
	}
}

function onMouseMove(e) {
	if(!drawing) { return }

	const hits = getHits(e)

	if(hits.length) {
		addDecal(hits[0])
	} else {
		drawing = false
	}
}

function onMouseUp(e) {
	if(e.button !== 0) { return }
	if(drawing) { drawing = false }
	OC.enabled = true
}

function addDecal(hit) {
	const { name } = hit.object.parent.userData
	const offset = offsets[name]
	const position = hit.point.clone()
	const eye = position.clone()
	eye.add(hit.face.normal)

	const rotation = new THREE.Matrix4()
	rotation.lookAt(eye, position, THREE.Object3D.DefaultUp)
	
	const euler = new THREE.Euler()
	euler.setFromRotationMatrix(rotation)

	const geometry = new DecalGeometry(
		hit.object,  
		hit.point, 
		euler, 
		decalSize
	)
	const material = new THREE.MeshStandardMaterial({
		map: stickers[currentSticker],
		color: 'white',
		depthTest: true,
		depthWrite: false,
		polygonOffset: true,
		polygonOffsetFactor: -4
	})
	const decal = new THREE.Mesh(geometry, material)
	decal.receiveShadow = true

	if(offset) {
		decal.position.set(offset.x, offset.y, offset.z)
	}
	
	objects[hit.object.parent.userData.name].add(decal)
	render()
}
