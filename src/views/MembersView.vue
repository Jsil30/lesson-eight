<script setup lang="ts">
import { computed, ref } from 'vue'
import rawMembers from '../data/members.json'

interface Member {
  id: number
  firstName: string
  lastName: string
  facility: string
  joinDate: string
  membershipType: string
  status: string
  gender: string
  age: number
  goalType: string
  avgMonthlyVisits: number
  groupClassesThisYear: number
  privateSessions: number
  totalSpend: number
}

const members = rawMembers as Member[]

// ── Filters ───────────────────────────────────────────────────────────────────
const FACILITY_ALL = 'All Facilities'
const facilityList = ['Downtown Detroit', 'Ann Arbor', 'Grand Rapids']
const selectedFacility = ref<string>(FACILITY_ALL)

const statusOptions = ['All', 'Active', 'Inactive']
const selectedStatus = ref<string>('All')

const goalOptions = ['All', 'Strength', 'Weight Loss', 'Muscle Gain', 'Cardio', 'General Fitness', 'Rehabilitation']
const selectedGoal = ref<string>('All')

const membershipOptions = ['All', 'Basic', 'Standard', 'Premium']
const selectedMembership = ref<string>('All')

const search = ref<string>('')

// ── Table headers ─────────────────────────────────────────────────────────────
const headers = [
  { title: 'Name',             key: 'fullName',            sortable: true  },
  { title: 'Facility',         key: 'facility',            sortable: true  },
  { title: 'Membership',       key: 'membershipType',      sortable: true  },
  { title: 'Status',           key: 'status',              sortable: true  },
  { title: 'Goal',             key: 'goalType',            sortable: true  },
  { title: 'Joined',           key: 'joinDate',            sortable: true  },
  { title: 'Duration',         key: 'durationMonths',      sortable: true  },
  { title: 'Age',              key: 'age',                 sortable: true  },
  { title: 'Avg Visits/Mo',    key: 'avgMonthlyVisits',    sortable: true  },
  { title: 'Group Classes',    key: 'groupClassesThisYear',sortable: true  },
  { title: 'Private Sessions', key: 'privateSessions',     sortable: true  },
  { title: 'Total Spend',      key: 'totalSpend',          sortable: true  },
]

// ── Computed member rows ──────────────────────────────────────────────────────
const today = new Date()

function durationMonths(joinDate: string): number {
  const d = new Date(joinDate)
  return (today.getFullYear() - d.getFullYear()) * 12 + (today.getMonth() - d.getMonth())
}

function durationLabel(months: number): string {
  const y = Math.floor(months / 12)
  const m = months % 12
  if (y === 0) return `${m}m`
  if (m === 0) return `${y}y`
  return `${y}y ${m}m`
}

const enriched = computed(() =>
  members.map((m) => ({
    ...m,
    fullName:       `${m.firstName} ${m.lastName}`,
    durationMonths: durationMonths(m.joinDate),
    durationLabel:  durationLabel(durationMonths(m.joinDate)),
  })),
)

const filtered = computed(() =>
  enriched.value.filter((m) => {
    if (selectedFacility.value !== FACILITY_ALL && m.facility !== selectedFacility.value) return false
    if (selectedStatus.value !== 'All' && m.status !== selectedStatus.value) return false
    if (selectedGoal.value !== 'All' && m.goalType !== selectedGoal.value) return false
    if (selectedMembership.value !== 'All' && m.membershipType !== selectedMembership.value) return false
    if (search.value) {
      const q = search.value.toLowerCase()
      if (!m.fullName.toLowerCase().includes(q)) return false
    }
    return true
  }),
)

// ── KPI cards ─────────────────────────────────────────────────────────────────
const kpis = computed(() => {
  const f = filtered.value
  const active   = f.filter((m) => m.status === 'Active').length
  const inactive = f.filter((m) => m.status === 'Inactive').length
  const avgDuration = f.length
    ? (f.reduce((s, m) => s + m.durationMonths, 0) / f.length).toFixed(1)
    : '0'
  const avgVisits = f.length
    ? (f.reduce((s, m) => s + m.avgMonthlyVisits, 0) / f.length).toFixed(1)
    : '0'
  const totalSpend = f.reduce((s, m) => s + m.totalSpend, 0)
  return { total: f.length, active, inactive, avgDuration, avgVisits, totalSpend }
})

// ── Status chip color ─────────────────────────────────────────────────────────
const statusColor: Record<string, string> = { Active: 'success', Inactive: 'error' }
const goalColor: Record<string, string> = {
  Strength:       'primary',
  'Weight Loss':  'secondary',
  'Muscle Gain':  'warning',
  Cardio:         'info',
  'General Fitness': 'success',
  Rehabilitation: 'error',
}
const membershipColor: Record<string, string> = { Basic: 'default', Standard: 'info', Premium: 'warning' }

// ── Print ─────────────────────────────────────────────────────────────────────
function printMembers() { window.print() }

// ── Download CSV ──────────────────────────────────────────────────────────────
function downloadCSV() {
  const header = 'ID,Name,Facility,Membership,Status,Goal,Joined,Duration (months),Age,Avg Visits/Mo,Group Classes,Private Sessions,Total Spend ($)'
  const body = filtered.value.map((m) =>
    [m.id, `"${m.fullName}"`, `"${m.facility}"`, m.membershipType, m.status, `"${m.goalType}"`,
     m.joinDate, m.durationMonths, m.age, m.avgMonthlyVisits, m.groupClassesThisYear, m.privateSessions, m.totalSpend,
    ].join(','),
  )
  const csv  = [header, ...body].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `members-${selectedFacility.value.replace(/\s+/g, '-')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <v-main>
    <v-container fluid class="pa-6">

      <!-- Page header -->
      <div class="d-flex align-center mb-6">
        <div>
          <h1 class="text-h5 font-weight-bold">Members</h1>
          <div class="text-medium-emphasis">Manage and explore individual member data</div>
        </div>
        <v-spacer />
        <v-tooltip text="Download CSV">
          <template #activator="{ props: tip }">
            <v-btn v-bind="tip" icon="mdi-download" variant="tonal" size="small" class="me-2" @click="downloadCSV" />
          </template>
        </v-tooltip>
        <v-tooltip text="Print member list">
          <template #activator="{ props: tip }">
            <v-btn v-bind="tip" icon="mdi-printer" variant="tonal" size="small" @click="printMembers" />
          </template>
        </v-tooltip>
      </div>

      <!-- KPI summary -->
      <v-row class="mb-4">
        <v-col cols="6" sm="4" md="2">
          <v-card class="pa-3 text-center" variant="tonal" color="primary">
            <div class="text-h5 font-weight-bold">{{ kpis.total }}</div>
            <div class="text-caption text-medium-emphasis">Total Members</div>
          </v-card>
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-card class="pa-3 text-center" variant="tonal" color="success">
            <div class="text-h5 font-weight-bold">{{ kpis.active }}</div>
            <div class="text-caption text-medium-emphasis">Active</div>
          </v-card>
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-card class="pa-3 text-center" variant="tonal" color="error">
            <div class="text-h5 font-weight-bold">{{ kpis.inactive }}</div>
            <div class="text-caption text-medium-emphasis">Inactive</div>
          </v-card>
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-card class="pa-3 text-center" variant="tonal" color="info">
            <div class="text-h5 font-weight-bold">{{ kpis.avgDuration }}<span class="text-body-2"> mo</span></div>
            <div class="text-caption text-medium-emphasis">Avg. Duration</div>
          </v-card>
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-card class="pa-3 text-center" variant="tonal" color="secondary">
            <div class="text-h5 font-weight-bold">{{ kpis.avgVisits }}</div>
            <div class="text-caption text-medium-emphasis">Avg. Visits/Mo</div>
          </v-card>
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-card class="pa-3 text-center" variant="tonal" color="warning">
            <div class="text-h5 font-weight-bold">${{ kpis.totalSpend.toLocaleString() }}</div>
            <div class="text-caption text-medium-emphasis">Total Spend</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Filters -->
      <v-card class="pa-4 mb-4">
        <v-row dense>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="search"
              label="Search by name"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              variant="outlined"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="selectedFacility"
              :items="[FACILITY_ALL, ...facilityList]"
              label="Facility"
              prepend-inner-icon="mdi-map-marker"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="selectedMembership"
              :items="membershipOptions"
              label="Membership"
              prepend-inner-icon="mdi-card-account-details"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="selectedStatus"
              :items="statusOptions"
              label="Status"
              prepend-inner-icon="mdi-account-check"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="selectedGoal"
              :items="goalOptions"
              label="Goal"
              prepend-inner-icon="mdi-target"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>
        </v-row>
      </v-card>

      <!-- Data table -->
      <v-card>
        <v-data-table
          :headers="headers"
          :items="filtered"
          :items-per-page="25"
          :sort-by="[{ key: 'durationMonths', order: 'desc' }]"
          density="comfortable"
          class="text-body-2"
        >
          <!-- Name -->
          <template #item.fullName="{ item }">
            <div class="font-weight-medium">{{ item.fullName }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.gender }} · {{ item.age }} yrs</div>
          </template>

          <!-- Facility chip -->
          <template #item.facility="{ item }">
            <v-chip size="x-small" variant="tonal" color="primary">{{ item.facility }}</v-chip>
          </template>

          <!-- Membership chip -->
          <template #item.membershipType="{ item }">
            <v-chip size="x-small" :color="membershipColor[item.membershipType]" variant="tonal">
              {{ item.membershipType }}
            </v-chip>
          </template>

          <!-- Status chip -->
          <template #item.status="{ item }">
            <v-chip size="x-small" :color="statusColor[item.status]" variant="tonal">
              <v-icon start size="12" :icon="item.status === 'Active' ? 'mdi-circle' : 'mdi-circle-outline'" />
              {{ item.status }}
            </v-chip>
          </template>

          <!-- Goal chip -->
          <template #item.goalType="{ item }">
            <v-chip size="x-small" :color="goalColor[item.goalType]" variant="tonal">{{ item.goalType }}</v-chip>
          </template>

          <!-- Join date + formatted -->
          <template #item.joinDate="{ item }">
            {{ new Date(item.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
          </template>

          <!-- Duration -->
          <template #item.durationMonths="{ item }">
            <span :class="item.durationMonths >= 24 ? 'text-success font-weight-medium' : ''">
              {{ item.durationLabel }}
            </span>
          </template>

          <!-- Avg visits with mini progress bar -->
          <template #item.avgMonthlyVisits="{ item }">
            <div class="d-flex align-center gap-2">
              <span>{{ item.avgMonthlyVisits }}</span>
              <v-progress-linear
                :model-value="(item.avgMonthlyVisits / 20) * 100"
                color="secondary"
                rounded
                height="4"
                style="width: 48px; min-width: 48px"
              />
            </div>
          </template>

          <!-- Total spend -->
          <template #item.totalSpend="{ item }">
            <span class="font-weight-medium">${{ item.totalSpend.toLocaleString() }}</span>
          </template>
        </v-data-table>
      </v-card>

    </v-container>
  </v-main>
</template>
