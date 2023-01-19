
const port = 3000;


let fs = require('fs');
let bodyParser = require('body-parser');
let express = require('express');

let app = express()

let writer = fs.createWriteStream('test_gfg.csv') 

csvHeaders = ['confidence', 'confidence timestamp', 'guess', 'changed mind', 'math mistake', 'other'];

csvFormatter = (string, currentVal) => string + ',' + currentVal;
headerString = csvHeaders.reduce(csvFormatter)
writer.write(headerString);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyParser.json())

const cors = require('cors');
app.use(cors({
    origin: '*'
}));

app.get('/', (req, res) => {
    console.log("recived get");
    res.send('Hello World!');
})

app.post("/", (req, res) => {
    console.log(req.body);
    csvParams = [req.body.confidence, req.body.confidenceTimestamp, req.body.guess, 
        req.body.changedMind, req.body.mathMistake, req.body.other];
    csvString = "\n" + csvParams.reduce(csvFormatter);
    writer.write(csvString);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('csv wrote\n');
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});
