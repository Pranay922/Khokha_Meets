
// const { Template } = require("ejs")

const socket = io('/');
const video = document.querySelector(".main-videos");
const videoGrid = document.getElementById('video-grid');
const chatbtn = document.querySelector(".chat-button");
const right = document.querySelector(".main-right");
const left = document.querySelector(".main-left");
const main = document.querySelector(".main");
const videobtn = document.querySelector(".playstop");
const videoicon = document.querySelector(".fa-video-slash");
const mutebtn = document.querySelector(".mutebutton");
const muteicon = document.querySelector(".fa-microphone-lines-slash");
const leavebtn = document.querySelector(".leave-button");
const chaticon = document.querySelector(".fa-comments");
const whtbrd = document.querySelector(".board");
const canvas = document.querySelector(".myCanvas");
const pen = document.querySelector(".fa-pen");
// const eraser=document.querySelector(".eraser");
// const erasicon=document.querySelector(".fa-circle");
const ctx=document.querySelector(".canvass").getContext('2d');
// const text = document.getElementById('chat-message');
const list = document.querySelector(".messages");
const main__chat__window = document.querySelector(".main-chat-window")
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})
const videos = document.querySelector(".main-videos");


let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
})
    .then(stream => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream)

        myPeer.on('call', call => {
            call.answer(stream)
            const video = document.createElement('video')
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream)
            })
        })

        socket.on('user-connected', userId => {
            setTimeout(connectToNewUser, 1000, userId, stream);
            connectToNewUser(userId, stream)
        })
    });

socket.on('user-disconnected', userId => {
    setTimeout(() => {
        console.log(userId);
        if (peers[userId])
            peers[userId].close()
    }, 1000);

})


myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}
videobtn.addEventListener('click', () => {                                        //video on/off button
    if (myVideoStream.getVideoTracks()[0].enabled == true) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        videoicon.style.color = "red";
    }
    else {
        myVideoStream.getVideoTracks()[0].enabled = true
        videoicon.style.color = "white";

    }

});
mutebtn.addEventListener('click', () => {                                         //mutebutton
    if (myVideoStream.getAudioTracks()[0].enabled == true) {
        myVideoStream.getAudioTracks()[0].enabled = false;

        muteicon.style.color = "red";
    }
    else {
        myVideoStream.getAudioTracks()[0].enabled = true
        muteicon.style.color = "white";

    }

});
whtbrd.addEventListener('click', () => {                                          //white board button
    if (canvas.classList.contains("displ")) {
        canvas.classList.remove("displ");
        chaticon.style.color = "white";
        right.style.flex = 0;
        left.style.flex = 1;
        right.classList.add("displ");

        video.classList.add("displ");
        pen.style.color = "yellow";
    }
    else {
        canvas.classList.add("displ");
         canvas.style.background="white";
        right.style.flex = .2;
        canvas.style.flex = 0;
        right.classList.remove("displ");

        video.classList.remove("displ");
        pen.style.color = "white";
        if (right.classList.contains("displ") === false) {
            chaticon.style.color = "green";
        }
    }

});

chatbtn.addEventListener('click', () => {                                           //chatbutton

    if (canvas.classList.contains("displ") == true) {
        if (right.classList.contains("displ")) {
            right.classList.remove("displ");
            right.style.flex = .2;
            left.style.flex = .8;
            chaticon.style.color = "green";


        }
        else {
            right.classList.add("displ");
            // right.style.flex=.2;
            // left.style.flex=.8;
            chaticon.style.color = "white";
            // chaticon.style.color="green";
            right.style.flex = 0;
            left.style.flex = 1;
        }
    }
});
leavebtn.addEventListener('click', () => {                                             //leavebutton
    location.href = '/ended'
})


//chat section
///this is for chat 
let text = document.getElementById('chat-message');                                   //chat message backend and front end
console.log(text.value);
document.querySelector('html').addEventListener('keydown', (e) => {
    if (e.which == 13 && text.value.length !== 0) {
        let li = document.createElement('li');
        li.innerHTML = `<li class="user"><div class="over"><b>User</b><br>${text.value}</div></li>`;
        document.querySelector('ul').append(li);

        console.log(text.value);
        socket.emit('message', text.value);
        text.value = ''
        main__chat__window.scrollTop = main__chat__window.scrollHeight;
    }
})
socket.on('createMessage', message => {

    console.log('fin==' + message);
    let li = document.createElement('li');

    li.innerHTML = `<li class="other"><b>Other</b><br>${message}</li>`;

    document.querySelector('ul').append(li);

    console.log('callin');

    main__chat__window.scrollTop = main__chat__window.scrollHeight;


});

(function () {                                                                           //white board canvas 
    var canvas = document.querySelector(".canvass");
    // var ctx = canvas.getContext('2d');
    resize();
// let io = io.connect("https://localhost:3000/");
    // last known position
    var pos = { x: 0, y: 0 };

    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', draw);
    document.addEventListener('mousedown', setPosition);
    document.addEventListener('mouseenter', setPosition);

    // new position from mouse event
    function setPosition(e) {
        pos.x = e.clientX;
        pos.y = e.clientY;
    }


    // resize canvas
    let h = canvas.innerheight;
    function resize() {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = 0.93*window.innerHeight;
    }
   socket.on('ondraw',(pos)=>{
        ctx.beginPath(); // begin
        console.log(pos.y);
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#c0392b';
        ctx.moveTo(pos.x, pos.y);
        ctx.lineto(pos.x,pos.y);
        ctx.stroke();
        })
    function draw(e) {
        // mouse left button must be pressed
        if (e.buttons !== 1) return;

        ctx.beginPath(); // begin

        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#c0392b';

        ctx.moveTo(pos.x, pos.y); // from
        setPosition(e);
        ctx.lineTo(pos.x, pos.y); // to
        // backend
        
socket.emit('draw',{x:pos.x,y:pos.y} );
// console.log(pos.x);
        ctx.stroke(); // draw it!
    }

// //////////////////////////////////////////////////////////////
// let canvas = document.querySelector(".canvass");
// // let test = document.getElementById("test");

// ctx.canvas.width =window.innerWidth;
// ctx.canvas.height = 0.93*window.innerHeight;

// // var io = io.connect("https://localhost:3000/");

// // let ctx = canvas.getContext("2d");

// let x;
// let y;
// let mouseDown = false;
// window.onmousedown = (e) => {
//     ctx.moveTo(x, y);
// socket.emit('down',{x,y})
// //    console.log(x);
//     mouseDown = true;
//   };
//   window.onmouseup = (e) => {
//   mouseDown = false;
// };
// socket.on('ondraw',({x,y})=>{
    
//     ctx.lineTo(x, y);
//     ctx.stroke();
// });
// socket.on('ondown',({x,y})=>{
//     // console.log(x);
//     ctx.moveTo(x, y);
// })
//   window.onmousemove = (e) => {
//     x = e.clientX;
//     y = e.clientY;
  
//     if (mouseDown) {
//      socket.emit('draw',{x,y});
//       ctx.lineTo(x, y);
//       ctx.stroke();
//     }
//   };


}());
