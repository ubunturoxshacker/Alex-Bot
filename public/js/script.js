
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

     function construct_url(text, url_type){
       var url = new URL('http://localhost:8080/'+url_type);
       var param_text;
       if(text ==" ")
       {
         param_text="";
        }
      else 
      {
        for(var i=0; i<(text.length); i++)
        {  
         if(i==0){
           param_text ="";
          }
         else 
          {
            param_text = param_text + text[i] + " ";
          }
         }
        }
       url.search = new URLSearchParams({'song': param_text}).toString();
   
      return url;
  
      }

 
    var url = construct_url(text_str1,'getter');

    async function getAccess_token(url) {
       const resp = await fetch(url , { method:'GET' });
       const j_son = await resp.json();
       return j_son.access_token;
  
     }

     var access_token = getAccess_token(url);

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

      var My_player = new window.Spotify.Player({ name:"My Web Playback SDK",
getOAuthToken : callback => { callback(access_token); } });
      
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
    
      /* var url1 = construct_url(text_str1, "searchsong");
    
       var body = get_fetcher(url1);
    
       console.log(body);*/
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



