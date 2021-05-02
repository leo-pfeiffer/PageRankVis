window.onload = () => {

    /**
     * Setup of the cytoscape.
     * */
    const cy = cytoscape({

        container: $('#cy'),
        elements: [],
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': 'green',
                    'border-color': 'white',
                    'border-width': '2',
                    'label': 'data(id)',
                    'width': 'data(width)',
                    'height': 'data(height)'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier'
                }
            },
            {
                selector: ':selected',
                style: {
                    'line-color': 'red',
                    'border-color': 'red',
                    'target-arrow-color': 'red',
                    'source-arrow-color': 'red'
                }
            },
            {
                selector: '.opaque',
                style: {
                    'opacity': 0.25,
                    'text-opacity': 0,
                }
            }
        ],

        layout: {
            name: 'avsdf',
            nodeSeparation: 120
        },

    });

    // the id of the last added node
    let lastAdded = 0;

    // initially, reset selected node to null
    cy.selectedNode = null;

    // save the result of the ranking returned from the API
    let ranking = null;

    let layout;

    /**
     * Delete the currently selected elements of the cytoscape.
     * */
    const deleteSelected = function() {
        let selectedElements = cy.$(':selected');
        selectedElements.connectedEdges().remove();
        selectedElements.remove();
        cy.selectedNode = null;
        cy.elements().removeClass('opaque');
    }

    const updateRanking = function() {
        if (ranking === null) {
            return;
        }
        cy.nodes().forEach((node) => {
            node.data('height', ranking.mappedResult[node.id()] * 100);
            node.data('width', ranking.mappedResult[node.id()] * 100);
        });
    }

    // Get the buttons
    const addNodeBtn = $('#add-node-btn')
    const removeBtn = $('#remove-btn')
    const destroyBtn = $('#destroy-btn')
    const rankBtn = $('#rank-btn')
    const layoutBtn = $('#layout-btn')

    // add a new node upon click
    addNodeBtn.click(() => {
        cy.add({
            group: "nodes",
            data: {id: '' + lastAdded, name: 'Node '+ lastAdded, height: 25, width: 25},
            position: { x: (100 + lastAdded * 90 % 400), y: 100 }
        });
        lastAdded++;
    })

    // handler for taps on nodes
    cy.on('tap', 'node', function(e){

        // get the target node
        const node = e.target;

        // draw edge
        if (cy.selectedNode !== null && cy.selectedNode !== node) {
            cy.add({
                group: "edges",
                data: {target: node.id(), source: cy.selectedNode.id()}
            });
            cy.elements().removeClass('opaque');
            cy.selectedNode = null;
        }

        // don't draw edge
        else {
            cy.elements().addClass('opaque');
            node.removeClass('opaque');
            node.select();
            cy.selectedNode = node;
        }
    });

    // handle taps on any part of the cytoscape
    cy.on('tap', (e) => {
        if (e.target === cy) {
            cy.elements().removeClass('opaque');
            cy.selectedNode = null;
        }
    })

    // refresh the page
    destroyBtn.click(() => {
        location.reload();
    });

    // handler for clicks on remove button
    removeBtn.click(() => {
        deleteSelected();
    })

    layoutBtn.click(() => {
        layout = cy.layout({
            name: 'avsdf',
            animate: "end",
            animationDuration: 500,
            animationEasing: 'ease-in-out',
            nodeSeparation: 180
        });
        layout.run();
    })

    // handler for keyup events on delete and backspace
    $(document).keyup((e) => {
        const DELETE_KEYCODES = [46, 8];
        if (DELETE_KEYCODES.includes(e.keyCode) ) {
            deleteSelected();
        }
    });

    // handler for clicks on the rank button
    rankBtn.click(() => {
        const nodes = cy.nodes().toArray().map(el => parseInt(el.id()));
        const edges = cy.edges().toArray().map(el => [parseInt(el.data().source), parseInt(el.data().target)]);

        if (nodes.length === 0) {
            return;
        }

        fetch('/api/rank/', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                edges: edges,
                nodes: nodes
            })
        }).then((res) => {
            if (!res.ok) {
                throw new Error(res.status + ' ' + res.statusText);
            }
            else {
                return res.json();
            }
        }).then(jsn => {
            console.log(jsn)
            ranking = jsn.result;
            updateRanking();
        }).catch(err => console.log(err))
    })
}