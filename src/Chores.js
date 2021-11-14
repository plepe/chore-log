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
}
