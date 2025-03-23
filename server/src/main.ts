import { logger } from "./functions/logger";
import express from "express";
import { createServer } from "node:http";
import { Server, type Socket } from "socket.io";
import type {
  Room,
  RoomData,
  LeaveRoomData,
  RejoinRoomData,
  StartGameData,
  UpdateCookiesData,
} from "./types/rooms";
import colors from "colors";
import "dotenv/config";

/**
 * Initializes the Express application.
 */
const app = express();

/**
 * Creates an HTTP server using the Express application.
 */
const HTTP = createServer(app);

/**
 * Initializes Socket.IO with the HTTP server.
 */
const io = new Server(HTTP);

/**
 * Stores active rooms on the server.
 */
const ROOMS: Record<string, Room> = {};

/**
 * Counter to generate unique identifiers for players.
 */
let roomIdCounter = 0;

/**
 * Generates a unique identifier for each player.
 * @returns The generated unique identifier.
 */
function generateUuid(): number {
  roomIdCounter += 1;
  return roomIdCounter;
}

/**
 * Generates a random code to identify a room.
 * @returns The generated room code.
 */
function generateCode(): string {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  if (ROOMS[code]) return generateCode()
  return code;
}

/**
 * Health check route to verify the server's state.
 * Returns "pong" as the response.
 */
app.get("/ping", (req, res) => {
  res.status(200).send({
    message: "pong!",
  });
});

/**
 * Handles client connections and sets up event listeners.
 */
io.on("connection", (socket: Socket) => {
  /**
   * Handles player joining or creating a room.
   * @param data - The data for creating or joining a room.
   */

  const client_ip = socket.handshake.address;

  socket.on(
    "room",
    ({ room_public, room_code, room_time, room_player }: RoomData) => {
      if (!room_code) {
        room_code = generateCode();
        ROOMS[room_code] = {
          code: room_code,
          date: new Date(),
          players: [],
          owner: room_player,
          public: room_public,
          time: Math.max(11, Math.min(room_time || 11, 600)),
          state: "waiting",
        };
      }

      const room = ROOMS[room_code];

      if (!room) {
        socket.emit("err_socket", { err_socket: "ROOM_NOT_FOUND" });
        return;
      }
      if (room.players.length >= 10) {
        socket.emit("err_socket", { err_socket: "ROOM_NOT_FOUND" });
        return;
      }

      if (room.state === "in_game") {
        socket.emit("err_socket", { err_socket: "ROOM_STATE_ERROR_IN_GAME" });
        return;
      }

      if (room.state === "finished") {
        socket.emit("err_socket", { err_socket: "ROOM_STATE_ERROR_FINISHED" });
        return;
      }

      if (room.players.find((player) => player.room_player === room_player)) {
        socket.emit("err_socket", { err_socket: "PLAYER_EXISTS" });
        return;
      }

      if (room.players.find((player) => player.ip === client_ip)) {
         socket.emit("err_socket", { err_socket: "PLAYER_EXISTS" });
         return;
       }

      socket.join(room_code);

      room.players.push({
        id: generateUuid(),
        date: new Date(),
        socket: socket.id,
        player_data: { cookies: null },
        room_player,
      });

      io.to(room_code).emit("update_room", { room_player, room });

      logger.info(
        `Player "${colors.bold.green.underline(room_player)}" joined room "${colors.bold.green.underline(room_code)}".`,
      );
    },
  );

  /**
   * Handles player leaving a room.
   * @param data - The data for leaving the room.
   */
  socket.on("leave_room", ({ room_code, room_player }: LeaveRoomData) => {
    const room = ROOMS[room_code];

    if (!room) {
      socket.emit("err_socket", { err_socket: "ROOM_NOT_FOUND" });
      return;
    }

    room.players = room.players.filter(
      (player) => player.room_player !== room_player,
    );

    if (room.players.length === 0) {
      delete ROOMS[room_code];
      logger.info(`Room ${room_code} has been deleted.`);
    } else if (room.owner === room_player) {
      room.owner = room.players[0]?.room_player || null;
      logger.info(`New owner of room ${room_code}: ${room.owner}`);
    }

    socket.leave(room_code);
    io.to(room_code).emit("update_room", { room_player, room });

    logger.info(
      `Player ${room_player} (Socket ID: ${socket.id}) left room ${room_code}`,
    );
  });

  /**
   * Handles joining a random public room.
   * Filters for available public rooms with space for more players.
   * If no public rooms are available, an error is emitted.
   * If the player is already in a room, an error is emitted.
   * Otherwise, the player is added to a random room and the room is updated.
   * @param {string} room_player - The name/identifier of the player.
   */
  socket.on("join_random_room", ({ room_player }: { room_player: string }) => {
    // Filters public rooms that are in "waiting" state and have less than 10 players
    const availableRooms = Object.values(ROOMS).filter(
      (room) => room.public && room.state === "waiting",
    );

    // If no available public rooms
    if (availableRooms.length === 0) {
      socket.emit("err_socket", { err_socket: "NO_PUBLIC_ROOMS_AVAILABLE" });
      return;
    }

    // Randomly select a room from the available rooms
    const randomRoom =
      availableRooms[Math.floor(Math.random() * availableRooms.length)];

    // Check if the player is already in the selected room
    if (
      randomRoom.players.find((player) => player.room_player === room_player)
    ) {
      socket.emit("err_socket", { err_socket: "PLAYER_EXISTS_IN_ROOM" });
      return;
    }

    // Add the player to the selected room
    socket.join(randomRoom.code);

    randomRoom.players.push({
      id: generateUuid(),
      date: new Date(),
      socket: socket.id,
      player_data: { cookies: null },
      room_player,
    });

    io.to(randomRoom.code).emit("update_room", {
      room_player,
      room: randomRoom,
    });

    logger.info(
      `Player "${colors.bold.green.underline(room_player)}" joined random room "${randomRoom.code}".`,
    );
  });

  /**
   * Handles player rejoining a room.
   * @param data - The data for rejoining the room.
   */
  socket.on("rejoin_room", ({ room_player, room_code }: RejoinRoomData) => {
    const room = ROOMS[room_code];

    if (!room) return;

    const player = room.players.find(
      (player) => player.room_player === room_player,
    );
    if (player) {
      player.socket = socket.id;
      socket.join(room_code);
      io.to(room_code).emit("update_room", { room_player, room });
      logger.info(`Player "${room_player}" rejoined room "${room_code}".`);
    }
  });

  /**
   * Starts the game in a room.
   * @param data - The data to start the game.
   */
  socket.on("start_game", ({ room_code }: StartGameData) => {
    const room = ROOMS[room_code];

    if (!room || room.state !== "waiting") {
      socket.emit("err_socket", { err_socket: "ROOM_NOT_FOUND" });
      return;
    }

    room.state = "in_game";
    let countdown = 3;

    const countdownInterval = setInterval(() => {
      io.to(room_code).emit("count_down", { countdown });

      if (countdown <= 0) {
        clearInterval(countdownInterval);
        io.to(room_code).emit("game_start");

        let time_game = room.time * 1;
        const gameInterval = setInterval(() => {
          io.to(room_code).emit("timer", { time_game });

          if (time_game <= 0) {
            clearInterval(gameInterval);

            const ranking = room.players
              .sort((a, b) => b.player_data.cookies - a.player_data.cookies)
              .map((player, index) => ({
                rank: index + 1,
                room_player: player.room_player,
                cookies: player.player_data.cookies,
              }));

            room.state = "finished";
            io.to(room_code).emit("game_end", { ranking });

            if (room.state === "finished") {
              delete ROOMS[room_code];
              logger.info(`Room ${room_code} has been deleted.`);
            }

            logger.info(
              `Game in room "${room_code}" finished! Ranking: ${JSON.stringify(ranking)}`,
            );
            return;
          }

          time_game--;
        }, 1000);
      }

      countdown--;
    }, 1000);
  });

  /**
   * Updates the number of cookies for a player in the room.
   * @param data - The data for updating the cookies.
   */
  socket.on(
    "update_cookies",
    ({ room_player, room_code, cookies }: UpdateCookiesData) => {
      if (typeof cookies !== "number") {
        socket.emit("err_socket", { err_socket: "INVALID_COOKIES" });
        return;
      }
      const room = ROOMS[room_code];

      if (!room) return;

      cookies = Math.max(Math.min(60*room.time,cookies), 0)
      const player = room.players.find(
        (player) => player.room_player === room_player,
      );

      if (player) {
        player.player_data.cookies = cookies;
        logger.info(
          `Player "${room_player}" in room "${room_code}" updated cookies to ${cookies}.`,
        );
      }
    },
  );

  /**
   * Handles client disconnection.
   */
  socket.on("disconnect", () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

HTTP.listen(process.env.PORT, () => {
  logger.info(
    `Socket running: ${colors.bold.green.underline(`http://0.0.0.0:${process.env.PORT}`)}`,
  );
});
