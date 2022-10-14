<template>
  <q-page padding>
    <q-tabs
        v-model="tab"
        align="left"
      >
      <q-tab name="backup" label="Backup" />
      <q-tab name="restore" label="Restore" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="backup" class="q-gutter-md">
        <q-btn label="new backup" size="sm" @click="createBackup" icon="cloud_upload" :disable="loading.create" />

        <q-card flat bordered>
          <q-separator inset />

          <q-card-section>
            <div class="text-h6">List of Backups</div>
          </q-card-section>

          <q-card-section v-if="backups.length">
            <q-list bordered separator>
              <q-item v-for="(backup, key) in backups" :key="key">
                <q-item-section>
                  {{ backup }}
                </q-item-section>
                <q-item-section top side>
                  <q-btn
                    @click="download(backup)"
                    dense
                    round
                    icon="cloud_download"
                  />
                </q-item-section>
                <q-item-section top side>
                  <q-btn
                    @click="remove(backup)"
                    dense
                    round
                    icon="delete"
                    color="red"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-card-section are no backups yet.-section v-if="!loading.list && !backups.length">
            There are no backups yet.
          </q-card-section>

          <skeleton-list v-if="loading.list || loading.remove" />
        </q-card>
      </q-tab-panel>

      <q-tab-panel name="restore" class="q-gutter-md">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">
              Restore a Backup
            </div>
          </q-card-section>
          <q-card-section>
            <q-file
              name="backup"
              outlined
              v-model="form.backup"
              accept="application/zip"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>
          </q-card-section>
          <q-card-section>
            <q-btn label="restore" color="red" :disable="!form.backup || loading.restore" @click="restore" />
          </q-card-section>
        </q-card>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script>
import SkeletonList from '../../components/SkeletonList.vue'

import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BackupRestoreIndex',
  components: {
    SkeletonList
  },
  data () {
    return {
      tab: 'backup',
      loading: {
        list: false,
        create: false,
        restore: false,
        remove: false
      },
      form: {
        backup: null
      },
      backups: []
    }
  },

  async created () {
    await this.fetchData()
  },

  methods: {
    async fetchData () {
      this.backups = []

      this.loading.list = true

      try {
         await this.$sailsIo.socket.get('/v1/backup', response => {
          this.backups = response.data
        })
      } catch (error) {
        console.error(error)

        this.$whoopsNotify.negative({
          message: 'It is not possible to load list of backups. Please try it again.'
        })
      } finally {
        this.loading.list = false
      }
    },

    createBackup () {
      this.loading.create = true

      try {
        this.$sailsIo.socket.post('/v1/backup', async () => {
          this.loading.create = false

          await this.fetchData()

          this.$whoopsNotify.positive({
            message: 'Backup successfully created.'
          })
        })
      } catch (error) {
        this.loading.create = false

        console.error(error)

        this.$whoopsNotify.negative({
          message: 'It is not possible to create a new backup. Please try it again.'
        })
      }
    },

    async download (backupName) {
      try {
        window.open(`${this.$store.state.config.APP_API_URL}/v1/backup/${backupName}/download?token=${this.$store.state.config.API_TOKEN}`, '_blank')
      } catch (error) {
        console.error(error)
        this.$whoopsNotify.negative({
          message: 'It is not possible to download a backup. Please try it again.'
        })
      }
    },

    async restore () {
      try {
        const formData = new FormData()
        formData.append('backup', this.form.backup)

        this.loading.restore = true

        await this.$axios.post(`/v1/backup/${this.form.backup.name}/restore`, formData, {
          timeout: 60 * 5 * 1000,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        this.$whoopsNotify.positive({
          message: 'Backup restored. Please wait a moment for a page to refresh.'
        })

        setTimeout(() => {
          window.location.href = '#'
          window.location.reload()
        }, 3000)
      } catch (error) {
        console.error(error)

        this.$whoopsNotify.negative({
          message: 'It is not possible to restore a backup. Please try it again.'
        })
      } finally {
        this.loading.restore = false
      }
    },

    remove (backup) {
      try {
        this.loading.remove = true
        this.backups = []

        this.$sailsIo.socket.delete(`/v1/backup/${backup}`, () => {
          this.fetchData()

          this.$whoopsNotify.positive({
            message: 'Backup removed.'
          })
        })
      } catch (error) {
        console.error(error)

        this.$whoopsNotify.negative({
          message: 'It is not possible to remove a backup. Please try it again.'
        })
      } finally {
        this.loading.remove = false
      }
    }
  }
})
</script>
