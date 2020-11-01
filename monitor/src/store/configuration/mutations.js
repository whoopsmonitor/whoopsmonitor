export function toggleGuide (state) {
  state.guide = !state.guide
}

export function hideGuide (state) {
  state.guide = false
}

export function allowGuide (state) {
  state.allowGuide = true
}

export function disallowGuide (state) {
  state.allowGuide = false
}
