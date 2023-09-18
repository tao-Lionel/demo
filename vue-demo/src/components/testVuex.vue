<template>
  <h1>测试vuex</h1>

  <h3>{{ testVuex }}</h3>
</template>

<script setup lang="ts">
import { useStore } from "../storeVuex/index";
import { computed } from "vue";

const store = useStore();

console.log(store);

const testVuex = computed(() => store.getters["getTestVuex"]);
</script>

<style scoped lang="scss"></style>
