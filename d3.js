var width = 900;
var height = 600;

function draw(nodes, links){
   var svg = d3.select('body').append('svg')
        .attr('width', width)
        .attr('height', height);

    var force = d3.layout.force()
        .size([width, height])
        .nodes(d3.values(nodes))
        .links(links)
        .on("tick", tick)
        .linkDistance(100)

    var link = svg.selectAll('.link')
        .data(links)
        .enter().append('line')
        .attr('class', 'link');


    var node = svg.selectAll('.node')
        .data(force.nodes())
        .enter().append('circle')
        .attr('class', 'node')
        .attr('r', width*0.01)

    function tick(e){
        node.attr('cx', function(d){return d.x})
            .attr('cy', function(d){return d.y})
            .call(force.drag);
            
        link.attr('x1', function(d){return d.source.x;})
            .attr('y1', function(d){return d.source.y;})
            .attr('x2', function(d){return d.target.y;})
            .attr('y2', function(d){return d.target.y;})
    }

    force.start();
}
 