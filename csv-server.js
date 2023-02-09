
const port = 3000;


let fs = require('fs');
let bodyParser = require('body-parser');
let express = require('express');

let app = express();

let followupWriter = fs.createWriteStream('followup_' + Date.now().toString() + '.csv');
let assistmentsWriter = fs.createWriteStream('assistments_' + Date.now().toString() + '.csv');


followupCSVHeaders = ['timestamp', 'confidence', 'guess', 'changed mind', 'math mistake', 'other'];
assistmentsCSVHeaders = ['timestamp', 'action'];

csvFormatter = (string, currentVal) => string + ',' + currentVal;

followupHeaderString = followupCSVHeaders.reduce(csvFormatter);
followupWriter.write(followupHeaderString);

assistmentsHeaderString = assistmentsCSVHeaders.reduce(csvFormatter);
assistmentsWriter.write(assistmentsHeaderString);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors({
    origin: '*'
}));

app.get('/', (req, res) => {
    console.log("recived get");
    res.send('Hello World!');
})

app.post("/followup", (req, res) => {
    console.log(req.body);
    csvParams = [req.body.timestamp, req.body.action, req.body.confidence, req.body.guess, 
        req.body.changedMind, req.body.mathMistake, req.body.other];
    csvString = "\n" + csvParams.reduce(csvFormatter);
    followupWriter.write(csvString);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('csv wrote\n');
});

app.post("/assistments", (req, res) => {
    console.log(req.body);
    csvParams = [req.body.timestamp, req.body.action];
    csvString = "\n" + csvParams.reduce(csvFormatter);
    assistmentsWriter.write(csvString);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('csv wrote\n');
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});