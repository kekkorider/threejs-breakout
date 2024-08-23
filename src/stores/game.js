import { defineStore } from 'pinia'

export const useGameStore = defineStore('gameStore', {
  state: () => ({
    score: 0
  }),

  actions: {
    increment() {
      this.score++
    },

    decrement() {
      this.score--
    }
  },

  getters: {
    getScore() {
      return this.score
    },
  },
})
