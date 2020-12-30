<template>
  <q-page padding>
    <q-card flat bordered>
      <q-separator inset />

      <q-card-section>
        <div class="text-h6">List of Backups</div>
      </q-card-section>

      <q-card-section>
        <q-btn label="new backup" size="sm" @click="createBackup" icon="cloud_upload" :disable="loading.create" />
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
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section are no backups yet.-section v-if="!loading.list && !backups.length">
        There are no backups yet.
      </q-card-section>

      <skeleton-list v-if="loading.list" />
    </q-card>
  </q-page>
</template>

<script>
import SkeletonList from '../../components/SkeletonList'

export default {
  name: 'BackupRestoreIndex',
  components: {
    SkeletonList
  },
  data () {
    return {
      loading: {
        list: false,
        create: false
      },
      backups: []
    }
  },

  async created () {
    await this.fetchData()
  },

  methods: {
    async fetchData () {
      this.loading.list = true

      try {
        this.backups = await this.$axios.get('/v1/backup').then(response => response.data)
      } catch (error) {
        console.error(error)

        this.$whoopsNotify.negative({
          message: 'It is not possible to load list of backups. Please try it again.'
        })
      } finally {
        this.loading.list = false
      }
    },

    async createBackup () {
      this.loading.create = true

      try {
        await this.$axios.post('/v1/backup').then(response => response.data)

        await this.fetchData()

        this.$whoopsNotify.positive({
          message: 'Backup successfully created.'
        })
      } catch (error) {
        console.error(error)

        this.$whoopsNotify.negative({
          message: 'It is not possible to create a new backup. Please try it again.'
        })
      } finally {
        this.loading.create = false
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
    }
  }
}
</script>

    SkeletonList
