var graph = undefined;
var w = 0, h = 0;
var nodes = [];
var links = [];
var nodesOnView = [];
var linksOnView = [];
var sizeState = {};
let cluster = [];
var SHOWTOP = 25;
var SUMMARY = {};

window.onload = function(){
    refreshGraph();
}

function checkAll(fill){
    let checks = document.getElementsByClassName('SIZECHECK');
    for(let c = 0; c<checks.length;c++){
        checks[c].checked = fill;
    }
}

document.querySelector('form.height-form').addEventListener('submit', (e) => {
    e.preventDefault();
    var elem = document.getElementsByClassName('graph')[0];
    elem.style.display = "inline";
    var heightStart = document.getElementById('heightStart').value;
    var heightEnd = document.getElementById('heightEnd').value;
    w = elem.offsetWidth;
    h = elem.offsetHeight;
    getDataBlockHeight(heightStart, heightEnd).then((parsedData) => {
        nodes = parsedData[0];
        links = parsedData[1];
        nodesOnView = nodes;
        linksOnView = links;
        //filterNTx(3, dec = false);
        //console.log(nodesOnView);
        //console.log(linksOnView);
        cluster = findCluster(links);
        refreshTables();
        refreshGraph();
    })
}, false);

function refreshTables(){
    sizeTable = document.getElementById('SIZE');
    heightTable = document.getElementById('HEIGHT');
    htmlSize  = "";
    htmlHeight = "";
    let temp = cluster.sort(function(a, b){
        return b.length - a.length;
    })
    let lengths = {}
    for (let c = 0; c< cluster.length;c++){
        if (!lengths[cluster[c].length]){
            lengths[cluster[c].length] = 0;
        }
        lengths[cluster[c].length] += 1;
    }
    let k = 0
    for (var key of Object.keys(lengths)) {
        if (k<SHOWTOP){
            sizeState[key] = true;
            htmlSize +=  `<input type="checkbox" checked="true" class = "SIZECHECK" 
                    id = "${key}"/> ${key} Connected Components (${lengths[key]} transactions) <br />`;
            k+=1;
        }else{
            sizeState[key] = false;
            htmlSize +=  `<input type="checkbox" checked="false" class = "SIZECHECK" 
                    id = "${key}"/> ${key} Connected Components (${lengths[key]} transactions) <br />`;
        }
    }
    sizeTable.innerHTML = htmlSize;

}

function refreshSummary(){
    SUMMARY['N Cluster'] = cluster.length;
    let max = 0;
    for (let c = 0 ; c<cluster.length; c++){
        if (cluster[c].length > max){
            max = cluster[c].length;
        }
    }
    SUMMARY['MAX Cluster'] = max;
    SUMMARY['N Nodes (Total)'] = nodes.length;
    SUMMARY['N Nodes (Active)'] = nodesOnView.length;
    SUMMARY['N Links (Total)'] = links.length;
    SUMMARY['N Links (Active)'] = linksOnView.length;
    let html = "";
    for (var key of Object.keys(SUMMARY)) {
        html += `<tr>
                    <td>${key}</td>
                    <td class="value">${SUMMARY[key]}</td>
                </tr>`
    }
    document.getElementById('Summary').innerHTML = html;            
}

function refreshGraph(){
    let curState = getState();
    for (var key of Object.keys(curState)) {
        if (curState[key] !== sizeState[key]){
            if (curState[key]){
                console.log(`adding txs of ${key}`);
                filterNTx(key, dec=false);
            }else{
                console.log(`deleting txs of ${key}`)
                filterNTx(key);
            }
        }
    }
    console.log('NOV',nodesOnView, 'LOV',linksOnView)
    document.getElementById('graph').innerHTML = "";
    if (graph){graph.pauseAnimation()}
    if (document.getElementById('3d').checked){
        graph = draw3dHeight(nodesOnView, linksOnView,w,h);
    }else{
        graph = draw2dHeight(nodesOnView, linksOnView,w,h);
    }
    graph.resumeAnimation();
    sizeState = curState;
    refreshSummary();
}

function getState(){
    var checks = document.getElementsByClassName('SIZECHECK');
    let out = {};
    for (let c = 0; c<checks.length;c++){
        out[Number(checks[c].id)] = checks[c].checked;
    }
    return out;
}

function filterNTx(N, dec = true){
    let addrs = []
    for (let l = 0; l< cluster.length; l++){
        if ((cluster[l].length == N) ||
            (cluster[l].length == N)){
                addrs = addrs.concat(cluster[l]).unique();
        }
    }
    if (dec){
        deleteNodes(addrs);
        deleteLinks(addrs);
    }else{
        addNodes(addrs);
        addLinks(addrs);
    }
    
}

function deleteNodes(addrs){
    console.log('deleting nodes ',addrs)
    nodesOnView = nodesOnView.filter(function(node, index, arr){
        return (!addrs.includes(node.id));
    });
}

function deleteLinks(addrs){
    console.log('deleting links ',addrs)
    linksOnView = linksOnView.filter(function(link, index, arr){
        return (!addrs.includes(link.source.id)&&!addrs.includes(link.target.id));
    });
}

function addNodes(addrs){
    console.log('adding nodes ',addrs)
    for (let n = 0; n< nodes.length; n++){
        if (addrs.includes(nodes[n].id)){
            nodesOnView.push(nodes[n]);
        }
    }
}

function addLinks(addrs){
    console.log('adding links ',addrs)
    for (let l = 0; l< links.length; l++){
        if ((addrs.includes(links[l].source.id))||
            (addrs.includes(links[l].target.id))){
            linksOnView.push(links[l]);
        }
    }
}

const getDataBlockHeight = async (heightStart, heightEnd) => {
    let txs = [];
    let heights = [];
    if (heightEnd){
        let curHeight = heightStart-1;
        if (heightEnd < curHeight){
            console.error("needs to be ascending");
        }
        while (curHeight < heightEnd){
            curHeight += 1
            console.log('withend' ,curHeight)
            const res = await axios.get(`http://localhost:3031/api/getdata?height=${curHeight}`);
            
            txs = txs.concat([res.data]);
            heights.push(curHeight);
            await sleep(200);
        }
    }
    else{
        console.log('with no end' ,heightStart)
        const res = await axios.get(`http://localhost:3031/api/getdata?height=${heightStart}`);
        txs = [res.data];
        heights.push(heightStart);
    }
    
    const parsed = parse(txs, heights);
    return parsed;
}


function parse(datas, heights){
    let addr = [];
    let nodes = [];
    let links = [];
    if(datas.length != heights.length){
        return;
    }
    for(let k = 0; k < datas.length ; k++){
        let data = datas[k];
        let height = heights[k];
        for(let i = 1; i < data.length;i++){ // starts at 1 to ignore the coinbase txs 
            let txIn = data[i].inputs;
            let txOut = data[i].out;
            for(let j = 0; j< txIn.length;j++){
                try{
                    if (!(addr.includes(txIn[j].prev_out.addr))){
                        let node = {id : txIn[j].prev_out.addr, 
                                block : String(height)
                            };
                        nodes = nodes.concat(node);
                        addr.push(txIn[j].prev_out.addr);
                    }
                    else{
                        for(let n = 0; n< nodes.length;n++){
                            if (nodes[n].id === txIn[j].prev_out.addr && 
                                (!nodes[n].block.includes(String(height)))){
                                nodes[n].block += `&${height}`;
                            }
                        }
                    }
                }
                catch(e){
                    console.log(txIn[j])
                    console.log(e)
                }
            }
            for(let j = 0; j< txOut.length;j++){
                try{
                    if (!(addr.includes(txOut[j].addr))){
                        let node = {id : txOut[j].addr, 
                            block : String(height)
                        };
                        nodes = nodes.concat(node);
                        addr.push(txOut[j].addr);
                    }
                    else{
                        for(let n = 0; n< nodes.length;n++){
                            if (nodes[n].id === txOut[j].addr && 
                                (!nodes[n].block.includes(String(height)))){
                                nodes[n].block += `&${height}`;
                            }
                        }
                    }
                }
                catch(e){
                    console.log(txOut[j])
                    console.log(e)
                }
            }

            for(let j = 0; j<txIn.length;j++){
                for(let k = 0; k<txOut.length;k++){
                    try{
                        const l = {source :txIn[j].prev_out.addr, target: txOut[k].addr, txLink:data[i].hash};
                        links = links.concat(l);
                    }
                    catch (e){
                        console.log(txIn[j])
                        console.log(txOut[k])
                        console.log(e)
                    }
                }
            }
        }
    }
    
    return [nodes, links];
}

function findCluster(links){
    let addrs = [];
    
    for (let l = 0; l< links.length; l++){
        let add = [links[l].source, links[l].target];
        addrs.push(add);
    }
    return clusterList(addrs);
}

Array.prototype.unique = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

function clusterList(lists){
    let out = lists;
    while(!allDisjoint(out)){
        let temp1 = [];
        let falses = [];
        for(let q = 0; q<out.length; q++){falses.push(false)}
        let visited = falses;
        for(let o1 = 0; o1<out.length; o1++){
            let temp2 = out[o1];
            let nonCon = [];
            let link = false;
            for (let o2 = o1; o2<out.length; o2++){
                if (!areDisjoint(temp2, out[o2])){
                    if (!visited[o2]){
                        temp2 = temp2.concat(out[o2]).unique();
                        visited[o2] = true;
                        link = true;
                    }
                }
            }
            visited = falses;
            if (link){
                temp1.push(temp2);
            }
        }
        out = temp1;
    }
    return out;
}

function allDisjoint(list){
    if (list.length === 1){
        return true;
    }
    for (let l = 0; l<list.length; l++){
        for (let k = l + 1; k<list.length ; k++){
            if (!areDisjoint(list[l], list[k])){
                return false;
            }
        }
    }
    return true;
}
function areDisjoint(list1, list2){
    for (let l1 = 0; l1 < list1.length; l1++){
        for (let l2 = 0; l2<list2.length; l2++){
            
            if (list1[l1] == list2[l2]){
                return false;
            }
        }
    }
    return true;
}

function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}