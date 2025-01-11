// @lang/en-US
const translation = {
    general: {
        cookies: "Cookies",
        seconds: "Seconds",
        timeLabel: "Time:",
        start: "GO!",
        message_now: "Now"
    },
    splashScreen: {
        splashClick: "Click..."
    },
    menu: {
        cookieTitle: "Cookie",
        playButton: "Play",
        settings: "Settings"
    },
    ranking: {
        rankingTitle: "Ranking",
        roomCode: "Room Code:",
        waiting: "Waiting...",
        startButton: "Start",
        leaveButton: "Leave"
    },
    game: {
        nicknameLabel: "Nickname",
        gameOptionLabel: "Choose an option:",
        randomRoom: "Join a random room",
        createRoom: "Create a room",
        joinRoom: "Join a room",
        roomCodeLabel: "Room Code",
        gameTimeLabel: "Game Time (in seconds)"
    },
    room: {
        no_room_player: "It seems you haven't set your nickname!",
        no_room_time: "It seems you haven't set the room time!",
        time_check:
            "The room time must be greater than 10 seconds and less than or equal to 10 minutes!",
        no_room_code: "It seems you haven't added the room code!",
        no_connected: "It seems you've been disconnected from the Cookie game!"
    },
    modal: {
        cancel: "Cancel",
        confirm: "Confirm"
    },
    err_message: {
        ROOM_NOT_FOUND: "The room was not found!",
        ROOM_STATE_ERROR: "The room is in the wrong state!",
        PLAYER_EXISTS: "A player with this name already exists in the room.",
        INVALID_COOKIES: "Invalid cookies data received.",
        ROOM_CODE_NOT_FOUND: "The room code was not found."
    }
};

export default translation;
