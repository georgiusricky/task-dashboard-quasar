<template>
  <q-item :class="itemClass" class="q-px-sm q-py-xs">
    <q-item-section avatar>
      <q-btn
        flat
        dense
        round
        :icon="task.statusIcon"
        @click.stop="$emit('toggle', task.id)"
        :color="task.isCompleted ? 'positive' : 'grey'"
        size="sm"
      />
    </q-item-section>

    <q-item-section @click="$emit('click', task)" style="cursor: pointer">
      <q-item-label
        :class="{ 'text-strikethrough text-grey-6': task.isCompleted }"
        class="text-weight-medium text-caption"
      >
        {{ task.title }}
      </q-item-label>
      <q-item-label caption lines="1" class="text-caption">
        {{ task.description }}
      </q-item-label>

      <div class="row items-center q-gutter-xs q-mt-xs">
        <q-chip
          :color="task.priorityColor"
          text-color="white"
          size="xs"
          :label="task.priority.charAt(0).toUpperCase()"
        />

        <q-chip
          v-if="task.isOverdue && !task.isCompleted"
          color="red"
          text-color="white"
          size="xs"
          icon="warning"
          dense
          class="q-px-sm"
          label="Overdue"
        />

        <q-chip
          v-if="task.dueDate"
          color="grey-4"
          text-color="grey-8"
          size="xs"
          icon="event"
          :label="formatDate(task.dueDate)"
        />

        <q-chip
          v-if="task.assignedTo"
          color="blue-grey-2"
          text-color="blue-grey-8"
          size="xs"
          :label="getAssigneeInitials(task.assignedTo)"
        />
      </div>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TaskModel } from '../models/TaskModel';
import { UserService } from '../services/UserService';

const props = defineProps<{ task: TaskModel }>();

defineEmits<{
  (e: 'toggle', id: string): void;
  (e: 'click', task: TaskModel): void;
}>();

const userService = UserService.getInstance();

const itemClass = computed(() => ({
  'bg-red-1': props.task.isOverdue && !props.task.isCompleted,
  'bg-grey-2': props.task.isCompleted,
}));

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const getAssigneeInitials = (userId: string) => {
  const user = userService.getUserById(userId);
  return user ? user.initials : '?';
};
</script>

<style scoped>
.q-item {
  border-radius: 4px;
  margin-bottom: 2px;
}

.q-item:hover {
  background-color: #f5f5f5;
}

.q-item.bg-red-1:hover {
  background-color: #ffebee;
}

.q-item.bg-grey-2:hover {
  background-color: #eeeeee;
}
</style>
