<template>
  <div>
    <div class="row gt-xs">
      <div class="col-6 bg">
        <div class="row window-height justify-center">
          <div class="col self-center text-center">
            <login-logo />
          </div>
        </div>
      </div>
      <div class="col-6">
        <div class="row window-height justify-center">
          <div class="col-xs-10 col-sm-8 self-center">
            <login-box />
          </div>
        </div>
      </div>
    </div>
    <div class="row lt-xs">
      <div class="col-12 bg q-pa-lg">
        <login-logo :height="128" />
      </div>
      <div class="col-12 q-mt-lg">
        <div class="row justify-center">
          <div class="col-10 self-center">
            <login-box />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import LoginBox from '../components/LoginBox.vue'
import LoginLogo from '../components/LoginLogo.vue'

export default {
  name: 'LoginPage',
  components: {
    LoginBox,
    LoginLogo
  }
}
</script>

<style lang="sass">
  .bg
    background-color: #2D4F6C
</style>
