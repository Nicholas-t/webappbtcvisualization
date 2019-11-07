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
    const height = req.query.height;
    console.log(`fetching for ${height} blockheight`)
    blockexplorer.getBlockHeight(height).then((raw) => {
        const txs = raw.blocks[0].tx;
        console.log(txs)
        res.send(txs)
    })
});