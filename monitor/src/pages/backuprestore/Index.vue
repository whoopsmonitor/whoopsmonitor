<template>
  <q-page padding>
    <q-card v-if="backups.length" flat bordered>
      <q-separator inset />

      <q-card-section>
        <div class="text-h6">List of Backups</div>
      </q-card-section>

      <q-card-section>
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
    </q-card>

    <p v-if="!loading.list && !backups.length">
      There are no backups yet.
    </p>
    <skeleton-list v-if="loading.list" />
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
        list: false
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

    download (backupName) {
      alert(backupName)
    }
  }
}
</script>

    SkeletonList
