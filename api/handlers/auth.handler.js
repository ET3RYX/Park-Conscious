import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { User, Owner } from '../lib/models.js';
import { sendJSON, sendError } from '../utils/responses.js';

const generateJWT = (user) => {
    const jwtSecret = process.env.JWT_SECRET || 'park-conscious-default-secret';
    return jwt.sign(
        { uid: user.uid || user._id, name: user.name, email: user.email, picture: user.picture },
        jwtSecret, 
        { expiresIn: '7d' }
    );
};

// ── User Handlers ──────────────────────────────────────────────────
export const handleUserSignup = async (req, res, body) => {
    try {
        const { name, email, password } = body;
        if (!name || !email || !password) return sendError(res, 400, 'Missing fields');
        if (await User.findOne({ email })) return sendError(res, 400, 'User already exists');
        
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashed });
        return sendJSON(res, 201, { user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) { return sendError(res, 500, 'Signup failed', err.message); }
};

export const handleUserLogin = async (req, res, body) => {
    try {
        const { email, password } = body;
        const user = await User.findOne({ email });
        if (!user || !user.password) return sendError(res, 400, 'Invalid credentials');
        if (!await bcrypt.compare(password, user.password)) return sendError(res, 400, 'Invalid credentials');
        return sendJSON(res, 200, { user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) { return sendError(res, 500, 'Login failed', err.message); }
};

export const handleGoogleLogin = async (req, res, body) => {
    try {
        const { token: googleToken } = body;
        if (!googleToken) return sendError(res, 400, 'Missing Google token');

        // Verify with Google
        const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${googleToken}` }
        });
        const profile = googleRes.data;
        if (!profile || !profile.email) return sendError(res, 401, 'Invalid Google token');

        // Upsert user
        let dbUser = await User.findOne({ email: profile.email.toLowerCase() });
        if (!dbUser) {
            dbUser = await User.create({
                name: profile.name,
                email: profile.email.toLowerCase(),
                googleId: profile.sub,
                picture: profile.picture,
                uid: 'G_' + profile.sub
            });
        } else {
            dbUser.picture = profile.picture || dbUser.picture;
            dbUser.name = profile.name || dbUser.name;
            await dbUser.save();
        }

        const jwtToken = generateJWT(dbUser);
        return sendJSON(res, 200, {
            token: jwtToken,
            user: { uid: dbUser.uid || dbUser._id, name: dbUser.name, email: dbUser.email, picture: dbUser.picture }
        });
    } catch (err) { return sendError(res, 500, 'Google Login processing failed', err.message); }
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
        return sendJSON(res, 200, { user: { id: owner._id, name: owner.name, email: owner.email } });
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
