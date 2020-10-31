<template>
  <q-page padding>
    <div class="row q-gutter-md">
      <div v-if="detail" class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">
              {{ detail.name }}
              <q-icon
                v-if="loggedIn"
                name="edit"
                class="cursor-pointer"
                @click="$router.push({ name: 'check.detail', params: { id: $route.params.id } })"
              >
                <q-tooltip>update details</q-tooltip>
              </q-icon>

              <q-chip
                :color="detail.enabled ? 'green' : 'gray'"
                :text-color="detail.enabled ? 'white' : 'black'">
                {{ detail.enabled ? 'enabled' : 'disabled' }}
              </q-chip>

              <q-chip v-if="loggedIn">
                <!-- <q-icon name="schedule" class="q-mr-sm" /> {{ detail.cron | translateCron }} -->
                <q-icon name="schedule" class="q-mr-sm" /> {{ detail.cron | translateCron }}
              </q-chip>
            </div>
          </q-card-section>

          <q-separator v-if="loggedIn" inset />

          <q-card-section v-if="loggedIn">
            <div>
              <q-icon name="wallpaper" /> {{ detail.image.image }}
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">Summary</div>
          </q-card-section>

          <q-separator inset />

          <q-card-section>
            <apexchart type="bar" :options="chart" :series="chart.series" />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12">
        <q-card flat bordered dense>
          <q-card-section>
            <div class="text-h6">
              Latest Logs - {{ logsStatusOnlyFailed ? 'errors' : 'all' }} (50)
              <q-toggle
                v-model="logsStatusOnlyFailed"
                @input="fetchLatestLogs"
                checked-icon="check"
                color="green"
                unchecked-icon="clear"
              >
                <q-tooltip v-if="logsStatusOnlyFailed">all logs</q-tooltip>
                <q-tooltip v-else>only failed records</q-tooltip>
              </q-toggle>
            </div>
          </q-card-section>

          <q-separator inset />

          <q-card-section>
            <q-list v-if="logs.length" bordered separator>
            <q-item v-for="log in logs" :key="log.id">
              <q-item-section avatar>
                <q-avatar :color="colorizeCircleClass(log)" size="30px" />
              </q-item-section>
              <q-item-section>
                <div v-if="log.output" :class="colorizeTextClass(log)" v-html="log.output.replace(/\n/g, '<br />')" />
                <div v-else>
                  no output
                </div>
                <q-item-label caption>
                  {{ log.createdAt | timeAgo(log.createdAt) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { DateTime } from 'luxon'
import { sortBy } from 'lodash'
import ini from 'ini'
import VueApexCharts from 'vue-apexcharts'
import timeAgo from '../../filters/timeAgo'
import translateCron from '../../filters/translateCron'

export default {
  name: 'PageCheckDashboard',
  components: {
    apexchart: VueApexCharts
  },
  filters: {
    timeAgo,
    translateCron
  },
  data () {
    return {
      items: [],
      logs: [],
      detail: undefined,
      logsStatusOnlyFailed: true
    }
  },

  computed: {
    loggedIn () {
      return this.$store.getters['auth/loggedIn']
    },
    chart () {
      return {
        series: this.statsSeries,
        chart: {
          type: 'bar',
          height: 350,
          stacked: true,
          stackType: '100%'
        },
        colors: ['#008000', '#ffa500', '#ff0000'],
        responsive: [{
          breakpoint: 480,
          options: {
            legend: {
              position: 'bottom',
              offsetX: -10,
              offsetY: 0
            }
          }
        }],
        xaxis: {
          categories: this.statsXAxisCategories
        },
        fill: {
          opacity: 1
        },
        legend: {
          position: 'right',
          offsetX: 0,
          offsetY: 50
        }
      }
    },
    statsSeries () {
      const itemsOk = []
      const itemsWarning = []
      const itemsCritical = []

      for (const item of this.items) {
        itemsOk.push(item.ok)
        itemsWarning.push(item.warning)
        itemsCritical.push(item.critical)
      }

      return [
        {
          name: 'ok',
          data: itemsOk
        },
        {
          name: 'warning',
          data: itemsWarning
        },
        {
          name: 'critical',
          data: itemsCritical
        }
      ]
    },
    statsXAxisCategories () {
      return this.items.map((item) => {
        return item.date
      }) || []
    }
  },

  async created () {
    await this.fetchDetails()
    await this.fetchAggregates()
    await this.fetchLatestLogs()
  },

  methods: {
    async fetchDetails () {
      try {
        this.detail = await this.$axios.get(`/v1/check/${this.$route.params.id}`, {
          params: {
            select: 'enabled,name,progress,environmentVariables,cron',
            populate: 'image'
          }
        }).then((response) => response.data)
      } catch (error) {
        console.error(error)
      }
    },

    async fetchAggregates () {
      const date = DateTime.local()
      const startOfDay = date.minus({ months: 1 }).startOf('day')
      const endOfDay = date.endOf('day')

      try {
        const items = await this.$axios.get(`/v1/checkstatus/aggregate-by-day/${this.$route.params.id}`, {
          params: {
            from: startOfDay.valueOf(),
            to: endOfDay.valueOf()
          }
        }).then((response) => response.data)

        this.items = sortBy(items, 'date')
      } catch (error) {
        console.error(error)
      }
    },

    async fetchLatestLogs () {
      try {
        this.logs = await this.$axios.get('/v1/checkstatus', {
          params: {
            limit: 50,
            sort: 'createdAt desc',
            select: 'output,status,createdAt',
            populate: false,
            where: {
              check: this.$route.params.id,
              status: this.logsStatusOnlyFailed ? [1, 2] : [0, 1, 2]
            }
          }
        }).then((response) => response.data)
      } catch (error) {
        console.error(error)
      }
    },

    colorizeTextClass (item) {
      return {
        'text-green': item.status === 0,
        'text-orange': item.status === 1,
        'text-red': item.status === 2
      }
    },

    colorizeCircleClass (item) {
      let color = 'red'

      // no status yet
      if (typeof item.status === 'undefined') {
        return 'grey'
      }

      switch (item.status) {
        case 0:
          color = 'green'
          break
        case 1:
          color = 'orange'
          break
        case 2:
        default:
          color = 'red'
          break
      }

      return color
    },

    iniStringify (properties) {
      return ini.stringify(properties)
    }
  }
}
</script>
