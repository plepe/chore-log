const Chore = require('./Chore')

module.exports = class Chores {
  constructor () {
    this.chores = []
  }

  load (data) {
    data.forEach(item => {
      const chore = new Chore(item, this)
      chore.show()
      this.chores.push(chore)
    })
  }

  addNew () {
    const item = new Chore({}, this)
    this.chores.push(item)
    item.edit()
  }

  update () {
    this.chores.forEach(item => item.update())
  }

  allTags () {
    const result = {}
    this.chores.forEach(item => {
      if (item.data.tags) {
        item.data.tags.forEach(tag => result[tag] = tag in result ? result[tag] + 1 : 1)
      }
    })

    const tags = Object.keys(result)
    tags.sort((a, b) => result[b] - result[a])

    return tags
  }
}
