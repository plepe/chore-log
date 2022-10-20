// server.js
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('data/db.json')
const middlewares = jsonServer.defaults({
  static: '.'
})

server.use(middlewares)
server.use(router)

const port = 3000
server.listen(port, () => {
  console.log('JSON Server is listening on port', port)
})
