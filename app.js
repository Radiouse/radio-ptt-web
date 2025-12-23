/******** CONFIG ********/
const PASSWORD = "7878";

/******** FIREBASE ********/
firebase.initializeApp({
  apiKey: "AIzaSyA2yJhcRYfQlVC_xXu-CVmZd_Dx7486uPs",
  databaseURL: "https://radioptt-aa99f-default-rtdb.firebaseio.com"
});
const db = firebase.database();

/******** UI ********/
const netEl = document.getElementById("net");
function setNet(status){
  if(status==="good"){ netEl.className="net good"; netEl.innerText="🟢 Good"; }
  if(status==="poor"){ netEl.className="net poor"; netEl.innerText="🟡 Poor"; }
  if(status==="off"){ netEl.className="net off"; netEl.innerText="🔴 Offline"; }
}

/******** PASSWORD ********/
function checkPass(){
  if(document.getElementById("password").value !== PASSWORD){
    alert("Wrong Password"); return;
  }
  document.getElementById("login").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
}

/******** WEBRTC ********/
let pc, localStream;
let channel = "1";

async function initPC(){
  if(pc) pc.close();
  pc = new RTCPeerConnection({
    iceServers:[{urls:"stun:stun.l.google.com:19302"}]
  });

  pc.onconnectionstatechange = () => {
    if(pc.connectionState==="connected") setNet("good");
    else if(pc.connectionState==="disconnected") setNet("poor");
    else if(pc.connectionState==="failed") setNet("off");
  };

  pc.ontrack = e => {
    const a = document.createElement("audio");
    a.srcObject = e.streams[0];
    a.autoplay = true;
  };

  if(!localStream){
    try{
      localStream = await navigator.mediaDevices.getUserMedia({audio:true});
    }catch{
      alert("Mic permission denied");
      setNet("off"); return;
    }
  }
  localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
}

initPC();

/******** CHANNEL ********/
document.getElementById("channel").onchange = e => {
  channel = e.target.value;
  initPC(); // reset on channel change
};

/******** SIGNALING ********/
const offerRef = () => db.ref(`rooms/channel_${channel}/offer`);
const answerRef = () => db.ref(`rooms/channel_${channel}/answer`);

/******** PTT ********/
document.getElementById("ptt").onmousedown = async () => {
  document.getElementById("status").innerText="🔴 Talking";
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  offerRef().set(offer);

  answerRef().off();
  answerRef().on("value", snap=>{
    if(snap.val()) pc.setRemoteDescription(new RTCSessionDescription(snap.val()));
  });
};

document.getElementById("ptt").onmouseup = ()=>{
  document.getElementById("status").innerText="🟢 Ready";
};

offerRef().on("value", async snap=>{
  if(!snap.val()) return;
  await pc.setRemoteDescription(new RTCSessionDescription(snap.val()));
  const ans = await pc.createAnswer();
  await pc.setLocalDescription(ans);
  answerRef().set(ans);
});

/******** NETWORK WATCH ********/
window.addEventListener("online", ()=>setNet("good"));
window.addEventListener("offline", ()=>setNet("off"));