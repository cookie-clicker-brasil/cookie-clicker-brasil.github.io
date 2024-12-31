const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling']
});

const code = $("#current_code");
const online = $("#online");

console.log(code.text());
socket.emit("room", {
 code: null,
 nickname: "sebastianjnuwu",
});

socket.on("error", (err) => {
  console.log(err.message);
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
  console.log(countdown > 0 ? countdown : "GO!");
});

socket.on("started_game", (oi) => {
  console.log(oi);
});

