<template>
	<canvas ref="canvasRef"></canvas>
	<p>Current store: {{ gameStore.getScore }}</p>
</template>

<script setup>
import { shallowRef, onMounted, nextTick } from 'vue'
import { useGameStore } from '@/stores/game'

const canvasRef = shallowRef(null)

const gameStore = useGameStore()

onMounted(async () => {
	await nextTick()

	console.log('Game mounted')
})
</script>
