var width = 900;
var height = 600;

function drawHeight(nodes, links){
    gData = {
        nodes: nodes,
        links: links,
    }
    const elem = document.getElementById('3d-graph');
    const Graph = ForceGraph3D()
      (elem)
        .graphData(gData)
        .nodeAutoColorBy('group')
        .linkOpacity(1)
        .nodeLabel(node => `${node.id}`)
        .linkLabel(link => `${link.txLink}`)
        .linkDirectionalArrowLength(7)
        .linkDirectionalArrowRelPos(1)
        .onNodeHover(node => elem.style.cursor = node ? 'pointer' : null)
        .onNodeClick(node => {
            // Aim at node from outside it
            const distance = 100;
            const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
            Graph.cameraPosition(
                { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
                node, // lookAt ({ x, y, z })
                3000  // ms transition duration
            );
        })
        .onNodeRightClick(node => {
            window.open(`https://www.blockchain.com/btc/address/${node.id}`, target="_blank");
        })
        .onLinkRightClick(link => {
            window.open(`https://www.blockchain.com/btc/tx/${link.txLink}`, target="_blank");
        })
}

/*
function drawAddress(pathAll, sizeAll){
    const controls = { 'DAG Orientation': 'td'};
    // graph config
    const NODE_REL_SIZE = 1;
    const graph = ForceGraph3D()
        .dagMode('td')
        .dagLevelDistance(200)
        .backgroundColor('#101020')
        .linkColor(() => 'rgba(255,255,255,0.2)')
        .nodeRelSize(NODE_REL_SIZE)
        .nodeId('path')
        .nodeVal('size')
        .nodeLabel('path')
        .nodeAutoColorBy('module')
        .nodeOpacity(0.9)
        .linkDirectionalParticles(2)
        .linkDirectionalParticleWidth(0.8)
        .linkDirectionalParticleSpeed(0.006)
        .d3Force('collision', d3.forceCollide(node => Math.cbrt(node.size) * NODE_REL_SIZE))
        .d3VelocityDecay(0.3);
    // Decrease repel intensity
    graph.d3Force('charge').strength(-15);
    fetch('./data.csv')
        .then(r => r.text())
        .then(d3.csvParse)
        .then(data => {
            const nodes = [], links = [];
            data.forEach(({ size, path }) => {
                console.log('size', size)
                console.log('path', path)
                const levels = path.split('/'),
                        level = levels.length - 1,
                        module = level > 0 ? levels[1] : null,
                        leaf = levels.pop(),
                        parent = levels.join('/');
                const node = {
                        path,
                        leaf,
                        module,
                        size: +size || 20,
                        level
                    };
                nodes.push(node);
                if (parent) {
                    links.push({source: parent, target: path, targetNode: node});
                }
            })
            graph(document.getElementById('3d-graph'))
                .graphData({ nodes, links });
        });
}*/
 