const LEARNING = 0;
const FOLLOWING = 1;
let state = LEARNING;
let timer = 0;
let timeToHint = 60000; //time until user is alerted for a hint

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("getData", {periodInMinutes: .1});
  chrome.alarms.create("updateState", {delayInMinutes: 0.01, periodInMinutes: .1});
  console.log('starting alarms');
  timer = Date.now()
});

function updatePopupState() {
  (async () => {
    const response = await chrome.runtime.sendMessage({state: state});
  })();
}

function sendHintAlert() {
  (async () => {
    console.log("sending alert")
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    const response = await chrome.tabs.sendMessage(tab.id, {alert: true});
  })();
}

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
  } else if (alarm.name = "updateState") {
    if (val <= 0.5) {
      prevState = state;
      state = LEARNING;

      if(prevState == LEARNING && Date.now() - timer >= 60000){
        sendHintAlert();
        timer = Date.now();
      } else if(prevState == FOLLOWING) {
        timer = Date.now();
        state = LEARNING;
        chrome.action.setIcon({ path: "/images/thinking-32.png" });
        updatePopupState();
      }
    } else if(val > 0.5) {
      prevState = state;
      state = FOLLOWING;
      if(prevState == LEARNING) {
        chrome.action.setIcon({ path: "/images/lightbulb-32.png" });
      }
      updatePopupState();
    }
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendReponse) => {
  if (msg.message == "gib data")
    sendReponse({message: "value", value:state});

  if (sender.tab) {

    console.log("message: " + msg);

    const apiURL = "http://127.0.0.1:5000"
    let requestURL = "";

    switch(msg["type"]) {
      case "start":
        requestURL = apiURL + "/ProblemStart";
        break;
      case "step":
        requestURL = apiURL + "/Step";
        break;
      case "submit":
        requestURL = apiURL + "/ProblemSubmit";
        break;
      default:
        requestURL = apiURL;
    }

    delete msg["type"];
    params = msg;

    options = {
      method: "POST", 
      body: JSON.stringify(params),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      }
    };

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