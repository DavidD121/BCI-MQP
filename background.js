// background.js

let val = 0;

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("getData", {periodInMinutes: .1});
  chrome.alarms.create("updatePopup", {delayInMinutes: 0.01, periodInMinutes: .1});
  console.log('starting alarms');
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name == "getData") {
    console.log('fetching');
    fetch('http://127.0.0.1:5000/rnd').then((res) => {
      if(res.ok) {
        return res.json();
      }
      throw new Error("Error fetching value");
    })
    .then((data) => {
      console.log(data);
      val = data.value;
    })
    .catch((error) =>{
      console.log(error);
    });
  } else if (alarm.name = "updatePopup") {
    if (val < 0.5) {
      chrome.action.setIcon({ path: "/images/sleepy-32.png" });
    } else {
      chrome.action.setIcon({ path: "/images/smile-32.png" });

    }
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendReponse) => {
  if (msg.message == "gib data")
    sendReponse({message: "value", value:val});

  if (sender.tab) {

    console.log("Params: " + msg);
    params = msg

    options = {
      method: "POST", 
      body: JSON.stringify(params),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      }
    };

    const apiURL = "http://127.0.0.1:5000"
    let requestURL = "";

    if("step_id" in params) {
      requestURL = apiURL + "/Step"
    } else {
      requestURL = apiURL + "/ProblemStart"
    }

    fetch(requestURL, options).then((res) => {
      if(res.ok) {
        return res.json();
      }
      throw new Error("Error sending problem ID");
    })
    .then((data) => {
      console.log(data);
      sendReponse({farewell: "thx bro"});
    })
    .catch((error) =>{
      console.log(error);
    });
  }
});