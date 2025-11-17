const moment = require('moment')
const ModulekitForm = require('modulekit-form')

const templates = require('./templates')

let editForm

class Chore {
  constructor (entry, list) {
    this.id = entry.id
    this.list = list
    this.data = entry
  }

  set (entry) {
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
    }

    if (this.isDue()) {
      this.li.classList.add('due')
    } else {
      this.li.classList.remove('due')
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

  hasTag (tag) {
    if (tag === '_due') {
      return this.isDue()
    }

    return this.data.tags.includes(tag)
  }

  isDue () {
    if (!this.data.frequencyDays) {
      return false
    }

    return this.lastDate() === null || new Date().getTime() - new Date(this.lastDate()).getTime() > this.data.frequencyDays * 86400000
  }

  reload (callback) {
    this.list.reload(callback)
  }

  done () {
    this.reload(() => this.done1())
  }

  done1 () {
    if (!this.data.dates) {
      this.data.dates = []
    }

    if (editForm && editForm.parentNode === document.body) {
      document.body.removeChild(editForm)
    }

    editForm = document.createElement('form')
    document.body.appendChild(editForm)

    const mf = new ModulekitForm('data', {
      hoursAgo: {
        name: 'Vor wieviel Stunden?',
        type: 'integer',
        default: 0,
      }
    })

    mf.show(editForm)
    mf.focus()

    const submit = document.createElement('button')
    submit.type = 'submit'
    submit.title = 'Save'
    submit.innerHTML = '<i class="fas fa-save"></i> Ok'
    editForm.appendChild(submit)

    const cancel = document.createElement('button')
    cancel.title = 'Cancel'
    cancel.innerHTML = '<i class="fas fa-times"></i> Abbrechen'
    editForm.appendChild(cancel)
    cancel.onclick = () => document.body.removeChild(editForm)

    editForm.onsubmit = () => {
      let data = mf.get_data()

      let date = new Date().getTime()
      date-=data.hoursAgo * 3600000

      this.data.dates.push(moment(new Date(date)).toISOString(true))
      this.data.dates.sort()

      const update = {
        dates: this.data.dates
      }

      this.save(update, () => {
        this.show()
        document.body.removeChild(editForm)
      })

      return false
    }
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
      },
      tags: {
        type: 'select_other',
        name: 'Kategorien',
        'button:other': '* Neu *',
        count: {
          default: 1,
          index_type: 'array',
          'button:add_element': 'Hinzufügen'
        },
        values: this.list.allTags()
      },
      frequencyDays: {
        type: 'integer',
        name: 'Gewünschte Frequenz',
        desc: 'in Tagen'
      }
    }

    if (this.id) {
      def.dates = {
        type: 'text',
        name: 'Zeiten',
        count: {
          default: 1,
          index_type: 'array',
          'button:add_element': 'Hinzufügen'
        }
      }
    }

    return def
  }

  edit () {
    this.reload(() => this.edit1())
  }

  edit1 () {
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
    submit.innerHTML = '<i class="fas fa-save"></i> Ok'
    editForm.appendChild(submit)

    const buttonDelete = document.createElement('button')
    buttonDelete.innerHTML = '<i class="fas fa-trash"></i> Löschen'
    buttonDelete.title = 'Remove'
    editForm.appendChild(buttonDelete)
    buttonDelete.onclick = () => this.remove()

    const cancel = document.createElement('button')
    cancel.title = 'Cancel'
    cancel.innerHTML = '<i class="fas fa-times"></i> Abbrechen'
    editForm.appendChild(cancel)
    cancel.onclick = () => document.body.removeChild(editForm)

    editForm.onsubmit = () => {
      const update = mf.get_data()

      this.save(update, () => {
        this.show()
        this.list.updateTags()
        document.body.removeChild(editForm)
      })

      return false
    }
  }

  update () {
    this.show()
  }
}

Chore.reorder = () => {
  const ul = document.getElementById('chores')

  const list = Array.from(ul.children)

  list.forEach(li => {
    li._chore.reorder()
  })
}

module.exports = Chore
