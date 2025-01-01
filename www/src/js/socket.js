const socket = io('http://192.168.1.106:3000', {
  transports: ['websocket', 'polling']
});

const $countdown = $("#countdown-container");
const countdown_text = $("#countdown");
const code = $("#current_code");
const online = $("#online");

socket.emit("room", {
 code: null,
 nickname: "sebastianjnuwu",
});

socket.on("error", (err) => {
  alert(err.message);
});

socket.on('update_room', (room) => {
  code.text(room.code);
  online.text(room.players.length);
});

$("#start-game").on("click", () => {
  socket.emit("start_game", {
    code: code.text(),
  })
});

socket.on("count_down", ({ countdown }) => {
 
   $(".waiting-room").remove();
   $countdown.show();

  if (countdown > 0) {
    countdown_text.text(countdown); 
  } else {
    countdown_text.text("GO!"); 

    setTimeout(() => {
      $countdown.remove();
      $(".game").show();
    }, 1000);

  }
});

socket.on("started_game", (oi) => {
  console.log(oi);
});

