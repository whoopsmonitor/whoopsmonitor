<template>
  <q-img
    src="/logo/login-page.png"
    :style="`height: ${height}px; max-width: ${width}px`"
    class="self-center"
    basic
    contain
  />
</template>

<script>
export default {
  name: 'LoginLogoComponent',
  props: {
    height: {
      type: Number,
      default: 256
    },
    width: {
      type: Number,
      default: 512
    }
  }
}
</script>
