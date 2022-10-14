<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>Whoops Monitor</q-toolbar-title>

        <q-btn tag="a" v-if="loggedIn && issues" :to="{ name: 'issue.index' }" flat round dense icon="error" color="red">
          <q-tooltip>application errors - click for details</q-tooltip>
        </q-btn>

        <q-btn v-if="loggedIn && guide" @click="goToHelp" flat round dense icon="support">
          <q-tooltip>show guide in new window</q-tooltip>
        </q-btn>

        <q-btn v-if="loggedIn" @click="logout" flat round dense icon="exit_to_app">
          <q-tooltip>click to logout</q-tooltip>
        </q-btn>

        <q-btn v-if="!loggedIn" @click="login" flat round dense icon="account_box">
          <q-tooltip>click to login</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
    >
      <q-list>
        <q-item
          clickable
          tag="a"
          :to="{ name: 'dashboard' }"
        >
          <q-item-section
            avatar
          >
            <q-icon name="dashboard" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Dashboard</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <template v-if="loggedIn">
        <q-list>
          <q-item-label
            header
            class="text-grey-8"
          >
            Configuration
          </q-item-label>
        </q-list>

        <q-list>
          <q-item
            clickable
            tag="a"
            :to="{ name: 'check.index' }"
          >
            <q-item-section
              avatar
            >
              <q-icon name="fact_check" />
            </q-item-section>

            <q-item-section>
              <q-item-label ref="guide-checks">
                Checks
              </q-item-label>
              <q-item-label caption>
                list all checks
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-list>
          <q-item
            clickable
            tag="a"
            :to="{ name: 'alert.index' }"
          >
            <q-item-section
              avatar
            >
              <q-icon name="notifications" />
            </q-item-section>

            <q-item-section>
              <q-item-label>
                Alerts
                <!-- <q-badge color="blue">
                  beta
                </q-badge> -->

              </q-item-label>
              <q-item-label caption>
                list all alerts
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-list>
          <q-item
            clickable
            tag="a"
            :to="{ name: 'image.index' }"
          >
            <q-item-section
              avatar
            >
              <q-icon name="wallpaper" />
            </q-item-section>

            <q-item-section>
              <q-item-label>Docker Images</q-item-label>
              <q-item-label caption>
                all Docker images
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-list>
          <q-item
            clickable
            tag="a"
            :to="{ name: 'sharedenvvars.index' }"
          >
            <q-item-section
              avatar
            >
              <q-icon name="vpn_key" />
            </q-item-section>

            <q-item-section>
              <q-item-label>Environment variables</q-item-label>
              <q-item-label caption>
                shared variables
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-list>
          <q-item-label
            header
            class="text-grey-8"
          >
            System
          </q-item-label>
        </q-list>

        <q-list>
          <q-item
            clickable
            tag="a"
            :to="{ name: 'tools.index' }"
          >
            <q-item-section
              avatar
            >
              <q-icon name="construction" />
            </q-item-section>

            <q-item-section>
              <q-item-label>Tools</q-item-label>
            </q-item-section>
          </q-item>
          <q-item
            clickable
            tag="a"
            :to="{ name: 'backuprestore.index' }"
          >
            <q-item-section
              avatar
            >
              <q-icon name="import_export" />
            </q-item-section>

            <q-item-section>
              <q-item-label>Backup & Restore</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </template>

      <div class="fixed-bottom q-mb-md text-center">
        <a href="https://whoopsmonitor.app/" target="_blank" rel="noreferrer noopener">
          <q-img
            src="logo/logo-dark.png"
            style="max-width: 250px"
            basic
            contain
          />
        </a>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MainLayout',
  data () {
    return {
      leftDrawerOpen: false,
      documentTitle: '',
      interval: {
        failedCheck: undefined,
        issues: undefined
      }
    }
  },
  computed: {
    loggedIn () {
      return this.$store.getters['auth/loggedIn']
    },
    guide () {
      return this.$store.state.guide.docs
    },
    issues () {
      return this.$store.state.issue.count > 0
    }
  },
  async created () {
    this.$sailsIo.socket.on('isfailing', (response) => {
      if (response.isFailing === true) {
        // some check failing
        document.title = this.documentTitle
        document.title = `[✖] ${document.title}`
      } else {
        document.title = this.documentTitle
      }
    })

    this.documentTitle = document.title

    this.interval.failedCheck = setInterval(async () => {
      await this.getFailedCheck()
    }, 10000)

    await this.getFailedCheck()

    this.interval.issue = setInterval(async () => {
      await this.findIssues()
    }, 10000)

    await this.findIssues()

    await this.getHealthIndexData()
  },
  unmounted () {
    clearInterval(this.interval.failedCheck)
    clearInterval(this.interval.issues)
  },
  methods: {
    login () {
      this.$router.push({
        name: 'auth.login'
      })
    },
    logout () {
      this.$store.dispatch('auth/logout')
    },

    async getFailedCheck () {
      try {
        // const result = await this.$axios.get('/v1/checkstatus/isfailing').then(result => result.data)

        // if (result === true) {
        //   // some check failing
        //   document.title = this.documentTitle
        //   document.title = `[✖] ${document.title}`
        // } else {
        //   document.title = this.documentTitle
        // }
      } catch (error) {
        console.error(error)
      }
    },

    async findIssues () {
      try {
        const overall = await this.$axios.get('/').then(result => result.data.data.overall)

        if (overall.issues) {
          this.$store.commit('issue/setCount', overall.issues)
        } else {
          this.$store.commit('issue/setCount', 0)
        }

        if (overall.output) {
          this.$store.commit('issue/setOutput', overall.output)
        } else {
          this.$store.commit('issue/setOutput', [])
        }
      } catch (error) {
        console.error(error)
      }
    },

    goToHelp () {
      if (this.guide) {
        window.open(this.guide, '_blank')
        return true
      }

      console.error('No URL specified.')
    },

    async getHealthIndexData () {
      try {
        const thresholds = await this.$axios.get('/v1/healthindex', {
          params: {
            select: 'option,value,hours,check',
            populate: false
          }
        }).then(result => result.data)

        this.$store.commit('healthindex/items', thresholds)
      } catch (error) {
        console.error(error)
      }
    }
  }
})
</script>
