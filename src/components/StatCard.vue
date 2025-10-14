<template>
  <div class="col-12 col-md-6 col-lg-3">
    <q-card
      class="text-center stats-card clickable-card q-ma-sm"
      :class="{ 'urgent-card': isUrgent }"
      @click="$emit('click')"
    >
      <q-card-section>
        <q-icon
          :name="icon"
          size="2rem"
          :color="iconColor"
          class="q-mb-sm stats-icon"
          :class="{ 'pulse-animation': isPulsing }"
        />
        <div class="text-h3 text-weight-bold counter-animation" :class="`text-${textColor}`">
          {{ value }}
        </div>
        <div class="text-h7 text-grey-7">{{ title }}</div>
        <div class="text-caption text-grey-5">{{ description }}</div>
        <div class="card-actions q-mt-sm">
          <q-btn
            flat
            dense
            size="sm"
            :icon="buttonIcon"
            :label="buttonLabel"
            :color="buttonColor"
            @click.stop="$emit('click')"
          />
        </div>
      </q-card-section>
      <q-inner-loading :showing="loading" />
    </q-card>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  value: number;
  description: string;
  icon: string;
  iconColor: string;
  textColor: string;
  buttonIcon: string;
  buttonLabel: string;
  buttonColor: string;
  loading?: boolean;
  isUrgent?: boolean;
  isPulsing?: boolean;
}

interface Emits {
  (e: 'click'): void;
}

withDefaults(defineProps<Props>(), {
  loading: false,
  isUrgent: false,
  isPulsing: false,
});

defineEmits<Emits>();
</script>

<style scoped>
.stats-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.clickable-card {
  cursor: pointer;
}

.stats-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
}

.urgent-card {
  border-left: 4px solid #f44336;
}

.urgent-card:hover {
  border-left-width: 6px;
}

.stats-icon {
  transition: all 0.3s ease;
}

.stats-card:hover .stats-icon {
  transform: scale(1.1) rotate(5deg);
}

.counter-animation {
  transition: all 0.5s ease;
}

.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.card-actions {
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.stats-card:hover .card-actions {
  opacity: 1;
  transform: translateY(0);
}

.stats-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.stats-card:hover::before {
  left: 100%;
}

@media (max-width: 599px) {
  .stats-card:hover {
    transform: translateY(-4px) scale(1.01);
  }
}
</style>
