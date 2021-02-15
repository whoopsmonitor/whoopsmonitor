<template>
  <q-page padding>
    <h1 v-if="edit" class="text-h4 q-mt-sm">Update Variable Details</h1>
    <h1 v-else class="text-h4 q-mt-sm">New Variable</h1>

    <q-form @submit="onSubmit">
      <q-tabs
        v-model="tab"
        align="left"
      >
        <q-tab name="general" label="General" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="general" class="q-gutter-md">
          <q-input
            filled
            v-model="form.option"
            label="Variable Name *"
            hint="Enter the variable name."
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please enter the name of your variable.']"
          />
          <q-input
            filled
            v-model="form.value"
            label="Variable Value *"
            hint="Enter the variable value."
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please enter the value of your variable.']"
          />
        </q-tab-panel>
      </q-tab-panels>

        <div class="q-mt-lg">
          <q-btn :label="edit ? 'update details' : 'Add a new variable'" type="submit" color="primary"/>
          <q-btn label="Cancel and return" type="reset" color="primary" flat class="q-ml-sm" :to="{ name: 'variable.index' }" />
        </div>
      </q-form>
  </q-page>
</template>

<script>
export default {
  name: 'PageVariableCreate',
  data () {
    return {
      form: {
        option: '',
        value: ''
      },
      tab: 'general'
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
        const item = await this.$axios.get(`/v1/variable/${this.$route.params.id}`).then((response) => response.data)

        if (item) {
          this.form.option = item.option
          this.form.value = item.value
        }
      } catch (error) {
        console.error(error)

        if (error.response) {
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
        await this.$axios[method]('/v1/variable' + (this.edit ? `/${this.$route.params.id}` : ''), form)

        this.$whoopsNotify.positive({
          message: this.edit ? 'Variable details successfully updated.' : 'New variable has been successfully added.'
        })

        this.$router.push({ name: 'variable.index' })
      } catch (error) {
        console.error(error)
        this.$whoopsNotify.negative({
          message: this.edit ? 'It is not possible to update details of the variable. Please try it again.' : 'It is not possible to insert a new variable. Please try it again.'
        })
      }
    }
  }
}
</script>
