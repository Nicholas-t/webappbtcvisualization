var express = require('express');
var blockexplorer = require('blockchain.info/blockexplorer')
const plot = require('node-scatterplot')

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
});

app.get("/api/getCurrentHeight", (req, res, next) => {
    blockexplorer.getLatestBlock().then((raw) => {
        console.log(raw.height)
        res.send(String(raw.height))
        res.end()
    })
});

app.get("/api/drawDistribution",(req, res, next) => {
    let datas = JSON.parse(req.query.data);
    let toPlot = []
    for (let d = 0; d<datas.length ; d++){
        if (datas[d].x !== 0){
            toPlot.push([datas[d].x,datas[d].y])
        }
    }
    console.log(toPlot);
    plot(toPlot)
});
