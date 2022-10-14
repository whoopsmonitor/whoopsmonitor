<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6">
        Results
        <div class="text-caption">
          in last 24 hours
        </div>
      </div>
    </q-card-section>

    <q-separator inset />

    <q-card-section class="text-center">
      <div class="row" v-if="results.length">
        <div class="col">
          <div class="row">
            <div class="col-12 text-h6">
              {{ percentage.ok }}%
            </div>
            <div class="col-12">
              <q-icon name="check_circle" size="md" color="green" />
            </div>
          </div>
        </div>
        <div class="col">
          <div class="row">
            <div class="col-12 text-h6">
              {{ percentage.warning }}%
            </div>
            <div class="col-12">
              <q-icon name="warning" size="md" color="orange" />
            </div>
          </div>
        </div>
        <div class="col">
          <div class="row">
            <div class="col-12 text-h6">
              {{ percentage.critical }}%
            </div>
            <div class="col-12">
              <q-icon name="error" size="md" color="red" />
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-h5">
        no data yet
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { DateTime } from 'luxon'

import { defineComponent } from 'vue'

export default defineComponent({
  name: 'StatusBox',
  data () {
    return {
      results: [],
      interval: undefined
    }
  },
  computed: {
    percentage () {
      const critical = this.findStatusById(2).total
      const warning = this.findStatusById(1).total
      const ok = this.findStatusById(0).total
      const total = critical + warning + ok

      return {
        critical: Math.round(critical / total * 100) || 0,
        warning: Math.round(warning / total * 100) || 0,
        ok: Math.round(ok / total * 100) || 0
      }
    }
  },
  async created () {
    await this.fetchData()

    this.interval = setInterval(async () => {
      await this.fetchData()
    }, 60000)
  },
  unmounted () {
    clearInterval(this.interval)
  },
  methods: {
    async fetchData () {
      const date = DateTime.local()
      const startOfInterval = date.minus({
        hours: 24
      })

      await this.$sailsIo.socket.get('/v1/checkstatus/aggregate', {
        from: startOfInterval.valueOf(),
        to: date.valueOf()
      }, results => {
        this.results = results
        this.$emit('ready', this.results)
      })
    },
    findStatusById (id) {
      return this.results.filter(result => result.status === id)[0] || { total: 0, status: 0 }
    }
  }
})
</script>
