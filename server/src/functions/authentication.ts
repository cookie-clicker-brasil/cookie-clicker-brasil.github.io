import jwt from "jsonwebtoken"
import OAuth from "discord-oauth2";

/**
 * Sign user data
 * @param username User's username
 * @returns A JWT
 */
export function sign(id: string, username: string) {
    return jwt.sign(JSON.stringify({ id, username, expiresIn: Date.now()+(3600*24*7*1000) }), process.env.JWT_SECRET!)
}
/**
 * Verify if token is real
 * @param token User's token
 * @returns TokenData
 */
export function verify(token: string) : TokenData | null {
    try {
        const data = (jwt.verify(token, process.env.JWT_SECRET!) as unknown) as TokenData
        if (!data || data.expiresIn < Date.now()) return null;
        return data
    } catch (e) {
        return null;
    }
}

/**
 * Discord Oauth2 Methods
 */
export const oauth = new OAuth({
    clientId: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
    redirectUri: process.env.CLIENT_REDIRECT
})
/**
 * Discord oauth2 scopes
 */
export const oauthScope = ["identify"]