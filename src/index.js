const Twig = require('twig')
const moment = require('moment')

const templates = require('./templates')

fetch('/chores')
  .then(req => req.json())
  .then(data => {
    data.forEach(entry => showChore(entry))
  })

function showChore (entry, li) {
  const ul = document.getElementById('chores')
  if (!li) {
    li = document.createElement('li')
    ul.appendChild(li)
  }

  templates.render(li, 'list', {entry}, () => {
    let actions = li.getElementsByClassName('actions')
    if (!actions.length) {
      return
    }
    actions = actions[0]

    let action = document.createElement('button')
    action.innerHTML = 'Done'
    actions.appendChild(action)
    action.onclick = () => {
      if (!entry.dates) {
        entry.dates = []
      }

      entry.dates.push(moment().toISOstring(true))

      const update = {
        dates: entry.dates
      }

      fetch('/chores/' + entry.id, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(update)
      })
        .then(req => req.json())
        .then(data => {
          entry = data
          showChore(entry, li)
        })
    }
  })
}
