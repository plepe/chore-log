fetch('/chores')
  .then(req => req.json())
  .then(data => {
    console.log(data)
  })
