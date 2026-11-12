
const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');

const UPLOAD_ROOT = path.resolve(
    process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads')
);

const STORAGE_CATEGORIES = Object.freeze({
    profile: 'public/profiles',
    medicalRecord: 'private/medical-records',
    doctorCredential: 'private/doctor-credentials',
    labReport: 'private/lab-reports'
});

const getCategoryDirectory = (category) => {
    const relativeDirectory = STORAGE_CATEGORIES[category];

    if (!relativeDirectory) {
        throw new Error('Invalid upload storage category.');
    }

    return path.join(UPLOAD_ROOT, relativeDirectory);
};

const ensureStorageDirectories = async () => {
    const directories = Object.keys(STORAGE_CATEGORIES);

    await Promise.all(
        directories.map(async (category) => {
            await fs.mkdir(getCategoryDirectory(category), {
                recursive: true,
                mode: 0o750
            });
        })
    );
};

const saveUploadedFile = async (buffer, category, extension) => {
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
        throw new Error('Invalid uploaded file buffer.');
    }

    if (!/^[a-z0-9]+$/.test(extension)) {
        throw new Error('Invalid detected file extension.');
    }

    const directory = getCategoryDirectory(category);

    await fs.mkdir(directory, {
        recursive: true,
        mode: 0o750
    });

    const filename = `${crypto.randomUUID()}.${extension}`;
    const absolutePath = path.join(directory, filename);

    await fs.writeFile(absolutePath, buffer, {
        flag: 'wx',
        mode: 0o640
    });

    return {
        filename,
        storageKey: `${STORAGE_CATEGORIES[category]}/${filename}`
    };
};

const resolveStoredFile = (storageKey) => {
    if (
        typeof storageKey !== 'string' ||
        storageKey.includes('\\') ||
        storageKey.includes('..') ||
        path.isAbsolute(storageKey)
    ) {
        throw new Error('Invalid storage key.');
    }

    const absolutePath = path.resolve(UPLOAD_ROOT, storageKey);

    if (!absolutePath.startsWith(UPLOAD_ROOT + path.sep)) {
        throw new Error('Storage path is outside the upload directory.');
    }

    return absolutePath;
};

const deleteStoredFile = async (storageKey) => {
    const absolutePath = resolveStoredFile(storageKey);

    await fs.unlink(absolutePath).catch((error) => {
        if (error.code !== 'ENOENT') {
            throw error;
        }
    });
};

module.exports = {
    UPLOAD_ROOT,
    STORAGE_CATEGORIES,
    ensureStorageDirectories,
    saveUploadedFile,
    resolveStoredFile,
    deleteStoredFile
};
