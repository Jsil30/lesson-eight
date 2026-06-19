<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <v-app>
    <v-app-bar flat border="b" color="surface">
      <template #prepend>
        <v-icon icon="mdi-dumbbell" color="primary" class="ms-2" />
      </template>
      <v-app-bar-title class="font-weight-bold text-h4">Elevate Fitness Studio</v-app-bar-title>
      <template #extension>
        <v-tabs color="primary" density="compact">
          <v-tab prepend-icon="mdi-view-dashboard-variant" to="/">Dashboard</v-tab>
          <v-tab prepend-icon="mdi-account-group" to="/members">Members</v-tab>
        </v-tabs>
      </template>
    </v-app-bar>
    <router-view />
  </v-app>
</template>
