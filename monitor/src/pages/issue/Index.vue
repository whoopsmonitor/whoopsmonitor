<template>
  <q-page padding>
    <h3 class="text-h4 q-mt-sm">Count of issues: {{ count }}</h3>
    <div v-if="output.length">
      <p>There are some errors in the application. Please check bellow:</p>

      <div v-for="(message, id) in output" :key="id">
        <q-icon name="info" class="on-left" /> <span>{{ message }}</span>
      </div>
    </div>
    <div v-else class="text-italic">
      Currently there are no system issues 🎉
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'IssueIndex',
  computed: {
    count () {
      return this.$store.state.issue.count
    },
    output () {
      return this.$store.state.issue.output
    }
  }
})
</script>
