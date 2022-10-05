// background.js

let val = 0;

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("getData", {periodInMinutes: .1});
  chrome.alarms.create("updatePopup", {periodInMinutes: .05});
  console.log('starting alarms');
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name == "getData") {
    console.log('fetching');
    fetch('http://127.0.0.1:5000/rnd').then((res) => {
      return res.json();
    }).then((data) => {
      console.log(data);
      val = data.value;
    });
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendReponse) => {
  if (msg.message == "gib data")
    sendReponse({message: "value", value:val});
});