<template>
  <q-page padding>
    <h1 v-if="edit" class="text-h4 q-mt-sm">Update Variable</h1>
    <h1 v-else class="text-h4 q-mt-sm">New Variable</h1>

    <q-form
      @submit="onSubmit"
    >
      <q-tabs
        v-model="tab"
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="general" label="General" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="general" class="q-gutter-md">
          <q-input
            filled
            v-model="form.key"
            label="Key *"
            hint="Enter key for environment variable."
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please enter the path to the image.']"
          />

          <q-input
            filled
            v-model="form.value"
            label="Value *"
            hint="Enter value for environment variable."
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please enter the path to the image.']"
          />
        </q-tab-panel>
      </q-tab-panels>

      <div class="q-mt-lg">
        <q-btn :label="edit ? 'update variable' : 'Add a new variable'" type="submit" color="primary" :loading="loading.update" :disable="loading.update" />
        <q-btn label="Cancel and return" type="reset" color="primary" flat class="q-ml-sm" :to="{ name: 'sharedenvvars.index' }" :disable="loading.update" />
      </div>
    </q-form>
  </q-page>
</template>

<script>
export default {
  name: 'PageSharedEnvVarsCreate',
  data () {
    return {
      tab: 'general',
      form: {
        key: '',
        value: ''
      },
      loading: {
        update: false
      }
    }
  },
  computed: {
    edit () {
      return this.$route.meta.edit || false
    }
  },
  async created () {
    if (this.edit) {
      await this.fetchData()
    }
  },
  methods: {
    async fetchData () {
      try {
        const item = await this.$axios.get(`/v1/environmentvariables/${this.$route.params.id}`).then(response => response.data)

        if (item) {
          this.form.key = item.key
          this.form.value = item.value
        }
      } catch (error) {
        console.error(error)

        if (error) {
          this.$whoopsNotify.negative({
            message: 'It is not possible to load variable details. Please refresh this page.'
          })
        }
      }
    },

    async onSubmit () {
      const method = this.edit ? 'patch' : 'post'
      const form = JSON.parse(JSON.stringify(this.form))

      try {
        this.loading.update = true

        await this.$axios[method]('/v1/environmentvariables' + (this.edit ? `/${this.$route.params.id}` : ''), form)

        this.$whoopsNotify.positive({
          message: (this.edit ? 'Variable details successfully updated.' : 'New variable has been successfully added.')
        })

        this.$router.push({ name: 'sharedenvvars.index' })
      } catch (error) {
        console.error(error)
        this.$whoopsNotify.negative({
          message: this.edit ? 'It is not possible to update details of the variable. Please try it again.' : 'It is not possible to create a new variable. Please try it again.'
        })
      } finally {
        this.loading.update = false
      }
    }
  }
}
</script>
