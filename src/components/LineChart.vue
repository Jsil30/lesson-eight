<script setup lang="ts">
import { computed } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import type { ChartOptions, TooltipItem } from 'chart.js'
import { Line } from 'vue-chartjs'
import { palette } from '../metrics'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
)

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
      label: props.label ?? 'Attendance',
      data: props.data,
      borderColor: palette.secondary,
      backgroundColor: palette.secondarySoft,
      tension: 0.35,
      borderWidth: 2,
      fill: false,
      pointBackgroundColor: props.data.map((_, i) =>
        props.highlightIndex === i ? palette.secondary : palette.secondary,
      ),
      pointRadius: props.data.map((_, i) =>
        props.highlightIndex == null ? 3 : props.highlightIndex === i ? 6 : 2,
      ),
      pointHoverRadius: 6,
    },
  ],
}))

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'line'>) =>
          ` ${(ctx.parsed.y ?? 0).toLocaleString()} ${props.label ?? 'Attendance'}`,  
      },
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: palette.ticks } },
    y: {
      grid: { color: palette.grid },
      ticks: {
        color: palette.ticks,
        callback: (v: string | number) => `${(Number(v) / 1000).toFixed(1)}k`,
      },
    },
  },
}
</script>

<template>
  <div style="height: 300px">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
