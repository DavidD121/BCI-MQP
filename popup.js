const LEARNING = 0;
const FOLLOWING = 1;

function setState(state) {
  if (state == LEARNING) {
    console.log('learning');
    document.getElementById('img').src='/images/thinking-160.png';
    document.getElementById('txt').textContent="You seem confused by this problem, don't give up!";
  } else {
    console.log('following');
    document.getElementById('img').src='/images/lightbulb-160.png';
    document.getElementById('txt').textContent='Looks like you understand this problem!';
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendReponse) => {
  if('state' in msg) {
    setState(msg.state);
  }
});

document.getElementById('disagree').addEventListener('click', () => {
  console.log("disagreed");
  data = {
    type: 'disagree'
  };
  chrome.runtime.sendMessage(data, function(response) {
    console.log(response);
  });
});