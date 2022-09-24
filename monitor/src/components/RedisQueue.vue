<template>
  <q-card>
    <q-card-section>
      <q-skeleton class="text-h6" type="text" v-if="loading.find" />
      <div v-else>
        <div class="text-h6">{{ name }}</div>
        <div class="text-subtitle2">{{ description }}</div>
      </div>

      <q-separator />

      <p></p>

      <q-skeleton class="text-h6" type="text" v-if="loading.find" />

      <template v-if="!loading.find">
        <p class="text-h6" v-if="count === 0">{{ count }} records</p>
        <p class="text-h6" v-if="count === 1">{{ count }} record</p>
        <p class="text-h6" v-if="count > 1">{{ count }} records</p>
      </template>
    </q-card-section>

    <q-separator />

    <q-card-actions>
      <q-btn flat @click="clean" :disabled="loading.find || loading.clean">clean</q-btn>
    </q-card-actions>
  </q-card>
</template>

<script>
export default {
  name: 'LoginBoxComponent',
  props: {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      count: 0,
      loading: {
        find: false,
        clean: false
      },
      queue: 'executeCheck'
    }
  },
  async created () {
    await this.fetchData()
  },
  methods: {
    async fetchData () {
      this.loading.find = true

      try {
        this.count = await this.$axios.get(`/v1/queue/${this.name}`).then(result => result.data.data.count)
      } catch (error) {
        if (error) {
          console.error(error)
        }
      }

      this.loading.find = false
    },

    async clean () {
      this.loading.clean = true

      try {
        const count = await this.$axios.delete(`/v1/queue/${this.name}`).then(result => result.data.data)
        this.$whoopsNotify.positive({
          message: `Cleaned ${count} record(s) in the <i>${this.name}</i> queue.`
        })
      } catch (error) {
        if (error) {
          console.error(error)
        }

        this.$whoopsNotify.negative({
          message: `It is not possible to clean up records in the <i>${this.name}</i> queue.`
        })
      }

      this.loading.clean = false
    }
  }
}
</script>
