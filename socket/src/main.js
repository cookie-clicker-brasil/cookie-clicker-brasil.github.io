import { Server } from "socket.io";
const io = new Server();
const ROOMS = {};
let roomIdCounter = 0;

function $generate_uuid() {
  roomIdCounter += 1;
  return roomIdCounter;
}

// code
function $generate_code() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Event listener for a new connection from a client.
 */
io.on("connection", (socket) => {
  /**
   * Handles room creation or joining a room.
   * @param {Object} data - The data for the room.
   * @param {string} data.room_code - The code of the room.
   * @param {number} data.room_time - The time duration for the room in minutes.
   * @param {string} data.room_player - The name of the player joining the room.
   */
  socket.on("room", ({ room_code, room_time, room_player }) => {
    // Generate a room code if not provided
    if (!room_code) {
      const new_room_code = $generate_code(); // Ensure $generate_code is defined
      room_code = new_room_code;
      ROOMS[room_code] = {
        code: room_code,
        date: new Date(),
        players: [],
        owner: room_player,
        time: room_time || 11, // Default to 11 seconds if no time is provided
        state: "waiting",
      };
    }

    // Select the room by its code
    const room = ROOMS[room_code];

    // Check if the room exists
    if (!room) {
      socket.emit("err_socket", {
        message: `The room "${room_code}" doesn't exist!`,
      });
      return;
    }

    // Check if the room is in "waiting" state
    if (room.state !== "waiting") {
      socket.emit("err_socket", {
        message: `The room "${room_code}" is currently in "${room.state}" state.`,
      });
      return;
    }

    // Check if the player with the same nickname is already in the room
    if (room.players.find((player) => player.room_player === room_player)) {
      socket.emit("err_socket", {
        message: `A player with the nickname "${room_player}" already exists in the room.`,
      });
      return;
    }

    // Add the player to the room
    socket.join(room_code);

    // Register the player in the room
    room.players.push({
      id: $generate_uuid(), // Ensure $generate_uuid is defined
      date: new Date(),
      socket: socket.id,
      player_date: {
        cookies: null,
      },
      room_player,
    });

    // Send room update to all players
    io.to(room_code).emit("update_room", { room_player, room });

    console.log(
      `Player "${room_player}" joined room "${room_code}". Room state:`,
      room,
    );
  });

  /**
   * Handles player leaving a room.
   * @param {Object} data - The data for leaving the room.
   * @param {string} data.room_code - The code of the room.
   * @param {string} data.room_player - The name of the player leaving the room.
   */
  socket.on("leave_room", ({ room_code, room_player }) => {
    const room = ROOMS[room_code];

    // Check if the room exists
    if (!room) return;

    // Remove the player from the room
    room.players = room.players.filter(
      (player) => player.room_player !== room_player,
    );

    // Delete the room if it is empty
    if (room.players.length === 0) {
      delete ROOMS[room_code];
      console.log(`Room ${room_code} has been deleted.`);
    } else if (room.owner === room_player) {
      // Update the owner if necessary
      room.owner = room.players[0]?.room_player || null;
      console.log(`New owner of room ${room_code}: ${room.owner}`);
    }

    // Remove the socket from the room
    socket.leave(room_code);

    // Send updated room state to all players
    io.to(room_code).emit("update_room", { room_player, room });

    console.log(`Socket ${socket.id} (${room_player}) left room ${room_code}`);
  });

  /**
   * Handles player rejoining a room.
   * @param {Object} data - The data for rejoining the room.
   * @param {string} data.room_player - The name of the player rejoining the room.
   * @param {string} data.room_code - The code of the room.
   */
  socket.on("rejoin_room", ({ room_player, room_code }) => {
    const room = ROOMS[room_code];

    if (!room) return;
    if (room.state === "finished") return;

    // Update the socket ID for the player
    for (const player of room.players) {
      if (player.room_player === room_player) {
        player.socket = socket.id;
        break; // Exit the loop after updating the player's socket
      }
    }

    // Player joins the room again
    socket.join(room_code);

    // Send updated room state to all players
    io.to(room_code).emit("update_room", { room_player, room });
  });

  /**
   * Starts the game in a room.
   * @param {Object} data - The data for starting the game.
   * @param {string} data.room_code - The code of the room.
   */
  socket.on("start_game", ({ room_code }) => {
    const room = ROOMS[room_code];

    // Check if the room exists
    if (!room) {
      socket.emit("err_socket", {
        message: `Room ${room_code} not found.`,
      });
      return;
    }

    // Change the room state to "in_game"
    room.state = "in_game";

    let countdown = 3; // Countdown for 3 seconds
    const countdownInterval = setInterval(() => {
      // Send the current countdown to the room
      io.to(room_code).emit("count_down", { countdown });

      if (countdown <= 0) {
        clearInterval(countdownInterval);

        // Start the game
        io.to(room_code).emit("game_start");

        let time_game = room.time * 1; // Convert time from minutes to seconds

        const gameInterval = setInterval(() => {
          // Send the remaining game time to the room
          io.to(room_code).emit("timer", { time_game });

          if (time_game <= 0) {
            clearInterval(gameInterval);

            // End the game and generate the ranking
            const ranking = room.players
              .sort((a, b) => b.player_date.cookies - a.player_date.cookies) // Sort by cookies
              .map((player, index) => ({
                rank: index + 1,
                room_player: player.room_player,
                cookies: player.player_date.cookies,
              }));

            room.state = "finished";

            // Send the game end event with the ranking
            io.to(room_code).emit("game_end", { ranking });

            if (room.state === "finished") {
              delete ROOMS[room_code];
              console.log(`Room ${room_code} has been deleted.`);
            }

            console.log(
              `Game in room ${room_code} finished! Ranking:`,
              ranking,
            );

            return; // Prevent further execution
          }

          time_game--; // Decrement the game time
        }, 1000); // Update every second
      }

      countdown--; // Decrement the countdown
    }, 1000); // Update every second
  });

  /**
   * Updates the number of cookies for a player in the room.
   * @param {Object} data - The data for updating cookies.
   * @param {string} data.room_player - The name of the player.
   * @param {string} data.room_code - The code of the room.
   * @param {number} data.cookies - The number of cookies to update.
   */
  socket.on("update_cookies", ({ room_player, room_code, cookies }) => {
    if (typeof cookies !== "number" || cookies < 0) {
      console.error("Invalid cookie data received.");
      return;
    }

    const room = ROOMS[room_code];

    if (!room) {
      console.error(`Room ${room_code} not found.`);
      return;
    }

    const player = room.players.find(
      (player) => player.room_player === room_player,
    );

    if (player) {
      player.player_date.cookies = cookies;
      console.log(
        `Player ${room_player} in room ${room_code} updated cookies to ${cookies}.`,
      );
    } else {
      console.error(`Player ${room_player} not found in room ${room_code}.`);
    }
  });
});

// Start listening on port 3000
io.listen(3000);
