const back = document.getElementsByClassName("back")[0];
back.addEventListener("click", function(){
    toggleFullscreen();
});

document.addEventListener('keydown', function (evt) {
    if (evt.which === 27) {
        if (!document.fullscreenElement){
            console.log('p');
            document.getElementsByClassName('graph')[0].style.display = "none";
        }
    }
});

function toggleFullscreen() {
    let elem = document.getElementsByClassName('graph')[0];
  
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
        document.getElementsByClassName('graph')[0].style.display = "none";
        document.exitFullscreen();
    }
  }

document.querySelector('form.height-form').addEventListener('submit', (e) => {
    e.preventDefault();
    document.getElementsByClassName('graph')[0].style.display = "inline";
    toggleFullscreen();
    var heightStart = document.getElementById('heightStart').value;
    var heightEnd = document.getElementById('heightEnd').value;
    getDataBlockHeight(heightStart, heightEnd).then((parsedData) => {
        const nodes = parsedData[0]
        const links = parsedData[1]
        //console.log(nodes, links)
        drawHeight(nodes, links);   
    })
}, false);



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