import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Owner } from '../lib/models.js';
import { sendJSON, sendError } from '../utils/responses.js';

const generateJWT = (user) => {
    const jwtSecret = process.env.JWT_SECRET || 'park-conscious-default-secret';
    return jwt.sign(
        { uid: user.uid || user._id, name: user.name, email: user.email, picture: user.picture, role: user.role || 'user' },
        jwtSecret, 
        { expiresIn: '7d' }
    );
};

export const handleUserSignup = async (req, res, body) => {
    try {
        const { name, email, password } = body;
        if (await User.findOne({ email: email.toLowerCase() })) return sendError(res, 400, 'User already exists');
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email: email.toLowerCase(), password: hashed, uid: new mongoose.Types.ObjectId().toString() });
        const token = generateJWT(user);
        return sendJSON(res, 201, { token, user: { uid: user.uid, name: user.name, email: user.email } });
    } catch (err) { return sendError(res, 500, 'Signup failed', err.message); }
};

export const handleUserLogin = async (req, res, body) => {
    try {
        const { email, password } = body;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !user.password) return sendError(res, 400, 'Invalid credentials');
        if (!await bcrypt.compare(password, user.password)) return sendError(res, 400, 'Invalid credentials');
        
        const token = generateJWT(user);
        return sendJSON(res, 200, { token, user: { uid: user.uid || user._id, name: user.name, email: user.email } });
    } catch (err) { return sendError(res, 500, 'Login failed', err.message); }
};

export const handleGoogleLogin = async (req, res, body) => {
    try {
        const { token, userInfo } = body || {};
        if (!token) return sendError(res, 400, 'Google token required');

        let uid, name, email, picture;

        if (userInfo && userInfo.sub) {
            ({ sub: uid, name, email, picture } = userInfo);
        } else {
            // Using native fetch to avoid heavy google-auth-library / axios crashing Vercel 50MB limits
            const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!googleRes.ok) throw new Error("Google auth request failed");
            const data = await googleRes.json();
            uid = data.sub;
            name = data.name;
            email = data.email;
            picture = data.picture;
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
        console.error('Google Auth Error:', err);
        return sendError(res, 500, 'Google Login failed', err.message); 
    }
};

// ── Owner Handlers ─────────────────────────────────────────────────
export const handleOwnerSignup = async (req, res, body) => {
    try {
        const { name, email, password } = body;
        if (await Owner.findOne({ email: email.toLowerCase() })) return sendError(res, 400, 'Owner already exists');
        const hashed = await bcrypt.hash(password, 10);
        const owner = await Owner.create({ name, email: email.toLowerCase(), password: hashed });
        return sendJSON(res, 201, { user: { id: owner._id, name: owner.name, email: owner.email } });
    } catch (err) { return sendError(res, 500, 'Owner signup failed', err.message); }
};

export const handleOwnerLogin = async (req, res, body) => {
    try {
        const { email, password } = body;
        const owner = await Owner.findOne({ email: email.toLowerCase() });
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
        let owner = await Owner.findOne({ email: email.toLowerCase() });
        if (!owner) owner = await Owner.create({ name, email: email.toLowerCase(), googleId });
        
        const token = generateJWT(owner);
        return sendJSON(res, 200, { 
            token, 
            user: { id: owner._id, name: owner.name, email: owner.email } 
        });
    } catch (err) { return sendError(res, 500, 'Owner Google login failed', err.message); }
};
