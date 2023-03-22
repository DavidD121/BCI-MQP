let currentProblemID = ''
let usernameBody = ''
let userid = ''

// Reads problem ID, if the problem has been proken into steps, get the current step ID as well
function readProblem() {
  const problemElements = document.getElementsByClassName('GOBIPLGDDM');
  if (problemElements.length == 0) {
    return false;
  } else {
    const idArray = Array.from(problemElements, problemElements => problemElements.textContent);
    const problemID = idArray.pop();
    console.log(problemID);
    currentProblemID = problemID;

    let regExp = /\(([^)]+)\)/;
    usernameBody = document.getElementById('accountName').childNodes[0].textContent;
    let matches = regExp.exec(usernameBody);
    userid = matches[1]

    let problemData = {};

    if (problemID.includes('-')) {
      problemData.type = 'step'
      problemData.step_id = problemID;
    } else {
      problemData.type = 'start'
      problemData.problem_id = problemID;
    }

    (async () => {
      const response = await chrome.runtime.sendMessage(problemData);
      console.log(response);
    })();
  }
}

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

const helpHandler = (event) => {
  console.log('helo geldi', currentProblemID);
  logAction(Date.now(), event.srcElement.textContent + ' clicked', currentProblemID);
}

const submitHandler = () => {
  console.log('submit geldi', currentProblemID);
  let elements = Array.from(document.getElementsByClassName('GOBIPLGDJJ'));
  let correctElements = elements.filter(element => element.innerText != 'Loading...')
  let lastElement = correctElements[correctElements.length - 1]
  let correctMessage = lastElement.innerText.includes('Correct!');
  console.log('correct', correctMessage)
  // Handles logging and correctness chacking when user submits problem
  logAction(Date.now(), 'Submit clicked', currentProblemID, correctMessage);
  
  console.log("handling");

  // Check if incorrect message element appears on the page after submitting answer
  let elements = Array.from(document.getElementsByClassName('GOBIPLGDJJ')); 
  let correctMessage = !elements.findLast(element => element.textContent.includes('Correct!'));

  const data = {
    type: 'submit',
    correct: correctMessage ? true : false,
    problem_id: currentProblemID,
    userid: userid
  };

  (async () => {
    const response = await chrome.runtime.sendMessage(data);
    console.log(response);
  })();

}

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

    (async () => {
      const response = await chrome.runtime.sendMessage(data);
      console.log(response);
    })();
  } 
}

const newProblemCallback = (mutationList, observer) => {
  for (const mutation of mutationList) {
    for (const node of mutation.addedNodes){
      if(node.className == 'GOBIPLGDPI') {
        readProblem();
        
        const buttons = Array.from(document.getElementsByClassName('GOBIPLGDEL'));
        const currentSubmitButton = buttons.findLast((butt) => (butt.textContent == 'Submit Answer') && !butt.ariaHidden);
        const nextProblemButton = buttons.findLast((butt) => (butt.textContent == 'Next Problem'));
        const helpButton = Array.from(document.getElementsByClassName('GOBIPLGDGL')).findLast((butt) => !butt.ariaHidden);

        const inputBox = Array.from(document.getElementsByClassName('gwt-TextBox')).pop();
        
        currentSubmitButton.addEventListener('click', submitHandler);
        nextProblemButton.addEventListener('click', newProblemHandler);
        if (helpButton.textContent == 'Break this problem into steps'){
          helpButton.addEventListener('click', newProblemHandler);
        }
        else{
          helpButton.addEventListener('click', helpHandler);
        }

        // catching when users submit with the enter key instead of clicking the submit buttonS
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

    console.log(targetNode);
    const config = {childList: true, subtree: true };

    const observer = new MutationObserver(newProblemCallback);
    observer.observe(targetNode, config);
  }
}, 150);

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request, sender);
    if(!sender.tab && 'alert' in request){
      const helpButton = Array.from(document.getElementsByClassName('GOBIPLGDGL')).findLast((butt) => !butt.ariaHidden);

      let helpPrompt = '';
      switch(helpButton.textContent){
        case('Break this problem into steps'):
          helpPrompt = 'Would you like to break the problem into steps?';
          break;
        case('Show hint'):
          helpPrompt = 'Would you like a hint?';
          break;
        case('Show answer'):
          helpPrompt = 'Would you like to show the answer?'
          break;
      }

      if(helpPrompt != '') {
        if(confirm("It seems like you've been stuck for a while,\n" + helpPrompt)) {
          helpButton.click();
          sendResponse({msg: 'help accepted'});
        } else {
          sendResponse({msg: 'help declined'});
        }
      } else {
        sendResponse({msg: 'No further help possible'});
      }
        
    }
  }
);