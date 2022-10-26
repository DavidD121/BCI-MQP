function setState(value) {
  if (value < 0.5) {
    console.log("sleepy");
    document.getElementById('img').src="/images/sleepy.png";
    document.getElementById('txt').textContent="Your mind seems to be wandering...";
  } else {
    console.log("focused");
    chrome.action.setIcon({ path: "/images/smile-32.png" });
    document.getElementById('img').src="/images/smile.png";
    document.getElementById('txt').textContent="You are focused and learning proactively!";
  }
}

chrome.runtime.sendMessage({message: "gib data"}, (response) => {
  if(response.message == "value") {
    console.log(response.value)
    setState(parseFloat(response.value));
  } else {
    console.log("invalid response")
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name == "updatePopup") {
    chrome.runtime.sendMessage({message: "gib data"}, (response) => {
      if(response.message == "value") {
        console.log(response.value)
        setState(parseFloat(response.value));
      } else {
        console.log("invalid response")
      }
    });
  }
});