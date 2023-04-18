/**
 * Background.js
 * 
 * This file recieves messages from the other components of the extension and
 * handles communications with the API 
 */

// Change this if API is not hosted locally!!!
const apiURL = 'http://127.0.0.1:5000';

/**
 * postRequest
 * Send a post request the the python neurolearn API 
 * 
 * @param {string} requestURL The url with which to make the API call
 * @param {Object} params Parameters for the API call dependent on API call
 *                        see API reference in Neurolearn for required params 
 *                        for specific requests
*/
function postRequest(requestURL, params) {
  options = {
    method: 'POST', 
    body: JSON.stringify(params),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  };

  fetch(requestURL, options).then((res) => {
    if(res.ok) {
      return res.json();
    }
    throw new Error('Error making request');
  })
  .then((data) => {
    console.log(data);
    sendReponse({farewell: 'thx bro'});
  })
  .catch((error) =>{
    console.log(error);
  });
}

/**
 * problemSetUpdateTrigger
 * Handles sending making API calls to send triggers when the user interacts
 * with the problem set. 
 * 
 * @param {Object} msg Message sent from the content script indicating an
 *                     action in the problem set
 * @param {string} msg.type The action for which the trigger is being sent
 *                          options include "start", "step", or "submit"
 * @param {string=} msg.problem_id Only for "start" type, the problem ID of the
 *                                 started problem
 * @param {string=} msg.step_id Only for "step" type, the step ID of the 
 *                              started step
*/
function problemSetUpdateTrigger(msg) {
  console.log('message: ' + msg);

  let requestURL = '';

  switch(msg.type) {
    case 'start':
      requestURL = apiURL + '/ProblemStart';
      break;
    case 'step':
      requestURL = apiURL + '/Step';
      break;
    case 'submit':
      requestURL = apiURL + '/ProblemSubmit';
      break;
    default:
      requestURL = apiURL;
  }

  delete msg.type;
  params = msg;
  postRequest(requestURL, params)
}

/**
 * handleIncorrectAnswer
 * Send message to options page indicating an incorrect answer was submitted
 */
function handleIncorrectAnswer() {
  (async () => {
    const response = await chrome.runtime.sendMessage({type: 'incorrect'});
    console.log(response);
  })();
}

// Listening for messages from problem-page content script
chrome.runtime.onMessage.addListener((msg, sender, sendReponse) => {
  // handle problem set update triggers
  if (sender.tab) {
    if(msg.type == 'submit') {
      if (!msg.correct) handleIncorrectAnswer();
    }
    problemSetUpdateTrigger(msg);
  }
});