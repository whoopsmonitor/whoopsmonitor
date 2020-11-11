<template>
  <q-page padding>
    <h1 v-if="edit" class="text-h4 q-mt-sm">Update Docker Image</h1>
    <h1 v-else class="text-h4 q-mt-sm">New Docker Image</h1>

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
        <q-tab name="metadata" label="Metadata" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="general" class="q-gutter-md">
          <q-select
            v-model="form.type"
            :options="imageTypes"
            label="Type *"
            hint="Select image type."
            emit-value
            lazy-rules
            :rules="[ val => val && Object.keys(val).length > 0 || 'Please select image type.']"
          />

          <q-toggle
            v-model="form.local"
            checked-icon="check"
            color="green"
            unchecked-icon="clear"
            label="local image"
          >
            <q-tooltip>Select if you have an image that is local and not remote.</q-tooltip>
          </q-toggle>

          <q-input
            filled
            v-model="form.image"
            label="Docker image *"
            hint="Enter full path to the docker image. You can use the tag as well."
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please enter the path to the image.']"
            @input="updateDockerImagePath"
          />

          <q-banner class="bg-secondary text-white q-mt-xl" dense>
            <template v-slot:avatar>
              <q-icon name="https" color="white" />
            </template>
            <div>In case the image is stored in a private registry, please enter the name and password to the registry. All secret credentials are encrypted.</div>
          </q-banner>

          <div class="row q-mt-md q-col-gutter-sm">
            <div class="col">
              <q-input
                filled
                v-model="form.username"
                label="Username"
              />
            </div>
            <div class="col">
              <q-input
                type="password"
                filled
                v-model="form.password"
                label="Password"
              />
            </div>
          </div>
          <template v-if="hasCredentials">
            <div class="row q-mt-sm text-italic">
              <div class="col">
                <q-icon name="info" />
                You already saved some credentials. You do not need to enter it again.
              </div>
            </div>
            <div class="row">
              <div class="col">
                <q-checkbox v-model="credentialsCleared" label="clear credentials" />
              </div>
            </div>
          </template>
        </q-tab-panel>

        <q-tab-panel name="metadata">
          <div v-if="metadata">
            <h4 class="text-h6 q-ma-none">Documentation</h4>
            <div v-if="metadataDocumentationUrl">
              <a :href="metadataDocumentationUrl" target="_blank">
                {{ metadataDocumentationUrl }}
              </a>
            </div>
            <div v-else>no documentation provided</div>

            <div v-for="(value, name) in form.metadata" :key="name" class="row">
              <div class="col">
                {{ name }}
              </div>
              <div class="col">
                {{ value }}
              </div>
            </div>
          </div>
          <div v-else>
            Metadata are not available yet. You have to save the image first or the image does not include it.
          </div>
        </q-tab-panel>
      </q-tab-panels>

      <div class="q-mt-lg">
        <q-btn :label="edit ? 'update details' : 'Add a new image'" type="submit" color="primary" :loading="loading.update" :disable="loading.update" />
        <q-btn label="Cancel and return" type="reset" color="primary" flat class="q-ml-sm" :to="{ name: 'image.index' }" :disable="loading.update" />
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { pick } from 'lodash'

export default {
  name: 'PageImageCreate',
  data () {
    return {
      tab: 'general',
      form: {
        image: '',
        username: '',
        password: '',
        type: '',
        local: false
      },
      loading: {
        update: false
      },
      metadata: '',
      hasCredentials: false,
      credentialsCleared: false,
      imageTypes: [
        {
          label: 'Check - this image runs check on regular interval',
          value: 'check'
        },
        {
          label: 'Alert - send notification about the check status',
          value: 'alert'
        }
      ]
    }
  },
  computed: {
    edit () {
      return this.$route.meta.edit || false
    },
    metadataDocumentationUrl () {
      const picked = pick(this.metadata, 'com.whoopsmonitor.documentation')
      if (Object.keys(picked).length) {
        return picked['com.whoopsmonitor.documentation']
      }

      return ''
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
        const item = await this.$axios.get(`/v1/dockerimage/${this.$route.params.id}`, {
          params: {
            select: 'id,image,username,password,type,local,metadata'
          }
        }).then((response) => response.data)

        if (item) {
          this.form.image = item.image
          if (item.username && item.password) {
            this.hasCredentials = true
          }
          this.form.type = item.type
          this.form.local = item.local

          this.metadata = item.metadata ? JSON.parse(item.metadata) : ''
        }
      } catch (error) {
        console.error(error)
        this.$whoopsNotify.negative({
          message: 'It is not possible to load Docker image details. Please refresh this page.'
        })
      }
    },

    async onSubmit () {
      const method = this.edit ? 'patch' : 'post'
      const form = JSON.parse(JSON.stringify(this.form))

      // remove credentials in case they are not entered up (prevent update those details)
      if (!form.username.length) {
        delete form.username
      }

      if (!form.password.length) {
        delete form.password
      }

      if (this.credentialsCleared) {
        // credentials required but have to be empty
        form.username = ''
        form.password = ''
      }

      // delete metadata
      delete form.metadata

      // reset healthcheck
      form.healthyStatus = -1
      form.healthyStatusOutput = ''

      try {
        this.loading.update = true

        await this.$axios[method]('/v1/dockerimage' + (this.edit ? `/${this.$route.params.id}` : ''), form)

        this.$whoopsNotify.positive({
          message: (this.edit ? 'Image details successfully updated.' : 'New image has been successfully added.') + ' Please wait a minute - so the image can be processed.'
        })

        this.$router.push({ name: 'image.index' })
      } catch (error) {
        console.error(error)
        this.$whoopsNotify.negative({
          message: this.edit ? 'It is not possible to update details of the Docker image. Please try it again.' : 'It is not possible to insert a new Docker image. Please try it again.'
        })
      } finally {
        this.loading.update = false
      }
    },

    updateDockerImagePath (val) {
      this.form.image = val.replace('docker pull ', '')
    }
  }
}
</script>
