// Styling for other checkbox
document.getElementById('other').addEventListener('click', () => {
    if(document.getElementById('other').checked) {
        document.getElementById('other_txt').style.display = 'block';
    } else {
        document.getElementById('other_txt').style.display = 'none';
    }
});

document.getElementById('submit').addEventListener('click', () => {
    const apiURL = 'http://localhost:3000';
    request = {
        confidence: document.getElementById('confidence').checked,
        confidenceTimestamp: 0,
        guess: document.getElementById('q1').checked,
        changedMind: document.getElementById('q2').checked,
        mathMistake: document.getElementById('q3').checked,
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
});