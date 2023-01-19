let currentProblemID = ''

// Reads problem ID, if the problem has been proken into steps, get the current step ID as well
function readProblem() {
  const problemElements = document.getElementsByClassName("GOBIPLGDDM");
  if (problemElements.length == 0) {
    return false;
  } else {
    const idArray = Array.from(problemElements, problemElements => problemElements.textContent);
    const problemID = idArray.pop();
    console.log(problemID);
    currentProblemID = problemID;

    let problemData = {};

    if (problemID.includes('-')) {
      problemData["type"] = "step"
      problemData["step_id"] = problemID;
    } else {
      problemData["type"] = "start"
      problemData["problem_id"] = problemID;
    }
    
    chrome.runtime.sendMessage(problemData, function(response) {
      console.log(response);
    });
  }
}

const submitHandler = () => {
  console.log('clicked');
  const data = {
    "type": "submit", 
    "problem_id": currentProblemID
  };

  chrome.runtime.sendMessage(data, function(response) {
    console.log(response.farewell);
  });
}

const newProblemCallback = (mutationList, observer) => {
  for (const mutation of mutationList) {
    for (const node of mutation.addedNodes){
      if(node.className == "GOBIPLGDPI") {
        readProblem();
        
        const buttons = Array.from(document.getElementsByClassName("GOBIPLGDEL"));
        const currentSubmitButton = buttons.findLast((butt) => (butt.textContent == 'Submit Answer') && !butt.ariaHidden);

        const inputBox = Array.from(document.getElementsByClassName("gwt-TextBox")).pop();
        currentSubmitButton.addEventListener('click', submitHandler);

        inputBox.addEventListener("keypress", function(event) {
          if (event.key === "Enter") {
            event.preventDefault();
            currentSubmitButton.click();
          }
        });
      }
    }
  }
};

// Waiting for DOM to load to read problem
const timer = setInterval(() => {
  const nodeSearch = document.getElementsByClassName("GOBIPLGDKI");
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

function showHint() {
  return null;
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request, sender);
    if(!sender.tab && "alert" in request){
      if(confirm("It seems like you've been stuck for a while,\nWould you like a hint?"))
        showHint();
    }
    sendResponse({msg: "msg received"});
  }
);
