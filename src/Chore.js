const moment = require('moment')
const ModulekitForm = require('modulekit-form')

const templates = require('./templates')

let editForm

class Chore {
  constructor (entry) {
    this.id = entry.id
    this.data = entry
  }

  lastDate () {
    return this.data.dates ? this.data.dates[this.data.dates.length - 1] : null
  }

  show () {
    if (!this.li) {
      this.li = document.createElement('li')
      this.li._chore = this

      const ul = document.getElementById('chores')
      ul.appendChild(this.li)

      this.contentDiv = document.createElement('div')
      this.contentDiv.className = 'content'
      this.li.appendChild(this.contentDiv)

      this.actionsDiv = document.createElement('div')
      this.actionsDiv.className = 'actions'
      this.li.appendChild(this.actionsDiv)

      let action = document.createElement('button')
      action.innerHTML = '<i class="fas fa-check"></i>'
      action.title = 'Done'
      this.actionsDiv.appendChild(action)
      action.onclick = () => this.done()

      action = document.createElement('button')
      action.innerHTML = '<i class="fas fa-cog"></i>'
      action.title = 'Edit'
      this.actionsDiv.appendChild(action)
      action.onclick = () => this.edit()

      action = document.createElement('button')
      action.innerHTML = '<i class="fas fa-trash"></i>'
      action.title = 'Remove'
      this.actionsDiv.appendChild(action)
      action.onclick = () => this.remove()
    }

    if (this.data.color) {
      this.li.style = '--color: ' + parseInt(this.data.color.substr(1, 2), 16) + ',' + parseInt(this.data.color.substr(3, 2), 16) + ',' + parseInt(this.data.color.substr(5, 2), 16)
    } else {
      this.li.style = '--color: 0,0,0'
    }

    templates.render(this.contentDiv, 'list', { entry: this.data }, () => this.reorder())

    return this.li
  }

  reorder () {
    const ul = document.getElementById('chores')
    const date = this.lastDate()

    const other = Array.from(ul.children)
    for (let i = 0; i < other.length; i++) {
      const otherDate = other[i]._chore.lastDate()

      if (otherDate < date) {
        ul.insertBefore(this.li, other[i])
        return
      }
    }
  }

  done () {
    if (!this.data.dates) {
      this.data.dates = []
    }

    this.data.dates.push(moment().toISOString(true))

    const update = {
      dates: this.data.dates
    }

    this.save(update, () => {})
  }

  save (update, callback) {
    global.fetch(this.id ? 'chores/' + this.id : 'chores', {
      method: this.id ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(update)
    })
      .then(req => req.json())
      .then(data => {
        if (!this.id) {
          this.id = data.id
        }

        this.data = data

        if (this.li) {
          this.show()
        }

        callback()
      })
  }

  remove (callback) {
    if (!this.id) {
      return callback()
    }

    global.fetch('chores/' + this.id, {
      method: 'DELETE'
    })
      .then(req => req.text())
      .then(data => {
        this.id = null

        if (this.li) {
          this.li.parentNode.removeChild(this.li)
        }

        callback()
      })
  }

  editDef () {
    const def = {
      title: {
        type: 'text',
        name: 'Name'
      },
      color: {
        type: 'color',
        name: 'Farbe'
      }
    }

    return def
  }

  edit () {
    if (editForm && editForm.parentNode === document.body) {
      document.body.removeChild(editForm)
    }

    editForm = document.createElement('form')
    document.body.appendChild(editForm)

    const mf = new ModulekitForm(null, this.editDef())

    mf.set_data(this.data)
    mf.show(editForm)

    const submit = document.createElement('button')
    submit.type = 'submit'
    submit.title = 'Save'
    submit.innerHTML = '<i class="fas fa-save"></i>'
    editForm.appendChild(submit)

    const cancel = document.createElement('button')
    cancel.title = 'Cancel'
    cancel.innerHTML = '<i class="fas fa-times"></i>'
    editForm.appendChild(cancel)
    cancel.onclick = () => document.body.removeChild(editForm)

    editForm.onsubmit = () => {
      const update = mf.get_data()

      this.save(update, () => {
        this.show()
        document.body.removeChild(editForm)
      })

      return false
    }
  }
}

Chore.reorder = () => {
  const ul = document.getElementById('chores')

  const list = Array.from(ul.children)

  list.forEach(li => {
    li._chore.reorder()
  })
}

Chore.update = () => {
  const ul = document.getElementById('chores')

  const list = Array.from(ul.children)

  list.forEach(li => {
    li._chore.show()
  })
}

module.exports = Chore
