const moment = require('moment')

const templates = require('./templates')

let editForm

module.exports = class Chore {
  constructor (entry) {
    this.id = entry.id
    this.data = entry
  }

  show () {
    if (!this.li) {
      this.li = document.createElement('li')

      const ul = document.getElementById('chores')
      ul.appendChild(this.li)

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

      action = document.createElement('button')
      action.innerHTML = 'Edit'
      this.actionsDiv.appendChild(action)
      action.onclick = () => this.edit()

      action = document.createElement('button')
      action.innerHTML = 'Remove'
      this.actionsDiv.appendChild(action)
      action.onclick = () => this.remove()
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

    this.save(update, () => {})
  }

  save (update, callback) {
    fetch(this.id ? '/chores/' + this.id : '/chores', {
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

    fetch('/chores/' + this.id, {
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

  edit () {
    if (editForm && editForm.parentNode === document.body) {
      document.body.removeChild(editForm)
    }

    const form = document.createElement('form')
    editForm = form
    document.body.appendChild(form)
    const div = document.createElement('div')
    form.appendChild(div)
    templates.render(div, 'edit', {entry: this.data})

    const submit = document.createElement('input')
    submit.type = 'submit'
    submit.value = 'Save'
    form.appendChild(submit)

    const cancel = document.createElement('button')
    cancel.innerHTML = 'Cancel'
    form.appendChild(cancel)
    cancel.onclick = () => document.body.removeChild(form)

    form.onsubmit = () => {
      let update = {}
      Array.from(form.elements).forEach(el => {
        if (el.name) {
          update[el.name] = el.value
        }
      })

      this.save(update, () => {
        this.show()
        document.body.removeChild(form)
      })

      return false
    }
  }
}
