const express = require('express');
const app = express();
var path = require('path');
var fs = require("fs");

app.use(express.static('assets'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/play.html'));
});

app.get('/get-question', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(fs.readFileSync("./questions.json", "utf8"));
})

app.listen(3000, () => console.log('Armour Family 100 is running on port 3000!'));