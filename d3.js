

function draw3dHeight(nodes, links, width, height){
    gData = {
        nodes: nodes,
        links: links,
    }
    const CBB = document.getElementById('ColorBlock');
    const elem = document.getElementById('graph');
    let Graph = null;
    if(document.getElementById('ColorBlock').checked){
        Graph = ForceGraph3D()
        (elem)
          .graphData(gData)
          .width(width)
          .height(height)
          .nodeAutoColorBy('block')
          .linkOpacity(1)
          .nodeLabel(node => `${node.id.slice(0,7)}.... (block ${node.block})`)
          .linkLabel(link => `${link.txLink.slice(0,7)}....`)
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
          return Graph;
    }else{
        Graph = ForceGraph3D()
        (elem)
          .graphData(gData)
          .width(width)
          .height(height)
          .linkOpacity(1)
          .nodeLabel(node => `${node.id.slice(0,7)}.... (block ${node.block})`)
          .linkLabel(link => `${link.txLink.slice(0,7)}....`)
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
          return Graph;
    }
   
}

function draw2dHeight(nodes, links, width, height){
    gData = {
        nodes: nodes,
        links: links,
    }
    let Graph = null;
    const elem = document.getElementById('graph');
    if(document.getElementById('ColorBlock').checked){
        Graph = ForceGraph()
        (elem)
        .graphData(gData)
        .width(width)
        .height(height)
        .backgroundColor('#101020')
        .nodeRelSize(6)
        .nodeAutoColorBy('block')
        .nodeLabel(node => `${node.id.slice(0,7)}.... (block ${node.block})`)
        .linkLabel(link => `${link.txLink.slice(0,7)}....`)
        .linkColor(() => 'rgba(255,255,255,0.2)')
        .linkDirectionalParticles(1)
        .onNodeHover(node => elem.style.cursor = node ? 'pointer' : null)
        .onNodeRightClick(node => {
            window.open(`https://www.blockchain.com/btc/address/${node.id}`, target="_blank");
        })
        .onLinkRightClick(link => {
            window.open(`https://www.blockchain.com/btc/tx/${link.txLink}`, target="_blank");
        })
        return Graph;
    }else{
        Graph = ForceGraph()
        (elem)
        .graphData(gData)
        .width(width)
        .height(height)
        .backgroundColor('#101020')
        .nodeRelSize(6)
        .nodeLabel(node => `${node.id.slice(0,7)}.... (block ${node.block})`)
        .linkLabel(link => `${link.txLink.slice(0,7)}....`)
        .linkColor(() => 'rgba(255,255,255,0.2)')
        .linkDirectionalParticles(1)
        .onNodeHover(node => elem.style.cursor = node ? 'pointer' : null)
        .onNodeRightClick(node => {
            window.open(`https://www.blockchain.com/btc/address/${node.id}`, target="_blank");
        })
        .onLinkRightClick(link => {
            window.open(`https://www.blockchain.com/btc/tx/${link.txLink}`, target="_blank");
        })
        return Graph;
    }
}