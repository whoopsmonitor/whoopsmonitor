<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="row">
          <div class="col">
            <div class="text-h6">Checks</div>
          </div>
          <div class="col">
            <filter-results
              v-model="filter.results"
              cache-key="check"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator inset />

      <q-card-section v-if="processedItems.length">
        <q-list bordered separator>
          <q-item v-for="check in processedItems" :key="check.id">
            <q-item-section side top>
              <q-toggle
                @update:model-value="switchStatus(check)"
                v-model="enabled[check.id]"
                checked-icon="check"
                color="green"
                unchecked-icon="clear"
              >
                <q-tooltip>click to {{ enabled[check.id] ? 'disable' : 'enable' }}</q-tooltip>
              </q-toggle>
            </q-item-section>
            <q-item-section side top v-if="check.image && check.image.metadata['com.whoopsmonitor.icon']">
              <q-icon :name="`img:${check.image.metadata['com.whoopsmonitor.icon']}`" />
            </q-item-section>
            <q-item-section>
              <q-item-label line="1" caption>
                <router-link :to="{ name: 'check.detail', params: { id: check.id }}">{{ check.name }}</router-link>
              </q-item-label>
              <q-item-label caption>
                <q-icon name="event_note" /> {{ datetime(check.createdAt) }}
              </q-item-label>
              <q-item-label v-if="check.tags && check.tags.length">
                <q-chip
                  v-for="tag in check.tags" :key="tag"
                  size="sm"
                >
                  {{ tag }}
                </q-chip>
              </q-item-label>
              <q-item-label v-if="!check.image" caption>
                <q-icon name="warning" color="red" /> Image does not exists.
              </q-item-label>
              <q-item-label v-else-if="check.image.healthyStatus !== 0" caption>
                <q-icon name="warning" color="red" /> Image is not valid.
              </q-item-label>
            </q-item-section>
            <q-item-section top side :class="{ 'disabled': loading.run }">
              <div class="text-grey-8 q-gutter-xs">
                <q-btn-group flat>
                  <q-btn
                    :disable="loading.order || check.order === 0"
                    @click="move(check, -1)"
                    color="accent"
                    dense
                    round
                    icon="arrow_upward"
                  >
                    <q-tooltip>move up</q-tooltip>
                  </q-btn>
                  <q-btn
                    :disable="loading.order || items.length - 1 === check.order"
                    @click="move(check, 1)"
                    color="accent"
                    dense
                    round
                    icon="arrow_downward"
                  >
                    <q-tooltip>move down</q-tooltip>
                  </q-btn>
                </q-btn-group>
                <q-btn
                  @click="runNow(check)"
                  color="secondary"
                  dense
                  round
                  icon="local_fire_department"
                >
                  <q-tooltip>run immediately</q-tooltip>
                </q-btn>
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

      <q-card-section v-if="!loading.fetch && !processedItems.length">
        <p>
          There are no checks to select from.
        </p>
        <div>
          <q-btn flat color="primary" type="a" :to="{ name: 'check.create' }">new check</q-btn>
        </div>
      </q-card-section>
    </q-card>

    <skeleton-list v-if="loading.fetch" />

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
import FilterResults from '../../components/FilterResults.vue'
import SkeletonList from '../../components/SkeletonList.vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import datetime from '../../filters/datetime'
import filteredItems from '../../helpers/filteredItems'
import { runNow, switchStatus as checkSwitchStatus } from '../../helpers/check'

import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PageCheckIndex',
  components: {
    FilterResults,
    SkeletonList,
    ConfirmDialog
  },
  data () {
    return {
      items: [],
      enabled: {},
      loading: {
        fetch: false,
        destroy: false,
        order: false
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
    ...filteredItems,
    processedItems () {
      return this.filteredItems.map(check => {
        try {
          check.image.metadata = JSON.parse(check.image.metadata)
        } catch (error) {
          if (error) {
            // do nothing
          }
        }

        return check
      })
    }
  },

  created () {
    this.fetchData()
  },
  methods: {
    runNow,
    async switchStatus (check) {
      await checkSwitchStatus({
        check,
        onBefore: () => {
          this.enabled[check.id] = this.enabled[check.id]
        },
        onSuccess: () => {
          this.$whoopsNotify.positive({
            message: `Check "${check.name}" successfully ${this.enabled[check.id] ? 'enabled' : 'disabled'}.`
          })
        },
        onError: () => {
          this.$whoopsNotify.negative({
            message: `Check "${check.name} status has not been changed. Please try it again or refresh the page."`
          })
        }
      })
    },

    fetchData () {
      this.loading.fetch = true

      try {
        this.$sailsIo.socket.get('/v1/check', {
          select: 'enabled,name,progress,environmentVariables,createdAt,image,cron,display,order,tags',
          populate: 'image',
          sort: 'order ASC'
        }, (checks, response) => {
          if (response.statusCode !== 200) {
            return false
          }

          this.loading.fetch = false
          this.items = checks

          for (const check of this.items) {
            this.enabled[check.id] = check.enabled
          }
        })
      } catch (error) {
        this.loading.fetch = false
        console.error(error)

        this.$whoopsNotify.negative({
          message: 'It is not possible to find checks. Please reload the page.'
        })
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

    destroyConfirm () {
      this.loading.destroy = true

      try {
        this.$sailsIo.socket.delete(`/v1/check/${this.destroyId}`, (result, response) => {
          if (response.statusCode !== 200) {
            return false
          }

          this.loading.destroy = false

          this.destroyCancel()
          this.forceOrdering()

          this.items = this.items.filter(item => item.id !== result.id)

          this.fetchData()

          this.$whoopsNotify.positive({
            message: 'Check successfully deleted.'
          })
        })
      } catch (error) {
        this.loading.destroy = false

        console.error(error)
        this.$whoopsNotify.negative({
          message: 'It is not possible to delete a check. Please try it again.'
        })
      }
    },

    duplicate (check) {
      const record = JSON.parse(JSON.stringify(check))
      delete record.id
      delete record.createdAt
      record.enabled = false
      record.name = `${record.name} - copy`
      record.image = check.image.id
      record.display = check.display || null
      record.order = this.items.length // order at the end

      try {
        this.$sailsIo.socket.post('/v1/check', record, (_, respose) => {
          if (response.statusCode !== 200) {
            return false
          }

          this.$whoopsNotify.positive({
            message: 'Check successfully duplicated.'
          })

          this.forceOrdering()
          this.fetchData()
        })
      } catch (error) {
        console.error(error)

        this.$whoopsNotify.negative({
          message: 'It is not possible to duplicate this check. Please try it again.'
        })
      }
    },

    move (check, howMuch) {
      const newOrder = check.order + howMuch
      const changeOrderInElementOnOrder = check.order + howMuch
      const changeOrderInElementOnOrderValue = check.order

      const changes = []
      for (const item of this.items) {
        if (item.order === changeOrderInElementOnOrder) {
          changes.push({
            id: check.id,
            order: newOrder
          })

          changes.push({
            id: item.id,
            order: changeOrderInElementOnOrderValue
          })
        }
      }

      try {
        for (const change of changes) {
          this.$sailsIo.socket.patch(`/v1/check/${change.id}`, {
            order: change.order
          }, (_, response) => {
            if (response.statusCode !== 200) {
            return false
          }

            this.fetchData()
          })
        }
      } catch (error) {
        console.error(error)

        this.$whoopsNotify.negative({
          message: 'It is not possible to change the ordering. Please try it again.'
        })
      }
    },

    forceOrdering () {
      try {
        this.loading.order = true
        this.$sailsIo.socket.post('/v1/check/reorder-all', (_, response) => {
          if (response.statusCode !== 200) {
            return false
          }

          this.fetchData()
          this.loading.order = false
        })
      } catch (error) {
        this.loading.order = false
        this.$whoopsNotify.negative({
          message: 'It is not possible to force a new ordering. Please try it again.'
        })
      }
    },

    datetime (date) {
      return datetime(date)
    }
  }
})
</script>
