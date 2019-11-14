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
    if (req.query.txHash && req.query.depth){
        const txHash = req.query.txHash;
        const depth = req.query.depth;
        var tx = [txHash];
        var out = [];
        for (let d= 0; d < depth;d++){ //iterate for depth
            for (let t = 0; t<tx.length; t++){ //iterate for each transaction
                console.log(t)
                blockexplorer.getTx(tx[t]).then( (result) => {
                    let outPoints = result.out
                    for(let i = 0 ; i < outPoints.length; i++){
                        if (outPoints[i].spent){
                            console.log(outPoints[i])
                        }
                    }
                        
                }).catch(console.error)   
            }  
        }
    }
});