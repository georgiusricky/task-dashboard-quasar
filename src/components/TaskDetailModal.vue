<template>
  <q-dialog
    v-model="isOpen"
    @hide="onClose"
    :full-width="$q.screen.lt.sm"
    :full-height="$q.screen.lt.sm"
  >
    <q-card :style="$q.screen.lt.sm ? '' : 'min-width: 600px; max-width: 800px'">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Task Details</div>
        <q-space />
        <q-btn icon="edit" flat round dense @click="onEdit" color="primary">
          <q-tooltip>Edit Task</q-tooltip>
        </q-btn>
        <q-btn icon="delete" flat round dense @click="onDelete" color="negative">
          <q-tooltip>Edit Task</q-tooltip>
        </q-btn>
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section v-if="task">
        <div class="q-gutter-md">
          <!-- Title and Status -->
          <div class="row items-start q-gutter-sm">
            <div class="col">
              <div
                class="text-h6 q-mb-xs"
                :class="{ 'text-strikethrough text-grey-6': isCompleted }"
              >
                {{ task.title }}
              </div>

              <div class="row items-center q-gutter-sm">
                <q-chip
                  :color="priorityColor"
                  text-color="white"
                  size="sm"
                  :label="task.priority.toUpperCase()"
                />

                <q-chip
                  :color="isCompleted ? 'positive' : 'grey'"
                  :text-color="isCompleted ? 'white' : 'black'"
                  size="sm"
                  :icon="task.statusIcon"
                  :label="isCompleted ? 'COMPLETED' : 'IN PROGRESS'"
                />

                <q-chip
                  v-if="isOverdue"
                  color="red"
                  text-color="white"
                  size="sm"
                  icon="warning"
                  label="OVERDUE"
                />
              </div>
            </div>

            <div class="col-auto">
              <q-btn
                :icon="task.statusIcon"
                :color="isCompleted ? 'positive' : 'grey'"
                @click="onToggleComplete"
                unelevated
                :label="isCompleted ? 'Completed' : 'Mark Complete'"
              />
            </div>
          </div>

          <!-- Description -->
          <div v-if="task.description">
            <div class="text-subtitle2 text-weight-medium q-mb-xs">Description</div>
            <div class="text-body2">{{ task.description }}</div>
          </div>

          <!-- Task Details Grid -->
          <div class="row q-gutter-md">
            <div class="col-12 col-md-6">
              <q-list>
                <q-item v-if="task.assignedTo">
                  <q-item-section avatar>
                    <q-icon name="person" color="blue-grey" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Assigned To</q-item-label>
                    <q-item-label>{{ getAssigneeName(task.assignedTo) }}</q-item-label>
                    <q-item-label caption>{{ getAssigneeEmail(task.assignedTo) }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item v-if="task.dueDate">
                  <q-item-section avatar>
                    <q-icon name="event" :color="task.isOverdue ? 'negative' : 'blue-grey'" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Due Date</q-item-label>
                    <q-item-label :class="{ 'text-negative': task.isOverdue && !task.isCompleted }">
                      {{ formatFullDate(task.dueDate) }}
                    </q-item-label>
                    <q-item-label caption v-if="isOverdue" class="text-negative">
                      overdue
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <div class="col-12 col-md-6">
              <q-list>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="add" color="blue-grey" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Created</q-item-label>
                    <q-item-label>{{ formatFullDate(task.createdAt) }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-icon name="update" color="blue-grey" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Last Updated</q-item-label>
                    <q-item-label>{{ formatFullDate(task.updatedAt) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import type { TaskModel } from '../models/TaskModel';
import { UserService } from '../services/UserService';
import { TaskModel as TM } from '../models/TaskModel';

interface Props {
  modelValue: boolean;
  task?: TaskModel | null;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'edit', task: TaskModel): void;
  (e: 'delete', taskId: string): void;
  (e: 'toggle', taskId: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  task: null,
});

const emit = defineEmits<Emits>();

const $q = useQuasar();
const userService = UserService.getInstance();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const optimisticCompleted = ref<boolean>(!!(props.task && props.task.isCompleted));

const priorityColor = computed(() => {
  if (!props.task) return 'grey';
  return new TM(props.task).priorityColor;
});

const isOverdue = computed(() => {
  if (!props.task) return false;
  return new TM(props.task).isOverdue;
});

const isCompleted = computed(() => {
  if (!props.task) return false;
  return new TM(props.task).isCompleted;
});
watch(
  () => (props.task ? props.task.isCompleted : false),
  (val) => {
    optimisticCompleted.value = !!val;
  },
);

const onClose = () => {
  emit('update:modelValue', false);
};

const onEdit = () => {
  if (props.task) {
    emit('edit', props.task);
  }
};

const onDelete = () => {
  if (!props.task) return;

  $q.dialog({
    title: 'Confirm Delete',
    message: 'Are you sure you want to delete this task?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    if (props.task) {
      emit('delete', props.task.id);
    }
  });
};

const onToggleComplete = () => {
  if (props.task) {
    optimisticCompleted.value = !optimisticCompleted.value;
    emit('toggle', props.task.id);
  }
};

const getAssigneeName = (userId: string) => {
  const user = userService.getUserById(userId);
  return user ? user.name : 'Unknown';
};

const getAssigneeEmail = (userId: string) => {
  const user = userService.getUserById(userId);
  return user ? user.email : '';
};

const formatFullDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>
