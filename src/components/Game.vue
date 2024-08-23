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
import { useWindowSize, useDevicePixelRatio } from '@vueuse/core'
import {
	Scene,
	PerspectiveCamera,
	Mesh,
	BoxGeometry,
	MeshBasicMaterial,
} from 'three'
import { WebGPURenderer } from 'three/webgpu'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { useGameStore } from '@/stores/game'
import { useGSAP } from '@/composables/useGSAP'

import { physics } from '@/assets/js/physics/simulation'
import { Box, Floor, Debug as PhysicsDebug } from '@/assets/js/physics'

const canvasRef = shallowRef(null)
let scene, camera, renderer, mesh, controls, physicsDebug

const { width: windowWidth, height: windowHeight } = useWindowSize()
const { pixelRatio: dpr } = useDevicePixelRatio()

const gameStore = useGameStore()
const { gsap } = useGSAP()

//
// Lifecycle
//
onMounted(async () => {
	await nextTick()

	createScene()
	createCamera()
	createRenderer()

	await physics.init()

	createMesh()
	createFloor()

	physicsDebug = new PhysicsDebug(scene)

	createControls()

	gsap.ticker.add(time => {
		updateScene(time)
		renderer.renderAsync(scene, camera)
	})
})

//
// Watchers
//
watch(dpr, value => {
	renderer.setPixelRatio(value)
})

watch([windowWidth, windowHeight], value => {
	camera.aspect = value[0] / value[1]
	camera.updateProjectionMatrix()

	renderer.setSize(value[0], value[1])
})

//
// Methods
//
function updateScene(time = 0) {
	physics.update()
	physicsDebug.update()
	controls.update()
}

function createScene() {
	scene = new Scene()
}

function createCamera() {
	camera = new PerspectiveCamera(
		75,
		windowWidth.value / windowHeight.value,
		0.1,
		100
	)
	camera.position.set(0, 0, 5)
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

function createMesh() {
	const geometry = new BoxGeometry(1.3, 1, 1.7)
	const material = new MeshBasicMaterial({ color: 0x00ff00 })
	const box = new Mesh(geometry, material)

	box.position.y = 1.5
	box.rotation.set(Math.PI * 0.1, 0, Math.PI * 0.24)

	scene.add(box)
	new Box(box)
}

function createFloor() {
	const geometry = new BoxGeometry(10, 0.1, 10)
	const material = new MeshBasicMaterial({ color: 0x0000ff })
	const floor = new Mesh(geometry, material)

	floor.position.y = -3

	scene.add(floor)
	new Floor(floor)
}
</script>

<style scoped>
.canvas {
	height: 100dvh;
	width: 100dvw;
}
</style>
