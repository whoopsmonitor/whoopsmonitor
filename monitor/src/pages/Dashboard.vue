<template>
  <q-page padding>
    <div class="row q-col-gutter-sm">
      <div class="col-9 col-md-9 col-sm-12 col-xs-12">
        <list-of-checks />
        <p></p>
        <quick-demo v-if="!checks.length" />
      </div>
      <div class="col-3 col-md-3 col-sm-12 col-xs-12">
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <correctness-index :hours="24" last-text="last 24 hours" />
          </div>
          <div class="col-12">
            <status-box @ready="statusData = $event || []" />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import ListOfChecks from '../components/ListOfChecks.vue'
import StatusBox from '../components/StatusBox.vue'
import CorrectnessIndex from '../components/CorrectnessIndex.vue'
import QuickDemo from '../components/QuickDemo.vue'

import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DashboardIndex',
  components: {
    ListOfChecks,
    StatusBox,
    CorrectnessIndex,
    QuickDemo
  },
  data () {
    return {
      statusData: [],
      checks: []
    }
  },

  computed: {
    hasChecks () {
      return this.checks.length > 0
    }
  },

  async created () {
    try {
      this.checks = await this.$axios.get('/v1/check', {
        params: {
          populate: false,
          select: 'id'
        }
      }).then((res) => res.data)
    } catch (error) {
      if (error) {
        console.error(error)
      }
    }
  }
})
</script>
