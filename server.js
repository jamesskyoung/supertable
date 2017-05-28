
var express = require('express');

// Create our app
var app = express();


//app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: wpConfig.output.publicPath }));
//app.use(webpackHotMiddleware(compiler));

app.use(express.static('public'));

app.listen(3000, function() {
    console.log('App running on port 3000');
});
