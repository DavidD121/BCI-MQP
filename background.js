class Buffer {
  constructor(size) {
    this.size = size;
    this.buffer = [];
  }

  add(element) {
    this.buffer.push(element);
    if (this.buffer.length > this.size) {
      this.buffer.shift();
    }
  }

  average() {
    let sum = 0;
    for (let i = 0; i < this.buffer.length; i++) {
      sum += this.buffer[i];
    }
    return sum / this.buffer.length;
  }

  isFull() {
    return this.buffer.length == this.size;
  }

  empty() {
    this.buffer = []
  }
}

const ACQUISITION = 0;
const FOLLOWING = 1;
let prevState = ACQUISITION;
let state = ACQUISITION;
let timer = 0;

let samplingRate = 10; // Amount of times per minute that the state of the user is obtained from the API 
let hintSampleBuffer = 90; // Length of time in seconds where the users state is tracked to send a hint
let hintThreshold = 0.90; // Ratio of time within the buffer where the user is confused that warrants a hint

let cognitiveStateBuffer = new Buffer(Math.floor(hintSampleBuffer/60 * samplingRate))

const apiURL = 'http://127.0.0.1:5000';

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('getData', {periodInMinutes: 1/samplingRate});
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
    console.log('sending alert')
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    const response = await chrome.tabs.sendMessage(tab.id, {alert: true});
    console.log(response);
  })();
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name == 'getData') {
    console.log('fetching');
    fetch('http://127.0.0.1:5000/GetRLState').then((res) => {
      if(res.ok) {
        return res.json();
      }
      throw new Error('Error fetching value');
    })
    .then((data) => {
      val = data.state;
      state = val
      cognitiveStateBuffer.add(state);
      console.log(cognitiveStateBuffer.buffer);
      if (state == ACQUISITION) {
        if(prevState == ACQUISITION && cognitiveStateBuffer.isFull() && cognitiveStateBuffer.average() <= 1 - hintThreshold ){
          sendHintAlert();
          cognitiveStateBuffer.empty();
        } else if(prevState == FOLLOWING) {
          timer = Date.now();
          chrome.action.setIcon({ path: '/images/thinking-32.png' });
          updatePopupState();
        }
      } else if(state == FOLLOWING) {
        if(prevState == ACQUISITION) {
          chrome.action.setIcon({ path: '/images/lightbulb-32.png' });
        }
        updatePopupState();
      }
      prevState = state;
    })
    .catch((error) =>{
      console.error(error);
    });
  }
});

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

function stateDisagreeTrigger(msg) {
  requestURL = apiURL + '/Disagree'
  params = {
    state: state == 0 ? "accquisition" : "following"
  };

  postRequest(requestURL, params);
}

chrome.runtime.onMessage.addListener((msg, sender, sendReponse) => {
  if (msg.message == 'gib data')
    sendReponse({message: 'value', value:state});

  
  if(msg.type == 'disagree')
    stateDisagreeTrigger(msg);

  // handle problem set update triggers
  if (sender.tab) 
    problemSetUpdateTrigger(msg);
    
});