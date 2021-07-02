<template>
  <q-page padding>
    <q-card v-if="images.length" flat bordered>
      <q-card-section>
        <div class="row">
          <div class="col">
            <div class="text-h6">Docker Images</div>
          </div>
          <div class="col">
            <q-input v-model="filter.images" filled type="search" placeholder="filter..." dense>
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>

      <q-separator inset />

      <q-card-section>
        <q-list bordered separator v-if="filteredImages.length">
          <q-item v-for="image in filteredImages" :key="image.id">
            <q-item-section side top>
              <q-icon :name="iconForImageType(image)" />
            </q-item-section>
            <q-item-section side top v-if="image.metadata['com.whoopsmonitor.icon']">
              <q-icon :name="`img:${image.metadata['com.whoopsmonitor.icon']}`" />
            </q-item-section>
            <q-item-section>
              <q-item-label line="1">
                <router-link :to="{ name: 'image.detail', params: { id: image.id }}">
                  {{ image.image }}
                </router-link>
              </q-item-label>
              <q-item-label caption>
                <q-icon name="event_note" /> {{ image.createdAt | datetime }}
                <q-icon
                  :color="colorOftheStatus(image.healthyStatus)"
                  name="lens"
                >
                  <q-tooltip v-if="image.healthyStatusOutput" max-width="20em">{{ image.healthyStatusOutput }}</q-tooltip>
                </q-icon>
              </q-item-label>
            </q-item-section>
            <q-item-section top side>
              <div class="text-grey-8 q-gutter-xs">
                <q-btn
                  @click="refreshMetadata(image)"
                  color="accent"
                  dense
                  round
                  icon="refresh"
                >
                  <q-tooltip>refresh image's metadata</q-tooltip>
                </q-btn>
                <q-btn
                  @click="destroyDialog(image.id)"
                  color="red"
                  dense
                  round
                  icon="delete"
                  title="click to remove"
                >
                  <q-tooltip>click to remove</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
        <p v-else>
          There are no images to select from.
        </p>
      </q-card-section>
    </q-card>

    <skeleton-list v-if="loading.fetch" />

    <no-item-list-here
      v-if="!loading.fetch && !images.length"
      title="No Docker images here"
      description="Currently there are no images registered yet. Please add a new one."
      :to="{ name: 'image.create' }"
      to-title="new image"
    />

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" type="a" :to="{ name: 'image.create' }" title="New Docker Image" />
    </q-page-sticky>

    <confirm-dialog
      :open="dialog.destroy"
      @cancel="destroyCancel"
      @confirm="destroyConfirm"
    >
      Are you sure you want to delete this image?<br />
      All checks and its history are going to be removed as well.
    </confirm-dialog>
  </q-page>
</template>

<script>
import NoItemListHere from '../../components/NoItemListHere'
import SkeletonList from '../../components/SkeletonList'
import ConfirmDialog from '../../components/ConfirmDialog'
import DateTime from '../../filters/datetime'

export default {
  name: 'PageImageIndex',
  components: {
    NoItemListHere,
    SkeletonList,
    ConfirmDialog
  },
  filters: {
    datetime: DateTime
  },
  data () {
    return {
      images: [],
      loading: {
        fetch: false,
        destroy: false
      },
      dialog: {
        destroy: false
      },
      destroyId: '',
      interval: undefined,
      filter: {
        images: ''
      }
    }
  },
  computed: {
    filteredImages () {
      return this.images.filter(item => {
        return item.image.toLowerCase().indexOf(this.filter.images) > -1
      })
    }
  },
  async created () {
    await this.fetchData({
      verbose: true
    })

    this.interval = setInterval(async () => {
      await this.fetchData()
    }, 10000)
  },
  destroyed () {
    clearInterval(this.interval)
  },
  methods: {
    async fetchData (config) {
      config = config || {}

      if (config.verbose) {
        this.loading.fetch = true
      }

      try {
        const images = await this.$axios.get('/v1/dockerimage', {
          params: {
            select: 'image,createdAt,username,password,type,healthyStatus,healthyStatusOutput,metadata'
          }
        }).then(response => response.data)

        this.images = images.map(image => {
          image.metadata = JSON.parse(image.metadata)
          return image
        })
      } catch (error) {
        console.error(error)
        this.$whoopsNotify.negative({
          message: 'It is not possible to find Docker images. Please reload the page.'
        })
      } finally {
        if (config.verbose) {
          this.loading.fetch = false
        }
      }
    },

    destroyDialog (imageId) {
      this.dialog.destroy = true
      this.destroyId = imageId
    },

    destroyCancel () {
      this.dialog.destroy = false
      this.destroyId = ''
    },

    async destroyConfirm () {
      this.loading.destroy = true

      try {
        await this.$axios.delete(`/v1/dockerimage/${this.destroyId}`)
        await this.fetchData({
          verbose: false
        })
        this.$whoopsNotify.positive({
          message: 'Docker image successfully deleted.'
        })
      } catch (error) {
        console.error(error)
        this.$whoopsNotify.negative({
          message: 'It is not possible to delete a docker image. Please try it again.'
        })
      } finally {
        this.destroyCancel()
      }
    },

    async refreshMetadata (image) {
      const record = {}
      record.healthyStatus = -1
      record.healthyStatusOutput = ''

      try {
        await this.$axios.patch(`/v1/dockerimage/${image.id}`, record)

        await this.fetchData()

        this.$whoopsNotify.positive({
          message: "Image's metadata are going to be rebuilded within a minute."
        })
      } catch (error) {
        console.error(error)

        this.$whoopsNotify.negative({
          message: 'It is not possible to refresh metadata of this image.'
        })
      }
    },

    iconForImageType (image) {
      let icon = 'fact_check'

      switch (image.type) {
        case 'check':
        default:
          icon = 'fact_check'
          break

        case 'alert':
          icon = 'notifications'
          break
      }

      return icon
    },

    colorOftheStatus (status) {
      let color = 'green'

      switch (status) {
        case -1:
          color = 'grey'
          break
        case 1:
          color = 'orange'
          break
        case 2:
          color = 'red'
          break
      }

      return color
    }
  }
}
</script>
