<template>
  <div>
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
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LoginBoxComponent',
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
        await this.$sailsIo.socket.post('/v1/auth/login', {
          password: this.form.password.toString().trim()
        }, (_, jwres) => {
          if ('statusCode' in jwres) {
            if (jwres.statusCode === 401) {
              return this.$whoopsNotify.negative({
                message: 'Wrong credentials. Please try it again.'
              })
            }
          }

          this.$store.commit('auth/setToken', this.form.password)

          this.$whoopsNotify.positive({
            message: 'Welcome back!'
          })

          this.$router.replace({
            name: 'dashboard'
          })
        })
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    }
  }
})
</script>
