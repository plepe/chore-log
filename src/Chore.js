const moment = require('moment')

const templates = require('./templates')

module.exports = class Chore {
  constructor (entry) {
    this.id = entry.id
    this.data = entry
  }

  show () {
    if (!this.li) {
      this.li = document.createElement('li')

      this.contentDiv = document.createElement('div')
      this.contentDiv.className = 'content'
      this.li.appendChild(this.contentDiv)

      this.actionsDiv = document.createElement('div')
      this.actionsDiv.className = 'actions'
      this.li.appendChild(this.actionsDiv)

      let action = document.createElement('button')
      action.innerHTML = 'Done'
      this.actionsDiv.appendChild(action)
      action.onclick = () => this.done()
    }

    templates.render(this.contentDiv, 'list', {entry: this.data})

    return this.li
  }

  done () {
    if (!this.data.dates) {
      this.data.dates = []
    }

    this.data.dates.push(moment().toISOString(true))

    const update = {
      dates: this.data.dates
    }

    fetch('/chores/' + this.id, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(update)
    })
      .then(req => req.json())
      .then(data => {
        this.data = data
        this.show()
      })
  }
}
