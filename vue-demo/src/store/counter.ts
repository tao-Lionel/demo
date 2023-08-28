import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const userCounterStore = defineStore("counter", () => {
  const count = ref(0);

  const double = computed(() => count.value * 2);

  function increment() {
    count.value++;
  }

  return { count, increment, double };
});
