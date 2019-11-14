
document.querySelector('form.height-form').addEventListener('submit', (e) => {
    e.preventDefault();
    var heightStart = document.getElementById('heightStart').value;
    var heightEnd = document.getElementById('heightEnd').value;
    console.log(heightStart, heightEnd)
    getDataBlockHeight(heightStart, heightEnd).then((parsedData) => {
        const nodes = parsedData[0]
        const links = parsedData[1]
        //console.log(nodes, links)
        draw(nodes, links)   
    })
}, false);

/*document.querySelector('form.txhash-form').addEventListener('submit', (e) => {
    e.preventDefault();
    var txHash = document.getElementById('txhash').value;
    var depth = document.getElementById('depth').value;
    console.log(txHash, depth)
    getDataTxHash(txHash, depth).then((parsedData) => {
        const nodes = parsedData[0]
        const links = parsedData[1]
        //console.log(nodes, links)
        draw(nodes, links)   
    })
}, false);*/

const getDataTxHash = async (txHash, depth) => {
    const res = await axios.get(`http://localhost:3031/api/getdata?txHash=${txHash}&depth=${depth}`);
}

const getDataBlockHeight = async (heightStart, heightEnd) => {
    let txs = [];
    if (heightEnd){
        let curHeight = heightStart-1;
        if (heightEnd < curHeight){
            console.error("needs to be ascending");
        }
        while (curHeight < heightEnd){
            curHeight += 1
            console.log('withend' ,curHeight)
            const res = await axios.get(`http://localhost:3031/api/getdata?height=${curHeight}`);
            
            txs = txs.concat(res.data);

            await sleep(200);
        }
    }
    else{
        console.log('with no end' ,heightStart)
        const res = await axios.get(`http://localhost:3031/api/getdata?height=${heightStart}`);
        txs = res.data;
    }
    
    const parsed = parse(txs);
    return parsed;
}

function parse(data){
    let nodes = [];
    let links = [];
    for(let i = 1; i < data.length;i++){
        let indexIn = [];
        let indexOut = [];
        let txIn = data[i].inputs;
        let txOut = data[i].out;
        for(let j = 0; j< txIn.length;j++){
            try{
                let node = {id : txIn[j].prev_out.addr};
                let ind = null;
                if (!(nodes.includes(node))){
                    nodes = nodes.concat(node);
                    ind = nodes.length-1;
                }
                else{ind = nodes.indexOf(node)}
                indexIn = indexIn.concat(ind);
            }
            catch(e){
                console.log(txIn[j])
                console.log(e)
            }
        }
        for(let j = 0; j< txOut.length;j++){
            try{
                let node = {id : txOut[j].addr};
                if (!(nodes.includes(node))){
                    nodes = nodes.concat(node);
                    ind = nodes.length - 1;
                }
                else{ind = nodes.indOf(node)}
                indexOut = indexOut.concat(ind);
            }
            catch(e){
                console.log(txOut[j])
                console.log(e)
            }
        }

        for(let j = 0; j<txIn.length;j++){
            for(let k = 0; k<txOut.length;k++){
                try{
                    const l = {source :txIn[j].prev_out.addr, target: txOut[k].addr};
                    //console.log(l)
                    
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
    //console.log('nodes',nodes)
    //console.log('link',links)
    return [nodes, links];
}

function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}