<template>
  <div>
    <q-input
      :model-value="modelValue"
      @update:model-value="doUpdate"
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

import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FilterResults',
  props: {
    modelValue: {
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
      this.$emit('update:modelValue', value)
    }
  }
})
</script>
