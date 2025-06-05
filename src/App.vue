<template>
    <router-view />
</template>

<script setup lang="ts">
</script>

<style>
nav {
  margin-bottom: 10px;
}

nav a {
  margin-right: 10px;
  text-decoration: none;
  color: #42b983;
}

nav a.router-link-exact-active {
  font-weight: bold;
  color: #42b983;
}
</style>
