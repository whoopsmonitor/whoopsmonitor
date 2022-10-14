<template>
  <q-dialog v-model="opened" persistent @hide="closeDialog">
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="help" color="red" text-color="white" />
        <span class="q-ml-sm">
          <slot />
        </span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn @click="confirm" flat label="Delete" color="red" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ConfirmDialog',
  props: {
    open: {
      type: Boolean,
      defaults: false
    }
  },
  data () {
    return {
      opened: this.open
    }
  },
  watch: {
    open (opened) {
      this.opened = opened
    }
  },
  methods: {
    closeDialog () {
      this.opened = false
      this.$emit('cancel')
    },
    confirm () {
      this.$emit('confirm')
      this.closeDialog()
    }
  }
})
</script>
