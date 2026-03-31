/*
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { User, Owner } from '../lib/models.js';
*/
import { sendJSON, sendError } from '../utils/responses.js';

export const handleUserSignup = async (req, res, body) => {
    return sendJSON(res, 200, { status: 'AUTH_ZERO_MODEL_LIVE', note: 'All imports (including models) disabled' });
};

export const handleUserLogin = async (req, res, body) => {
    return sendJSON(res, 200, { status: 'AUTH_ZERO_MODEL_LIVE' });
};

export const handleGoogleLogin = async (req, res, body) => {
    return sendJSON(res, 200, { status: 'AUTH_ZERO_MODEL_LIVE' });
};

export const handleOwnerSignup = async (req, res, body) => {
    return sendJSON(res, 200, { status: 'AUTH_ZERO_MODEL_LIVE' });
};

export const handleOwnerLogin = async (req, res, body) => {
    return sendJSON(res, 200, { status: 'AUTH_ZERO_MODEL_LIVE' });
};

export const handleOwnerGoogleLogin = async (req, res, body) => {
    return sendJSON(res, 200, { status: 'AUTH_ZERO_MODEL_LIVE' });
};
