let roomIdCounter = 0;

export function $generate_uuid() {
  roomIdCounter += 1; 
  return roomIdCounter; 
}

 // code
export function $generate_code() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};