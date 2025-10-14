<template>
  <q-dialog
    v-model="isOpen"
    @hide="onClose"
    persistent
    :full-width="$q.screen.lt.sm"
    :full-height="$q.screen.lt.sm"
  >
    <q-card :style="$q.screen.lt.sm ? '' : 'min-width: 500px; max-width: 700px'">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ isEditing ? 'Edit Task' : 'Create New Task' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" ref="formRef" class="q-gutter-md">
          <q-input
            filled
            v-model="formData.title"
            label="Task Title *"
            :rules="[(val) => !!val || 'Title is required']"
            lazy-rules
          />

          <q-input
            filled
            v-model="formData.description"
            label="Description"
            type="textarea"
            rows="3"
          />

          <div class="row q-gutter-md">
            <div class="col">
              <q-select
                filled
                v-model="formData.priority"
                :options="priorityOptions"
                label="Priority"
                emit-value
                map-options
              />
            </div>
            <div class="col">
              <q-input filled v-model="formData.dueDate" label="Due Date" type="date" />
            </div>
          </div>

          <q-select
            filled
            v-model="formData.assignedTo"
            :options="userOptions"
            label="Assign to"
            emit-value
            map-options
            option-label="name"
            option-value="id"
            clearable
          />

          <div class="row justify-end q-gutter-sm q-pt-md">
            <q-btn label="Cancel" color="grey" flat @click="onClose" />
            <q-btn label="Save" type="submit" color="primary" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { QForm } from 'quasar';
import type { TaskModel, Priority } from '../models/TaskModel';
import { UserService } from '../services/UserService';

interface Props {
  modelValue: boolean;
  task?: TaskModel | null;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'save', task: Partial<TaskModel>): void;
}

const props = withDefaults(defineProps<Props>(), {
  task: null,
});

const emit = defineEmits<Emits>();

const userService = UserService.getInstance();
const formRef = ref<QForm>();
const loading = ref(false);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const isEditing = computed(() => !!props.task);

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

const userOptions = computed(() => {
  return userService.getAllUsers().map((user) => ({
    id: user.id,
    name: user.name,
    label: user.name,
    value: user.id,
  }));
});

const formData = ref({
  title: '',
  description: '',
  priority: 'medium' as Priority,
  dueDate: '' as string,
  assignedTo: null as string | null,
});

watch(
  [() => props.modelValue, () => props.task],
  () => {
    if (props.modelValue) {
      if (props.task) {
        formData.value = {
          title: props.task.title,
          description: props.task.description,
          priority: props.task.priority,
          dueDate: (props.task.dueDate ? props.task.dueDate.split('T')[0] : '') as string,
          assignedTo: props.task.assignedTo,
        };
      } else {
        formData.value = {
          title: '',
          description: '',
          priority: 'medium',
          dueDate: '',
          assignedTo: null,
        };
      }
    }
  },
  { immediate: true },
);

const onSubmit = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  loading.value = true;
  try {
    const taskData: Partial<TaskModel> = {
      ...formData.value,
      dueDate: formData.value.dueDate || null,
    };

    if (isEditing.value && props.task) {
      taskData.id = props.task.id;
    }

    emit('save', taskData);
    onClose();
  } finally {
    loading.value = false;
  }
};

const onClose = () => {
  emit('update:modelValue', false);
};
</script>
