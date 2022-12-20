let express = require( 'express' );
let app = express();
const https = require('https');
const fs = require("fs");
// let server = https.Server( app );
let stream = require( './ws/stream' );
let path = require( 'path' );
let favicon = require( 'serve-favicon' );
// const { fstat } = require('fs');

let server = https
    .createServer(
        {
            key: fs.readFileSync("key.pem"),
            cert: fs.readFileSync("cert.pem"),
        },
        app
    )
    .listen(3000, ()=> {
        console.log('server is running at port 3000')
    });

let io = require( 'socket.io' )( server );

app.use( favicon( path.join( __dirname, 'favicon.ico' ) ) );
app.use( '/assets', express.static( path.join( __dirname, 'assets' ) ) );

app.get( '/', ( req, res ) => {
    res.sendFile( __dirname + '/index.html' );
} );


io.of( '/stream' ).on( 'connection', stream );

// server.listen( 3000 );