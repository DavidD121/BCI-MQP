/**
 * problem-page.js
 * 
 * Content script for the assistments problem page. Monitors elements in the  
 * assistments page and sends messages to background.js to send triggers
 * Also communicates with the node.js server to well as log actions to csv
 */

let currentProblemID = ''
let usernameBody = ''
let userid = ''

/**
 * readProblem
 *  
 * Reads current problem or step ID, sending a message to the background script
 * to send a start trigger to the API
*/ 
function readProblem() {
  // Get all of the text elements with problem IDs on the ASSISTments page
  const problemElements = document.getElementsByClassName('GOBIPLGDDM');
  if (problemElements.length == 0) {
    return false;
  }

  // Get the current problem ID
  const idArray = Array.from(problemElements, problemElements => problemElements.textContent);
  const problemID = idArray.pop();
  console.log(problemID);
  currentProblemID = problemID;

  let regExp = /\(([^)]+)\)/;
  usernameBody = document.getElementById('accountName').childNodes[0].textContent;
  let matches = regExp.exec(usernameBody);
  userid = matches[1]

  let problemData = {};

  // Identify if the new problem is a step (step IDs have a dash)
  if (problemID.includes('-')) {
    problemData.type = 'step'
    problemData.step_id = problemID;
  } else {
    problemData.type = 'start'
    problemData.problem_id = problemID;
  }

  // send message to background.js to send trigger
  (async () => {
    const response = await chrome.runtime.sendMessage(problemData);
    console.log(response);
  })();

}

/**
 * logAction
 *  
 * Sends request to Node.js to log an action to csv
 * 
 * @param {number} timestamp The time in ms since epoch that the action occured
 * @param {action} action A short string describing the action being logged 
 *                        i.e 'Submit button pressed'
*/ 
function logAction(timestamp, action, problemid, correct='') {
  console.log('request');
  const apiURL = 'http://localhost:3000/assistments';
  request = {
    timestamp: timestamp,
    action: action,
    problemid: problemid,
    userid: userid,
    correct: correct,
  };
  options = {
    method: 'POST', 
    body: JSON.stringify(request),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  };
  fetch(apiURL, options).then((res) => {
    if(res.ok) {
      console.log('csv logged');
    } else {
      throw new Error('Error sending data');
    }
  })
  .catch((error) =>{
    console.log(error);
  });
}

/**
 * helpHandler
 * 
 * Callback funtion for when the hint button is clicked. Send the request to 
 * Log the action to CSV
 */ 
const helpHandler = (event) => {
  console.log('help geldi', currentProblemID, event.target.ariaHidden);
  if(event.target.ariaHidden == "true"){
    logAction(Date.now(), 'Show answer clicked', currentProblemID);
  }
  else{
    logAction(Date.now(), 'Show hint clicked', currentProblemID);
  }
}

/**
 * submitHandler
 * 
 * Callback funtion for when the submit button is clicked. Sends message to 
 * background.js to send trigger to API and sends request to log the action to
 * csv
 */ 
const submitHandler = () => {
  console.log('submit geldi', currentProblemID);
  // Checking if correct message is on page after submit
  let elements = Array.from(document.getElementsByClassName('GOBIPLGDJJ'));
  let correctElements = elements.filter(element => element.innerText != 'Loading...')
  let lastElement = correctElements[correctElements.length - 1]
  let correctMessage = lastElement.innerText.includes('Correct!');
  console.log('correct', correctMessage)
  
  // Handles logging and correctness chacking when user submits problem
  logAction(Date.now(), 'Submit clicked', currentProblemID, correctMessage);
  
  console.log("handling");

  const data = {
    type: 'submit',
    correct: correctMessage ? true : false,
    problem_id: currentProblemID,
    userid: userid
  };

  // Sending message to background.js to send trigger
  (async () => {
    const response = await chrome.runtime.sendMessage(data);
    console.log(response);
  })();

}

/**
 * newProblemHandler
 * 
 * Callback funtion for when a new porblem is started. Sends message to 
 * options.js to reset the question prompt.
 */ 
const newProblemHandler = (event) => {
  console.log('new problem geldi', currentProblemID)
  buttonText = event.srcElement.textContent
  logAction(Date.now(), buttonText + ' clicked', currentProblemID);
  if (buttonText == 'Next Problem' || 'Break this problem into steps' || 'Next step') {
    console.log('new problem');
    const data = {
      type: 'new problem',
      problem_id: currentProblemID,
      userid: userid
    };

    // send message to options.js to reset question prompt
    (async () => {
      const response = await chrome.runtime.sendMessage(data);
      console.log(response);
    })();
  } 
}

/**
 * observerCallback
 * 
 * Callback funtion for the mutation observer, runs when the DOM is updated.
 * Searchs for new problems in the page, and adds event listeners to relevent
 * elements to send triggers and log actions to csv.
 */ 
const observerCallback = (mutationList, observer) => {
  for (const mutation of mutationList) {
    for (const node of mutation.addedNodes){
      // Search added elements for new problem containers
      if(node.className == 'GOBIPLGDPI') {
        readProblem();
        
        // Find buttons and inputs for which we want to add event listeners
        const buttons = Array.from(document.getElementsByClassName('GOBIPLGDEL'));
        const currentSubmitButton = buttons.findLast((butt) => (butt.textContent == 'Submit Answer') && !butt.ariaHidden);
        const nextProblemButton = buttons.findLast((butt) => (butt.textContent == 'Next Problem'));
        const helpButton = Array.from(document.getElementsByClassName('GOBIPLGDGL')).findLast((butt) => !butt.ariaHidden);
        const inputBox = Array.from(document.getElementsByClassName('gwt-TextBox')).pop();
        
        // Add event listeners to trigger callback functions on click
        currentSubmitButton.addEventListener('click', submitHandler);
        nextProblemButton.addEventListener('click', newProblemHandler);
        if (helpButton.textContent == 'Break this problem into steps'){
          helpButton.addEventListener('click', newProblemHandler);
        }
        else{
          helpButton.addEventListener('click', helpHandler);
        }

        // Catching when users submit with the enter key instead of clicking the submit buttons
        inputBox.addEventListener('keypress', function(event) {
          if (event.key === 'Enter') {
            console.log("breh");
            event.preventDefault();
            submitHandler();
          }
        });
      }
    }
  }
};

// Waiting for DOM to load to read problem
const timer = setInterval(() => {
  const nodeSearch = document.getElementsByClassName('GOBIPLGDKI');
  if(nodeSearch.length != 0) {
    clearTimeout(timer);

    // Tracking HTML DOM changes in the problem set
    const targetNode = nodeSearch[0];

    // Initializing mutation observer which monitors the DOM for changes
    console.log(targetNode);
    const config = {childList: true, subtree: true };
    const observer = new MutationObserver(observerCallback);
    observer.observe(targetNode, config);
  }
}, 150);
