<template>
  <div>{{ x }}</div>
  <div>{{ y }}</div>
</template>

<script setup lang="ts">
import { useLocalStorage, useMouse, usePreferredDark } from "@vueuse/core";

// tracks mouse position
const { x, y } = useMouse();

// is user prefers dark theme
const isDark = usePreferredDark();

// persist state in localStorage
const store = useLocalStorage("my-storage", {
  name: "Apple",
  color: "red",
});
</script>

<style scoped lang="scss"></style>
