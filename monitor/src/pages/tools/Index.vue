<template>
  <q-page padding>
    <q-tabs
        v-model="tab"
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="queue" label="Queue" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="queue" class="q-gutter-md">
        <div class="row q-mt-md q-col-gutter-sm">
          <div class="col-xs-12 col-sm-6 col-md-4">
            <redis-queue name="executeCheck" description="check executions" />
          </div>
          <div class="col-xs-12 col-sm-6 col-md-4">
            <redis-queue name="alertingQueue" description="alerting queue" />
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script>
import RedisQueue from '../../components/RedisQueue.vue'

import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BackupRestoreIndex',
  components: {
    RedisQueue
  },
  data () {
    return {
      tab: 'queue'
    }
  }
})
</script>
