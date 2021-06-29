<template>
  <div>
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">
          Correctness
          <q-icon
            v-if="loggedIn"
            name="tune"
            class="cursor-pointer"
            @click="dialog = true"
          >
            <q-tooltip>click to update thresholds</q-tooltip>
          </q-icon>
          <div class="text-caption">
            {{ lastText }}
          </div>
        </div>
      </q-card-section>

      <q-separator inset />

      <q-card-section class="text-center">
        <div class="text-h4" :class="colorize" v-if="!loading">
          {{ index }}<span v-if="aggregatedResults.length">%</span>
        </div>
        <div v-if="loading" class="row justify-center">
          <q-skeleton type="QAvatar" />
        </div>
      </q-card-section>
    </q-card>

    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 500px; max-width: 50vw;">
        <q-card-section>
          <q-list dense>
            <q-item>
              <q-item-section avatar>
                <q-icon color="orange" name="warning" />
              </q-item-section>
              <q-item-section>
                <q-slider
                  v-model="form.threshold.warning.value"
                  :min="0"
                  :max="100"
                  label
                />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-icon color="red" name="error" />
              </q-item-section>
              <q-item-section>
                <q-slider
                  v-model="form.threshold.critical.value"
                  :min="0"
                  :max="100"
                  label
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            @click="update"
            :disabled="!form.threshold.warning.value || !form.threshold.critical.value"
            flat
            label="update"
            color="secondary"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { DateTime } from 'luxon'

export default {
  name: 'HealthIndex',
  props: {
    hours: {
      type: Number,
      required: true
    },
    check: {
      type: String,
      default: null
    },
    lastText: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      aggregatedResults: [],
      dialog: false,
      form: {
        threshold: {
          warning: {
            id: '',
            value: 90,
            check: this.check,
            hours: this.hours
          },
          critical: {
            id: '',
            value: 50,
            check: this.check,
            hours: this.hours
          }
        }
      },
      loading: false
    }
  },
  computed: {
    index () {
      if (!this.aggregatedResults.length) {
        return 'no data'
      }

      const okCount = Math.round(this.findStatusById(0).total)
      const errorCount = Math.round((this.findStatusById(1).total || 0) + (this.findStatusById(2).total || 0))
      const totalCount = okCount + errorCount
      const result = (okCount / totalCount) * 100

      return Math.round(result) || 0
    },
    colorize () {
      if (!this.aggregatedResults.length) {
        return 'text-gray'
      }

      const thresholdWarning = this.form.threshold.warning.value
      const thresholdCritical = this.form.threshold.critical.value

      if (this.index >= thresholdWarning) {
        return 'text-green'
      }

      if (this.index >= thresholdCritical && this.index < thresholdWarning) {
        return 'text-orange'
      }

      if (this.index < thresholdCritical) {
        return 'text-red'
      }

      return 'text-gray'
    },
    loggedIn () {
      return this.$store.getters['auth/loggedIn']
    },
    thresholdsRaw () {
      if (Object.keys(this.$store.state.healthindex.thresholds).length) {
        return this.$store.state.healthindex.thresholds.filter(item => item.check === this.check && item.hours === this.hours)
      }
      return {}
    },
    thresholds () {
      const thresholds = {}

      for (const item of this.thresholdsRaw) {
        thresholds[item.option] = item.value
      }

      return thresholds
    }
  },

  watch: {
    thresholdsRaw: {
      immediate: true,
      handler (thresholds) {
        // assign to form
        for (const key in thresholds) {
          const threshold = thresholds[key]

          const option = {
            id: threshold.id,
            value: threshold.value || 0,
            hours: threshold.hours || this.hours,
            check: threshold.check || this.check
          }

          this.$set(this.form.threshold, threshold.option, option)
        }
      }
    }
  },

  async created () {
    await this.fetchData()
  },

  methods: {
    async fetchData () {
      const date = DateTime.local()
      const startOfInterval = date.minus({
        hours: this.hours
      })

      this.loading = true

      try {
        this.aggregatedResults = await this.$axios.get(`/v1/checkstatus/aggregate/${this.check || ''}`, {
          params: {
            from: startOfInterval.valueOf(),
            to: date.valueOf()
          }
        }).then(result => result.data)
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async update () {
      let hasError = false
      let updatedCount = 0

      for (const levelKey in this.form.threshold) {
        const level = this.form.threshold[levelKey]

        if (level.value) {
          try {
            if (!level.id) {
              // create
              delete level.id
              level.option = levelKey // warning, critical...

              const result = await this.$axios.post('/v1/healthindex', level)
                .then(result => result.data)

              // update model
              this.$set(this.form.threshold, result.option, {
                id: result.id,
                value: result.value,
                hours: result.hours,
                check: result.check.id
              })
            } else {
              // update
              await this.$axios.patch(`/v1/healthindex/${level.id}`, {
                value: level.value || 0
              })
            }

            ++updatedCount
          } catch (error) {
            hasError = true
            console.error(error)
          }

          // re-set thresholds to update a view
          this.$nextTick(() => this.$set(this.thresholds, levelKey, this.thresholds[levelKey]))
        }
      }

      if (hasError) {
        this.$whoopsNotify.negative({
          message: 'It is not possible to update the thresholds. Please try it again.'
        })
      } else {
        if (updatedCount) {
          this.$whoopsNotify.positive({
            message: 'Thresholds have been successfully updated.'
          })
        }
      }
    },

    findStatusById (id) {
      return this.aggregatedResults.filter(result => result.status === id)[0] || { total: 0, status: 0 }
    }
  }
}
</script>
