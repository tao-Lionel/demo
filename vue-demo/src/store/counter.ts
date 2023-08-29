import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const userCounterStore = defineStore("counter", () => {
  const counter = ref(0);

  const double = computed(() => counter.value * 2);

  function increment() {
    counter.value++;
  }

  return { counter, increment, double };
});
