export function logout ({ commit }) {
  commit('setToken', '')
  window.location.href = '/'
}
