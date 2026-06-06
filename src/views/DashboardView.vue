<script setup lang="ts">
import { computed, ref } from 'vue'
import BarChart from '../components/BarChart.vue'
import LineChart from '../components/LineChart.vue'
import AreaChart from '../components/AreaChart.vue'
import type { MonthMetric } from '../metrics'
import rawMetrics from '../data/metrics.json'

const metrics = rawMetrics as MonthMetric[]
const labels = metrics.map((m) => m.month)

const ALL = 'All'
const selectedMonth = ref<string>(ALL)
const monthOptions = [ALL, ...labels]

const isAll = computed(() => selectedMonth.value === ALL)
const selectedIndex = computed(() =>
  isAll.value ? -1 : metrics.findIndex((m) => m.month === selectedMonth.value),
)
const highlightIndex = computed(() =>
  selectedIndex.value < 0 ? null : selectedIndex.value,
)

// Chart series (always full year; charts highlight the selected month)
const revenueData = metrics.map((m) => m.revenue)
const visitorsData = metrics.map((m) => m.visitors)
const conversionsData = metrics.map((m) => m.conversions)

// Formatting helpers
const fmtCurrency = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`
const fmtNumber = (n: number) => Math.round(n).toLocaleString('en-US')
const fmtPercent = (n: number) => `${n.toFixed(1)}%`

interface SummaryCard {
  title: string
  icon: string
  color: string
  value: string
  delta: number | null
}

const summaryCards = computed<SummaryCard[]>(() => {
  if (isAll.value) {
    const totalRevenue = metrics.reduce((s, m) => s + m.revenue, 0)
    const totalVisitors = metrics.reduce((s, m) => s + m.visitors, 0)
    const totalOrders = metrics.reduce((s, m) => s + m.orders, 0)
    const avgConversion =
      metrics.reduce((s, m) => s + m.conversions, 0) / metrics.length
    return [
      { title: 'Total Revenue', icon: 'mdi-currency-usd', color: 'primary', value: fmtCurrency(totalRevenue), delta: null },
      { title: 'Total Visitors', icon: 'mdi-account-group', color: 'secondary', value: fmtNumber(totalVisitors), delta: null },
      { title: 'Avg. Conversion', icon: 'mdi-trending-up', color: 'accent', value: fmtPercent(avgConversion), delta: null },
      { title: 'Total Orders', icon: 'mdi-cart', color: 'info', value: fmtNumber(totalOrders), delta: null },
    ]
  }

  const i = selectedIndex.value
  const cur = metrics[i]
  const prev = i > 0 ? metrics[i - 1] : null
  const delta = (now: number, before: number | undefined) =>
    prev && before ? ((now - before) / before) * 100 : null

  return [
    { title: 'Revenue', icon: 'mdi-currency-usd', color: 'primary', value: fmtCurrency(cur.revenue), delta: delta(cur.revenue, prev?.revenue) },
    { title: 'Visitors', icon: 'mdi-account-group', color: 'secondary', value: fmtNumber(cur.visitors), delta: delta(cur.visitors, prev?.visitors) },
    { title: 'Conversion', icon: 'mdi-trending-up', color: 'accent', value: fmtPercent(cur.conversions), delta: delta(cur.conversions, prev?.conversions) },
    { title: 'Orders', icon: 'mdi-cart', color: 'info', value: fmtNumber(cur.orders), delta: delta(cur.orders, prev?.orders) },
  ]
})

const periodLabel = computed(() =>
  isAll.value ? 'Full year 2025' : `${selectedMonth.value} 2025`,
)
</script>

<template>
  <v-app-bar flat border="b" color="surface">
    <template #prepend>
      <v-icon icon="mdi-view-dashboard-variant" color="primary" class="ms-2" />
    </template>

    <v-app-bar-title class="font-weight-bold">My Dashboard</v-app-bar-title>

    <v-spacer />

    <v-select
      v-model="selectedMonth"
      :items="monthOptions"
      density="compact"
      variant="outlined"
      hide-details
      prepend-inner-icon="mdi-calendar-month"
      label="Month"
      style="max-width: 200px"
      class="me-4"
    />
  </v-app-bar>

  <v-main>
    <v-container fluid class="pa-6">
      <div class="d-flex align-center mb-6">
        <div>
          <h1 class="text-h5 font-weight-bold">Business Metrics</h1>
          <div class="text-medium-emphasis">{{ periodLabel }}</div>
        </div>
      </div>

      <!-- Summary cards -->
      <v-row>
        <v-col
          v-for="card in summaryCards"
          :key="card.title"
          cols="12"
          sm="6"
          md="3"
        >
          <v-card class="pa-4" height="100%">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-medium-emphasis text-body-2">{{ card.title }}</span>
              <v-avatar :color="card.color" variant="tonal" size="36" rounded>
                <v-icon :icon="card.icon" size="20" />
              </v-avatar>
            </div>
            <div class="text-h4 font-weight-bold">{{ card.value }}</div>
            <div v-if="card.delta !== null" class="mt-1 d-flex align-center text-body-2">
              <v-icon
                :icon="card.delta >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down'"
                :color="card.delta >= 0 ? 'success' : 'error'"
                size="18"
              />
              <span :class="card.delta >= 0 ? 'text-success' : 'text-error'">
                {{ Math.abs(card.delta).toFixed(1) }}%
              </span>
              <span class="text-medium-emphasis ms-1">vs prev. month</span>
            </div>
            <div v-else class="mt-1 text-body-2 text-medium-emphasis">
              {{ isAll ? 'across 12 months' : 'no prior month' }}
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Two charts -->
      <v-row class="mt-2">
        <v-col cols="12" md="6">
          <v-card class="pa-4" height="100%">
            <div class="text-subtitle-1 font-weight-medium mb-2">Monthly Revenue</div>
            <BarChart :labels="labels" :data="revenueData" :highlight-index="highlightIndex" />
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card class="pa-4" height="100%">
            <div class="text-subtitle-1 font-weight-medium mb-2">Visitors Over Time</div>
            <LineChart :labels="labels" :data="visitorsData" :highlight-index="highlightIndex" />
          </v-card>
        </v-col>
      </v-row>

      <!-- Full-width area chart -->
      <v-row class="mt-2">
        <v-col cols="12">
          <v-card class="pa-4">
            <div class="text-subtitle-1 font-weight-medium mb-2">Conversion Rate Trend</div>
            <AreaChart :labels="labels" :data="conversionsData" :highlight-index="highlightIndex" />
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>
