// Styling for other checkbox
document.getElementById('other').addEventListener('click', () => {
  if(document.getElementById('other').checked) {
    document.getElementById('other_txt').style.display = 'block';
  } else {
    document.getElementById('other_txt').style.display = 'none';
  }
});

inputs = Array.from(document.getElementsByTagName('input'));

inputs.forEach(element => {
  element.addEventListener('click', (event) => {
    timestamp = Date.now();
    action  = event.srcElement.id + " clicked";
    submit(timestamp, action);
  });
});

function submit(timestamp, action) {
  const apiURL = 'http://localhost:3000/followup';
  request = {
    timestamp: timestamp,
    action: action,
    confidence: document.getElementById('confidence').checked,
    guess: document.getElementById('guess').checked,
    changedMind: document.getElementById('changedMind').checked,
    mathMistake: document.getElementById('mathMistake').checked,
    other: document.getElementById('other').checked ? '\"' + String(document.getElementById('other_txt').value) + '\"' : '' 
  };
  options = {
    method: "POST", 
    body: JSON.stringify(request),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  };
  fetch(apiURL, options).then((res) => {
    if(res.ok) {
      console.log("csv logged");
    } else {
      throw new Error("Error sending data");
    }
  })
  .catch((error) =>{
    console.log(error);
  });
}

function resetQuestion() {
  document.getElementById('confidence').checked = false;
  document.getElementById('guess').checked = false;
  document.getElementById('changedMind').checked = false;
  document.getElementById('mathMistake').checked = false;
  document.getElementById('other').checked = false;
  document.getElementById('other_txt').value = '';    
}

chrome.runtime.onMessage.addListener((msg, sender, sendReponse) => {
  console.log("msg recieved in options")
  if(msg.type == "new problem") {
    timestamp = Date.now();
    action = "Problem submitted";
    submit(timestamp, action);
    resetQuestion();
    sendReponse({msg: "reset follow-up question"})
  }
});