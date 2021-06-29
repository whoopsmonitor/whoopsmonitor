<template>
  <div>
    <div class="row">
      <div class="col-6 bg">
        <div class="row window-height justify-center">
          <div class="col self-center text-center">
            <q-img
              src="logo/login-page.png"
              style="height: 256px; max-width: 512px"
              class="self-center"
              basic
              contain
            />
          </div>
        </div>
      </div>
      <div class="col-6">
        <div class="row window-height justify-center">
          <div class="col-6 self-center">
            <q-input
              type="password"
              label="Enter Admin Password"
              outlined
              autofocus
              v-model="form.password"
              lazy-rules
              @keypress.enter="login"
              :loading="loading"
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
            </q-input>
            <div class="text-right q-pt-sm">
              <router-link :to="{ name: 'dashboard' }">or continue as a guest</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'LoginPage',
  data () {
    return {
      form: {
        password: ''
      },
      loading: false
    }
  },
  methods: {
    async login () {
      this.loading = true

      try {
        await this.$axios.post('/v1/auth/login', {
          password: this.form.password
        }).then(result => result.data)

        this.$store.commit('auth/setToken', this.form.password)

        this.$whoopsNotify.positive({
          message: 'Welcome back!'
        })

        this.$router.replace({
          name: 'dashboard'
        })
      } catch (error) {
        console.error(error)
        this.$whoopsNotify.negative({
          message: 'Wrong credentials. Please try it again.'
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="sass">
  .bg
    background-color: #2D4F6C
</style>
