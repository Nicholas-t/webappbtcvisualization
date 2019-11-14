var width = 900;
var height = 600;

function draw(nodes, links){
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
        .nodeThreeObject(node => {
            // use a sphere as a drag handle
            try{
                const obj = new THREE.Mesh(
                new THREE.SphereGeometry(10),
                new THREE.MeshBasicMaterial({ depthWrite: false, transparent: true, opacity: 0 })
                );
                // add text sprite as child
                const sprite = new SpriteText(node.id.slice(0,6));
                sprite.textHeight = 8;
                obj.add(sprite);
                return obj;
            }
            catch(e){
                console.log(node)
                console.log(e)
            }
          })
        .onNodeHover(node => elem.style.cursor = node ? 'pointer' : null)
        .onNodeClick(node => {
        // Aim at node from outside it
        const distance = 40;
        const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
        Graph.cameraPosition(
            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
            node, // lookAt ({ x, y, z })
            3000  // ms transition duration
        );
        });
}
 