const apiURL = 'http://127.0.0.1:5000';

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

chrome.runtime.onMessage.addListener((msg, sender, sendReponse) => {
  // handle problem set update triggers
  if (sender.tab) 
    problemSetUpdateTrigger(msg);
    
});