<template>
  <q-page padding>
    <div class="row q-col-gutter-sm">
      <div class="col-9 col-md-9 col-sm-12 col-xs-12">
        <list-of-checks />
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
import ListOfChecks from '../components/ListOfChecks'
import StatusBox from '../components/StatusBox'
import CorrectnessIndex from '../components/CorrectnessIndex'

export default {
  name: 'DashboardIndex',
  components: {
    ListOfChecks,
    StatusBox,
    CorrectnessIndex
  },
  data () {
    return {
      statusData: []
    }
  }
}
</script>
