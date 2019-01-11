require('isomorphic-fetch')
require('dotenv').config({ path: 'secrets.env' })

const bodyParser = require('body-parser')
const express = require('express')
const zlFetch = require('zl-fetch')
const qs = require('qs')
const app = express()

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Routes
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`)
})

// Direct user to Google to authenticate
app.get('/test', (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth`
  const string = qs.stringify({
    scope: 'https://www.googleapis.com/auth/calendar',
    redirect_uri: 'http://localhost:3000/oauth',
    response_type: 'code',
    access_type: 'offline', // required for refresh token
    client_id: process.env.GOOGLE_CLIENT_ID
  })
  res.redirect(`${url}?${string}`)
})

// Code comes back to /oauth with code query param
// If error, has error query param
app.get('/oauth', (req, res) => {
  const { code } = req.query

  if (!code) return
  zlFetch('https://www.googleapis.com/oauth2/v4/token', {
    method: 'post',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: qs.stringify({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: `yZdc4CoBQo55cC9J9SoyloHg`,
      redirect_uri: 'http://localhost:3000/oauth', // Seems like this redirect_uri must be the same as the previous uri.
      grant_type: 'authorization_code'
    })
  })
    .then(r => {
      console.log(r.body)
      // access_token
      // token_type
      // expires_in: 3600
      // refresh token => Used to send for another access token. Should be kept in some long term storage
    })
    .catch(e => console.log(e.body))

  res.sendFile(`${__dirname}/public/index.html`)
})

app.listen(3000, '127.0.0.1', () => {
  console.log('app listening on http://127.0.0.1:' + 3000)
})
