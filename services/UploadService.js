const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const MAX_RETRIES = 3;
const RETRY_DELAYS = [3000, 5000, 10000]; // Delays in milliseconds

async function retryUpload(uploadFunction, ...args) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            return await uploadFunction(...args);
        } catch (error) {
            if (attempt === MAX_RETRIES - 1) {
                throw error; // Rethrow the error on the last attempt
            }
            console.warn(`Attempt ${attempt + 1} failed. Retrying in ${RETRY_DELAYS[attempt] / 1000} seconds.`);
            await delay(RETRY_DELAYS[attempt]);
        }
    }
}

export const uploadMusic = async (musicFile, onUploadProgress) => {
    const chunkSize = 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(musicFile.size / chunkSize);

    for (let chunkNumber = 1; chunkNumber <= totalChunks; chunkNumber++) {
        const start = (chunkNumber - 1) * chunkSize;
        const end = Math.min(start + chunkSize, musicFile.size);
        const chunk = musicFile.slice(start, end);

        const formData = new FormData();
        formData.append('file', chunk, musicFile.name);
        formData.append('chunk_number', chunkNumber);
        formData.append('total_chunks', totalChunks);
        formData.append('filename', musicFile.name);

        try {
            const response = await retryUpload(async () => {
                const res = await fetch('https://immortals-cod-api.playwox.com/upload-music-chunk/', {
                    method: 'POST',
                    body: formData,
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(`Music upload failed for chunk ${chunkNumber}: ${errorData.detail}`);
                }

                return res;
            });

            if (onUploadProgress) {
                onUploadProgress({
                    loaded: Math.min((chunkNumber * chunkSize), musicFile.size),
                    total: musicFile.size,
                });
            }

            const result = await response.json();
            if (chunkNumber === totalChunks) {
                return result.filename;
            }
        } catch (error) {
            console.error(`Error uploading music chunk ${chunkNumber}:`, error);
            throw error;
        }
    }
};

export const uploadFile = async ({
    file,
    accountName,
    gameMode,
    weapon,
    mapName,
    backgroundMusicFilename,
    onUploadProgress,
}) => {
    const chunkSize = 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(file.size / chunkSize);

    for (let chunkNumber = 1; chunkNumber <= totalChunks; chunkNumber++) {
        const start = (chunkNumber - 1) * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('file', chunk, file.name);
        formData.append('chunk_number', chunkNumber);
        formData.append('total_chunks', totalChunks);
        formData.append('filename', file.name);
        formData.append('account_name', accountName);
        formData.append('game_mode', gameMode);
        formData.append('weapon', weapon);
        formData.append('map_name', mapName);

        if (backgroundMusicFilename && chunkNumber === 1) {
            formData.append('background_music_filename', backgroundMusicFilename);
        }

        try {
            const response = await retryUpload(async () => {
                const res = await fetch('https://immortals-cod-api.playwox.com/upload-video-chunk/', {
                    method: 'POST',
                    body: formData,
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(`Upload failed for chunk ${chunkNumber}: ${errorData.detail}`);
                }

                return res;
            });

            if (onUploadProgress) {
                onUploadProgress({
                    loaded: Math.min((chunkNumber * chunkSize), file.size),
                    total: file.size,
                });
            }

            const result = await response.json();
            if (chunkNumber === totalChunks) {
                return result;
            }
        } catch (error) {
            console.error(`Error uploading chunk ${chunkNumber}:`, error);
            throw error;
        }
    }
};

export const processVideo = async (videoFilename, musicFilename) => {
    try {
        const response = await retryUpload(async () => {
            const res = await fetch('https://immortals-cod-api.playwox.com/process-video/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    video_filename: videoFilename,
                    music_filename: musicFilename,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(`Video processing failed: ${errorData.detail}`);
            }

            return res;
        });

        return await response.json();
    } catch (error) {
        console.error('Error processing video:', error);
        throw error;
    }
};