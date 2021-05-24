const Twig = require('twig')
const templates = require('./templates')

fetch('/chores')
  .then(req => req.json())
  .then(data => {
    data.forEach(showChore)
  })

function showChore (entry) {
  const ul = document.getElementById('chores')
  const li = document.createElement('li')
  ul.appendChild(li)

  templates.render(li, 'list', {entry})
}
