<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h5 text-primary q-mb-sm">Task Manager</div>
        <div class="text-subtitle2 text-grey-6">Manage and organize all your tasks</div>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon="add" label="New Task" @click="createNewTask" unelevated />
      </div>
    </div>

    <!-- Task List Component -->
    <div class="row">
      <div class="col-12">
        <TaskList ref="taskListRef" />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import TaskList from '../components/TaskList.vue';

const route = useRoute();
const taskListRef = ref<InstanceType<typeof TaskList> | null>(null);

const createNewTask = () => {
  if (taskListRef.value) {
    taskListRef.value.createNewTask();
  }
};

onMounted(() => {
  if (route.query.filter && taskListRef.value) {
    taskListRef.value.applyFilter(route.query.filter as string);
  }
});
</script>

<style scoped></style>
