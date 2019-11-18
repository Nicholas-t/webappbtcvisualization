
document.querySelector('form.height-form').addEventListener('submit', (e) => {
    e.preventDefault();
    var heightStart = document.getElementById('heightStart').value;
    var heightEnd = document.getElementById('heightEnd').value;
    getDataBlockHeight(heightStart, heightEnd).then((parsedData) => {
        const nodes = parsedData[0]
        const links = parsedData[1]
        //console.log(nodes, links)
        drawHeight(nodes, links);   
    })
}, false);

/*document.querySelector('form.address-form').addEventListener('submit', (e) => {
    e.preventDefault();
    //drawAddress()
    var addressStart = document.getElementById('addressStart').value;
    var depth = document.getElementById('depth').value;
    var maxTx = document.getElementById('maxTx').value;
    var maxOutput = document.getElementById('maxOutput').value;
    getDataFromAddress(addressStart, depth, maxTx, maxOutput).then((parsedData) => {
        const path = parsedData[0]
        const size = parsedData[1]
        drawAddress(path, size)   
    })
}, false);*/

const getDataFromAddress = async (address, depth, maxTx, maxOutput) => {
    let tx = [];
    let addresses = [address];
    let doneAddresses = [];
    for(let j = 0;j<depth;j++){
        let newAddresses = [];
        for (let i = 0; i< addresses.length ; i++){
            const address = addresses[i];
            console.log(`fetching history for ${address}`)
            const res = await axios.get(`http://localhost:3031/api/getdata?address=${address}&maxTx=${maxTx}&maxOutput=${maxOutput}`);//receives txs
            if (res !== []) {
                doneAddresses.push(address)
                newAddresses.push(deriveAddress(res.data, doneAddresses));
                console.log(`received ${res.data.length} txs!`)
                tx.push(res.data);
            }
            await sleep(2000);
            console.log(`on depth ${j+1}`);
        }
        addresses = newAddresses; // NEED TO DO ITERATION OVER DEPTH
        //console.log(addresses);
    }
    return parseAddress(tx[0]);
}

const deriveAddress = (txs, doneAddresses) => {
    console.log(txs)
    let out = [];
    for (let i = 0; i < txs.length ; i++){
        for (let j  =0; j< txs[i].inputs.length ; j++){
            if (!doneAddresses.includes(txs[i].inputs[j].prev_out.addr)){
                out.push(txs[i].inputs[j].prev_out.addr);
            }
        }
        for (let j  =0; j< txs[i].out.length ; j++){
            if (!doneAddresses.includes(txs[i].out[j].addr)){
                out.push(txs[i].out[j].addr);
            }
        }
    }
    return out;
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

function parseAddress(data){
    let size = [];
    let path = [];
    for (let i = 0; i< data.length;i++){
        let ent = data[i];
        for (let j = 0; j< ent.inputs.length;j++){
            for (let k = 0; k< ent.out.length;k++){
                path.push(`${ent.inputs[j].prev_out.addr}/${ent.hash}/${ent.out[k].addr}`);
                size.push(ent.out[k].value);
            }
        }
    }
    return [path, size];
}

function parse(data){
    let addr = [];
    let nodes = [];
    let links = [];
    for(let i = 1; i < data.length;i++){
        let txIn = data[i].inputs;
        let txOut = data[i].out;
        for(let j = 0; j< txIn.length;j++){
            try{
                let node = {id : txIn[j].prev_out.addr};
                let ind = null;
                if (!(addr.includes(txIn[j].prev_out.addr))){
                    nodes = nodes.concat(node);
                    ind = nodes.length-1;
                    addr.push(txIn[j].prev_out.addr);
                }
            }
            catch(e){
                console.log(txIn[j])
                console.log(e)
            }
        }
        for(let j = 0; j< txOut.length;j++){
            try{
                let node = {id : txOut[j].addr};
                if (!(addr.includes(txOut[j].addr))){
                    nodes = nodes.concat(node);
                    ind = nodes.length - 1;
                    addr.push(txOut[j].addr);
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
    console.log('nodes',nodes)
    console.log('link',links)
    return [nodes, links];
}

function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}