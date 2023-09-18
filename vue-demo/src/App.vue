<script setup lang="ts">
import testVueUse from "./components/testVueUse.vue";
import testVuex from "./components/testVuex.vue";
import { useStore } from "./storeVuex/index";

const store = useStore();

const setVuex = () => {
  store.commit("setTestVuex");
  console.log(store.state);
  // store.dispatch("testActions", 100);
};
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <testVueUse />
  <testVuex />

  <button @click="setVuex">加</button>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
