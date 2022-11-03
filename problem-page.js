// Reads problem ID, if the problem has been proken into steps, get the current step ID as well
function readProblem() {
  const problemElements = document.getElementsByClassName("GOBIPLGDDM");
  if (problemElements.length == 0) {
    return false;
  } else {
    const idArray = Array.from(problemElements, problemElements => problemElements.textContent);
    const problemID = idArray.findLast(id => !id.includes('-'));
    const stepID = idArray.findLast(id => id.includes('-'));

    let problemData = {
      problem_id: problemID,
    };

    if (stepID) {
      problemData["step_id"] = stepID;
    } 
    
    chrome.runtime.sendMessage(problemData, function(response) {
      console.log(response.farewell);
    });
  }
}

const callback = (mutationList, observer) => {
  console.log(mutationList);
  for (const mutation of mutationList) {
    for (const node of mutation.addedNodes){
      console.log(node);
      if(node.className == "GOBIPLGDPI") {
        readProblem()
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

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
  }
}, 150);
