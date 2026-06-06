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
  Filler,
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
  Filler,
)

const props = defineProps<{
  labels: string[]
  data: number[]
  highlightIndex?: number | null
}>()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: 'Conversions',
      data: props.data,
      borderColor: palette.accent,
      backgroundColor: palette.accentSoft,
      tension: 0.35,
      borderWidth: 2,
      fill: true,
      pointRadius: props.data.map((_, i) =>
        props.highlightIndex == null ? 2 : props.highlightIndex === i ? 6 : 1,
      ),
      pointBackgroundColor: palette.accent,
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
        label: (ctx: TooltipItem<'line'>) => ` ${ctx.parsed.y ?? 0}%`,
      },
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: palette.ticks } },
    y: {
      grid: { color: palette.grid },
      ticks: {
        color: palette.ticks,
        callback: (v: string | number) => `${v}%`,
      },
    },
  },
}
</script>

<template>
  <div style="height: 280px">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
