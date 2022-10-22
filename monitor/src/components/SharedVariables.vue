<template>
  <div class="row q-col-gutter-sm">
    <div class="col-12 text-bold">
      Shared Environment Variables
    </div>
    <div class="col-12" v-if="!loading && variables.length">
      <q-checkbox
        v-model="selected"
        v-for="item in variables"
        :key="item.id"
        :val="item.id"
        :label="item.key"
        @update:model-value="select"
      />
    </div>
    <div v-if="!loading && !variables.length">
      There are no shared environment variables yet.
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SharedVariablesComponent',
  props: {
    modelValue: {
      type: Array,
      defaultsTo: []
    }
  },
  data () {
    return {
      variables: [],
      selected: [],
      loading: false
    }
  },
  async created () {
    this.fetch()

    // mark the default "value" as "selected"
    this.selected = this.modelValue
  },
  methods: {
    fetch () {
      this.loading = true

      try {
        this.$sailsIo.socket.get('/v1/environmentvariables', {
          select: 'key,value'
        }, (variables, response) => {
          if (response.statusCode !== 200) {
            return false
          }

          this.variables = variables
          this.loading = false
        })
      } catch (error) {
        this.loading = false
        console.error(error)
      }
    },
    select (val) {
      this.$emit('update:modelValue', val)
    }
  }
})
</script>
