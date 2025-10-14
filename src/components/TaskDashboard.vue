<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">Task Dashboard</div>

    <div class="q-mb-md">
      <q-btn color="primary" label="Add Task" @click="addTask" />
      <q-btn flat label="Reload" @click="store.reload" />
    </div>

    <q-list bordered>
      <q-item v-for="t in store.tasks" :key="t.id">
        <q-item-section avatar>
          <q-btn
            flat
            dense
            round
            icon="check"
            @click="store.toggle(t.id)"
            :color="t.isCompleted ? 'positive' : 'grey'"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ t.title }}</q-item-label>
          <q-item-label caption>{{ t.description }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn dense flat icon="delete" color="negative" @click="store.remove(t.id)" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import { useTaskStore } from '../stores/TaskStores';
import { TaskModel } from '../models/TaskModel';

const store = useTaskStore();

async function addTask() {
  const title = prompt('Task title?');
  if (title) {
    await store.create(new TaskModel({ title }));
  }
}
</script>
