<script setup lang="ts">
import { computed, ref } from 'vue'
import BarChart from '../components/BarChart.vue'
import LineChart from '../components/LineChart.vue'
import AreaChart from '../components/AreaChart.vue'
import type { MonthMetric } from '../metrics'
import rawMetrics from '../data/metrics.json'

const metrics = rawMetrics as MonthMetric[]

// ── Facility toggle ───────────────────────────────────────────────────────────
const FACILITY_ALL = 'All Facilities'
const facilityList = ['Downtown Detroit', 'Ann Arbor', 'Grand Rapids']
const selectedFacility = ref<string>(FACILITY_ALL)

const facilityData = computed<MonthMetric[]>(() => {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  if (selectedFacility.value === FACILITY_ALL) {
    return MONTHS.map((month) => {
      const rows = metrics.filter((m) => m.month === month)
      const sum = <K extends keyof MonthMetric>(key: K) =>
        rows.reduce((s, m) => s + (m[key] as number), 0)
      const avg = <K extends keyof MonthMetric>(key: K) =>
        rows.reduce((s, m) => s + (m[key] as number), 0) / rows.length
      return {
        month, year: 2025, facility: FACILITY_ALL,
        revenue:              sum('revenue'),
        attendance:           sum('attendance'),
        newMembers:           sum('newMembers'),
        membershipAvgMonths:  Math.round(avg('membershipAvgMonths') * 10) / 10,
        groupClasses:         sum('groupClasses'),
        individualSessions:   sum('individualSessions'),
        dropIns:              sum('dropIns'),
        workoutsLogged:       sum('workoutsLogged'),
        nutritionRevenue:     sum('nutritionRevenue'),
        privateTrainingRevenue: sum('privateTrainingRevenue'),
        gearRevenue:          sum('gearRevenue'),
        supplementsRevenue:   sum('supplementsRevenue'),
      }
    })
  }
  return metrics.filter((m) => m.facility === selectedFacility.value)
})

// ── Month filter ──────────────────────────────────────────────────────────────
const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const ALL_MONTHS = 'All'
const selectedMonth = ref<string>(ALL_MONTHS)
const monthOptions  = [ALL_MONTHS, ...labels]

const isAll = computed(() => selectedMonth.value === ALL_MONTHS)
const selectedIndex = computed(() =>
  isAll.value ? -1 : labels.findIndex((m) => m === selectedMonth.value),
)
const highlightIndex = computed(() =>
  selectedIndex.value < 0 ? null : selectedIndex.value,
)

// ── Chart series ──────────────────────────────────────────────────────────────
const revenueData    = computed(() => facilityData.value.map((m) => m.revenue))
const attendanceData = computed(() => facilityData.value.map((m) => m.attendance))
const newMembersData = computed(() => facilityData.value.map((m) => m.newMembers))
const workoutsData   = computed(() => facilityData.value.map((m) => m.workoutsLogged))
const membershipLengthData = computed(() => facilityData.value.map((m) => m.membershipAvgMonths))

// Classes chart — toggle between group / individual / drop-ins
type ClassSeries = 'groupClasses' | 'individualSessions' | 'dropIns'
const classSeriesOptions: { key: ClassSeries; label: string }[] = [
  { key: 'groupClasses',      label: 'Group Classes'     },
  { key: 'individualSessions', label: 'Individual Sessions' },
  { key: 'dropIns',           label: 'Drop-Ins'          },
]
const selectedClassSeries = ref<ClassSeries>('groupClasses')
const classData = computed(() =>
  facilityData.value.map((m) => m[selectedClassSeries.value] as number),
)
const classLabel = computed(
  () => classSeriesOptions.find((o) => o.key === selectedClassSeries.value)!.label,
)

// Services revenue chart — toggle between nutrition / private training / gear / supplements
type ServiceSeries = 'nutritionRevenue' | 'privateTrainingRevenue' | 'gearRevenue' | 'supplementsRevenue'
const serviceSeriesOptions: { key: ServiceSeries; label: string; icon: string }[] = [
  { key: 'nutritionRevenue',       label: 'Nutrition',       icon: 'mdi-food-apple'       },
  { key: 'privateTrainingRevenue', label: 'Private Training', icon: 'mdi-whistle'         },
  { key: 'gearRevenue',            label: 'Training Gear',   icon: 'mdi-tshirt-crew'      },
  { key: 'supplementsRevenue',     label: 'Supplements',     icon: 'mdi-bottle-tonic-plus' },
]
const selectedService = ref<ServiceSeries>('privateTrainingRevenue')
const serviceData = computed(() =>
  facilityData.value.map((m) => m[selectedService.value] as number),
)
const serviceLabel = computed(
  () => serviceSeriesOptions.find((o) => o.key === selectedService.value)!.label,
)

// ── Formatting helpers ────────────────────────────────────────────────────────
const fmtCurrency = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`
const fmtNumber   = (n: number) => Math.round(n).toLocaleString('en-US')

// ── Summary KPI cards (6) ─────────────────────────────────────────────────────
interface SummaryCard {
  title: string; icon: string; color: string; value: string; subtitle: string; delta: number | null
}

const summaryCards = computed<SummaryCard[]>(() => {
  if (isAll.value) {
    const fd = facilityData.value
    const tot = <K extends keyof MonthMetric>(k: K) =>
      fd.reduce((s, m) => s + (m[k] as number), 0)
    const avgML = (fd.reduce((s, m) => s + m.membershipAvgMonths, 0) / fd.length).toFixed(1)
    return [
      { title: 'Total Revenue',         icon: 'mdi-currency-usd',       color: 'primary',  value: fmtCurrency(tot('revenue')),            subtitle: 'across 12 months',    delta: null },
      { title: 'Total Attendance',      icon: 'mdi-account-multiple',   color: 'secondary',value: fmtNumber(tot('attendance')),            subtitle: 'check-ins this year', delta: null },
      { title: 'New Members',           icon: 'mdi-account-plus',       color: 'success',  value: fmtNumber(tot('newMembers')),            subtitle: 'enrolled this year',  delta: null },
      { title: 'Drop-Ins',              icon: 'mdi-walk',               color: 'warning',  value: fmtNumber(tot('dropIns')),               subtitle: 'external visits',     delta: null },
      { title: 'Avg. Membership',       icon: 'mdi-calendar-clock',     color: 'info',     value: `${avgML} mo`,                          subtitle: 'avg duration',        delta: null },
      { title: 'Workouts Logged',       icon: 'mdi-weight-lifter',      color: 'error',    value: fmtNumber(tot('workoutsLogged')),        subtitle: 'implemented',         delta: null },
    ]
  }

  const i = selectedIndex.value
  const cur  = facilityData.value[i]
  const prev = i > 0 ? facilityData.value[i - 1] : null
  const delta = (now: number, before: number | undefined) =>
    prev && before != null ? ((now - before) / before) * 100 : null

  return [
    { title: 'Revenue',         icon: 'mdi-currency-usd',     color: 'primary',  value: fmtCurrency(cur.revenue),                   subtitle: `${cur.month} 2025`, delta: delta(cur.revenue,              prev?.revenue)              },
    { title: 'Attendance',      icon: 'mdi-account-multiple', color: 'secondary',value: fmtNumber(cur.attendance),                  subtitle: 'check-ins',        delta: delta(cur.attendance,            prev?.attendance)            },
    { title: 'New Members',     icon: 'mdi-account-plus',     color: 'success',  value: fmtNumber(cur.newMembers),                  subtitle: 'enrolled',         delta: delta(cur.newMembers,            prev?.newMembers)            },
    { title: 'Drop-Ins',        icon: 'mdi-walk',             color: 'warning',  value: fmtNumber(cur.dropIns),                     subtitle: 'external visits',  delta: delta(cur.dropIns,               prev?.dropIns)               },
    { title: 'Avg. Membership', icon: 'mdi-calendar-clock',   color: 'info',     value: `${cur.membershipAvgMonths} mo`,            subtitle: 'avg duration',     delta: delta(cur.membershipAvgMonths,   prev?.membershipAvgMonths)   },
    { title: 'Workouts Logged', icon: 'mdi-weight-lifter',    color: 'error',    value: fmtNumber(cur.workoutsLogged),              subtitle: 'this month',       delta: delta(cur.workoutsLogged,        prev?.workoutsLogged)        },
  ]
})

const periodLabel   = computed(() => isAll.value ? 'Full year 2025' : `${selectedMonth.value} 2025`)
const facilityLabel = computed(() =>
  selectedFacility.value === FACILITY_ALL ? 'All Michigan Locations' : selectedFacility.value,
)

// ── Download CSV ──────────────────────────────────────────────────────────────
function downloadCSV(chartName: string) {
  const rows = isAll.value ? facilityData.value : [facilityData.value[selectedIndex.value]]
  const header = 'Month,Facility,Revenue,Attendance,New Members,Avg Membership (mo),Group Classes,Individual Sessions,Drop-Ins,Workouts Logged,Nutrition Rev,Private Training Rev,Gear Rev,Supplements Rev'
  const body = rows.map((r) =>
    [r.month, selectedFacility.value, r.revenue, r.attendance, r.newMembers,
     r.membershipAvgMonths, r.groupClasses, r.individualSessions, r.dropIns,
     r.workoutsLogged, r.nutritionRevenue, r.privateTrainingRevenue, r.gearRevenue, r.supplementsRevenue,
    ].join(','),
  )
  const csv  = [header, ...body].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${chartName}-${selectedFacility.value.replace(/\s+/g, '-')}-${selectedMonth.value}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function printDashboard() { window.print() }
</script>

<template>
  <v-main>
    <v-container fluid class="pa-6">

      <!-- Page header -->
      <div class="d-flex align-center flex-wrap gap-3 mb-4">
        <div>
          <h1 class="text-h5 font-weight-bold">Fitness Metrics</h1>
          <div class="text-medium-emphasis">{{ periodLabel }} · {{ facilityLabel }}</div>
        </div>
        <v-spacer />
        <v-select
          v-model="selectedMonth"
          :items="monthOptions"
          density="compact"
          variant="outlined"
          hide-details
          prepend-inner-icon="mdi-calendar-month"
          label="Month"
          style="max-width: 180px"
        />
        <v-tooltip text="Print dashboard">
          <template #activator="{ props: tip }">
            <v-btn v-bind="tip" icon="mdi-printer" variant="tonal" size="small" @click="printDashboard" />
          </template>
        </v-tooltip>
      </div>

      <!-- Facility tabs -->
      <v-tabs v-model="selectedFacility" density="compact" color="primary" class="mb-4" show-arrows>
        <v-tab :value="FACILITY_ALL">All Facilities</v-tab>
        <v-tab v-for="f in facilityList" :key="f" :value="f">{{ f }}</v-tab>
      </v-tabs>

      <!-- KPI cards — 6 cards, 2 per row on small, 3 on md, 6 on xl -->
      <v-row>
        <v-col
          v-for="card in summaryCards"
          :key="card.title"
          cols="12"
          sm="6"
          md="4"
          lg="2"
        >
          <v-card class="pa-4" height="100%">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-medium-emphasis text-body-2">{{ card.title }}</span>
              <v-avatar :color="card.color" variant="tonal" size="36" rounded>
                <v-icon :icon="card.icon" size="20" />
              </v-avatar>
            </div>
            <div class="text-h5 font-weight-bold">{{ card.value }}</div>
            <div v-if="card.delta !== null" class="mt-1 d-flex align-center text-body-2">
              <v-icon
                :icon="card.delta >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down'"
                :color="card.delta >= 0 ? 'success' : 'error'"
                size="16"
              />
              <span :class="card.delta >= 0 ? 'text-success' : 'text-error'">
                {{ Math.abs(card.delta).toFixed(1) }}%
              </span>
              <span class="text-medium-emphasis ms-1">vs prev. month</span>
            </div>
            <div v-else class="mt-1 text-body-2 text-medium-emphasis">
              {{ card.subtitle }}
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Row 1: Revenue + Services Revenue (toggleable) -->
      <v-row class="mt-4">
        <v-col cols="12" md="7">
          <v-card class="pa-4" height="100%">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="text-subtitle-1 font-weight-medium">Monthly Revenue</div>
              <div>
                <v-tooltip text="Download CSV">
                  <template #activator="{ props: tip }">
                    <v-btn v-bind="tip" icon="mdi-download" size="small" variant="text" @click="downloadCSV('revenue')" />
                  </template>
                </v-tooltip>
                <v-tooltip text="Total revenue from memberships, classes, and all services per month.">
                  <template #activator="{ props: tip }">
                    <v-btn v-bind="tip" icon="mdi-information-outline" size="small" variant="text" />
                  </template>
                </v-tooltip>
              </div>
            </div>
            <BarChart :labels="labels" :data="revenueData" :highlight-index="highlightIndex" label="Revenue ($)" />
          </v-card>
        </v-col>

        <v-col cols="12" md="5">
          <v-card class="pa-4" height="100%">
            <div class="d-flex align-center justify-space-between mb-1">
              <div class="text-subtitle-1 font-weight-medium">Services Revenue</div>
              <div>
                <v-tooltip text="Download CSV">
                  <template #activator="{ props: tip }">
                    <v-btn v-bind="tip" icon="mdi-download" size="small" variant="text" @click="downloadCSV('services')" />
                  </template>
                </v-tooltip>
                <v-tooltip text="Revenue from individual services sold at the facility.">
                  <template #activator="{ props: tip }">
                    <v-btn v-bind="tip" icon="mdi-information-outline" size="small" variant="text" />
                  </template>
                </v-tooltip>
              </div>
            </div>
            <!-- Toggle chips -->
            <div class="mb-3">
              <v-chip-group v-model="selectedService" mandatory color="primary" selected-class="text-primary">
                <v-chip
                  v-for="opt in serviceSeriesOptions"
                  :key="opt.key"
                  :value="opt.key"
                  :prepend-icon="opt.icon"
                  size="small"
                  variant="tonal"
                >{{ opt.label }}</v-chip>
              </v-chip-group>
            </div>
            <BarChart :labels="labels" :data="serviceData" :highlight-index="highlightIndex" :label="`${serviceLabel} ($)`" />
          </v-card>
        </v-col>
      </v-row>

      <!-- Row 2: Classes Activity (full width, toggleable series) -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card class="pa-4">
            <div class="d-flex align-center justify-space-between mb-1">
              <div class="text-subtitle-1 font-weight-medium">Classes &amp; Activity</div>
              <div>
                <v-tooltip text="Download CSV">
                  <template #activator="{ props: tip }">
                    <v-btn v-bind="tip" icon="mdi-download" size="small" variant="text" @click="downloadCSV('classes')" />
                  </template>
                </v-tooltip>
                <v-tooltip text="Group classes, individual training sessions, and drop-in visits per month.">
                  <template #activator="{ props: tip }">
                    <v-btn v-bind="tip" icon="mdi-information-outline" size="small" variant="text" />
                  </template>
                </v-tooltip>
              </div>
            </div>
            <!-- Toggle chips -->
            <div class="mb-3">
              <v-chip-group v-model="selectedClassSeries" mandatory color="secondary" selected-class="text-secondary">
                <v-chip
                  v-for="opt in classSeriesOptions"
                  :key="opt.key"
                  :value="opt.key"
                  size="small"
                  variant="tonal"
                >{{ opt.label }}</v-chip>
              </v-chip-group>
            </div>
            <LineChart :labels="labels" :data="classData" :highlight-index="highlightIndex" :label="classLabel" />
          </v-card>
        </v-col>
      </v-row>

      <!-- Row 3: Attendance + New Members -->
      <v-row class="mt-4">
        <v-col cols="12" md="6">
          <v-card class="pa-4" height="100%">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="text-subtitle-1 font-weight-medium">Member Attendance</div>
              <div>
                <v-tooltip text="Download CSV">
                  <template #activator="{ props: tip }">
                    <v-btn v-bind="tip" icon="mdi-download" size="small" variant="text" @click="downloadCSV('attendance')" />
                  </template>
                </v-tooltip>
                <v-tooltip text="Total monthly check-ins by active members and drop-in visitors.">
                  <template #activator="{ props: tip }">
                    <v-btn v-bind="tip" icon="mdi-information-outline" size="small" variant="text" />
                  </template>
                </v-tooltip>
              </div>
            </div>
            <LineChart :labels="labels" :data="attendanceData" :highlight-index="highlightIndex" label="Attendance" />
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="pa-4" height="100%">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="text-subtitle-1 font-weight-medium">New Member Growth</div>
              <div>
                <v-tooltip text="Download CSV">
                  <template #activator="{ props: tip }">
                    <v-btn v-bind="tip" icon="mdi-download" size="small" variant="text" @click="downloadCSV('new-members')" />
                  </template>
                </v-tooltip>
                <v-tooltip text="Number of new memberships enrolled each month.">
                  <template #activator="{ props: tip }">
                    <v-btn v-bind="tip" icon="mdi-information-outline" size="small" variant="text" />
                  </template>
                </v-tooltip>
              </div>
            </div>
            <AreaChart :labels="labels" :data="newMembersData" :highlight-index="highlightIndex" label="New Members" />
          </v-card>
        </v-col>
      </v-row>

      <!-- Row 4: Avg. Membership Length + Workouts Logged -->
      <v-row class="mt-4">
        <v-col cols="12" md="6">
          <v-card class="pa-4" height="100%">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="text-subtitle-1 font-weight-medium">Avg. Membership Length</div>
              <div>
                <v-tooltip text="Download CSV">
                  <template #activator="{ props: tip }">
                    <v-btn v-bind="tip" icon="mdi-download" size="small" variant="text" @click="downloadCSV('membership-length')" />
                  </template>
                </v-tooltip>
                <v-tooltip text="Average duration in months of active memberships, tracked monthly.">
                  <template #activator="{ props: tip }">
                    <v-btn v-bind="tip" icon="mdi-information-outline" size="small" variant="text" />
                  </template>
                </v-tooltip>
              </div>
            </div>
            <AreaChart :labels="labels" :data="membershipLengthData" :highlight-index="highlightIndex" label="Avg. Months" />
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="pa-4" height="100%">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="text-subtitle-1 font-weight-medium">Workouts Implemented</div>
              <div>
                <v-tooltip text="Download CSV">
                  <template #activator="{ props: tip }">
                    <v-btn v-bind="tip" icon="mdi-download" size="small" variant="text" @click="downloadCSV('workouts')" />
                  </template>
                </v-tooltip>
                <v-tooltip text="Total workout programs implemented and logged by members each month.">
                  <template #activator="{ props: tip }">
                    <v-btn v-bind="tip" icon="mdi-information-outline" size="small" variant="text" />
                  </template>
                </v-tooltip>
              </div>
            </div>
            <BarChart :labels="labels" :data="workoutsData" :highlight-index="highlightIndex" label="Workouts" />
          </v-card>
        </v-col>
      </v-row>

    </v-container>
  </v-main>
</template>
