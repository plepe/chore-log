const Twig = require('twig')
const moment = require('moment')
require('moment/locale/de-at')

const Chore = require('./Chore')

Twig.extendFilter('date_diff', (value, other) => {
  if (!other) {
    other = new Date()
  }

  let x = new Date(value).getTime() - new Date(other).getTime()
  return x
})

global.lang_str = {}

Twig.extendFilter('momentFormat', (date, format) => moment(date).format(format[0]))
Twig.extendFilter('momentFromNow', (date, param) => moment(date).fromNow(param))

global.fetch('chores')
  .then(req => req.json())
  .then(data => {
    data.forEach(entry => {
      const chore = new Chore(entry)
      chore.show()
    })
  })

window.onload = () => {
  const button = document.createElement('button')
  button.innerHTML = '<i class="fas fa-plus"></i>'
  button.title = 'Add'
  document.body.appendChild(button)
  button.onclick = () => {
    const chore = new Chore({})
    chore.edit()
  }

  window.setInterval(Chore.update, 60000)
}
