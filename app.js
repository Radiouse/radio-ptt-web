/******** FIREBASE CONFIG ********/
var firebaseConfig = {
  apiKey: "AIzaSyA2yJhcRYfQlVC_xXu-CVmZd_Dx7486uPs",
  authDomain: "radioptt-aa99f.firebaseapp.com",
  databaseURL: "https://radioptt-aa99f-default-rtdb.firebaseio.com",
  projectId: "radioptt-aa99f"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.database();

/******** SETTINGS ********/
const PASSWORD = "7878";

/******** STATE ********/
let channel = "channel_1";
let recording = false;
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let processor, source, stream;

/******** PASSWORD CHECK ********/
let userPass = prompt("Enter Channel Password (7878)");
if (userPass !== PASSWORD) {
  alert("Wrong Password");
  throw new Error("Unauthorized");
}

/******** CHANNEL CHANGE ********/
document.getElementById("channel").onchange = e => {
  channel = e.target.value;
};

/******** PTT BUTTON ********/
document.getElementById("ptt").onmousedown = startTalk;
document.getElementById("ptt").onmouseup = stopTalk;

function startTalk() {
  recording = true;
  document.getElementById("status").innerText = "🔴 Transmitting";

  navigator.mediaDevices.getUserMedia({ audio: true }).then(s => {
    stream = s;
    source = audioCtx.createMediaStreamSource(stream);
    processor = audioCtx.createScriptProcessor(2048, 1, 1);

    source.connect(processor);
    processor.connect(audioCtx.destination);

    processor.onaudioprocess = e => {
      if (!recording) return;
      let data = Array.from(e.inputBuffer.getChannelData(0));
      db.ref("radio/" + channel + "/audio").set(data);
    };
  });
}

function stopTalk() {
  recording = false;
  document.getElementById("status").innerText = "🟢 Listening";
  if (stream) stream.getTracks().forEach(t => t.stop());
}

/******** RECEIVE AUDIO ********/
db.ref("radio/" + channel + "/audio").on("value", snap => {
  let data = snap.val();
  if (!data || recording) return;

  let buffer = audioCtx.createBuffer(1, data.length, audioCtx.sampleRate);
  buffer.copyToChannel(new Float32Array(data), 0);

  let src = audioCtx.createBufferSource();
  src.buffer = buffer;
  src.connect(audioCtx.destination);
  src.start();
});