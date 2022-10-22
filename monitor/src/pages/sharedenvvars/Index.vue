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
import SkeletonList from '../../components/SkeletonList.vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import filteredItems from '../../helpers/filteredItems'

import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PageSharedEnvVarsIndex',
  components: {
    SkeletonList,
    ConfirmDialog,
    FilterResults
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
  created () {
    this.fetchData()
  },
  methods: {
    fetchData () {
      this.loading.fetch = true

      try {
        this.$sailsIo.socket.get('/v1/environmentvariables', (items, response) => {
          if (response.statusCode !== 200) {
            return false
          }

          this.loading.fetch = false
          this.items = items
        })
      } catch (error) {
        this.loading.fetch = false

        console.error(error)
        this.$whoopsNotify.negative({
          message: 'It is not possible to find load environment variables. Please reload the page.'
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
        this.$sailsIo.socket.delete(`/v1/environmentvariables/${this.destroyId}`, (record, response) => {
          this.destroyCancel()

          if (response.statusCode !== 200) {
            return false
          }

          this.items = this.items.filter(item => item.id !== record.id)

          this.$whoopsNotify.positive({
            message: 'Environment variable successfully deleted.'
          })
        })
      } catch (error) {
        this.destroyCancel()

        console.error(error)
        this.$whoopsNotify.negative({
          message: 'It is not possible to delete an environment variable. Please try it again.'
        })
      }
    }
  }
})
</script>
