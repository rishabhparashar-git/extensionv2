const JIRA_SELECTOR =
  '#ak-main-content > div > div > div._4t3i1osq._1e0c1txw._2lx21bp4 > div._4t3i1osq._kqswh2mm > div._kqswh2mm._4t3i1osq > div._4t3i1osq._12ji1r31._1qu2glyw._12y31o36._1reo1wug._18m91wug > div > div._3um0ewfl > div > div > div > div._otyr1b66._1yt4swc3._1e0c116y'
const TITLE_SELECTOR =
  '#ak-main-content > div > div > div._4t3i1osq._1e0c1txw._2lx21bp4 > div._4t3i1osq._kqswh2mm > div._kqswh2mm._4t3i1osq > div._ogwtidpf._6tinidpf._1cezidpf._m3zkidpf._7yjtidpf._ldgnidpf._un3pidpf._29hzidpf._4t3i1osq._1e0c1txw._2lx21bp4._15y61q9c._k8em1osq._dzc24jg8 > div > div._12ji1r31._1qu2glyw._12y31o36._1reo1e7b._18m92qvy._16jlkb7n._1o9zidpf._i0dlidpf._1ul9xilx._19bv18bx > div > div._1e0c1txw._16jlkb7n._1o9zkb7n._i0dl1wug._1ul9idpf._1bsb1osq > div > div > div > div > div > form > div > div > div > div > h1'
const SELECTOR = '._otyr1b66._1yt4swc3._1e0c116y'
console.log('THE DRAGON DEVS script running')

const btnTextCls = '.css-178ag6o'
const btnIconCls = '.css-4h66kx'

const btnText = {
  add: 'Add to Sheet',
  waiting: 'Adding..',
  failed: 'Failed to add',
  added: 'Added',
}

const color = {
  success: '#4bce97 !important',
  fail: '#e54939 !important',
  default: 'inherit',
}
// var actionPanel = document.querySelector('h1')
// var actionPanel = document.getElementsByTagName('h1')
// var actionPanel = document.querySelector()
// console.log(actionPanel)

// Injected script on the client side
function waitForSelector(selector, maxAttempts = 10, interval = 1000) {
  let attempts = 0

  function attempt() {
    const element = document.querySelector(selector)
    attempts++

    if (element) {
      console.log(`Found element with selector "${selector}"`)

      addBtn(element)

      // Do something with the element, e.g., extract information
    } else if (attempts < maxAttempts) {
      console.log(`Attempt ${attempts}: Element not found, waiting...`)
      setTimeout(attempt, interval)
    } else {
      console.log(`Reached max attempts. Element not found.`)
    }
  }

  attempt()
}

// Call the function to wait for a specific selector
waitForSelector(SELECTOR)

function addBtn(parent) {
  // Get the first child of the parent
  var firstChild = parent.firstChild

  // Check if the first child is an element node (to exclude text nodes or whitespace)
  while (firstChild && firstChild.nodeType !== 1) {
    firstChild = firstChild.nextSibling
  }

  // Modify the content of the first child
  if (firstChild) {
    var clonedChild = firstChild.cloneNode(true)

    const button = clonedChild.querySelector(btnTextCls)
    const icon = clonedChild.querySelector(btnIconCls)
    icon.remove()
    button.innerText = btnText.add

    // parent.append(clonedChild) // inserting at first place
    parent.insertBefore(clonedChild, firstChild)
    clonedChild.addEventListener('click', () => onBtnClick(button))
  }
}

function onBtnClick(button) {
  button.innerText = btnText.waiting
  const ticketInfo = scrapTicketInfo()
  writeToSheet(ticketInfo)
    .then((res) => {
      button.innerText = btnText.added
      button.style.color = color.success
    })
    .catch((err) => {
      button.innerText = btnText.failed
      button.style.color = color.fail
      setTimeout(() => {
        button.innerText = btnText.add
        button.style.color = color.default
      }, 3000)
      console.error(err?.message || 'An error occured while writing to sheet')
    })
}

function writeToSheet(ticketInfo) {
  console.log('pushing', ticketInfo)
  return fetch('http://localhost:5003/write', {
    method: 'POST',
    headers: {
      Accept: 'application.json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ticketInfo),
  })
}

function scrapTicketInfo() {
  const title = document.querySelector(TITLE_SELECTOR)?.innerText || 'title'
  const assignee =
    document.querySelector(
      '#ak-main-content > div > div > div._4t3i1osq._1e0c1txw._2lx21bp4 > div._4t3i1osq._kqswh2mm > div._kqswh2mm._4t3i1osq > div._ogwtidpf._6tinidpf._1cezidpf._m3zkidpf._7yjtidpf._ldgnidpf._un3pidpf._29hzidpf._4t3i1osq._1e0c1txw._2lx21bp4._15y61q9c._k8em1osq._dzc24jg8 > div > div._12ji1r31._1qu2glyw._12y31o36._1reo1e7b._18m92qvy._u5f318bx._1ul91ll1._v5647jka > div > div._3um0ewfl > div:nth-child(3) > div:nth-child(2) > div:nth-child(1) > div > div > details > div > div > div._1e0c1kw7._2lx21kw7._4cvr1kw7._1bah1kw7 > div > div > div > div > div._16jlkb7n._1bsb1nrf._vchhusvi._1j1hbgig._1owx16np > div > div > div > div.sc-1u79nuj-0.fFzhmA > form > div > div > div > div > span > div > div > span > span'
    )?.innerText || 'assignee'
  const type =
    document.querySelector(
      '#jira-issue-header > div > div > div > nav > ol > div:nth-child(4) > div._u5f31b66 > div > button > span > img'
    )?.alt || 'type'
  const url =
    document.querySelector(
      '#jira-issue-header > div > div > div > nav > ol > div:nth-child(4) > div:nth-child(2) > li > a'
    )?.href || 'url'
  const ticket =
    document.querySelector(
      '#jira-issue-header > div > div > div > nav > ol > div:nth-child(4) > div:nth-child(2) > li > a > span'
    )?.innerText || 'ticket'

  const sprint =
    document.querySelector(
      '#ak-main-content > div > div > div._4t3i1osq._1e0c1txw._2lx21bp4 > div._4t3i1osq._kqswh2mm > div._kqswh2mm._4t3i1osq > div._ogwtidpf._6tinidpf._1cezidpf._m3zkidpf._7yjtidpf._ldgnidpf._un3pidpf._29hzidpf._4t3i1osq._1e0c1txw._2lx21bp4._15y61q9c._k8em1osq._dzc24jg8 > div > div._12ji1r31._1qu2glyw._12y31o36._1reo1e7b._18m92qvy._u5f318bx._1ul91ll1._v5647jka > div > div._3um0ewfl > div:nth-child(3) > div:nth-child(2) > div:nth-child(1) > div > div > details > div > div > div:nth-child(11) > div > div > div._16jlkb7n._1bsb1nrf._vchhusvi._196m16np > div > div > div > form > div > div > div > div > div > div._o5721q9c._1reo15vq._18m915vq._1bto1l2s > a'
    )?.innerText || 'sprint'

  const status =
    document.querySelector(
      `#issue .fields .status-view .status-button > span.css-178ag6o`
    )?.innerText || 'status'
    
  return { title, ticket, type, url, assignee, sprint, status }
}
