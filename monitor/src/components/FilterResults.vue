<template>
  <div>
    <q-input
      :value="value"
      @input="doUpdate"
      filled
      type="search"
      placeholder="filter..."
      dense>
        <template v-slot:append>
          <q-icon name="search" />
        </template>
    </q-input>
  </div>
</template>

<script>
export default {
  name: 'FilterResults',
  props: {
    value: {
      type: String
    }
  },
  methods: {
    doUpdate (value) {
      this.$emit('input', value)
    }
  }
}
</script>
