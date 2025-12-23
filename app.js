const PASSWORD = "7878";

function unlock(){
  const p = document.getElementById("password").value;
  if(p !== PASSWORD){
    alert("Wrong password");
    return;
  }
  document.getElementById("login").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
}

const net = document.getElementById("net");

function updateNet(){
  if(navigator.onLine){
    net.innerText="🟢 Online";
    net.className="net online";
  }else{
    net.innerText="🔴 Offline";
    net.className="net offline";
  }
}
updateNet();
window.addEventListener("online",updateNet);
window.addEventListener("offline",updateNet);

/* PTT demo feedback only (stable UI) */
const ptt = document.querySelector(".ptt");
ptt.addEventListener("touchstart",()=>ptt.innerText="🎙 TALKING");
ptt.addEventListener("touchend",()=>ptt.innerText="🎙 HOLD TO TALK");
ptt.addEventListener("mousedown",()=>ptt.innerText="🎙 TALKING");
ptt.addEventListener("mouseup",()=>ptt.innerText="🎙 HOLD TO TALK");
