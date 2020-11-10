export function setCount (state, count) {
  state.count = count
}

export function setOutput (state, output) {
  // reset the array instead of pushing
  state.output = output
}
