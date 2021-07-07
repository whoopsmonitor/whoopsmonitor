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
        @input="select"
      />
    </div>
    <div v-if="!loading && !variables.length">
      There are no shared environment variables yet.
    </div>
  </div>
</template>

<script>
export default {
  name: 'SharedVariablesComponent',
  props: {
    value: {
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
    await this.fetch()

    // mark the default "value" as "selected"
    this.selected = this.value
  },
  methods: {
    async fetch () {
      this.loading = true
      try {
        this.variables = await this.$axios.get('/v1/environmentvariables', {
          params: {
            select: 'key,value'
          }
        }).then(result => result.data)
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    select (val) {
      this.$emit('input', val)
    }
  }
}
</script>
