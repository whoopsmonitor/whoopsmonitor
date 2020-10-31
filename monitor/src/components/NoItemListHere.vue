<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6">
        <q-icon name="info" />
        {{ title }}
      </div>
    </q-card-section>

    <q-separator inset />

    <q-card-section>
      {{ description }}
    </q-card-section>

    <q-separator />

    <q-card-actions>
      <q-btn flat color="primary" type="a" :to="to">{{ toTitle }}</q-btn>
    </q-card-actions>
  </q-card>
</template>

<script>
export default {
  name: 'NoItemListHere',
  props: {
    title: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: 'add'
    },
    description: {
      type: String,
      required: true
    },
    to: {
      type: Object,
      required: true
    },
    toTitle: {
      type: String,
      required: true
    }
  }
}
</script>
