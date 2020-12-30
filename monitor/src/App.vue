<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script>
export default {
  name: 'App',
  created () {
    this.$store.commit('config/setApiUrl', process.env.APP_API_URL)
    this.$store.commit('config/setApiToken', process.env.API_TOKEN)
  }
}
</script>
