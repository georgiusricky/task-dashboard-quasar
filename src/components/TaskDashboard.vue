<template>
  <q-page padding>
    <div class="row items-center q-mb-xl">
      <div class="col">
        <div class="text-h5 text-primary q-mb-sm">Dashboard Overview</div>
        <div class="text-subtitle2 text-grey-6">
          Track your team's progress and performance metrics
        </div>
      </div>
    </div>

    <div class="row stats-overview">
      <StatCard
        v-for="stat in statsConfig"
        :key="stat.key"
        :title="stat.title"
        :value="stat.value"
        :description="stat.description"
        :icon="stat.icon"
        :icon-color="stat.iconColor"
        :text-color="stat.textColor"
        :button-icon="stat.buttonIcon"
        :button-label="stat.buttonLabel"
        :button-color="stat.buttonColor"
        :loading="loading"
        :is-urgent="stat.isUrgent"
        :is-pulsing="stat.isPulsing"
        @click="navigateToTasks(stat.filter)"
      />
    </div>

    <div class="row q-gutter-md">
      <div class="col-12 col-lg-6">
        <q-card class="q-mb-sm">
          <q-card-section>
            <div class="text-h6 q-mb-md">Progress Overview</div>

            <div class="q-mb-lg">
              <div class="text-subtitle2 q-mb-sm">Overall Completion Rate</div>
              <div class="row items-center">
                <div class="col">
                  <q-linear-progress
                    :value="completionPercentage"
                    color="positive"
                    size="xl"
                    class="q-mb-xs"
                  />
                </div>
                <div class="col-auto q-ml-md">
                  <div class="text-h4 text-weight-bold text-positive">
                    {{ Math.round(completionPercentage * 100) }}%
                  </div>
                </div>
              </div>
              <div class="text-caption text-grey-6">
                {{ store.stats.completed }} of {{ store.stats.total }} tasks completed
              </div>
            </div>

            <div>
              <div class="text-subtitle2 q-mb-sm">Tasks by Priority</div>
              <div class="q-gutter-sm">
                <div
                  v-for="priority in priorityBreakdown"
                  :key="priority.name"
                  class="row items-center q-mb-sm"
                >
                  <div>
                    <q-icon :name="priority.icon" :color="priority.color" size="md" />
                  </div>
                  <div class="col">
                    <div class="text-weight-medium">{{ priority.name }}</div>
                    <q-linear-progress
                      :value="priority.count / Math.max(store.stats.pending, 1)"
                      :color="priority.color"
                      size="sm"
                    />
                  </div>
                  <div class="col-auto">
                    <q-badge :color="priority.color" :label="priority.count" />
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Team Performance</div>

            <q-list class="team-performance">
              <q-item v-for="user in userService.getAllUsers()" :key="user.id" class="q-mb-sm">
                <q-item-section avatar>
                  <q-avatar
                    :color="getUserColor(user.id)"
                    text-color="white"
                    class="text-weight-bold"
                  >
                    {{ user.initials }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ user.name }}</q-item-label>
                  <q-item-label caption>{{ user.role }}</q-item-label>
                  <div class="row items-center q-mt-xs">
                    <div class="col">
                      <q-linear-progress
                        :value="getUserCompletionRate(user.id)"
                        color="primary"
                        size="sm"
                      />
                    </div>
                    <div class="col-auto q-ml-sm">
                      <span class="text-caption">{{ getUserTaskCount(user.id) }} tasks</span>
                    </div>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-5">
        <div class="row q-gutter-lg">
          <div class="col-12">
            <q-card>
              <q-card-section>
                <div class="text-h6 q-mb-md">Recent Activity</div>

                <q-timeline dense color="primary">
                  <q-timeline-entry
                    v-for="activity in recentActivity"
                    :key="activity.id"
                    :title="activity.title"
                    :subtitle="activity.time"
                    :icon="activity.icon"
                    :color="activity.color"
                  >
                    <div class="text-body2">{{ activity.description }}</div>
                  </q-timeline-entry>
                </q-timeline>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTaskStore } from '../stores/TaskStores';
import { UserService } from '../services/UserService';
import StatCard from './StatCard.vue';

const router = useRouter();
const store = useTaskStore();
const userService = UserService.getInstance();

const loading = ref(false);

const completionPercentage = computed(() => {
  if (store.stats.total === 0) return 0;
  return store.stats.completed / store.stats.total;
});

const statsConfig = computed(() => [
  {
    key: 'total',
    title: 'Total Tasks',
    value: store.stats.total,
    description: 'All tasks in the system',
    icon: 'assignment',
    iconColor: 'primary',
    textColor: 'primary',
    buttonIcon: 'visibility',
    buttonLabel: 'View All',
    buttonColor: 'primary',
    filter: 'all',
    isUrgent: false,
    isPulsing: false,
  },
  {
    key: 'completed',
    title: 'Completed',
    value: store.stats.completed,
    description: 'Successfully finished tasks',
    icon: 'check_circle',
    iconColor: 'positive',
    textColor: 'positive',
    buttonIcon: 'check_circle',
    buttonLabel: 'View Done',
    buttonColor: 'positive',
    filter: 'completed',
    isUrgent: false,
    isPulsing: false,
  },
  {
    key: 'pending',
    title: 'In Progress',
    value: store.stats.pending,
    description: 'Currently being worked on',
    icon: 'schedule',
    iconColor: 'orange',
    textColor: 'orange',
    buttonIcon: 'schedule',
    buttonLabel: 'View Active',
    buttonColor: 'orange',
    filter: 'pending',
    isUrgent: false,
    isPulsing: false,
  },
  {
    key: 'overdue',
    title: 'Overdue',
    value: store.stats.overdue,
    description: 'Past due date',
    icon: 'warning',
    iconColor: 'negative',
    textColor: 'negative',
    buttonIcon: 'warning',
    buttonLabel: 'Urgent',
    buttonColor: 'negative',
    filter: 'overdue',
    isUrgent: true,
    isPulsing: true,
  },
]);

const priorityBreakdown = computed(() => {
  const breakdown = { high: 0, medium: 0, low: 0 };
  store.tasks.forEach((task) => {
    if (!task.isDeleted && !task.isCompleted) {
      breakdown[task.priority]++;
    }
  });

  return [
    { name: 'High Priority', count: breakdown.high, color: 'red', icon: 'keyboard_arrow_up' },
    { name: 'Medium Priority', count: breakdown.medium, color: 'orange', icon: 'remove' },
    { name: 'Low Priority', count: breakdown.low, color: 'green', icon: 'keyboard_arrow_down' },
  ];
});

const recentActivity = computed(() => {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

  const activities = store.tasks
    .filter((task) => {
      const eventTime =
        task.isDeleted && task.deletedAt
          ? new Date(task.deletedAt).getTime()
          : new Date(task.updatedAt).getTime();
      return eventTime > oneDayAgo;
    })
    .sort((a, b) => {
      const aTime =
        a.isDeleted && a.deletedAt
          ? new Date(a.deletedAt).getTime()
          : new Date(a.updatedAt).getTime();
      const bTime =
        b.isDeleted && b.deletedAt
          ? new Date(b.deletedAt).getTime()
          : new Date(b.updatedAt).getTime();
      return bTime - aTime;
    })
    .slice(0, 5)
    .map((task, index) => ({
      id: `activity_${index}`,
      title: task.isDeleted ? 'Task Deleted' : task.isCompleted ? 'Task Completed' : 'Task Updated',
      description: task.title,
      time: formatRelativeTime(task.isDeleted && task.deletedAt ? task.deletedAt : task.updatedAt),
      icon: task.isDeleted ? 'delete' : task.isCompleted ? 'check_circle' : 'edit',
      color: task.isDeleted ? 'negative' : task.isCompleted ? 'positive' : 'primary',
    }));

  return activities.length > 0
    ? activities
    : [
        {
          id: 'no_activity',
          title: 'No recent activity',
          description: 'Task updates will appear here',
          time: '',
          icon: 'info',
          color: 'grey',
        },
      ];
});

const getUserColor = (userId: string) => {
  const colors = ['primary', 'secondary', 'accent', 'positive', 'negative', 'info', 'warning'];
  const index = userId.charCodeAt(userId.length - 1) % colors.length;
  return colors[index];
};

const getUserTaskCount = (userId: string): string => {
  const userTasks = store.tasks.filter((task) => task.assignedTo === userId && !task.isDeleted);

  const completedCount = userTasks.filter((task) => task.isCompleted).length;
  const totalCount = userTasks.length;

  return `${completedCount}/${totalCount}`;
};

const getUserCompletionRate = (userId: string) => {
  const userTasks = store.tasks.filter((task) => task.assignedTo === userId && !task.isDeleted);
  if (userTasks.length === 0) return 0;
  const completed = userTasks.filter((task) => task.isCompleted).length;
  return completed / userTasks.length;
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const navigateToTasks = async (filter: string) => {
  try {
    await router.push({
      path: '/tasks',
      query: { filter },
    });
  } catch (error) {
    console.error('Navigation failed:', error);
  }
};

onMounted(() => {
  store.reload();
});
</script>

<style scoped>
.stats-overview {
  margin-bottom: 2rem;
}

.row + .row {
  position: relative;
}

.team-performance .q-item {
  transition: all 0.2s ease;
  border-radius: 8px;
  margin-bottom: 4px;
}

.team-performance .q-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: translateX(4px);
}

.q-linear-progress {
  transition: all 0.3s ease;
}

.q-linear-progress:hover {
  transform: scaleY(1.2);
}

.q-timeline-entry {
  transition: all 0.2s ease;
}

.q-timeline-entry:hover {
  transform: translateX(8px);
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  padding: 8px;
  margin: -8px;
}

@media (max-width: 599px) {
  .q-page {
    padding: 12px;
  }
}

.q-inner-loading {
  border-radius: inherit;
}

.q-btn {
  transition: all 0.2s ease;
}

.q-btn:hover {
  transform: translateY(-1px);
}
</style>
