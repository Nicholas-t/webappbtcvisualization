

function drawHeight(nodes, links){
    gData = {
        nodes: nodes,
        links: links,
    }
    const elem = document.getElementById('3d-graph');
    const Graph = ForceGraph3D()
      (elem)
        .graphData(gData)
        .nodeAutoColorBy('block')
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