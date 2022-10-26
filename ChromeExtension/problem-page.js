
// Waiting for DOM to load to read problem
const timer = setInterval(() => {
  const problemIDElements = document.getElementsByClassName("GOBIPLGDDM")
  if(problemIDElements.length != 0) {
    clearTimeout(timer);
    chrome.runtime.sendMessage({ID: problemIDElements[0].textContent}, function(response) {
      console.log(response.farewell);
    });
  }
}, 150);
 

