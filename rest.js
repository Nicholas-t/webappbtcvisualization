var express = require('express');
var blockexplorer = require('blockchain.info/blockexplorer')


var app = express();

app.use(function(req, res, next) {  // Enable cross origin resource sharing (for app frontend)
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next(); 
    }
});

app.listen(3031, () => {
 console.log("Server running on port 3031");
});

app.get("/api/getdata", (req, res, next) => {
    let txs = [];
    if (req.query.height){
        
        const height = req.query.height;
        console.log(`fetching for ${height} blockheight`)
        blockexplorer.getBlockHeight(height).then((raw) => {
            txs = raw.blocks[0].tx;
            console.log(`Found ${txs.length} transactions`)
            res.send(txs)
            res.end()
        })
    }
    if (req.query.address && req.query.maxTx && req.query.maxOutput){
        const address = req.query.address;
        const maxTx = req.query.maxTx;
        const maxOutput = req.query.maxOutput;
        let txs = [];
        blockexplorer.getAddress(address).then( (result) => {
            if (result.txs.length <= maxTx){
                for (let i = 0; i< result.txs.length; i++){
                    if (result.txs[i].inputs.length<= maxOutput &&
                        result.txs[i].out.length<= maxOutput){
                            txs.push(result.txs[i]);
                        }
                }
            }
            console.log('sending ',txs)
            res.send(txs)
        }).catch((e) => {
            console.error(e);
            res.send(txs);
        })
            
    }
});
