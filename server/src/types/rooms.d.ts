// types/rooms.d.ts

/** Represents a room */
export interface Room {
    code: string;
    date: Date;
    players: Player[];
    playerLimit: number;
    owner: string;
    time: number;
    public: boolean;
    state: "waiting" | "in_game" | "finished";
}

/** Represents a player */
export interface Player {
    id: number;
    date: Date;
    socket: string;
    player_data: {
        cookies: number | null;
    };
    ip: string;
    room_player: string;
}

/** Data received to create or join a room */
export interface RoomData {
    room_public?: boolean;
    player_limit?: number;
    room_code?: string;
    room_time: number;
    room_player: string;
}

/** Data for leaving a room */
export interface LeaveRoomData {
    room_code: string;
    room_player: string;
}

/** Data for rejoining a room */
export interface RejoinRoomData {
    room_code: string;
    room_player: string;
}

/** Data for starting a game */
export interface StartGameData {
    room_code: string;
}

/** Data for updating cookies */
export interface UpdateCookiesData {
    room_code: string;
    room_player: string;
    cookies: number;
}
