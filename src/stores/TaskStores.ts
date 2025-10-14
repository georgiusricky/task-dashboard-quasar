import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { TaskService } from '../services/TaskService';
import { TaskModel, type TaskModelParams } from '../models/TaskModel';

const service = TaskService.getInstance();

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<TaskModel[]>(service.list);

  function reload() {
    tasks.value = service.list;
  }

  async function create(data: Partial<TaskModel>) {
    await service.create(new TaskModel(data as TaskModelParams));

    reload();
  }

  async function update(task: TaskModel) {
    await service.update(task);
    reload();
  }

  async function remove(id: string) {
    await service.delete(id);
    reload();
  }

  async function toggle(id: string) {
    await service.toggle(id);
    reload();
  }

  const stats = computed(() => ({
    total: tasks.value.length,
    completed: tasks.value.filter((t) => t.isCompleted).length,
    overdue: tasks.value.filter((t) => t.isOverdue).length,
  }));

  return { tasks, reload, create, update, remove, toggle, stats };
});
