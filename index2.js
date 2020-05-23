const express = require('express');
const app = express();
const https = require('https');
var request = require('request');
var bodyParser = require('body-parser');
var querystring =require('querystring');


app.use(express.static(__dirname + '/views'));
app.use(express.static( __dirname + '/public'));
app.use(bodyParser.json());

const server = app.listen(process.env.PORT || 8080, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);

});

var textstring; 

var io = require('socket.io')(server);

var client_id = '473cbd49924b48099107292813fe0ceb';
var clientsecret= '6287214f11d542ea961ddd29f48deb5a';
var redirect_uri ='http://localhost:8080/callback';
var access_token_share;

const apiai = require('apiai')('9481e3bf884448b78e450fa34dd7ffdf');


var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

io.on('connection', function(socket){
  console.log('a user connected');
});

 





app.get('/playsong',(req ,res) => {

  var param_string = req.query.song;
  var token = req.query.token;

  console.log(param_string); 
  console.log(token);
  var type = "track";
  console.log(req.query);
   var options = {
          url: 'https://api.spotify.com/v1/search'+'?q='+param_string+'&type='+ type,
          headers: { 
                     'Authorization': 'Bearer ' + access_token_share },
          json: true
        };
   request.get(options, function(error, response, body) {
          
          console.log(body);
          
        });

          res.json(body);
    
});


/* Test search 2

 app.get('/play',(req,res) => { 
 console.log(req.query);

   var access_token = req.query.access_token;
   
   var type = "artist";

   var options = {
          url: 'https://api.spotify.com/v1/search'+'?q='+'John '+'Denver'+'&type='+ type,
          headers: { 
                     'Authorization': 'Bearer ' + access_token },
          json: true
        };
   request.get(options, function(error, response, body) {
         
       console.log(body.artists);
       
        });

 res.redirect('/');

});*/

// Get homepage

app.get('/', (req, res) => {
 
 res.sendFile('index.html');
 
});





// Get code and state using login (Client Secret and id)

app.get('/login',(req,res) => { 
var state = generateRandomString(16);
var scopes = 'user-read-private user-read-email streaming user-modify-playback-state' ;
 res.redirect('https://accounts.spotify.com/authorize'+'?response_type=code'+ '&client_id='+ '473cbd49924b48099107292813fe0ceb' + (scopes ? '&scope=' + encodeURIComponent(scopes):'')+'&redirect_uri=' + encodeURIComponent(redirect_uri)+'&state='+ state); 
 }); 

// Callback and get access token

app.get('/callback', function(req, res)  {
 var code = req.query.code || null;
 var state = req.query.state || null;
 var authOptions = { url:'https://accounts.spotify.com/api/token', 
                     form : { 
                              code:code,
                              redirect_uri : redirect_uri,
                              grant_type : 'authorization_code'
                             },
                             headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + clientsecret).toString('base64'))
      },
            json:true

                   };
 request.post(authOptions, function(error, response, body) {
  

        var access_token = body.access_token,
            refresh_token = body.refresh_token;
        
        
          var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };
       
        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        }); 
        res.redirect('/refresh_token?' + querystring.stringify({access_token:access_token, refresh_token:refresh_token }));
       
  });
});

// Get access token using refresh token coz access token expires in one hr

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + clientsecret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      access_token_share = access_token;
        res.redirect('/?'+querystring.stringify({'access_token':access_token_share}));
    }
  });
});

// Share access token with client
app.get('/getter', (req, res) => {

 res.json({access_token : access_token_share});
});

app.get('/searchsong',(req, res) => {

  var param_string = req.query.song;
  var token = req.query.token;

  console.log(param_string); 
  console.log(token);

  var type = "track";
  
  var items;

  var options = { 
              url:'https://api.spotify.com/v1/search'+'?q='+param_string+'&type='+type+'&limit=2',                
              headers : { 'Accept': 'application/json',
                          
                         'Content-Type': 'application/json',
                      
                          'Authorization': 'Bearer ' + token },
                         
               json: true
             }; 

    request.get(options, function(error, response, body) {
         var json_tracks = JSON.stringify(response.body.tracks);
         items = json_tracks;
         console.log(items);
         res.send(items);
         
    });
   
             
});



// Socket at 8080 to listen speech converted text

io.on('connection', function(socket) { 
  socket.on('chat message' ,(text) => { 
    
   let apiaiReq = apiai.textRequest(text, {sessionId:'Test'});
   
  
    apiaiReq.on('response', (response) => { 
     let aiText = response.result.fulfillment.speech;
     socket.emit('bot reply', aiText);
   });
   
   apiaiReq.on('error', (error) => {
   console.log(error);
   });
   
   apiaiReq.end();

  });
 });

