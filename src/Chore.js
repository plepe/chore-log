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
    }

    templates.render(this.li, 'list', {entry: this.data}, () => {
      let actions = this.li.getElementsByClassName('actions')
      if (!actions.length) {
        return
      }
      actions = actions[0]

      let action = document.createElement('button')
      action.innerHTML = 'Done'
      actions.appendChild(action)
      action.onclick = () => this.done()
    })

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
