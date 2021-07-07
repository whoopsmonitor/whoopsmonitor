<template>
  <q-page padding>
    <h1 v-if="edit" class="text-h4 q-mt-sm">Update Alert Details: {{ form.name }}</h1>
    <h1 v-else class="text-h4 q-mt-sm">New Alert</h1>

    <q-form @submit="onSubmit">
      <q-toggle
        v-model="form.enabled"
        checked-icon="check"
        color="green"
        unchecked-icon="clear"
        label="Published"
      />

      <q-tabs
        v-model="tab"
        align="left"
      >
        <q-tab name="general" label="General" />
        <q-tab name="env" label="ENV Variables" :disable="Object.values(form.image).length === 0" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="general" class="q-gutter-md">
          <q-input
            filled
            v-model="form.name"
            label="Alert Name *"
            hint="Enter the alert name."
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please enter the name of your alert.']"
          />

          <q-select
            v-if="hasImages"
            v-model="form.image"
            :options="imageOptions"
            label="Image *"
            hint="Select the image."
            lazy-rules
            :rules="[ val => val && Object.keys(val).length > 0 || 'Please select image that represents the alert.']"
            use-input
            input-debounce="0"
            @filter="filterImages"
          >
          <template v-slot:option="scope">
            <q-item
              v-bind="scope.itemProps"
              v-on="scope.itemEvents"
            >
              <q-item-section avatar v-if="scope.opt.icon">
                <q-icon :name="scope.opt.icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label v-html="scope.opt.label" />
                <q-item-label caption v-if="scope.opt.description">{{ scope.opt.description }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
          </q-select>
          <div v-else>
            <div class="caption">Images</div>
            There are no images to select from or they are invalid.
          </div>

          <div>
            <h6 class="text-caption q-ma-none q-mb-sm">Repeat (minutes)</h6>
            <q-slider v-model="form.repeat" :min="1" :max="60" snap label />
            <div class="text-caption">Alert won't trigger for selected period (in case status has not changed).</div>
          </div>

          <div>
            <div class="text-h6">Levels</div>
            <div class="text-caption">Allows notification for selected levels.</div>

            <q-toggle
              label="success"
              v-model="form.level"
              :val="0"
              color="green"
            />

            <q-toggle
              label="warning"
              v-model="form.level"
              :val="1"
              color="orange"
            />
            <q-toggle
              label="critical"
              v-model="form.level"
              :val="2"
              color="red"
            />
            <div class="text-red" v-if="form.level && !form.level.length">
              Please select some level. Otherwise it will be saved with all options checked.
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="env" class="q-gutter-md">
          <q-banner class="bg-secondary text-white q-mt-sm" dense>
            <template v-slot:avatar>
              <q-icon name="info" color="white" />
            </template>
            <div>Put your environment variables in the field bellow like you would do in Docker <i>.env</i> file, like:</div>
            <div>
              MY_VARIABLE=MY_VALUE
            </div>
          </q-banner>

          <div class="text-red">
            <q-icon name="https" /> Every variable you put in here is encrypted when stored.
          </div>

          <q-input
            v-model="form.environmentVariables"
            filled
            type="textarea"
          />

          <q-btn @click="loadEnvVars" size="sm" :disabled="!form.image">
            reset variables
            <q-tooltip>Reset variables to default ones provided by the image.</q-tooltip>
          </q-btn>

          <shared-variables
            v-model="form.sharedEnvironmentVariables"
          />
        </q-tab-panel>

      </q-tab-panels>

        <div class="q-mt-lg">
          <q-btn :label="edit ? 'update details' : 'Add a new alert'" type="submit" color="primary"/>
          <q-btn label="Cancel and return" type="reset" color="primary" flat class="q-ml-sm" :to="{ name: 'alert.index' }" />
        </div>
      </q-form>
  </q-page>
</template>

<script>
import ini from 'ini'
import SharedVariables from '../../components/SharedVariables.vue'
const levels = [0, 1, 2]

export default {
  name: 'PageCheckCreate',
  components: {
    SharedVariables
  },
  data () {
    return {
      form: {
        enabled: true,
        name: '',
        description: '',
        image: '',
        environmentVariables: '',
        repeat: 5,
        level: levels,
        sharedEnvironmentVariables: []
      },
      tab: 'general',
      images: [],
      filterImagesString: '',
      hasImages: false
    }
  },
  computed: {
    edit () {
      return this.$route.meta.edit || false
    },
    imageOptions () {
      let items = this.images.map((image) => {
        const metadata = JSON.parse(image.metadata)

        const opts = {
          label: image.image,
          value: image.id
        }

        if (metadata['com.whoopsmonitor.icon']) {
          opts.icon = `img:${metadata['com.whoopsmonitor.icon']}`
        }

        return opts
      })

      if (this.filterImagesString.length) {
        items = items
          .filter(
            input => input.label.toLowerCase().indexOf(
              this.filterImagesString.toLowerCase()
            ) > -1
          )
      }

      return items
    }
  },
  async created () {
    if (this.edit) {
      await this.fetchData()
    }

    this.fetchImages()
  },

  methods: {
    async fetchImages () {
      try {
        this.images = await this.$axios.get('/v1/dockerimage', {
          params: {
            select: 'image,metadata',
            where: {
              type: 'alert'
            },
            healthyStatus: 0 // "0" means success in unix world
          }
        }).then(result => result.data)

        if (this.images.length) {
          this.hasImages = true
        }
      } catch (error) {
        console.error(error)
      }
    },

    async fetchData () {
      try {
        const item = await this.$axios.get(`/v1/alert/${this.$route.params.id}`).then((response) => response.data)

        if (item) {
          this.form.enabled = (typeof item.enabled === 'boolean' ? item.enabled : false)
          this.form.name = item.name
          this.form.description = item.description
          if (item.image) {
            this.form.image = {
              label: item.image.image,
              value: item.image.id
            }
          }
          this.form.repeat = item.repeat
          this.form.environmentVariables = ini.stringify(item.environmentVariables)
          this.form.sharedEnvironmentVariables = item.sharedEnvironmentVariables.map(i => i.id)
          this.form.level = (typeof item.level === 'undefined' ? levels : item.level)
        }
      } catch (error) {
        console.error(error)

        if (error.response) {
          this.$whoopsNotify.negative({
            message: 'It is not possible to load alert details. Please refresh this page.'
          })
        }
      }
    },

    async onSubmit () {
      const method = this.edit ? 'patch' : 'post'
      const form = JSON.parse(JSON.stringify(this.form))

      try {
        if (form.environmentVariables) {
          form.environmentVariables = ini.parse(form.environmentVariables)
        }

        // make sure image is just an ID
        form.image = form.image.value

        if (!form.level.length) {
          form.level = [0, 1, 2]
        }

        await this.$axios[method]('/v1/alert' + (this.edit ? `/${this.$route.params.id}` : ''), form)

        this.$whoopsNotify.positive({
          message: this.edit ? 'Alert details successfully updated.' : 'New alert has been successfully added.'
        })

        this.$router.push({ name: 'alert.index' })
      } catch (error) {
        console.error(error)
        this.$whoopsNotify.negative({
          message: this.edit ? 'It is not possible to update details of the alert. Please try it again.' : 'It is not possible to insert a new alert. Please try it again.'
        })
      }
    },

    filterImages (val, update) {
      if (val === '') {
        // do nothing here
        update()
        return false
      }

      update(() => {
        this.filterImagesString = val
      })
    },

    async loadEnvVars () {
      try {
        const envProps = await this.$axios.get(`/v1/dockerimage/${this.form.image.value}/envvars`).then(result => result.data)

        if (Object.keys(envProps).length) {
          this.form.environmentVariables = ini.stringify(envProps)

          this.$whoopsNotify.positive({
            message: 'Environment veriables loaded to the textarea field.'
          })
        } else {
          this.$whoopsNotify.positive({
            message: 'There are no environment variables.'
          })
        }
      } catch (error) {
        console.error(error)
        this.$whoopsNotify.negative({
          message: 'It is not possible to load environment veriables.'
        })
      }
    }
  }
}
</script>
