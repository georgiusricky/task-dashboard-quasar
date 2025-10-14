<template>
  <q-card flat bordered class="task-column">
    <q-expansion-item v-model="open" header-class="column-header">
      <template #header>
        <div class="row items-center justify-between full-width">
          <div :class="['text-subtitle2', textColorClass]">
            <q-icon :name="icon" :color="badgeColor" class="q-mr-sm" /> {{ title }}
          </div>
          <div class="row items-center q-gutter-xs">
            <q-badge :color="badgeColor" :label="items.length" />
          </div>
        </div>
      </template>

      <q-list separator class="column-list">
        <template v-if="items.length">
          <TaskItem
            v-for="task in items"
            :key="task.id"
            :task="task"
            @toggle="$emit('toggle', $event)"
            @click="$emit('itemClick', task)"
          />
        </template>
        <div v-else class="text-caption text-grey-6 q-pa-sm">{{ emptyText }}</div>
      </q-list>
    </q-expansion-item>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { TaskModel } from '../models/TaskModel';
import TaskItem from './TaskItem.vue';

const props = withDefaults(
  defineProps<{
    title: string;
    icon: string;
    color: string;
    items: TaskModel[];
    emptyText: string;
    defaultOpen?: boolean;
  }>(),
  {
    defaultOpen: true,
  },
);

defineEmits<{
  (e: 'toggle', id: string): void;
  (e: 'itemClick', task: TaskModel): void;
}>();

const open = ref(props.defaultOpen);
const badgeColor = computed(() => props.color);
const textColorClass = computed(() => {
  if (props.color === 'negative') return 'text-negative';
  if (props.color === 'positive') return 'text-positive';
  if (props.color === 'orange') return 'text-orange-9';
  return `text-${props.color}`;
});
</script>

<style scoped>
.column-header {
  position: sticky;
  top: 0;
  z-index: 1;
  background: rgb(199, 197, 197);
}

.q-expansion-item__toggle-icon {
  display: none !important;
}
</style>
