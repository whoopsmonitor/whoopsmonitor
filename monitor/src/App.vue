<template>
  <router-view />
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App',
  created () {
    this.$store.commit('config/setApiUrl', process.env.APP_API_URL)
    this.$store.commit('config/setApiToken', process.env.APP_TOKEN)

    // join realtime events
    this.$sailsIo.socket.get('/v1/realtime/join')
  }
})
</script>
