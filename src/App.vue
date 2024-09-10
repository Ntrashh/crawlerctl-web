<script setup>
import { RouterLink, RouterView } from "vue-router";
import Login from "@/components/Login.vue";
</script>

<template>
  <header>
    <div class="wrapper">
      <Login />
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

</style>
