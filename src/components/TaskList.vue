<template>
  <div class="task-list-container">
    <!-- Search and Filters Row -->
    <div class="row q-gutter-sm">
      <div class="col-12 col-md-4">
        <q-input v-model="searchText" filled placeholder="Search tasks..." debounce="300" dense>
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append v-if="searchText">
            <q-btn flat round dense icon="clear" @click="searchText = ''" />
          </template>
        </q-input>
      </div>

      <div class="col-6 col-md-2">
        <q-select
          v-model="filterPriority"
          :options="priorityFilterOptions"
          filled
          label="Priority"
          clearable
          emit-value
          map-options
          dense
        />
      </div>

      <div class="col-6 col-md-2">
        <q-select
          v-model="filterStatus"
          :options="statusFilterOptions"
          filled
          label="Status"
          clearable
          emit-value
          map-options
          dense
        />
      </div>

      <div class="col-12 col-md-3">
        <q-select
          v-model="filterAssignee"
          :options="assigneeFilterOptions"
          filled
          label="Assignee"
          clearable
          emit-value
          map-options
          dense
        />
      </div>
    </div>

    <!-- Quick View Filters -->
    <div class="q-mb-md">
      <div class="text-subtitle2 q-mb-xs">Quick Filters</div>
      <div class="q-gutter-xs">
        <q-btn
          :color="currentView === 'all' ? 'primary' : 'grey-4'"
          :text-color="currentView === 'all' ? 'white' : 'grey-8'"
          icon="list"
          label="All"
          @click="setView('all')"
          :unelevated="currentView === 'all'"
          :outline="currentView !== 'all'"
          size="sm"
          no-caps
        />
        <q-btn
          :color="currentView === 'today' ? 'orange' : 'grey-4'"
          :text-color="currentView === 'today' ? 'white' : 'grey-8'"
          icon="today"
          label="Today"
          @click="setView('today')"
          :unelevated="currentView === 'today'"
          :outline="currentView !== 'today'"
          size="sm"
          no-caps
        />
        <q-btn
          :color="currentView === 'overdue' ? 'negative' : 'grey-4'"
          :text-color="currentView === 'overdue' ? 'white' : 'grey-8'"
          icon="warning"
          label="Overdue"
          @click="setView('overdue')"
          :unelevated="currentView === 'overdue'"
          :outline="currentView !== 'overdue'"
          size="sm"
          no-caps
        />
        <q-btn
          :color="currentView === 'completed' ? 'positive' : 'grey-4'"
          :text-color="currentView === 'completed' ? 'white' : 'grey-8'"
          icon="check_circle"
          label="Done"
          @click="setView('completed')"
          :unelevated="currentView === 'completed'"
          :outline="currentView !== 'completed'"
          size="sm"
          no-caps
        />
        <q-btn
          :color="currentView === 'high' ? 'red' : 'grey-4'"
          :text-color="currentView === 'high' ? 'white' : 'grey-8'"
          icon="priority_high"
          label="High"
          @click="setView('high')"
          :unelevated="currentView === 'high'"
          :outline="currentView !== 'high'"
          size="sm"
          no-caps
        />
      </div>
    </div>

    <!-- Task Board -->
    <div class="task-board">
      <div class="text-caption text-grey-7 q-mb-sm">
        {{ filteredTasks.length }} Task{{ filteredTasks.length !== 1 ? 's' : '' }}
        <span v-if="searchText || hasActiveFilters"> (filtered from {{ store.stats.total }}) </span>
      </div>

      <div class="row q-col-gutter-md board-row">
        <div class="col-12 col-md-4">
          <TaskColumn
            :key="'pending-' + boardVersion"
            title="In Progress"
            icon="schedule"
            color="orange"
            :items="groupedTasks.pending"
            empty-text="No in-progress tasks"
            @toggle="store.toggle"
            @itemClick="showTaskDetail"
          />
        </div>

        <div class="col-12 col-md-4">
          <TaskColumn
            :key="'overdue-' + boardVersion"
            title="Overdue"
            icon="warning"
            color="negative"
            :items="groupedTasks.overdue"
            empty-text="No overdue tasks"
            @toggle="store.toggle"
            @itemClick="showTaskDetail"
          />
        </div>

        <div class="col-12 col-md-4">
          <TaskColumn
            :key="'completed-' + boardVersion"
            title="Completed"
            icon="check_circle"
            color="positive"
            :items="groupedTasks.completed"
            empty-text="No completed tasks"
            @toggle="store.toggle"
            @itemClick="showTaskDetail"
          />
        </div>
      </div>
    </div>

    <!-- Task Modals -->
    <TaskModal v-model="showCreateModal" :task="editingTask" @save="onTaskSave" />

    <TaskDetailModal
      v-model="showDetailModal"
      :task="detailTask"
      @edit="onTaskDetailEdit"
      @delete="onTaskDetailDelete"
      @toggle="onTaskDetailToggle"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useTaskStore } from '../stores/TaskStores';
import type { TaskModel, Priority } from '../models/TaskModel';
import { UserService } from '../services/UserService';
import TaskModal from './TaskModal.vue';
import TaskDetailModal from './TaskDetailModal.vue';
import TaskColumn from './TaskColumn.vue';

const $q = useQuasar();
const store = useTaskStore();
const userService = UserService.getInstance();

const showCreateModal = ref(false);
const showDetailModal = ref(false);
const editingTask = ref<TaskModel | null>(null);
const detailTask = ref<TaskModel | null>(null);
const loading = ref(false);
const boardVersion = ref(0);

const forceRefreshBoard = () => {
  boardVersion.value++;
};

const searchText = ref('');
const filterPriority = ref<Priority | null>(null);
const filterStatus = ref<string | null>(null);
const filterAssignee = ref<string | null>(null);
const currentView = ref<string>('all');

const priorityFilterOptions = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

const statusFilterOptions = [
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Overdue', value: 'overdue' },
];

const assigneeFilterOptions = computed(() =>
  userService.getAllUsers().map((user) => ({
    label: user.name,
    value: user.id,
  })),
);

const hasActiveFilters = computed(
  () => !!(searchText.value || filterPriority.value || filterStatus.value || filterAssignee.value),
);

const filteredTasks = computed(() => {
  let tasks = store.tasks.filter((t) => !t.isDeleted);

  switch (currentView.value) {
    case 'today': {
      const today = new Date().toDateString();
      tasks = tasks.filter(
        (task) =>
          task.dueDate && new Date(task.dueDate).toDateString() === today && !task.isCompleted,
      );
      break;
    }
    case 'overdue':
      tasks = tasks.filter((task) => task.isOverdue && !task.isCompleted);
      break;
    case 'completed':
      tasks = tasks.filter((task) => task.isCompleted);
      break;
    case 'high':
      tasks = tasks.filter((task) => task.priority === 'high' && !task.isCompleted);
      break;
  }

  if (searchText.value) {
    const search = searchText.value.toLowerCase();
    tasks = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search),
    );
  }

  if (filterPriority.value) {
    tasks = tasks.filter((task) => task.priority === filterPriority.value);
  }

  if (filterStatus.value) {
    switch (filterStatus.value) {
      case 'completed':
        tasks = tasks.filter((task) => task.isCompleted);
        break;
      case 'pending':
        tasks = tasks.filter((task) => !task.isCompleted && !task.isOverdue);
        break;
      case 'overdue':
        tasks = tasks.filter((task) => task.isOverdue && !task.isCompleted);
        break;
    }
  }

  if (filterAssignee.value) {
    tasks = tasks.filter((task) => task.assignedTo === filterAssignee.value);
  }

  const priorityOrder = { high: 3, medium: 2, low: 1 };
  return tasks.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    if (priorityOrder[a.priority] !== priorityOrder[b.priority])
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    if (a.dueDate && b.dueDate)
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    return 0;
  });
});

const filteredTasksAllStatuses = computed(() => {
  let tasks = store.tasks.filter((t) => !t.isDeleted);

  if (searchText.value) {
    const search = searchText.value.toLowerCase();
    tasks = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search),
    );
  }

  if (filterPriority.value) {
    tasks = tasks.filter((task) => task.priority === filterPriority.value);
  }

  if (filterAssignee.value) {
    tasks = tasks.filter((task) => task.assignedTo === filterAssignee.value);
  }

  const priorityOrder = { high: 3, medium: 2, low: 1 };
  return tasks.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    if (priorityOrder[a.priority] !== priorityOrder[b.priority])
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    if (a.dueDate && b.dueDate)
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    return 0;
  });
});

const groupedTasks = computed(() => {
  const tasks = filteredTasks.value;
  const allStatusTasks = filteredTasksAllStatuses.value;
  return {
    overdue: tasks.filter((t) => t.isOverdue && !t.isCompleted),
    pending: tasks.filter((t) => !t.isCompleted && !t.isOverdue),
    completed: allStatusTasks.filter((t) => t.isCompleted),
  };
});

const setView = (view: string) => {
  currentView.value = view;
  if (view !== 'all') {
    searchText.value = '';
    filterPriority.value = null;
    filterStatus.value = null;
    filterAssignee.value = null;
  }
};

const showTaskDetail = (task: TaskModel) => {
  loading.value = true;
  try {
    store.reload();
    const latestTask = store.tasks.find((t) => t.id === task.id);
    if (latestTask) {
      detailTask.value = { ...latestTask };
      showDetailModal.value = true;
    } else {
      $q.notify({ type: 'warning', message: 'Task not found or deleted', position: 'top' });
    }
  } finally {
    loading.value = false;
  }
};

const onTaskSave = async (taskData: Partial<TaskModel>) => {
  loading.value = true;
  try {
    if (editingTask.value) {
      const updatedTask = { ...editingTask.value, ...taskData };
      await store.update(updatedTask as TaskModel);
    } else {
      await store.create(taskData);
    }
    store.reload();
    $q.notify({ type: 'positive', message: 'Task saved successfully', position: 'top' });
    forceRefreshBoard();
    showDetailModal.value = false;
  } catch (err) {
    console.error(err);
    $q.notify({ type: 'negative', message: 'Failed to save task', position: 'top' });
  } finally {
    loading.value = false;
    editingTask.value = null;
  }
};

const onTaskDetailEdit = (task: TaskModel) => {
  editingTask.value = task;
  showCreateModal.value = true;
  showDetailModal.value = false;
};

const onTaskDetailDelete = async (taskId: string) => {
  await store.remove(taskId);
  store.reload();
  $q.notify({ type: 'positive', message: 'Task deleted successfully', position: 'top' });
  forceRefreshBoard();
  showDetailModal.value = false;
};

const onTaskDetailToggle = async (taskId: string) => {
  await store.toggle(taskId);
  store.reload();
  forceRefreshBoard();
  detailTask.value = store.tasks.find((t) => t.id === taskId) || null;
};

const applyFilter = (filter: string) => {
  searchText.value = '';
  filterPriority.value = null;
  filterStatus.value = null;
  filterAssignee.value = null;
  switch (filter) {
    case 'completed':
      setView('completed');
      break;
    case 'pending':
      filterStatus.value = 'pending';
      setView('all');
      break;
    case 'overdue':
      setView('overdue');
      break;
    case 'high':
      setView('high');
      break;
    case 'today':
      setView('today');
      break;
    default:
      setView('all');
  }
};

const createNewTask = () => {
  editingTask.value = null;
  showCreateModal.value = true;
};

defineExpose({
  applyFilter,
  createNewTask,
});

onMounted(() => {
  store.reload();
});
</script>

<style scoped>
.task-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.task-board {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.board-row {
  height: auto;
}
</style>
