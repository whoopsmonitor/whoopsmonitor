<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-6 col-md-6 col-sm-12 col-xs-12">
        <list-of-checks />
      </div>
      <div class="col-3 col-md-3 col-sm-6 col-xs-12">
        <correctness-index :data="statusData" />
      </div>
      <div class="col-3 col-md-3 col-sm-6 col-xs-12">
        <status-box @ready="statusData = $event || []" />
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
