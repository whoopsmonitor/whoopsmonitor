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
        </div>
      </q-card-section>

      <q-separator inset />

      <q-card-section class="text-center">
        <div class="text-h4" :class="colorize">{{ index }}%</div>
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
export default {
  name: 'HealthIndex',
  props: {
    data: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      thresholds: {
        warning: 90,
        critical: 50
      },
      dialog: false,
      form: {
        threshold: {
          warning: {
            id: '',
            value: 90
          },
          critical: {
            id: '',
            value: 50
          }
        }
      }
    }
  },
  computed: {
    index () {
      const okCount = Math.round(this.findStatusById(0).total)
      const errorCount = Math.round((this.findStatusById(1).total || 0) + (this.findStatusById(2).total || 0))
      const totalCount = okCount + errorCount
      const result = (okCount / totalCount) * 100

      return Math.round(result) || 0
    },
    colorize () {
      const thresholdWarning = this.thresholds.warning
      const thresholdCritical = this.thresholds.critical

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
    }
  },
  created () {
    this.fetchHealthIndex()
  },

  methods: {
    async fetchHealthIndex () {
      try {
        const thresholds = await this.$axios.get('/v1/healthindex', {
          params: {
            select: 'option,value'
          }
        }).then(result => result.data)

        for (const threshold of thresholds) {
          this.thresholds[threshold.option] = threshold.value
        }

        // assign to form
        for (const threshold of thresholds) {
          this.form.threshold[threshold.option].value = threshold.value || 0
          this.form.threshold[threshold.option].id = threshold.id
        }
      } catch (error) {
        console.error(error)
      }
    },

    async update () {
      let hasError = false
      let updatedCount = 0

      for (const levelKey in this.form.threshold) {
        const level = this.form.threshold[levelKey]

        if (level.value) {
          try {
            await this.$axios.patch(`/v1/healthindex/${level.id}`, {
              value: level.value || 0
            })
              .then(result => result.data)

            ++updatedCount
          } catch (error) {
            hasError = true
            console.error(error)
          }
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
      return this.data.filter(result => result.status === id)[0] || { total: 0, status: 0 }
    }
  }
}
</script>
