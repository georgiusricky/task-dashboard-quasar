import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { TaskService } from '../services/TaskService';
import { TaskModel, type TaskModelParams } from '../models/TaskModel';

const service = TaskService.getInstance();

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<TaskModel[]>([...service.list]);

  function reload() {
    tasks.value = [...service.list];
  }

  async function create(data: Partial<TaskModel>) {
    await service.create(new TaskModel(data as TaskModelParams));
    reload();
  }

  async function update(task: TaskModel) {
    const updatedTask = await service.update(task);
    const index = tasks.value.findIndex((t) => t.id === task.id);
    if (index !== -1) {
      tasks.value[index] = updatedTask;
    }
  }

  async function remove(id: string) {
    const updated = await service.delete(id);
    if (updated) {
      const index = tasks.value.findIndex((t) => t.id === id);
      if (index !== -1) {
        tasks.value[index] = updated;
      } else {
        reload();
      }
    }
  }

  async function toggle(id: string) {
    const updatedTask = await service.toggle(id);
    if (updatedTask) {
      const index = tasks.value.findIndex((t) => t.id === id);
      if (index !== -1) {
        tasks.value[index] = updatedTask;
      }
    }
  }

  const stats = computed(() => {
    const active = tasks.value.filter((t) => !t.isDeleted);
    return {
      total: active.length,
      completed: active.filter((t) => t.isCompleted).length,
      pending: active.filter((t) => !t.isCompleted && !t.isOverdue).length,
      overdue: active.filter((t) => t.isOverdue && !t.isCompleted).length,
    };
  });

  return { tasks, reload, create, update, remove, toggle, stats };
});
