/*
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
*/
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Owner } from '../lib/models.js';

import { sendJSON, sendError } from '../utils/responses.js';

export const handleUserSignup = async (req, res, body) => {
    return sendJSON(res, 200, { status: 'AUTH_BASIC_LIBS_LIVE', note: 'bcrypt and jwt enabled' });
};

export const handleUserLogin = async (req, res, body) => {
    return sendJSON(res, 200, { status: 'AUTH_BASIC_LIBS_LIVE' });
};

export const handleGoogleLogin = async (req, res, body) => {
    return sendJSON(res, 200, { status: 'AUTH_BASIC_LIBS_LIVE' });
};

export const handleOwnerSignup = async (req, res, body) => {
    return sendJSON(res, 200, { status: 'AUTH_BASIC_LIBS_LIVE' });
};

export const handleOwnerLogin = async (req, res, body) => {
    return sendJSON(res, 200, { status: 'AUTH_BASIC_LIBS_LIVE' });
};

export const handleOwnerGoogleLogin = async (req, res, body) => {
    return sendJSON(res, 200, { status: 'AUTH_BASIC_LIBS_LIVE' });
};
