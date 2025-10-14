<template>
  <q-layout view="lHh Lpr lFf">
    <!-- HEADER -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title> Task Management System </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- LEFT DRAWER -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="300" class="bg-grey-1">
      <!-- Tab Panels -->
      <q-tab-panels v-model="activeTab" animated class="bg-grey-1">
        <!-- Navigation Panel -->
        <q-tab-panel name="navigation" class="q-pa-none">
          <q-list padding>
            <q-item clickable v-ripple to="/" exact class="q-mb-xs rounded-borders q-mx-sm">
              <q-item-section avatar>
                <q-icon name="dashboard" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Dashboard</q-item-label>
                <q-item-label caption>Overview & analytics</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/tasks" class="q-mb-xs rounded-borders q-mx-sm">
              <q-item-section avatar>
                <q-icon name="assignment" color="orange" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Task Manager</q-item-label>
                <q-item-label caption>Full task management</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>
      </q-tab-panels>
    </q-drawer>

    <!-- MAIN CONTENT -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const leftDrawerOpen = ref(false);
const activeTab = ref('navigation');

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};
</script>
