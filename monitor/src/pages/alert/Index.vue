<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="row">
          <div class="col">
            <div class="text-h6">Alerts</div>
          </div>
          <div class="col">
            <filter-results
              v-model="filter.results"
              cache-key="alert"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator inset />

      <q-card-section v-if="filteredItems.length">
        <q-list bordered separator>
          <q-item v-for="alert in filteredItems" :key="alert.id">
            <q-item-section side top>
              <q-toggle
                @input="switchStatus(alert)"
                v-model="enabled[alert.id]"
                checked-icon="check"
                color="green"
                unchecked-icon="clear"
              >
                <q-tooltip>click to {{ enabled[alert.id] ? 'disable' : 'enable' }}</q-tooltip>
              </q-toggle>
            </q-item-section>
            <q-item-section side top v-if="alert.image.metadata['com.whoopsmonitor.icon']">
              <q-icon :name="`img:${alert.image.metadata['com.whoopsmonitor.icon']}`" />
            </q-item-section>
            <q-item-section>
              <q-item-label line="1">
                <router-link :to="{ name: 'alert.detail', params: { id: alert.id }}">{{ alert.name }}</router-link>
              </q-item-label>
              <q-item-label caption>
                <q-icon name="event_note" /> {{ alert.createdAt | datetime }}
              </q-item-label>
              <q-item-label caption v-if="alert.level && alert.level.length">
                <q-chip v-if="alert.level.indexOf(0) > -1" color="green" text-color="white" size="sm">success</q-chip>
                <q-chip v-if="alert.level.indexOf(1) > -1" color="orange" text-color="white" size="sm">warning</q-chip>
                <q-chip v-if="alert.level.indexOf(2) > -1" color="red" text-color="white" size="sm">critical</q-chip>
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

      <q-card-section v-if="!loading.fetch && !filteredItems.length">
        <p v-if="!filteredItems.length">
          There are no alerts to select from.
        </p>
        <div>
          <q-btn flat color="primary" type="a" :to="{ name: 'alert.create' }">new alert</q-btn>
        </div>
      </q-card-section>
    </q-card>

    <skeleton-list v-if="loading.fetch" />

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
import FilterResults from '../../components/FilterResults.vue'
import SkeletonList from '../../components/SkeletonList'
import ConfirmDialog from '../../components/ConfirmDialog'
import DateTime from '../../filters/datetime'
import filteredItems from '../../helpers/filteredItems'

export default {
  name: 'PageCheckIndex',
  components: {
    FilterResults,
    SkeletonList,
    ConfirmDialog
  },
  filters: {
    datetime: DateTime
  },
  data () {
    return {
      items: [],
      enabled: {},
      loading: {
        fetch: false,
        destroy: false
      },
      dialog: {
        destroy: false
      },
      destroyId: '',
      interval: undefined,
      filter: {
        results: ''
      },
      filterByKey: 'name'
    }
  },
  computed: {
    ...filteredItems
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
        const alerts = await this.$axios.get('/v1/alert', {
          params: {
            select: 'enabled,name,description,image,environmentVariables,createdAt,level',
            populate: 'image'
          }
        }).then(response => response.data)

        this.items = alerts.map(alert => {
          alert.image.metadata = JSON.parse(alert.image.metadata)
          return alert
        })

        for (const alert of this.items) {
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

        this.$whoopsNotify.negative({
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
      record.level = alert.level
      record.repeat = alert.repeat

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

        this.$whoopsNotify.negative({
          message: 'It is not possible to duplicate this alert. Please try it again.'
        })
      }
    }
  }
}
</script>
