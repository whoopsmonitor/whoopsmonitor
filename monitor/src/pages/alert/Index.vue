<template>
  <q-page padding>
    <q-card v-if="alerts.length" flat bordered>
      <q-card-section>
        <div class="text-h6">Alerts</div>
      </q-card-section>

      <q-separator inset />

      <q-card-section>
        <q-list bordered separator>
          <q-item v-for="alert in alerts" :key="alert.id">
            <q-item-section>
              <q-item-label line="1">
                <router-link :to="{ name: 'alert.detail', params: { id: alert.id }}">{{ alert.name }}</router-link>
              </q-item-label>
              <q-item-label caption>
                <q-icon name="event_note" /> {{ alert.createdAt | datetime }}
              </q-item-label>
              <q-item-label v-if="!alert.image" caption>
                <q-icon name="warning" color="red" /> Image does not exists.
              </q-item-label>
              <q-item-label v-else-if="alert.image.healthyStatus !== 0" caption>
                <q-icon name="warning" color="red" /> Image is not valid.
              </q-item-label>
            </q-item-section>
            <q-item-section top side>
              <div class="text-grey-8 q-gutter-xs">
                <q-btn
                  @click="duplicate(alert)"
                  color="secondary"
                  dense
                  round
                  icon="content_copy"
                >
                  <q-tooltip>click to duplicate</q-tooltip>
                </q-btn>
                <q-btn
                  @click="destroyDialog(alert.id)"
                  color="red"
                  dense
                  round
                  icon="delete"
              >
                  <q-tooltip>click to remove</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <skeleton-list v-if="loading.fetch" />

    <no-item-list-here
      v-if="!loading.fetch && !alerts.length"
      title="No alerts here"
      description="Currently there are no alerts here yet. Please add a new one."
      :to="{ name: 'alert.create' }"
      to-title="new alert"
    />

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" type="a" :to="{ name: 'alert.create' }" title="New Alert" />
    </q-page-sticky>

    <confirm-dialog
      :open="dialog.destroy"
      @cancel="destroyCancel"
      @confirm="destroyConfirm"
    >
      Are you sure you want to delete this alert?<br />
      Its history is going to be removed as well.
    </confirm-dialog>
  </q-page>
</template>

<script>
import NoItemListHere from '../../components/NoItemListHere'
import SkeletonList from '../../components/SkeletonList'
import ConfirmDialog from '../../components/ConfirmDialog'
import DateTime from '../../filters/datetime'

export default {
  name: 'PageCheckIndex',
  components: {
    NoItemListHere,
    SkeletonList,
    ConfirmDialog
  },
  filters: {
    datetime: DateTime
  },
  data () {
    return {
      alerts: [],
      enabled: {},
      loading: {
        fetch: false,
        destroy: false
      },
      dialog: {
        destroy: false
      },
      destroyId: '',
      interval: undefined
    }
  },
  async created () {
    await this.fetchData({
      verbose: true
    })

    this.interval = setInterval(async () => {
      await this.fetchData()
    }, 10000)
  },
  destroyed () {
    clearInterval(this.interval)
  },
  methods: {
    async fetchData (config) {
      config = config || {}

      if (config.verbose) {
        this.loading.fetch = true
      }

      try {
        this.alerts = await this.$axios.get('/v1/alert', {
          params: {
            select: 'name,description,image,environmentVariables,createdAt',
            populate: 'image'
          }
        }).then(response => response.data)

        for (const alert of this.alerts) {
          this.$set(this.enabled, alert.id, alert.enabled)
        }
      } catch (error) {
        console.error(error)
        this.$whoopsNotify.negative({
          message: 'It is not possible to find alerts. Please reload the page.'
        })
      } finally {
        if (config.verbose) {
          this.loading.fetch = false
        }
      }
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
      this.loading.destroy = true

      try {
        await this.$axios.delete(`/v1/alert/${this.destroyId}`)
        await this.fetchData({
          verbose: false
        })

        this.$whoopsNotify.positive({
          message: 'Alert successfully deleted.'
        })
      } catch (error) {
        console.error(error)
        this.$whoopsNotify.negative({
          message: 'It is not possible to delete a alert. Please try it again.'
        })
      } finally {
        this.destroyCancel()
      }
    },

    async switchStatus (alert) {
      this.$set(this.enabled, alert.id, this.enabled[alert.id])

      try {
        // update state
        await this.$axios.patch(`/v1/alert/${alert.id}`, {
          enabled: this.enabled[alert.id]
        }, {
          params: {
            select: 'enabled'
          }
        })

        this.$whoopsNotify.positive({
          message: `Alert "${alert.name}" successfully ${this.enabled[alert.id] ? 'enabled' : 'disabled'}.`
        })
      } catch (error) {
        console.error(error)

        this.$whoopsNotify.error({
          message: `Alert "${alert.name} status has not been changed. Please try it again or refresh the page."`
        })
      }
    },

    async duplicate (alert) {
      const record = JSON.parse(JSON.stringify(alert))
      delete record.id
      delete record.createdAt
      record.enabled = false
      record.name = `${record.name} - copy`
      record.image = alert.image.id

      try {
        await this.$axios.post('/v1/alert', record)

        this.$whoopsNotify.positive({
          message: 'Alert successfully duplicated.'
        })

        await this.fetchData({
          verbose: false
        })
      } catch (error) {
        console.error(error)

        this.$whoopsNotify.error({
          message: 'It is not possible to duplicate this alert. Please try it again.'
        })
      }
    }
  }
}
</script>
