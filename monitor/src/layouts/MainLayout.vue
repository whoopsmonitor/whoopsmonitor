<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          v-if="loggedIn"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        <q-btn
          v-if="!loggedIn"
          flat
          dense
          round
          icon="home"
          aria-label="Home"
          @click="$router.push({ name: 'dashboard' })"
        />

        <q-toolbar-title>
          Whoops Monitor
        </q-toolbar-title>

        <q-btn v-if="loggedIn && allowGuide" @click="toggleGuide" flat round dense icon="info" :color="guide ? 'secondary': ''">
          <q-tooltip v-if="!guide">show guide</q-tooltip>
          <q-tooltip v-if="guide">hide guide</q-tooltip>
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
      v-if="loggedIn"
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
            <q-item-label>Checks</q-item-label>
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
export default {
  name: 'MainLayout',
  data () {
    return {
      leftDrawerOpen: false,
      documentTitle: '',
      interval: undefined
    }
  },
  computed: {
    loggedIn () {
      return this.$store.getters['auth/loggedIn']
    },
    allowGuide () {
      return this.$store.state.configuration.allowGuide
    },
    guide () {
      return this.$store.state.configuration.guide
    }
  },
  watch: {
    guide: {
      immediate: true,
      handler (state) {
        if (state) {
          this.$nextTick(() => {
            this.$intro().start()
            this.$intro().showHints()
          })
        } else {
          this.$nextTick(() => {
            this.$intro().exit()
            this.$intro().hideHints()
          })
        }
      }
    }
  },
  async created () {
    this.documentTitle = document.title

    this.interval = setInterval(async () => {
      await this.getFailedCheck()
    }, 10000)

    await this.getFailedCheck()
  },
  mounted () {
    this.$intro().addHints().onhintclose(() => {
      this.$store.commit('configuration/toggleGuide')
    })
  },
  destroyed () {
    clearInterval(this.interval)
  },
  methods: {
    toggleGuide () {
      this.$store.commit('configuration/toggleGuide')
    },
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
        const result = await this.$axios.get('/v1/checkstatus/isfailing').then(result => result.data)

        if (result === true) {
          // some check failing
          document.title = this.documentTitle
          document.title = `[✖] ${document.title}`
        } else {
          document.title = this.documentTitle
        }
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>
