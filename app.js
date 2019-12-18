var graph = undefined;
var w = 0, h = 0;
var nodes = [];
var links = [];
var nodesOnView = [];
var linksOnView = [];
var sizeState = {};
let cluster = [];
var blocksFetched = [];
var DATA_TX = {};
var SUMMARY = {};
var cnsle = document.getElementsByClassName('log')[0];
let CC = {};

window.onload = function(){
    cnslog("Welcome to my project");
    cnslog("Ready for query ...");
    refreshGraph();
}

function listFetched(){
    cnslog('listing fetched transactions')
    for (var key of Object.keys(DATA_TX)) {
            cnslog(`block ${key} (${DATA_TX[key].length} Txs)`)
        }
}
    

function checkAll(fill){
    let checks = document.getElementsByClassName('SIZECHECK');
    for(let c = 0; c<checks.length;c++){
        checks[c].checked = fill;
    }
}

function cnslog(message, color = "white"){
    cnsle.innerHTML += ` <a style = "color:${color}"> >> ${message}</a><br>`;
    cnsle.scrollTop = cnsle.scrollHeight - cnsle.clientHeight;
}

document.getElementById('current').addEventListener('change', function() {
    if(this.checked) {
        console.log('change to CH')
        axios.get(`http://localhost:3031/api/getCurrentHeight`).then((res) => {
            document.getElementById('heightStart').value = res.data;
            document.getElementById('heightEnd').value = '';
            document.getElementById('heightStart').disabled = true;
            document.getElementById('heightEnd').disabled = true;
        });
    } else {
        document.getElementById('heightStart').value = '';
        document.getElementById('heightEnd').value = '';
        document.getElementById('heightStart').disabled = false;
        document.getElementById('heightEnd').disabled = false;
    }
})

document.querySelector('form.height-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    var elem = document.getElementsByClassName('graph')[0];
    var heightStart = Number(document.getElementById('heightStart').value);
    var heightEnd = Number(document.getElementById('heightEnd').value);
    var limit = Number(document.getElementById('limitView').value);
    if (heightEnd){
        if (heightEnd<heightStart){
            cnslog("Block order needs to be ascending", "red");
            return;
        }
        cnslog(`Visualizing block ${heightStart}th to ${heightEnd}hth`);
    }else{
        cnslog(`Visualizing block ${heightStart}th`)
    }
    w = elem.offsetWidth;
    h = elem.offsetHeight;
    getDataBlockHeight(heightStart, heightEnd).then((parsedData) => {
        nodes = parsedData[0];
        links = parsedData[1];
        nodesOnView = nodes;
        linksOnView = links;
        cluster = findCluster(links);
        refreshTables();
        if (nodes.length>limit){
            cnslog("nodes received more than the limits", "red");
            checkAll(false);
            nodesOnView = [];
            linksOnView = [];
        }
        console.log(nodes, links)
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
    for (var key of Object.keys(lengths)) {
        sizeState[key] = true;
        htmlSize +=  `<input type="checkbox" checked="${true}" class = "SIZECHECK" 
                id = "${key}"/> ${key} Connected Components (${lengths[key]} transactions) <br />`;
    }
    sizeTable.innerHTML = htmlSize;

}

function getMaxCluster(clst){
    let max = 0;
    for (let c = 0 ; c<clst.length; c++){
        if (clst[c].length > max){
            max = clst[c].length;
        }
    }
    return max
}

function getNeighbours(addr){
    let out = []
    for (let l = 0; l< links.length; l++){
        if ((addr.includes(links[l].source))||
            (addr.includes(links[l].target))){
            if (addr.includes(links[l].source)){
                out.push(links[l].target);
            }
            else{
                out.push(links[l].source);
            }
        }else{
            try{
                if ((addr.includes(links[l].source.id))||
                    (addr.includes(links[l].target.id))){
                    if (addr.includes(links[l].source.id)){
                        out.push(links[l].target.id);
                    }
                    else{
                        out.push(links[l].source.id);
                    }
                }
            }catch(e){
                console.log('');
            }  
        }
    }
    return out;
}

function getCCLinks(addr){
    let out = []
    for (let l = 0; l< links.length; l++){
        if ((addr.includes(links[l].source))&&
            (addr.includes(links[l].target))){
            out.push(l);
        }else{
            try{
                if ((addr.includes(links[l].source.id))&&
                    (addr.includes(links[l].target.id))){ //With large data sets the library will not include id
                    out.push(l);
                    }
            }catch(e){
                console.log('');
            }  
        }
    }
    return out;
}
    
function getCC(){
    CC = {};
    for(let c = 0; c < cluster.length ; c++){
        let clst = cluster[c];
        for (let n = 0;n<clst.length;n++){
            let node = clst[n];
            CC[node] = 0;
            let neighb = getNeighbours(node);
            let temp = getCCLinks(neighb);
            if (temp.length !== 0){
                CC[node] = 1/temp.length;
            }
        }
    }
    let ccAvg = [];
    let ccOnView = [];
    let NOV = [];
    for (let n = 0 ; n< nodesOnView.length;n++){
        NOV.push(nodesOnView[n].id)
    }
    let nodesMaxCC = null;
    let nodesMaxCCOnView = null;
    for (var key of Object.keys(CC)) {
        if (nodesMaxCC === null){
            nodesMaxCC = CC[key];
            nodesMaxCCOnView = CC[key];
        }
        if (NOV.includes(key)){
            ccOnView.push(CC[key]);
            if (CC[key] > nodesMaxCCOnView){
                nodesMaxCCOnView = CC[key];
            }
        }
        if (CC[key] > nodesMaxCC){
            nodesMaxCC = CC[key];
        }
        ccAvg.push(CC[key]);
    }
    let ccAvgOut = 0;
    let ccOnViewOut = 0;
    for (let i = 0; i< ccAvg.length ; i++){
        ccAvgOut += ccAvg[i];
    }
    for (let i = 0; i< ccOnView.length ; i++){
        ccOnViewOut += ccOnView[i];
    }
    return [ccAvgOut/ccAvg.length, ccOnViewOut/ccOnView.length, nodesMaxCC, nodesMaxCCOnView];
}

function downloadDistributionGraph(){
    let data = {};
    for (var key of Object.keys(CC)) {
        if (!(data[CC[key]])){
            data[CC[key]] = 0;
        }
        data[CC[key]]+=1;
    }
    let lineData = [];
    for (var key of Object.keys(data)) {
        lineData.push({x:Number(key), y:data[key]})
    }
    axios.get(`http://localhost:3031/api/drawDistribution?data=${JSON.stringify(lineData)}`);
}

function refreshSummary(){
    SUMMARY['N Cluster'] = cluster.length;
    SUMMARY['N Nodes (Total)'] = nodes.length;
    SUMMARY['N Nodes (On view)'] = nodesOnView.length;
    SUMMARY['N Links (Total)'] = links.length;
    SUMMARY['N Links (On view)'] = linksOnView.length;
    SUMMARY['MAX Cluster'] = getMaxCluster(cluster);
    if(document.getElementById("CC").checked){
        const cl = getCC();
        SUMMARY['Average CC'] = cl[0];
        SUMMARY['Average CC (On view)'] = cl[1];
        SUMMARY['MAX CC'] = cl[2];
        SUMMARY['MAX CC (On view)'] = cl[3];
    }
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
    if (nodes.length !== 0 ){
        cnslog("reloading Graph with datasets", "green");
    }
    let curState = getState();
    for (var key of Object.keys(curState)) {
        if (curState[key] !== sizeState[key]){
            if (curState[key]){
                filterNTx(key, dec=false);
            }else{
                filterNTx(key);
            }
        }
    }
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
    nodesOnView = nodesOnView.filter(function(node, index, arr){
        return (!addrs.includes(node.id));
    });
}

function deleteLinks(addrs){
    linksOnView = linksOnView.filter(function(link, index, arr){
        return (!addrs.includes(link.source.id)&&!addrs.includes(link.target.id));
    });
}

function addNodes(addrs){
    for (let n = 0; n< nodes.length; n++){
        if (addrs.includes(nodes[n].id)){
            nodesOnView.push(nodes[n]);
        }
    }
}


function getLinks(addr){
    let out = []
    for (let l = 0; l< links.length; l++){
        if ((addr.includes(links[l].source))||
            (addr.includes(links[l].target))){
            out.push(l);
        }else{
            try{
                if ((addr.includes(links[l].source.id))||
                    (addr.includes(links[l].target.id))){ //With large data sets the library will not include id
                    out.push(l);
                    }
            }catch(e){
                console.log('');
            }  
        }
    }
    return out;
}

function addLinks(addrs){
    const index = getLinks(addrs);
    for(let i=0; i< index.length;i++){
        const l = index[i];
        linksOnView.push(links[l]);
    }
}

const getDataBlockHeight = async (heightStart, heightEnd) => {
    let txs = [];
    let heights = [];
    if (heightEnd){
        let curHeight = heightStart-1;
        if (heightEnd < curHeight){
            cnslog("Block order needs to be ascending", "red");
            return;
        }
        while (curHeight < heightEnd){
            curHeight += 1;
            if (blocksFetched.includes(curHeight)){
                cnslog(`reusing past fetched transactions for block ${curHeight}`, "yellow");
                txs = txs.concat([DATA_TX[curHeight]]);
                heights.push(curHeight);
            }else{
                cnslog(`fetching transactions for block ${curHeight}`, "yellow");
                let res = null;
                try{
                    res = await axios.get(`http://localhost:3031/api/getdata?height=${curHeight}`);
                    txs = txs.concat([res.data]);
                    cnslog(`${res.data.length} Transaction(s) found`, "yellow");
                    blocksFetched.push(curHeight);
                    DATA_TX[curHeight] = res.data;
                    heights.push(curHeight);
                    await sleep(200);
                }catch(e){
                    console.log(e);
                    cnslog('[ERROR] Failed to fetch',"red");
                    cnslog('[ERROR] did you run the server by running rest.js ?',"red");
                }
            }
            
        }
    }
    else{
        if (blocksFetched.includes(heightStart)){
            cnslog(`reusing past fetched transactions for block ${heightStart}`, "yellow");
            txs = [DATA_TX[heightStart]];
            heights.push(heightStart);
        }else{
            cnslog(`fetching transactions for block ${heightStart}`, "yellow");
            let res = null;
            try{
                res = await axios.get(`http://localhost:3031/api/getdata?height=${heightStart}`);
                cnslog(`${res.data.length} Transaction(s) found`, "yellow");
                txs = [res.data];
                blocksFetched.push(heightStart);
                DATA_TX[heightStart] = res.data;
                heights.push(heightStart);
            }catch(e){
                console.log(e);
                cnslog('[ERROR] Failed to fetch',"red");
                cnslog('[ERROR] did you run the server by running rest.js ?',"red");
            }
        }
    }
    const parsed = parse(txs, heights);
    return parsed;
}


function parse(datas, heights){
    cnslog(`processing data...`, "yellow");
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
                    cnslog(`failed to parse node for transaction ${data[i].hash}`, "red")
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
                    cnslog(`failed to parse node for transaction ${data[i].hash}`, "red")
                    console.log(e)
                }
            }

            for(let j = 0; j<txIn.length;j++){
                for(let k = 0; k<txOut.length;k++){
                    try{
                        const l = {source :txIn[j].prev_out.addr, 
                                target: txOut[k].addr, 
                                txLink:data[i].hash};
                        links = links.concat(l);
                    }
                    catch (e){
                        cnslog(`failed to parse link for transaction ${data[i].hash}`, "red")
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