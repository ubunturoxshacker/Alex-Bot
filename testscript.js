const socket = io();
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; 
const recognition = new SpeechRecognition();

recognition.lang = 'en-US';
recognition.interimResults = false;

var text_str;

function synthVoice(text) { 
 const synth = window.speechSynthesis; 
 const utterance = new SpeechSynthesisUtterance();
 utterance.text = text;
 synth.speak(utterance);
}
 
document.getElementById('button1').addEventListener('click', () => {

   recognition.start(); 

});
 
recognition.addEventListener('result', (e) => {

 let last = e.results.length - 1;
 let text = e.results[last][0].transcript;
 text_str = text.split(",");
 var text_str1temp = text_str.toString();
 var text_str1 = text_str1temp.split(" ");

  if(text_str1[0] == "play")
  { 

     function construct_url(text, url_type, access_token){
       var url = new URL('http://localhost:8080/'+url_type);
       var param_text;
       if(text ==" ")
       {
         return url;
       }
      else 
      {
        for(var i=0; i<(text.length); i++)
        {  
          if(i==0)
          {
           param_text ="";
          }
          else 
           {
            if(i!=(text.length-1)){
              param_text = param_text + text[i] + " ";
             }
              else {
                param_text = param_text + text[i];
              }

           }
          }
          url.search = new URLSearchParams({"song": param_text, "token": access_token}).toString();
   
          return url;
        }
       
  
      }

 
    var url = construct_url(" ",'getter'," ");
    
  
    fetch(url , { method:'GET' }).then((response) => response.json()).then((data) => {var My_player = new window.Spotify.Player({ name:"My Web Playback SDK",
getOAuthToken : callback => { callback(data.access_token); } });
My_player.addListener('initialization_error', ({ message }) =>
   { console.error(message); });
   My_player.addListener('authentication_error', ({ message }) =>   
   { console.error(message); });
   My_player.addListener('account_error', ({ message }) => { console.error(message); });
   My_player.addListener('playback_error', ({ message }) => { console.error(message); });
   My_player.addListener('player_state_changed', state => { 
   console.log(state);});
   My_player.addListener('ready',({device_id}) => { 
    console.log('Ready with Device ID',device_id); });
   My_player.addListener('not_ready', ({ device_id }) => {
    console.log('Device ID has gone offline', device_id);
   });
   
   My_player.connect();
   return data;
   
 }).then((data) => {
       var url1 = construct_url(text_str1, "searchsong", data.access_token);
        fetch(url1, {method: 'GET' }).then((response) => response.text()).then((data1) =>             
   {    var json_data = JSON.parse(data1); console.log(json_data);
        json_data.access_token = data.access_token;
        return json_data; 
   
   }).then((data) => {
const play = ({ spotify_uri, playerInstance:{}}) => { fetch('https://api.spotify.com/v1/me/player/play', {method: 'PUT', body: JSON.stringify({uris: [spotify_uri]}),
headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + data.access_token }, }); }; 
play({playerInstance: window.Spotify.Player, spotify_uri: data.items[0].uri , }); });
        
        }
     );
      

     function waitForSpotifyWebPlaybackSDKTOLoad()
     {
       return new Promise(resolve => { 
       if(window.Spotify) {
         resolve(window.Spotify);
        }
       else 
       { window.onSpotifyWebPlaybackSDKReady = () => { 
         resolve(window.Spotify);};
       }
       });
   
    };

  
    (async () => {
      const {Player} = await waitForSpotifyWebPlaybackSDKTOLoad();
     
      console.log("The Web Playback SDK has loaded.");
 
      })();
    
     
    }
   else
    {

      console.log('Confidence:' + e.results[0][0].confidence);

      socket.emit('chat message', text);

     }
});

socket.on('bot reply', function(replyText) { 
 synthVoice(replyText);
 
});

