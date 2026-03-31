import { v2 as cloudinary } from 'cloudinary';
import Busboy from 'busboy';

// Initialize Cloudinary
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET
    });
}

export const uploadImage = (req) => {
    return new Promise((resolve, reject) => {
        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
            return reject(new Error('Cloudinary credentials missing in environment.'));
        }

        const bb = Busboy({ headers: req.headers });
        let fileHandled = false;

        bb.on('file', (fieldname, file) => {
            fileHandled = true;
            const stream = cloudinary.uploader.upload_stream({ 
                folder: 'park-conscious-events',
                resource_type: 'auto' 
            }, (error, result) => {
                if (error) return reject(new Error(`Cloudinary Upload Error: ${error.message}`));
                resolve(result.secure_url);
            });
            file.pipe(stream);
        });

        bb.on('error', (err) => reject(new Error(`Busboy Parsing Error: ${err.message}`)));

        bb.on('finish', () => {
            if (!fileHandled) reject(new Error('No file detected in request.'));
        });

        req.pipe(bb);
    });
};
