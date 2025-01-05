const $countdown = $("#countdown-container");
const countdown_text = $("#countdown");
const code = $("#current_code");
const online = $("#online");
const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
});

if (Cookies.get('nickname')) {
 $('#nickname').val(Cookies.get('nickname'));
};

socket.on("connect", () => {
  socket.emit("rejoin_room", {
    room_player: Cookies.get('nickname'), 
    room_code: Cookies.get('code'), 
  });
});

  // leave the room spontaneously!
$("#leave_room").on("click", () => {
  
  socket.emit("leave_room", {
    room_code: Cookies.get('code'),
    room_player: Cookies.get('nickname')
  });
  
  $("ui").hide();
  $("#start-screen").show();
  
});

$('#form_room').on('submit', (e) => {
  
  e.preventDefault();

  const $nickname = $('#nickname').val();
  const $code = $('#room_code').val();
  const $time = $('#game_time').val();
  
  Cookies.set('nickname', $nickname);
 
  socket.emit("room", {
    room_code: $code, 
    room_time: $time || 3, 
    room_player: $nickname
  });
});

socket.on("error", (err) => {
  alert(err.message);
});

socket.on("update_room", ({ room_player, room }) => {
  
  if (room.owner !== Cookies.get('nickname')) {
    $("#start_game").hide()
  };
  
  $("#splash-screen").hide();
  $("#start-screen").hide();
  $("ui").show();
  $('#gameModal').modal('hide');
  
  Cookies.set('code', room.code)
  code.text(room.code);
  online.text(room.players.length);
  
});

socket.on("count_down", ({ countdown }) => {
 
  $(".room-code").hide();
  $(".waiting-room").hide();
  $countdown.show();

  if (countdown > 0) {
    countdown_text.text(countdown);
  } else {
    countdown_text.text("GO!");

    setTimeout(() => {
      $(".room-code").show();
      $countdown.remove();
      $(".game").show();
      $(".game-time ").show();
    }, 1000);
  }

});

// Botão "Começar" no cliente
$("#start_game").on("click", () => {
 
    socket.emit("start_game", {
      room_code: Cookies.get('code'),
    });
    
});

socket.on("timer", ({ time_game }) => {
  return $("#timer").text(time_game);
});

// Evento recebido do servidor com o ranking final
socket.on("game_end", ({ ranking }) => {
  
  console.log(ranking);
  
  $(".room-code").hide();
  $(".game").remove();
  $(".game-time").hide();
  
  const $rankingContainer = $("#ranking");
  const $rankingList = $("#ranking-list");

  // Limpa a lista antes de adicionar novos jogadores
  $rankingList.empty();

  // Adiciona cada jogador ao ranking
  ranking.forEach((player, index) => {
    const isNewClass = index === 0 ? "new" : ""; // Destaque para o primeiro lugar
    $rankingList.append(`
      <li class="${isNewClass}">
        <span><b>#${player.rank}</b> ${player.room_player} - ${player.cookies} </span>
      </li>
    `);
  });

  // Mostra o ranking
  $rankingContainer.fadeIn();
  
});
