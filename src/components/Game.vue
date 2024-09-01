<template>
	<canvas
		class="canvas"
		ref="canvasRef"
		:width="windowWidth"
		:height="windowHeight"
	/>
</template>

<script setup>
import { shallowRef, onMounted, nextTick, watch } from 'vue'
import { useWindowSize, useDevicePixelRatio, useMagicKeys } from '@vueuse/core'
import {
	Scene,
	PerspectiveCamera,
	Mesh,
	InstancedMesh,
	BoxGeometry,
	MeshBasicMaterial,
	InstancedBufferAttribute,
	Object3D,
} from 'three'
import { WebGPURenderer } from 'three/webgpu'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader'

import { Pane } from 'tweakpane'

import { useGameStore } from '@/stores/game'
import { useGSAP } from '@/composables/useGSAP'

import { physics } from '@/assets/js/physics/simulation'
import {
	Box,
	InstancedBlock,
	Floor,
	Debug as PhysicsDebug,
	Player,
	Wall,
} from '@/assets/js/physics'

import { playerMaterial, timeScale } from '@/assets/materials/Player'
import { wallMaterial } from '@/assets/materials/Wall'
import { blockMaterial } from '@/assets/materials/block'

const canvasRef = shallowRef(null)
let scene,
	camera,
	renderer,
	mesh,
	controls,
	physicsDebug,
	player,
	playerBody,
	ballPhysics

const { width: windowWidth, height: windowHeight } = useWindowSize()
const { left: leftKey, a: aKey, right: rightKey, d: dKey } = useMagicKeys()
const { pixelRatio: dpr } = useDevicePixelRatio()

const gameStore = useGameStore()
const { gsap } = useGSAP()

const level = [
	[1, 1, 1, 0, 0, 1, 1],
	[0, 1, 0, 1, 1, 1, 0],
	[1, 0, 1, 0, 0, 1, 1],
]

//
// Lifecycle
//
onMounted(async () => {
	await nextTick()

	createScene()
	createCamera()
	createRenderer()

	await physics.init()

	await loadModel()

	createPlayer()
	createBall()
	createBlocks()

	physicsDebug = new PhysicsDebug(scene)

	createControls()

	createDebug()

	gsap.ticker.add(time => {
		updateScene(time)
		renderer.renderAsync(scene, camera)
	})

	gsap.delayedCall(0.5, () => {
		ballPhysics.rigidBody.setLinvel(
			{ x: gsap.utils.random(-10, 10), y: 0, z: gsap.utils.random(-12, -18) },
			true
		)
	})
})

//
// Watchers
//
watch([windowWidth, windowHeight], value => {
	camera.aspect = value[0] / value[1]
	camera.updateProjectionMatrix()

	renderer.setSize(value[0], value[1])
})

//
// Methods
//
function updateScene(time = 0) {
	const left = leftKey.value || aKey.value ? 1 : 0
	const right = rightKey.value || dKey.value ? 1 : 0
	playerBody.body.setLinvel({ x: (right - left) * 5, y: 0, z: 0 }, true)

	physics.update()
	physicsDebug.update()
	controls.update()
}

async function loadModel() {
	const loader = new GLTFLoader()

	loader.load('/game.glb', gltf => {
		const gameField = gltf.scene.getObjectByName('Game_field')
		gameField.material = wallMaterial

		scene.add(gameField)

		const wallUp = gltf.scene.getObjectByName('Wall_UP')
		const wallDown = gltf.scene.getObjectByName('Wall_DOWN')
		const wallLeft = gltf.scene.getObjectByName('Wall_LEFT')
		const wallRight = gltf.scene.getObjectByName('Wall_RIGHT')

		new Wall(wallUp)
		new Wall(wallDown)
		new Wall(wallLeft)
		new Wall(wallRight)

		return Promise.resolve()
	})
}

function createScene() {
	scene = new Scene()
}

function createCamera() {
	camera = new PerspectiveCamera(
		75,
		windowWidth.value / windowHeight.value,
		0.1,
		500
	)
	camera.position.set(0, 4, 12)
}

function createRenderer() {
	renderer = new WebGPURenderer({
		canvas: canvasRef.value,
		alpha: true,
		antialias: dpr.value === 1,
	})

	renderer.setClearColor(0x121212, 1)
	renderer.setSize(windowWidth.value, windowHeight.value)
}

function createControls() {
	controls = new OrbitControls(camera, renderer.domElement)
	controls.enableDamping = true
}

function createPlayer() {
	const geometry = new BoxGeometry(5, 0.6, 1)
	const material = playerMaterial
	player = new Mesh(geometry, material)

	player.name = 'Player'

	player.position.y = 0.75
	player.position.z = 8

	scene.add(player)
	playerBody = new Player(player)
}

function createBall() {
	const geometry = new BoxGeometry(0.5, 0.5, 0.5)
	const material = new MeshBasicMaterial({ color: 0x00ff00 })
	const ball = new Mesh(geometry, material)

	ball.name = 'Ball'

	ball.position.x = 0
	ball.position.y = 0.75
	ball.position.z = 6.5

	scene.add(ball)
	ballPhysics = new Box(ball)
}

function createBlocks() {
	const dummy = new Object3D()

	const size = 0.75
	const geometry = new BoxGeometry(size, size, size)
	const mesh = new InstancedMesh(geometry, blockMaterial, level.flat().length)

	let row, col

	const startX = (level[0].length - 2) * 0.5
	const startZ = 8

	for (row = 0; row < level.length; row++) {
		for (col = 0; col < level[row].length; col++) {
			const x = col - startX - 0.5
			const y = level[row][col] === 0 ? -2 : 1
			const z = row - startZ

			dummy.position.set(x, y, z)
			dummy.updateMatrix()

			mesh.setMatrixAt(row * level[row].length + col, dummy.matrix)
		}
	}

	mesh.instanceMatrix.needsUpdate = true

	scene.add(mesh)
	new InstancedBlock(mesh)
}

function createDebug() {
	const pane = new Pane()

	pane.addBinding(timeScale, 'value', { label: 'timeScale', min: 0, max: 20 })

	const orthographic = { value: 0 }
	pane
		.addBinding(orthographic, 'value', { label: 'Ortographic', min: 0, max: 1 })
		.on('change', event => {
			const zoom = gsap.utils.mapRange(0, 1, 1, 20, event.value)
			camera.zoom = zoom

			const positionY = gsap.utils.mapRange(0, 1, 4, 20 * 4, event.value)
			camera.position.y = positionY

			const positionZ = gsap.utils.mapRange(0, 1, 12, 20 * 12, event.value)
			camera.position.z = positionZ

			camera.updateProjectionMatrix()
		})
}
</script>

<style scoped>
.canvas {
	height: 100dvh;
	width: 100dvw;
}
</style>
