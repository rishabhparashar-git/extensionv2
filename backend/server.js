const express = require('express')
const app = express()
const router = express.Router()

const bodyParser = require('body-parser')

const script = require('./main')

app.use(require('morgan')('dev'))
app.use(require('cors')())
app.use(require('helmet')())
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

try {
  router.post('/write', script)

  app.use(router)

  app.get('/', (req, res) =>
    res.send({ error: false, message: 'SERVER IS LIVE!', result: null })
  )

  app.listen(5003, async () => {
    console.clear()
    console.log(`SERVER STARTED ON PORT: 5003`)
  })
} catch (err) {
  console.log('err block')
  console.log(err)
}
