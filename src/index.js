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

let chores

global.fetch('chores')
  .then(req => req.json())
  .then(data => {
    chores = new Chores()
    chores.load(data)
  })

window.onload = () => {
  const button = document.createElement('button')
  button.innerHTML = '<i class="fas fa-plus"></i>'
  button.title = 'Add'
  document.body.appendChild(button)
  button.onclick = () => chores.addNew()

  window.setInterval(() => chores.update(), 60000)
}
