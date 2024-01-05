const puppeteer = require('puppeteer')

// URL of the Jira page you want to scrape
const TICKET_URL = 'https://seppi.atlassian.net/browse/NWA-3838'
const SELECTOR = `[data-testid]="issue.views.issue-base.foundation.summary.heading"`

async function scrapeJiraTicket(url) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  // Navigate to the Jira page
  await page.goto(url, { waitUntil: 'networkidle2' })
    
  // Extract ticket information based on the HTML structure
  //   await page.waitForSelector(SELECTOR) // not working
  const ticketTitle = await page.$eval(`h5`, (element) => {
    console.log(element)
    return element.textContent.trim()
  })
  //   const ticketDescription = await page.$eval(
  //     'div[id="description"]',
  //     (element) => element.textContent.trim()
  //   )

  // Print the extracted information
  console.log(`Ticket Title: ${ticketTitle}`)
  //   console.log(`Ticket Description: ${ticketDescription}`)

  // Close the browser
  await browser.close()
}

// Call the function to scrape Jira ticket information
scrapeJiraTicket(TICKET_URL)
