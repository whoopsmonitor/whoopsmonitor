<template>
  <div>
    <q-input
      :value="value"
      @input="doUpdate"
      filled
      type="search"
      placeholder="filter..."
      dense
      clearable
     >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
    </q-input>
  </div>
</template>

<script>
import { SessionStorage } from 'quasar'

export default {
  name: 'FilterResults',
  props: {
    value: {
      type: String
    },
    cacheKey: {
      type: String,
      required: true
    }
  },
  created () {
    const sessionValue = SessionStorage.getItem(this.cacheKey)

    if (sessionValue !== null) {
      this.doUpdate(sessionValue)
    }
  },
  methods: {
    doUpdate (value) {
      if (value === null) {
        value = ''
      }

      SessionStorage.set(this.cacheKey, value)
      this.$emit('input', value)
    }
  }
}
</script>
