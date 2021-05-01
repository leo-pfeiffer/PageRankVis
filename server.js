const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(express.static('content'));

const PORT = process.env.PORT || 8080

app.post('/api/rank/', (req, res) => {
    const edges = req.body.edges;
    const nodes = req.body.nodes;

    // sort by source node
    edges.sort((a, b) => a[0] - b[0], 0)

    // create the name Map for pageRank
    const nameMap = nodes.map((el, i) => [el, i])
        .reduce((obj, arr) => {
            obj[arr[0]] = arr[1]
            return obj
        }, {})

    // Create adjacency object
    const adjacencyMap = edges.reduce((obj, arr) => {
        obj.hasOwnProperty(arr[0]) ? obj[arr[0]].push(arr[1]) : obj[arr[0]] = [arr[1]]
        return obj
    }, {})

    // fill in nodes that don't have any edges
    nodes.forEach(node => {
        if (!adjacencyMap.hasOwnProperty(node)) {
            adjacencyMap[node] = []
        }
    })

    // create the adjacency list
    const adjacencyList = Object.entries(adjacencyMap)
        .sort((a, b) => {
            return parseInt(a[0]) - parseInt(b[0]);
        }, 0)
        .map(arr => arr[1])

    // create pageRank instance
    // todo
    const result = adjacencyList

    res.status(200).send({result: result})

})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
