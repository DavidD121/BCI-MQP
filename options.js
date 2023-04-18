/**
 * options.js
 * 
 * This file handles the logic and styling for the student question prompt. The prompt is
 * in the "options" menus of the chrome extension and is meant to be displayed
 * side by side with ASSISTments.
 * 
 * Communicates with Node.js server to log interactions to CSV
 */

/**
 * Log
 * Log the users action on with the follow-up question
 * 
 * @param {int} timestamp Time in ms since epoch that the action occured
 * @param {string} action A short string describing the action being logged i.e 'Submit button pressed'
 * @param {string} problemid
 * @param {string} userid

*/
function log(timestamp, action, problemid, userid) {
  const apiURL = 'http://localhost:3000/followup';
  request = {
    timestamp: timestamp,
    action: action,
    confidence: document.getElementById('confidence').checked,
    guess: document.getElementById('guess').checked,
    changedMind: document.getElementById('changedMind').checked,
    mathMistake: document.getElementById('mathMistake').checked,
    other: document.getElementById('other').checked ? '\"' + String(document.getElementById('other-txt').value) + '\"' : '' ,
    problemid: problemid,
    userid: userid
  };
  options = {
    method: "POST", 
    body: JSON.stringify(request),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  };
  fetch(apiURL, options).then((res) => {
    if(res.ok) {
      console.log("csv logged");
    } else {
      throw new Error("Error sending data");
    }
  })
  .catch((error) =>{
    console.log(error);
  });
}

/**
 * Reset Question
 * Resets the follow-up question to its original state 
*/
function resetQuestion() {
  document.getElementById('confidence').checked = false;
  document.getElementById('guess').checked = false;
  document.getElementById('changedMind').checked = false;
  document.getElementById('mathMistake').checked = false;
  document.getElementById('other').checked = false;
  document.getElementById('other-txt').value = ''; 
  setIncorrectPromptVisibility(false);   
}

/**
 * Set Incorrect Prompt Visibility
 * Sets visibility of the checkbox prompt when a problem is answered incorrectly
 * 
 * @param {bool} visible  Whether the prompt should be visible or not
*/
function setIncorrectPromptVisibility(visible) {
  if(visible) {
    document.getElementById('incorrect-prompt').style.display = 'block';
  } else {
    document.getElementById('incorrect-prompt').style.display = 'none';
  }
}

let currentProblemID = ''
let userid = ''

// Adding event listeners to each input element
inputs = Array.from(document.getElementsByTagName('input'));

inputs.forEach(element => {
  // Log every instance the buttons are clicked
  element.addEventListener('click', (event) => {
    timestamp = Date.now();
    action  = event.srcElement.id + " clicked";
    log(timestamp, action, currentProblemID, userid);
  });
});

// Hiding/showing other checkbox
document.getElementById('other').addEventListener('click', () => {
  if(document.getElementById('other').checked) {
    document.getElementById('other-txt').style.display = 'block';
  } else {
    document.getElementById('other-txt').style.display = 'none';
  }
});

// Message listener
chrome.runtime.onMessage.addListener((msg, sender, sendReponse) => {
  currentProblemID = msg.problem_id
  userid = msg.userid
  console.log("msg recieved in options")
  console.log("message for " + currentProblemID)
  if (msg.type == "new problem") {
    // Reset question prompt when problem is finished
    timestamp = Date.now();
    action = "Problem submitted";
    log(timestamp, action, currentProblemID, userid);
    resetQuestion();
    sendReponse({msg: "reset follow-up question"})
  } else if (msg.type == 'incorrect') {
    // Show expanded prompt when the user gets a problem wrong with confidence checked
    if(document.getElementById('confidence').checked) {
      timestamp = Date.now();
      setIncorrectPromptVisibility(true);
      log(timestamp, 'Incorrect Guess with confidence checked', currentProblemID, userid);
    }
  }
});
