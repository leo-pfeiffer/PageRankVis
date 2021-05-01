const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(express.static('content'));

const PORT = process.env.PORT || 8080

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
