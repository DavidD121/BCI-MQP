let currentProblemID = ''

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

function logAction(timestamp, action) {
  console.log('request');
  const apiURL = 'http://localhost:3000/assistments';
  request = {
    timestamp: timestamp,
    action: action
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
  logAction(Date.now(), event.srcElement.textContent + ' clicked');
}

const submitHandler = () => {
  console.log('submit');
  logAction(Date.now(), 'Submit clicked');
  const data = {
    type: 'submit', 
    problem_id: currentProblemID
  };

  (async () => {
    const response = await chrome.runtime.sendMessage(data);
    console.log(response);
  })();

}

const newProblemHandler = (event) => {
  buttonText = event.srcElement.textContent
  logAction(Date.now(), buttonText + ' clicked');
  if (buttonText == 'Next Problem') {
    console.log('new problem');
    const data = {
      type: 'new problem'
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
        helpButton.addEventListener('click', helpHandler);

        inputBox.addEventListener('keypress', function(event) {
          if (event.key === 'Enter') {
            event.preventDefault();;
            currentSubmitButton.click();
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