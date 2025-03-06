import { io, type Socket } from "socket.io-client";
import { lang } from "@language/main.ts";
import { Modal } from "bootstrap";
import $ from "jquery";

const $room_modal = new Modal($("#room_modal"));

/**
 * Display a message with bootstrap toast
 * @param text - The message to display
 */
function showMessage(text: string): void {
  const $message = $("#message");

  // Clear any previous messages
  $message.html("");

  setTimeout(() => {
    $message.html("");
  }, 10000);

  // Create and append toast message
  $message.html(`
    <div class="toast fade show">
     <div class="toast-header">
     <img style="width: 10%;" src="favicon.ico" class="rounded me-2">
     <strong class="me-auto">Cookie</strong>
     <small><i18next i18next-id="general.message_now">${lang("general.message_now")}</i18next></small>
     <button type="button" style="box-shadow: none; outline: none;" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">${text}</div></div>`);
}

/*  */

// Create socket connection
const socket: Socket = io(
  import.meta.env.VITE_SOCKET_URL || "https://socket-hj1h.onrender.com",
  {
    transports: ["websocket", "polling"],
  },
);

// Initialize cookies count and handle local storage
let cookies: number = Number(localStorage.getItem("cookie")) || 0;
if (cookies < 0) {
  cookies = 0;
  localStorage.setItem("cookie", cookies.toString());
}

let $cps = 0;

/**
 * Update cookies per second (CPS) and reset after update
 */
const updateCps = (): void => {
  $("#cps").text($cps.toString());
  $cps = 0;
};

/**
 * Update cookies count, increase CPS, and sync with server
 */
const updateCookies = (): void => {
  cookies++;
  $cps++;
  $("#click-cookie").text(`${cookies}`);
  localStorage.setItem("cookie", cookies.toString());

  socket.emit("update_cookies", {
    room_player: localStorage.getItem("name"),
    room_code: localStorage.getItem("code"),
    cookies,
  });
};

// Set interval for CPS update
setInterval(updateCps, 1000);

// Cookie click event with animation
$(".cookie").on("click", function (e) {
  updateCookies();

  const $effect = $('<div class="click-effect">+1</div>');
  const offset = $(this).offset();
  const X = e.pageX - offset.left;
  const Y = e.pageY - offset.top;

  $effect.css({
    left: `${X}px`,
    top: `${Y}px`,
    position: "absolute",
  });

  $(this).append($effect);

  $effect
    .animate(
      {
        top: "-=2.5rem",
        opacity: 1,
        fontSize: "1.5rem",
      },
      300,
    )
    .animate(
      {
        opacity: 0,
      },
      200,
      function () {
        $(this).remove();
      },
    );
});

// Rejoin room if necessary
socket.emit("rejoin_room", {
  room_player: localStorage.getItem("name"),
  room_code: localStorage.getItem("code"),
});

// Set room name if available
if (localStorage.getItem("name")) {
  $("#room_name").val(localStorage.getItem("name"));
}

// Form for creating the room
$("#form_button").on("click", () => {
  const option = $('input[name="option_game"]:checked').val() as string;
  const roomPlayer = $("#room_name").val() as string;
  const roomCode = $("#room_code").val() as string;
  const roomPublic = $("#room_public").prop("checked") as boolean;
  const roomTime = $("#room_time").val() as string | null;

  if (!roomPlayer) {
    return showMessage(
      `<i class="fas fa-exclamation-circle"></i> ${lang("room.no_room_player")}`,
    );
  }

  if (option === "room_random") {
    $room_modal.hide();

    localStorage.setItem("name", roomPlayer);

    socket.emit("join_random_room", {
      room_player: roomPlayer,
    });

    return;
  }

  // Verificação do tempo só se a opção for "create"
  if (option === "create") {
    if (!roomTime) {
      return showMessage(
        `<i class="fas fa-exclamation-circle"></i> ${lang("room.no_room_time")}`,
      );
    }

    const timeCheck = roomTime ? Number.parseInt(roomTime, 10) : Number.NaN;

    if (Number.isNaN(timeCheck) || timeCheck <= 10 || timeCheck > 600) {
      return showMessage(
        `<i class="fas fa-exclamation-circle"></i> ${lang("room.time_check")}`,
      );
    }
  }

  // Verificação do código da sala só se a opção for "join"
  if (option === "join" && !roomCode) {
    return showMessage(
      `<i class="fas fa-exclamation-circle"></i> ${lang("room.no_room_code")}`,
    );
  }

  if (!socket.connected) {
    return showMessage(
      `<i class="fas fa-exclamation-circle"></i> ${lang("room.no_connected")}`,
    );
  }

  $room_modal.hide();

  localStorage.setItem("name", roomPlayer);

  socket.emit("room", {
    room_public: roomPublic,
    room_code: roomCode,
    room_time: roomTime,
    room_player: roomPlayer,
  });
});

socket.on("err_socket", ({ err_socket }: { err_socket: string }) => {
  return showMessage(lang(`err_message.${err_socket}`));
});

// Handle room updates
socket.on(
  "update_room",
  ({ room_player, room }: { room_player: string; room: any }) => {
    $("#splash-screen").hide();
    $("#start-screen").hide();
    $("ui").show();

    if (room.state === "waiting") {
      $(".waiting-room").show();
      $(".room-code").show();
    } else if (room.state === "in_game") {
      $(".waiting-room").hide();
      $("#game").show();
    }

    if (room.owner === localStorage.getItem("name")) {
      $("#start_game").show();
    } else {
      $("#start_game").hide();
    }

    localStorage.setItem("code", room.code);

    $("#current_code").text(room.code);
    $("#online").text(room.players.length);
  },
);

// Leave room functionality
$("#leave_room").on("click", () => {
  socket.emit("leave_room", {
    room_code: localStorage.getItem("code"),
    room_player: localStorage.getItem("name"),
  });

  localStorage.setItem("code", null);

  $("ui").hide();
  $("#start-screen").show();
});

// Start game functionality
$("#start_game").on("click", () => {
  cookies = 0;
  localStorage.setItem("cookie", cookies.toString());
  socket.emit("start_game", {
    room_code: localStorage.getItem("code"),
  });
});

// Handle countdown and game start
socket.on("count_down", ({ countdown }: { countdown: number }) => {
  $("ui").hide();
  $("#countdown-container").show();

  if (countdown > 0) {
    $("#countdown").text(countdown);
  } else {
    $("#countdown").text(lang("general.start"));

    setTimeout(() => {
      $("#countdown-container").hide();
      $(".waiting-room").hide();
      $("#game").show();
      $(".game-time").show();
      $("ui").show();
    }, 1000);
  }
});

// Handle timer updates
socket.on("timer", ({ time_game }: { time_game: number }) => {
  $("#timer").text(time_game.toString());
});

// Handle game end and ranking
socket.on("game_end", ({ ranking }: { ranking: any[] }) => {
  $("#cps").text("0");
  $("#click-cookie").text("0");

  cookies = 0;
  localStorage.setItem("cookie", cookies.toString());
  localStorage.setItem("code", null);

  $(".room-code").hide();
  $("#game").hide();
  $("#ranking").hide();
  $("#ranking-list").empty();

  // Show trophy icon before ranking
  $("#countdown-container").show();
  $("#countdown").html(
    '<i class="fas fa-trophy" style="color: #f4a261; font-size: 10rem; text-align: center;"></i>',
  );

  setTimeout(() => {
    $("#countdown-container").hide();
    $("#ranking").fadeIn();

    ranking.forEach((player, index) => {
      $("#ranking-list").append(`
        <li class="${index === 0 ? "new" : ""}">
          <span><b>#${player.rank}</b> ${player.room_player} - ${player.cookies || 0}</span>
        </li>
      `);
    });
  }, 1200);
});

// Game exit functionality
$("#game_exit").on("click", () => {
  $("ui").hide();
  $("#ranking").hide();
  $("#start-screen").show();
});
