const Twig = require('twig')
const moment = require('moment')
require('moment/locale/de-at');

const Chore = require('./Chore')

Twig.extendFilter('momentFormat', (date, format) => moment(date).format(format[0]))
Twig.extendFilter('momentFromNow', (date, param) => moment(date).fromNow(param))

fetch('/chores')
  .then(req => req.json())
  .then(data => {
    data.forEach(entry => {
      const chore = new Chore(entry)
      chore.show()
    })
  })

window.onload = () => {
  const button = document.createElement('button')
  button.innerHTML = 'Add'
  document.body.appendChild(button)
  button.onclick = () => {
    const chore = new Chore({})
    chore.edit()
  }
}
