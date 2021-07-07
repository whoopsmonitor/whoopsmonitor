/**
 * Required data in the component:
  filter: {
    results: ''
  },
  filterByKey: 'some_key_to_filter_by'
 */
export default {
  filteredItems () {
    if (typeof this.filterByKey !== 'string' || !this.filterByKey) {
      throw Error('"filterByKey" not configured on the component level.')
    }

    return this.items.filter(item => {
      return item[this.filterByKey].toLowerCase().indexOf(this.filter.results.toLowerCase()) > -1
    })
  }
}
