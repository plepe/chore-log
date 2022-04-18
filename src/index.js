const Twig = require('twig')
const moment = require('moment')
require('moment/locale/de-at')

const Chores = require('./Chores')

Twig.extendFilter('date_diff', (value, other) => {
  if (!other) {
    other = new Date()
  }

  let x = new Date(value).getTime() - new Date(other).getTime()
  return x
})

global.lang_str = {}
global.ui_lang = 'de'

Twig.extendFilter('momentFormat', (date, format) => moment(date).format(format[0]))
Twig.extendFilter('momentFromNow', (date, param) => moment(date).fromNow(param))

const chores = new Chores()
chores.reload()

window.onload = () => {
  let button = document.createElement('button')
  button.innerHTML = '<i class="fas fa-plus"></i>'
  button.title = 'Add'
  document.body.appendChild(button)
  button.onclick = () => chores.addNew()

  button = document.createElement('button')
  button.innerHTML = '<i class="fas fa-redo"></i>'
  button.title = 'Reload'
  document.body.appendChild(button)
  button.onclick = () => chores.reload()

  window.setInterval(() => chores.update(), 60000)
}
