import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const userCounterOptions = defineStore("counterOptions", {
  state: () => {
    return {
      counterA: 0,
    };
  },
});
