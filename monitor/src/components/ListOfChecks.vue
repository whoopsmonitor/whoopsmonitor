<template>
  <q-card flat bordered>
    <q-card-section>
      <h3 class="text-h6 q-mt-none q-mb-sm">Latest Results</h3>
      <skeleton-list v-if="loading && !checks.length" />

      <no-item-list-here
        v-if="!loading && !checks.length"
        title="No checks here"
        description="Currently there are no checks configured. Please try to add a new one."
        :to="{ name: 'check.create' }"
        to-title="new check"
      />

      <q-toggle
        v-if="hasFailingCheck"
        v-model="onlyFailing"
        checked-icon="check"
        color="green"
        unchecked-icon="clear"
        label="only failing"
      />

      <div class="row q-col-gutter-sm" v-if="checks.length">
        <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-xs-12" v-for="check in filteredChecks" :key="check.id">
          <q-list bordered separator>
            <q-item v-ripple :to="{ name: 'check.dashboard', params: { id: check.id } }">
                <q-item-section>
                  <q-item-label caption v-if="check.status">
                    <span>
                      {{ check.status.createdAt | timeAgo }}
                      <q-tooltip>
                        {{ check.status.createdAt | datetime }}
                      </q-tooltip>
                    </span>
                  </q-item-label>
                  <q-item-label :lines="2">
                    {{ check.name }}
                    <q-icon name="info" v-if="check.description" color="grey" style="cursor: help" @click.prevent.self>
                      <q-tooltip>{{ check.description }}</q-tooltip>
                    </q-icon>
                  </q-item-label>
                  <q-item-label caption :lines="2" v-if="!check.display || check.display === null">
                    <div v-if="check.status">
                      <div :class="colorizeTextClass(check.status)" v-html="truncate(check.status.output.replace(/\n/g, '<br />'), 100) || 'no output yet'" />
                    </div>
                    <div v-else>
                      <div v-if="!check.enabled">
                        not enabled
                      </div>
                      <div v-else>
                        no output yet
                      </div>
                    </div>
                  </q-item-label>
                  <q-item-label v-if="check.statusHistory.length">
                    <q-avatar
                      v-for="status in check.statusHistory"
                      :key="status.id"
                      :color="colorizeCircleClass(status)"
                      size="8px"
                      class="q-mr-sm"
                    />
                  </q-item-label>
                  <q-item-label caption v-else>
                    no output yet
                  </q-item-label>
                </q-item-section>
                <template v-if="!check.display || check.display === null">
                  <q-item-section v-if="check.enabled" avatar>
                    <q-avatar v-if="check.status && !check.progress" :color="colorizeCircleClass(check.status)" size="30px" />
                    <q-skeleton v-if="check.progress" type="QAvatar" size="30px" />
                  </q-item-section>
                  <q-item-section v-else avatar>
                    <q-badge color="grey">disabled</q-badge>
                  </q-item-section>
                </template>
                <template v-if="check.status && check.display && check.display.metric">
                  <div>
                    <q-chip size="xl" dense :color="metricBgColor(check)" text-color="white">
                      <template v-if="check.status.trend && check.display.trend">
                        <template v-if="check.status.trend < 0">
                          <q-icon name="arrow_downward" size="xs" />
                        </template>
                        <template v-if="check.status.trend > 0">
                          <q-icon name="arrow_upward" size="xs" />
                        </template>
                      </template>
                      {{ parseInt(check.status.output) || '?' }} <span v-if="check.display.type.value === 'numberWithPercent'">%</span>
                    </q-chip>
                  </div>
                </template>
            </q-item>
          </q-list>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import truncate from 'truncate'
import { map } from 'lodash'
import trend from 'trend'
import timeAgo from '../filters/timeAgo'
import datetime from '../filters/datetime'
import NoItemListHere from '../components/NoItemListHere'
import SkeletonList from '../components/SkeletonList'

export default {
  name: 'ListOfChecks',
  filters: {
    timeAgo,
    datetime
  },
  components: {
    SkeletonList,
    NoItemListHere
  },
  data () {
    return {
      checks: [],
      interval: undefined,
      loading: false,
      onlyFailing: false
    }
  },
  computed: {
    filteredChecks () {
      return this.checks.filter((check) => {
        if (this.onlyFailing) {
          return check.status.status > 0
        }

        return true
      })
    },
    loggedIn () {
      return this.$store.getters['auth/loggedIn']
    },
    hasFailingCheck () {
      return this.checks.length && this.checks.some(check => check.status && check.status.status > 0)
    }
  },
  async created () {
    await this.fetchData()

    this.interval = setInterval(async () => {
      await this.fetchData()
    }, 10000)
  },
  destroyed () {
    clearInterval(this.interval)
  },
  methods: {
    async fetchData () {
      this.loading = true

      try {
        const checks = await this.$axios.get('/v1/check', {
          params: {
            populate: false,
            select: 'name,description,progress,enabled,display',
            sort: 'order ASC'
          }
        }).then((res) => res.data)

        for (const check of checks) {
          const status = await this.$axios.get('/v1/checkstatus', {
            params: {
              populate: false,
              select: 'output,status,createdAt',
              where: {
                check: check.id
              },
              sort: 'createdAt desc',
              limit: 10
            }
          }).then((res) => res.data)

          check.status = status[0]
          check.statusHistory = status.reverse()

          if (check.display && check.display.trend) {
            const outputs = map(check.statusHistory, history => history.output * 1)
            check.status.trend = trend(outputs, {
              avgPoints: 5
            }) || false
          }
        }

        this.checks = checks

        // assign when we have all the data
        // this.checks = sortBy(checks, [
        //   (check) => {
        //     let sortable = 0

        //     if (!check.enabled) {
        //       sortable = 3
        //     }

        //     if (check.status) {
        //       if (typeof check.status.status === 'number') {
        //         switch (check.status.status) {
        //           case 0:
        //             sortable = 2
        //             break
        //           case 1:
        //             sortable = 1
        //             break
        //           case 2:
        //             sortable = 0
        //             break
        //         }
        //       }
        //     }

        //     return sortable
        //   }
        // ])
      } catch (error) {
        console.error(error)

        // error 404 is ok otherwise redirect
        if (error.response.status !== 404) {
          this.$router.push({ name: 'error.500' })
        }
      } finally {
        this.loading = false
      }
    },
    colorizeTextClass (status) {
      return {
        'text-green': status.status === 0,
        'text-orange': status.status === 1,
        'text-red': status.status === 2
      }
    },
    colorizeCircleClass (status) {
      let color = 'red'

      // no status yet
      if (!status) {
        return 'grey'
      }

      switch (status.status) {
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

    truncate (str, length) {
      return truncate(str, length)
    },

    metricBgColor (check) {
      let color = 'grey'
      const status = check.status

      if (!status.output) {
        return color
      }

      if (typeof check.display.warning === 'undefined') {
        return color
      }

      if (typeof check.display.critical === 'undefined') {
        return color
      }

      const output = status.output * 1 // make sure it is a number
      const warning = check.display.warning * 1
      const critical = check.display.critical * 1

      if (isNaN(output)) {
        return color
      }

      if (output >= warning) {
        color = 'green'
      } else if (output >= critical && output < warning) {
        color = 'orange'
      } else if (output < critical) {
        color = 'red'
      }

      return color
    }
  }
}
</script>
