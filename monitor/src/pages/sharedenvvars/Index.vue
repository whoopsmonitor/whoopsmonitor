<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section>
        <div class="row">
          <div class="col">
            <div class="text-h6">Environment Variables</div>
          </div>
          <div class="col">
            <filter-results
              v-model="filter.results"
              cache-key="envkey"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator inset />

      <q-card-section v-if="filteredItems.length">
        <q-list bordered separator>
          <q-item v-for="item in filteredItems" :key="item.id">
            <q-item-section>
              <q-item-label line="1">
                <router-link :to="{ name: 'sharedenvvars.detail', params: { id: item.id }}">
                  {{ item.key }}
                </router-link>
              </q-item-label>
            </q-item-section>
            <q-item-section top side>
              <div class="text-grey-8 q-gutter-xs">
                <q-btn
                  @click="destroyDialog(item.id)"
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

      <q-card-section v-if="!loading.fetch && !filteredItems.length" class="q-ma-md">
        <p>
          There are no variables to select from.
        </p>
        <div>
          <q-btn flat color="primary" type="a" :to="{ name: 'sharedenvvars.create' }">new variable</q-btn>
        </div>
      </q-card-section>
    </q-card>

    <skeleton-list v-if="loading.fetch" />

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" type="a" :to="{ name: 'sharedenvvars.create' }" title="New Environment Variable" />
    </q-page-sticky>

    <confirm-dialog
      :open="dialog.destroy"
      @cancel="destroyCancel"
      @confirm="destroyConfirm"
    >
      Are you sure you want to delete this variable?
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
  name: 'PageSharedEnvVarsIndex',
  components: {
    SkeletonList,
    ConfirmDialog,
    FilterResults
  },
  filters: {
    datetime: DateTime
  },
  data () {
    return {
      items: [],
      loading: {
        fetch: false,
        destroy: false
      },
      dialog: {
        destroy: false
      },
      destroyId: '',
      filter: {
        results: ''
      },
      filterByKey: 'key'
    }
  },
  computed: {
    ...filteredItems
  },
  async created () {
    await this.fetchData({
      verbose: true
    })
  },
  methods: {
    async fetchData (config) {
      config = config || {}

      if (config.verbose) {
        this.loading.fetch = true
      }

      try {
        this.items = await this.$axios.get('/v1/environmentvariables').then(response => response.data)
      } catch (error) {
        console.error(error)
        this.$whoopsNotify.negative({
          message: 'It is not possible to find load environment variables. Please reload the page.'
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
        await this.$axios.delete(`/v1/environmentvariables/${this.destroyId}`)
        await this.fetchData({
          verbose: false
        })
        this.$whoopsNotify.positive({
          message: 'Environment variable successfully deleted.'
        })
      } catch (error) {
        console.error(error)
        this.$whoopsNotify.negative({
          message: 'It is not possible to delete an environment variable. Please try it again.'
        })
      } finally {
        this.destroyCancel()
      }
    }
  }
}
</script>
