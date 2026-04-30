import mongoose from 'mongoose';
import connectDB from './mongodb.js';
import * as models from './lib/models.js';

/**
 * Synchronizes a User or Owner object across both 'backstage_events' and 'park_conscious' databases.
 * @param {Object} data - The user/owner document data
 * @param {Boolean} isOwner - Whether the document is an Owner (Admin/Organizer) or a regular User
 */
export async function syncIdentity(data, isOwner = false) {
    if (!data) return;

    const targetDb = 'park_conscious'; // Mirror to parking DB
    const sourceDb = 'backstage_events'; // Usually created here first

    try {
        // Convert to a plain object and remove sensitive internal fields if necessary
        const cleanData = JSON.parse(JSON.stringify(data));
        const email = (cleanData.email || '').toLowerCase();
        
        if (!email) return;

        console.log(`[SYNC] Mirroring ${isOwner ? 'Owner' : 'User'} (${email}) to ${targetDb}...`);

        // Switch to the target database
        await connectDB(targetDb);
        
        const Model = isOwner ? models.Owner : models.User;

        // Use upsert to create or update
        // We match by email to ensure identity stability across databases
        await Model.findOneAndUpdate(
            { email: email },
            { $set: cleanData },
            { upsert: true, new: true, runValidators: false }
        );

        console.log(`[SYNC] Success: ${email} mirrored.`);
        
        // Always switch back to the default source DB to prevent context leaks
        await connectDB(sourceDb);
    } catch (err) {
        console.error(`[SYNC ERROR] Failed to mirror identity for ${data.email}:`, err);
        // We do NOT throw here to prevent breaking the main request flow
        try { await connectDB(sourceDb); } catch(e) {}
    }
}
