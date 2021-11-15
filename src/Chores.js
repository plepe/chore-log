const Chore = require('./Chore')

module.exports = class Chores {
  constructor () {
    this.chores = []
    this.filter = []
    this.excluded = []
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

  applyFilter () {
    this.chores.forEach(item => item.li.classList.remove('hide'))

    this.chores.forEach(item => {
      if (item.data.tags && this.excluded.filter(tag => item.data.tags.includes(tag)).length) {
        item.li.classList.add('hide')
      }
    })

    if (!this.filter.length) {
      return
    }

    this.chores.forEach(item => {
      if (!item.data.tags || this.filter.filter(tag => !item.data.tags.includes(tag)).length) {
        item.li.classList.add('hide')
      }
    })
  }

  updateTags () {
    const div = document.getElementById('tags')
    div.innerHTML = ''

    const ul = document.createElement('ul')
    this.allTags().forEach(tag => {
      const li = document.createElement('li')
      li.appendChild(document.createTextNode(tag))
      ul.appendChild(li)

      li.onclick = () => {
        if (this.filter.includes(tag)) {
          li.classList.remove('active')
          li.classList.add('excluded')
          this.filter.splice(this.filter.indexOf(tag), 1)
          this.excluded.push(tag)
        } else if (this.excluded.includes(tag)) {
          li.classList.remove('excluded')
          this.excluded.splice(this.excluded.indexOf(tag), 1)
        } else {
          li.classList.add('active')
          this.filter.push(tag)
        }

        this.applyFilter()
      }
    })

    div.appendChild(ul)
  }
}
