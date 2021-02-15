<template>
  <q-page padding>
    <q-card v-if="variables.length" flat bordered>
      <q-card-section>
        <div class="text-h6">Shared Variables</div>
      </q-card-section>

      <q-separator inset />

      <q-card-section>
        <q-list bordered separator>
          <q-item v-for="variable in variables" :key="variable.id">
            <q-item-section>
              <q-item-label line="1" caption>
                <router-link :to="{ name: 'variable.detail', params: { id: variable.id }}">{{ variable.option }}</router-link>
              </q-item-label>
            </q-item-section>
            <q-item-section top side>
              <div class="text-grey-8 q-gutter-xs">
                <q-btn
                  @click="destroyDialog(variable.id)"
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
      v-if="!loading.fetch && !variables.length"
      title="No variables here"
      description="Currently there are no shared variables here yet. Please add a new one."
      :to="{ name: 'variable.create' }"
      to-title="new variable"
    />

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" type="a" :to="{ name: 'variable.create' }" title="New Variable" />
    </q-page-sticky>

    <confirm-dialog
      :open="dialog.destroy"
      @cancel="destroyCancel"
      @confirm="destroyConfirm"
    >
      Are you sure you want to delete this variable?<br />
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
  name: 'PageVariableIndex',
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
      variables: [],
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
        this.variables = await this.$axios.get('/v1/variable', {
          params: {
            select: 'option,value'
          }
        }).then(response => response.data)
      } catch (error) {
        console.error(error)
        this.$whoopsNotify.negative({
          message: 'It is not possible to load shared variables. Please reload the page.'
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
        await this.$axios.delete(`/v1/variable/${this.destroyId}`)

        await this.fetchData({
          verbose: false
        })

        this.$whoopsNotify.positive({
          message: 'Variable successfully deleted.'
        })
      } catch (error) {
        console.error(error)
        this.$whoopsNotify.negative({
          message: 'It is not possible to delete a variable. Please try it again.'
        })
      } finally {
        this.destroyCancel()
      }
    }
  }
}
</script>
