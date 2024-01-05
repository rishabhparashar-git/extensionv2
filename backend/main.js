const fs = require('fs')
const { google } = require('googleapis')
const readline = require('readline')

const API_KEY = 'AIzaSyBKlnzq1vea1YjeedHt5sOjsfs8l5-8UrI'
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

const workingSheet = '1kPRqqi7Lj1qItc02LChNQ0cpAGHvSnxzJGPXDrcJOlI'
const testingSheet = '1SIbdorn3TT96375zcsOh_XIMJAXu2rYun8XtOYsdhYk'
const sheetByPro = '1PZ4GYOJEbc9rR3LMurdwkXsIC88qX0fXivUqY-xENTA'
const SPREADSHEET_ID = workingSheet
const TOKEN_PATH = 'token.json'
const SERVICE_ACCOUNT_FILE = 'service_account_creds.json'

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  )

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback)
    oAuth2Client.setCredentials(JSON.parse(token))
    callback(oAuth2Client)
  })
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  })
  console.log('Authorize this app by visiting this url:', authUrl)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close()
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err)
      oAuth2Client.setCredentials(token)
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err)
        console.log('Token stored to', TOKEN_PATH)
      })
      callback(oAuth2Client)
    })
  })
}

module.exports = function (req, res) {
  const ticketInfo = req.body

  const credentials = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE))

  // Set up the JWT client
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  })
  operations(auth, ticketInfo)
  res.status(201).send({ message: 'Request is in queue' })
  return
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err)
    authorize(JSON.parse(content), operations)
  })
}

function operations(auth, ticketInfo) {
  // listValues(auth)
  appendValues(auth, ticketInfo)
}

function listValues(auth) {
  const sheets = google.sheets({ version: 'v4', auth })
  sheets.spreadsheets.values.get(
    {
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A1:C8',
    },
    (err, res) => {
      if (err) return console.error('The API returned an error:', err.message)
      const values = res?.data?.values
      if (values && values.length) {
        console.log('Name, Major:')
        values.forEach((row) => {
          console.log(row.join(' | '))
        })
      } else {
        console.log('No data found.')
      }
    }
  )
}

const requiredKeys = [
  'title',
  'ticket',
  'type',
  'url',
  'assignee',
  'sprint',
  'status',
]

function appendValues(auth, ticketInfo) {
  const sheets = google.sheets({ version: 'v4', auth })

  console.log(ticketInfo)
  requiredKeys.forEach((key) => {
    if (!ticketInfo[key]) {
      throw new Error(`Required Key not found: ${key}`)
    }
  })

  const date = new Date().toDateString()
  const { title, ticket, type, url, assignee, sprint, status } = ticketInfo
  const values = [[date, title, ticket, type, status, assignee, url, sprint]]
  console.log(values)
  sheets.spreadsheets.values.append(
    {
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values,
      },
    },
    (err, res) => {
      if (err) return console.error('The API returned an error:', err.message)
      console.log('Values appended successfully.')
    }
  )
}
