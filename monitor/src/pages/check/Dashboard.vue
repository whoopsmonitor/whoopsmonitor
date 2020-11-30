<template>
  <q-page padding>
    <div v-if="detail">
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12">
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
      </div>
    </div>
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12">
        <div class="row q-col-gutter-md">
          <div class="col-10">
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
          <div class="col-2 q-gutter-y-md">
            <correctness-index :check="$route.params.id" :hours="24" last-text="last 24 hours" />
            <correctness-index :check="$route.params.id" :hours="7 * 24" last-text="last 7 days" />
          </div>
        </div>
      </div>
      <div class="col-12">
        <q-card flat bordered dense>
          <q-card-section>
            <div class="text-h6">
              Latest Results <span class="text-caption">(50 records)</span>
            </div>
            <div>
              <q-toggle
                v-model="logsStatusOnlyFailed"
                @input="fetchLatestLogs"
                checked-icon="check"
                color="green"
                unchecked-icon="clear"
                label="errors only"
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
                    {{ log.createdAt | dateformat }}
                  </q-item-label>
                  <q-item-label v-if="loggedIn">
                    <q-btn
                      size="xs"
                      color="red"
                      @click="destroyDialog(log.id)"
                    >delete</q-btn>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <q-item-section v-if="!logs.length">
              No logs here.
            </q-item-section>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <confirm-dialog
      :open="dialog.destroy"
      @cancel="destroyCancel"
      @confirm="destroyConfirm"
    >
      Are you sure you want to delete this log?
    </confirm-dialog>
  </q-page>
</template>

<script>
import { DateTime } from 'luxon'
import { sortBy } from 'lodash'
import ini from 'ini'
import VueApexCharts from 'vue-apexcharts'
import dateformat from '../../filters/datetime'
import translateCron from '../../filters/translateCron'
import CorrectnessIndex from '../../components/CorrectnessIndex'
import ConfirmDialog from '../../components/ConfirmDialog'

export default {
  name: 'PageCheckDashboard',
  components: {
    apexchart: VueApexCharts,
    CorrectnessIndex,
    ConfirmDialog
  },
  filters: {
    translateCron,
    dateformat
  },
  data () {
    return {
      items: [],
      logs: [],
      detail: undefined,
      logsStatusOnlyFailed: false,
      destroyId: '',
      dialog: {
        destroy: false
      },
      loading: {
        destroy: false
      }
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
    await this.fetchData()
  },

  methods: {
    async fetchData () {
      await this.fetchDetails()
      await this.fetchAggregates()
      await this.fetchLatestLogs()
    },
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
    },

    destroyDialog (id) {
      this.dialog.destroy = true
      this.destroyId = id
    },

    destroyCancel () {
      this.dialog.destroy = false
      this.destroyId = ''
    },

    async destroyConfirm () {
      if (!this.loggedIn) {
        return false
      }

      this.loading.destroy = true

      try {
        await this.$axios.delete(`/v1/checkstatus/${this.destroyId}`)

        this.$whoopsNotify.positive({
          message: 'Log successfully deleted.'
        })

        await this.fetchData({
          verbose: false
        })
      } catch (error) {
        console.error(error)
        this.$whoopsNotify.negative({
          message: 'It is not possible to delete a log. Please try it again.'
        })
      } finally {
        this.destroyCancel()
      }
    }
  }
}
</script>
