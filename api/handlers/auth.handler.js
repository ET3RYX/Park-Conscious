import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { User, Owner } from '../lib/models.js';
import { sendJSON, sendError } from '../utils/responses.js';

let googleClient;

const generateJWT = (user) => {
    const jwtSecret = process.env.JWT_SECRET || 'park-conscious-default-secret';
    return jwt.sign(
        { uid: user.uid || user._id, name: user.name, email: user.email, picture: user.picture, role: user.role || 'user' },
        jwtSecret, 
        { expiresIn: '7d' }
    );
};

// ... existing signup/login handlers ...

export const handleGoogleLogin = async (req, res, body) => {
    try {
        const { token, userInfo } = body || {};
        if (!token) return sendError(res, 400, 'Google token required');

        const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
        if (!googleClient) {
            googleClient = new OAuth2Client(googleClientId);
        }

        let uid, name, email, picture;

        if (userInfo && userInfo.sub) {
            ({ sub: uid, name, email, picture } = userInfo);
        } else {
            try {
                const ticket = await googleClient.verifyIdToken({
                    idToken: token,
                    audience: googleClientId,
                });
                const payload = ticket.getPayload();
                ({ sub: uid, name, email, picture } = payload);
            } catch (verifyErr) {
                // Fallback to userinfo API for access tokens
                const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = googleRes.data;
                uid = data.sub;
                name = data.name;
                email = data.email;
                picture = data.picture;
            }
        }

        if (!uid || !email) return sendError(res, 401, 'Invalid Google authentication');

        // Upsert user
        let dbUser = await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            { 
                uid: uid, 
                name: name, 
                email: email.toLowerCase(), 
                picture: picture,
                googleId: uid 
            },
            { upsert: true, new: true }
        );

        const jwtToken = generateJWT(dbUser);
        return sendJSON(res, 200, {
            token: jwtToken,
            user: { uid: dbUser.uid || dbUser._id, name: dbUser.name, email: dbUser.email, picture: dbUser.picture, role: dbUser.role || 'user' }
        });
    } catch (err) { 
        console.error('Google Auth CRASH:', err);
        return sendError(res, 500, 'Google Login failed', err.message); 
    }
};

// ── Owner Handlers ─────────────────────────────────────────────────
export const handleOwnerSignup = async (req, res, body) => {
    try {
        const { name, email, password } = body;
        if (await Owner.findOne({ email })) return sendError(res, 400, 'Owner already exists');
        const hashed = await bcrypt.hash(password, 10);
        const owner = await Owner.create({ name, email, password: hashed });
        return sendJSON(res, 201, { user: { id: owner._id, name: owner.name, email: owner.email } });
    } catch (err) { return sendError(res, 500, 'Owner signup failed', err.message); }
};

export const handleOwnerLogin = async (req, res, body) => {
    try {
        const { email, password } = body;
        const owner = await Owner.findOne({ email });
        if (!owner || !owner.password) return sendError(res, 400, 'Invalid credentials');
        if (!await bcrypt.compare(password, owner.password)) return sendError(res, 400, 'Invalid credentials');
        
        const token = generateJWT(owner);
        return sendJSON(res, 200, { 
            token,
            user: { id: owner._id, name: owner.name, email: owner.email } 
        });
    } catch (err) { return sendError(res, 500, 'Owner login failed', err.message); }
};

export const handleOwnerGoogleLogin = async (req, res, body) => {
    try {
        const { email, name, googleId } = body;
        let owner = await Owner.findOne({ email });
        if (!owner) owner = await Owner.create({ name, email, googleId });
        return sendJSON(res, 200, { user: { id: owner._id, name: owner.name, email: owner.email } });
    } catch (err) { return sendError(res, 500, 'Owner Google login failed', err.message); }
};
