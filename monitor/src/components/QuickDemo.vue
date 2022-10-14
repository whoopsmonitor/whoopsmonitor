<template>
  <q-card flat bordered>
    <q-card-section>
      <h3 class="text-right text-h6 q-mt-none q-mb-none">Demo Installation</h3>
    </q-card-section>
    <q-card-section v-if="!installed">
      You can also install a single check that pings Google server in 1m interval.

      <p class="q-mt-md">
        <q-btn @click="install" :disable="loading">install demo check</q-btn>
      </p>
    </q-card-section>

    <q-card-section v-if="installed">
      Check has been successfully installed. It might take a minute or two for the check to start working. Please refresh this page.

      <p class="q-mt-md">
        <q-btn @click="refresh">refresh</q-btn>
      </p>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'QuickStart',
  props: {
  },
  data () {
    return {
      loading: false,
      installed: false
    }
  },

  methods: {
    async install () {
      try {
        this.loading = true

        await this.$axios.post('/v1/demodata')

        this.installed = true
      } catch (error) {
        console.error(error)
      }

      this.loading = false
    },

    refresh () {
      window.location.reload()
    }
  }
})
</script>
