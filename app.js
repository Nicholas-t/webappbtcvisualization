
document.querySelector('form.date-form').addEventListener('submit', (e) => {
    e.preventDefault();
    var nameInput = document.getElementById('height');
    getData(nameInput.value).then((parsedData) => {
        const nodes = parsedData[0]
        const links = parsedData[1]
        console.log(nodes, links)
        draw(nodes, links)   
    })
}, false);


const getData = async (height) => {
    const res = await axios.get(`http://localhost:3031/api/getdata?height=${height}`);
    const parsed = parse(res.data);
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
                let node = {address : txIn[j].prev_out.addr};
                let ind = null;
                if (!(nodes.includes(node))){
                    nodes = nodes.concat(node);
                    ind = nodes.length-1;
                }
                else{ind = nodes.indexOf(node)}
                indexIn = indexIn.concat(ind);
            }
            catch(e){
                console.log(e)
            }
        }
        for(let j = 0; j< txOut.length;j++){
            try{
                let node = {address : txOut[j].addr};
                if (!(nodes.includes(node))){
                    nodes = nodes.concat(node);
                    ind = nodes.length - 1;
                }
                else{ind = nodes.indexOf(node)}
                indexOut = indexOut.concat(ind);
            }
            catch(e){
                console.log(e)
            }
        }

        for(let j = 0; j<indexIn.length;j++){
            for(let k = 0; k<indexOut.length;k++){
                const l = {source :indexIn[j], target: indexOut[k]};
                links = links.concat(l);
            }
        }
        console.log('links',links)
    }
    // /console.log(nodes, links)
    return [nodes, links];
}