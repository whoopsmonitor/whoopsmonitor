<template>
  <q-page padding>
    <h1 v-if="edit" class="text-h4 q-mt-sm">Update Check Details</h1>
    <h1 v-else class="text-h4 q-mt-sm">New Check</h1>

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
        <q-tab name="display" label="Display" />
        <q-tab name="env" label="ENV Variables" :disable="Object.values(form.image).length === 0" />
        <q-tab name="file" label="File" :disable="Object.values(form.image).length === 0" />
        <q-tab name="alert" label="Alerts" :disable="Object.values(form.image).length === 0" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="general" class="q-gutter-md">
          <q-input
            filled
            v-model="form.name"
            label="Check Name *"
            hint="Enter the check name."
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please enter the name of your check.']"
          />

          <q-input
            filled
            v-model="form.description"
            label="Description"
            hint="Enter the check description."
          />

          <q-select
            v-if="hasImages"
            v-model="form.image"
            :options="imageOptions"
            label="Image *"
            hint="Select the image."
            lazy-rules
            :rules="[ val => val && Object.keys(val).length > 0 || 'Please select image that would trigger your check.']"
            use-input
            input-debounce="0"
            @filter="filterImages"
          />
          <div v-else>
            <div class="caption">Images</div>
            There are no images to select from or they are invalid.
          </div>

          <q-input
            filled
            v-model="form.cron"
            label="Cron *"
            hint="Cron notation to trigger the check. Default is every minute."
            lazy-rules
            :rules="[ val => val && val.length > 0 && validateCron(val) || 'You should enter valid cron notation for your check to trigger correctly.']"
          />
          <div v-if="form.cron" class="text-caption">
            You entered <i>{{ form.cron | translateCron }}</i>.
          </div>
        </q-tab-panel>

        <q-tab-panel name="env" class="q-gutter-md">
          <q-banner class="bg-secondary text-white q-mt-sm" dense>
            <template v-slot:avatar>
              <q-icon name="info" color="white" />
            </template>
            <div>Put your environmental variables in the field bellow like you would do in Docker <i>.env</i> file, like:</div>
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

        </q-tab-panel>

      <q-tab-panel name="general" class="q-gutter-md">
          <q-input
            filled
            v-model="form.name"
            label="Check Name *"
            hint="Enter the check name."
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please enter the name of your check.']"
          />

          <q-select
            v-if="hasImages"
            v-model="form.image"
            :options="imageOptions"
            label="Image *"
            hint="Select the image."
            lazy-rules
            :rules="[ val => val && Object.keys(val).length > 0 || 'Please select image that would trigger your check.']"
            use-input
            input-debounce="0"
            @filter="filterImages"
          />
          <div v-else>
            <div class="caption">Images</div>
            There are no images to select from or they are invalid.
          </div>

          <q-input
            filled
            v-model="form.cron"
            label="Cron *"
            hint="Cron notation to trigger the check. Default is every minute."
            lazy-rules
            :rules="[ val => val && val.length > 0 && validateCron(val) || 'You should enter valid cron notation for your check to trigger correctly.']"
          />
          <div v-if="form.cron" class="text-caption">
            You entered <i>{{ form.cron | translateCron }}</i>.
          </div>
        </q-tab-panel>

        <q-tab-panel name="display" class="q-gutter-md">
          <q-toggle
            v-model="form.display.metric"
            checked-icon="check"
            color="accent"
            unchecked-icon="clear"
            label="Show as a Metric"
          />

          <div v-if="form.display.metric">
            <q-toggle
              v-model="form.display.trend"
              checked-icon="check"
              color="accent"
              unchecked-icon="clear"
              label="Show a trend icon"
            />

            <div>
              <q-select
                v-model="form.display.type"
                :options="metric.options"
                label="Type"
                hint="Select metric type."
                lazy-rules
                :rules="[ val => form.display.metric && val && Object.keys(val).length > 0 || 'Please select metric type.']"
              />
            </div>

            <div class="row q-col-gutter-sm q-mt-md">
              <div class="col-12">
                <h4 class="text-h6 q-mt-md q-mb-none">Thresholds</h4>
              </div>
              <div class="col-4">
                <q-input
                  filled
                  type="number"
                  v-model="form.display.warning"
                  label="Warning"
                  hint="Warning level."
                  lazy-rules
                  :rules="[ val => val && val > 0 || 'You should enter warning threshold for the metric.']"
                />
              </div>
              <div class="col-4">
                <q-input
                  filled
                  type="number"
                  v-model="form.display.critical"
                  label="Critical"
                  hint="critical level."
                  lazy-rules
                  :rules="[ val => val && val > 0 || 'You should enter critical threshold for the metric.']"
                />
              </div>
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="file" class="q-gutter-md">
          <q-banner class="bg-secondary text-white q-mt-sm" dense>
            <template v-slot:avatar>
              <q-icon name="info" color="white" />
            </template>
            <div>File is going to be mounted in <i>/whoopsmonitor-worker</i> directory so your checks can make an advantage of it.</div>
          </q-banner>

          <q-input
            filled
            v-model="form.file.name"
            label="File Name"
            hint="Enter file name with the extension like index.js or unit-test.php"
          />

          <q-input
            type="textarea"
            autogrow
            filled
            v-model="form.file.content"
            label="File Content"
            hint="Enter file content."
          />
        </q-tab-panel>

        <q-tab-panel name="alert">
          <div class="row">
            <div v-if="alerts.length" class="col">
              <p>Select active alerts for the check.</p>
              <q-option-group
                v-model="form.alerts"
                :options="alerts"
                type="toggle"
              />
            </div>
            <div v-else class="col">
              <q-banner class="bg-secondary text-white q-mt-sm" dense>
                <template v-slot:avatar>
                  <q-icon name="info" color="white" />
                </template>
                <div>
                  There are no alerts created. You should create a new one first.
                </div>
                <template v-slot:action>
                  <q-btn flat type="link" :to="{ name: 'alert.create' }">
                    add a new alert
                  </q-btn>
                </template>
              </q-banner>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>

        <div class="q-mt-lg">
          <q-btn :label="edit ? 'update details' : 'Add a new check'" type="submit" color="primary"/>
          <q-btn label="Cancel and return" type="reset" color="primary" flat class="q-ml-sm" :to="{ name: 'check.index' }" />
        </div>
      </q-form>
  </q-page>
</template>

<script>
import { isValidCron } from 'cron-validator'
import ini from 'ini'
import translateCron from '../../filters/translateCron'

export default {
  name: 'PageCheckCreate',
  filters: {
    translateCron
  },
  data () {
    return {
      form: {
        enabled: false,
        name: '',
        description: '',
        image: '',
        cron: '* * * * *',
        environmentVariables: '',
        file: {
          name: '',
          content: ''
        },
        alerts: [],
        display: {
          metric: false,
          type: 'number',
          warning: 80,
          critical: 40,
          trend: false
        }
      },
      tab: 'general',
      images: [],
      filterImagesString: '',
      alerts: [],
      alertElements: [],
      metric: {
        options: [
          {
            label: 'number',
            value: 'number'
          },
          {
            label: 'number with percent',
            value: 'numberWithPercent'
          }
        ],
        originalForm: {
          metric: false,
          type: 'number'
        }
      }
    }
  },
  computed: {
    edit () {
      return this.$route.meta.edit || false
    },
    imageOptions () {
      let items = this.images.map((image) => {
        return {
          label: image.image,
          value: image.id
        }
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
    },
    hasImages () {
      return this.images.length > 0
    }
  },

  watch: {
    'form.display.metric' (val) {
      if (val === false) {
        // reset metric data to default values
        this.form.display = this.metric.originalForm
      }
    }
  },

  async created () {
    if (this.edit) {
      await this.fetchData()
    }

    await this.fetchImages()
    await this.fetchAlerts()
  },

  methods: {
    async fetchData () {
      try {
        const item = await this.$axios.get(`/v1/check/${this.$route.params.id}`).then((response) => response.data)

        if (item) {
          this.form.enabled = item.enabled
          this.form.name = item.name
          this.form.description = item.description
          this.form.image = {
            label: item.image.image,
            value: item.image.id
          }
          this.form.file = item.file || {
            name: '',
            content: ''
          }
          this.form.cron = item.cron
          this.form.environmentVariables = ini.stringify(item.environmentVariables)

          if (item.alerts.length) {
            this.form.alerts = item.alerts.map(alert => alert.id)
          }

          if (item.display) {
            // set the default value in case "trend" has not been setup yet (due to compatibility)
            if (typeof item.display.trend === 'undefined') {
              item.display.trend = this.form.display.trend
            }

            this.form.display = item.display
          }
        }
      } catch (error) {
        console.error(error)

        if (error.response) {
          this.$whoopsNotify.negative({
            message: 'It is not possible to load check details. Please refresh this page.'
          })
        }
      }
    },

    async fetchImages () {
      try {
        this.images = await this.$axios.get('/v1/dockerimage', {
          params: {
            select: 'image,metadata',
            where: {
              type: 'check',
              healthyStatus: 0 // "0" means success in unix world
            }
          }
        }).then(result => result.data)
      } catch (error) {
        console.error(error)
      }
    },

    async fetchAlerts () {
      try {
        this.alerts = await this.$axios.get('/v1/alert', {
          params: {
            select: 'name,description,image,createdAt,environmentVariables'
          }
        }).then(result => result.data.filter(alert => alert.image).map((alert) => {
          return {
            label: alert.name,
            value: alert.id
          }
        }))
      } catch (error) {
        console.error(error)
      }
    },

    async onSubmit () {
      const method = this.edit ? 'patch' : 'post'
      const form = JSON.parse(JSON.stringify(this.form))

      try {
        if (form.environmentVariables) {
          form.environmentVariables = ini.parse(form.environmentVariables)
        }

        // reset metric if necessary
        if (form.display.metric === false) {
          form.display = null
        }

        // make sure image is just an ID
        form.image = form.image.value

        await this.$axios[method]('/v1/check' + (this.edit ? `/${this.$route.params.id}` : ''), form)

        this.$whoopsNotify.positive({
          message: this.edit ? 'Check details successfully updated.' : 'New check has been successfully added.'
        })

        this.$router.push({ name: 'check.index' })
      } catch (error) {
        console.error(error)
        this.$whoopsNotify.negative({
          message: this.edit ? 'It is not possible to update details of the check. Please try it again.' : 'It is not possible to insert a new check. Please try it again.'
        })
      }
    },

    validateCron (cron) {
      return isValidCron(cron, { seconds: true })
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

    async addAlertOption () {
      const alert = JSON.parse(JSON.stringify(this.alerts[0]))

      try {
        await this.$axios.put(`/v1/check/${this.$route.params.id}/alerts/${alert.value}`)

        this.form.alerts.push(alert)
      } catch (error) {
        console.error(error)
      }
    },

    async loadEnvVars () {
      const imageId = this.form.image.value

      // find image
      const founded = this.images.filter(image => image.id === imageId)

      if (founded[0]) {
        const image = founded[0]
        const metadata = JSON.parse(image.metadata)

        const labels = []

        for (const key in metadata) {
          if (key.indexOf('com.whoopsmonitor.env.') > -1) {
            labels[key.replace('com.whoopsmonitor.env.', '')] = metadata[key]
          }
        }

        this.form.environmentVariables = ini.stringify(labels)
      } else {
        this.$whoopsNotify.negative({
          message: 'There are no environmental variables in this image that we could use.'
        })
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  .highlight
    width 90%
    height 400px
</style>
