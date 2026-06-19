<script setup lang="ts">
import { computed } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import type { ChartOptions, TooltipItem } from 'chart.js'
import { Bar } from 'vue-chartjs'
import { palette } from '../metrics'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps<{
  labels: string[]
  data: number[]
  highlightIndex?: number | null
  label?: string
}>()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: props.label ?? 'Revenue',
      data: props.data,
      backgroundColor: props.data.map((_, i) =>
        props.highlightIndex == null || props.highlightIndex === i
          ? palette.primary
          : palette.primarySoft,
      ),
      borderRadius: 6,
      maxBarThickness: 48,
    },
  ],
}))

const chartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'bar'>) =>
          ` $${(ctx.parsed.y ?? 0).toLocaleString()}`,
      },
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: palette.ticks } },
    y: {
      grid: { color: palette.grid },
      ticks: {
        color: palette.ticks,
        callback: (v: string | number) => `$${Number(v) / 1000}k`,
      },
    },
  },
}
</script>

<template>
  <div style="height: 300px">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

