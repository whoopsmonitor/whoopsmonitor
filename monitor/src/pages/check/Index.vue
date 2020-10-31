<template>
  <q-page padding>
    <q-card v-if="checks.length" flat bordered>
      <q-card-section>
        <div class="text-h6">Checks</div>
      </q-card-section>

      <q-separator inset />

      <q-card-section>
        <q-list bordered separator>
          <q-item v-for="check in checks" :key="check.id">
            <q-item-section side top>
              <q-toggle
                @input="switchStatus(check)"
                v-model="enabled[check.id]"
                checked-icon="check"
                color="green"
                unchecked-icon="clear"
              >
                <q-tooltip>click to {{ enabled[check.id] ? 'disable' : 'enable' }}</q-tooltip>
              </q-toggle>
            </q-item-section>
            <q-item-section>
              <q-item-label line="1" caption>
                <router-link :to="{ name: 'check.detail', params: { id: check.id }}">{{ check.name }}</router-link>
              </q-item-label>
              <q-item-label caption>
                <q-icon name="event_note" /> {{ check.createdAt | datetime }}
              </q-item-label>
              <q-item-label v-if="!check.image" caption>
                <q-icon name="warning" color="red" /> Image does not exists.
              </q-item-label>
              <q-item-label v-else-if="check.image.healthyStatus !== 0" caption>
                <q-icon name="warning" color="red" /> Image is not valid.
              </q-item-label>
            </q-item-section>
            <q-item-section top side>
              <div class="text-grey-8 q-gutter-xs">
                <q-btn
                  @click="duplicate(check)"
                  color="secondary"
                  dense
                  round
                  icon="content_copy"
                >
                  <q-tooltip>click to duplicate</q-tooltip>
                </q-btn>
                <q-btn
                  @click="destroyDialog(check.id)"
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
      v-if="!loading.fetch && !checks.length"
      title="No checks here"
      description="Currently there are no checks here yet. Please add a new one."
      :to="{ name: 'check.create' }"
      to-title="new check"
    />

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" type="a" :to="{ name: 'check.create' }" title="New Check" />
    </q-page-sticky>

    <confirm-dialog
      :open="dialog.destroy"
      @cancel="destroyCancel"
      @confirm="destroyConfirm"
    >
      Are you sure you want to delete this check?<br />
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
      checks: [],
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
    await this.fetchData()

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
        this.checks = await this.$axios.get('/v1/check', {
          params: {
            select: 'enabled,name,progress,environmentVariables,createdAt,image,cron',
            populate: 'image'
          }
        }).then(response => response.data)

        for (const check of this.checks) {
          this.$set(this.enabled, check.id, check.enabled)
        }
      } catch (error) {
        console.error(error)
        this.$whoopsNotify.negative({
          message: 'It is not possible to find checks. Please reload the page.'
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
        await this.$axios.delete(`/v1/check/${this.destroyId}`)
        await this.fetchData({
          verbose: false
        })

        this.$whoopsNotify.positive({
          message: 'Check successfully deleted.'
        })
      } catch (error) {
        console.error(error)
        this.$whoopsNotify.negative({
          message: 'It is not possible to delete a check. Please try it again.'
        })
      } finally {
        this.destroyCancel()
      }
    },

    async switchStatus (check) {
      this.$set(this.enabled, check.id, this.enabled[check.id])

      try {
        // update state
        await this.$axios.patch(`/v1/check/${check.id}`, {
          enabled: this.enabled[check.id]
        }, {
          params: {
            select: 'enabled'
          }
        })

        this.$whoopsNotify.positive({
          message: `Check "${check.name}" successfully ${this.enabled[check.id] ? 'enabled' : 'disabled'}.`
        })
      } catch (error) {
        console.error(error)

        this.$whoopsNotify.error({
          message: `Check "${check.name} status has not been changed. Please try it again or refresh the page."`
        })
      }
    },

    async duplicate (check) {
      const record = JSON.parse(JSON.stringify(check))
      delete record.id
      delete record.createdAt
      record.enabled = false
      record.name = `${record.name} - copy`
      record.image = check.image.id

      try {
        await this.$axios.post('/v1/check', record)

        this.$whoopsNotify.positive({
          message: 'Check successfully duplicated.'
        })

        await this.fetchData({
          verbose: false
        })
      } catch (error) {
        console.error(error)

        this.$whoopsNotify.error({
          message: 'It is not possible to duplicate this check. Please try it again.'
        })
      }
    }
  }
}
</script>
