import imageCompression from 'browser-image-compression';
import { PDFDocument } from 'pdf-lib';

/**
 * Compresses an image or PDF file to stay under a target size (default 9MB).
 * @param {File} file - The file to compress.
 * @param {number} targetSizeMB - Target size in MB.
 * @returns {Promise<File|Blob>} - The compressed file/blob.
 */
export async function compressFile(file, targetSizeMB = 8.5) {
    const targetSizeBytes = targetSizeMB * 1024 * 1024;

    // If already under target size, return original
    if (file.size <= targetSizeBytes) {
        return file;
    }

    const fileType = file.type;

    if (fileType.includes('image')) {
        console.log(`🚀 Auto-compressing image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        
        let compressedFile = file;
        let quality = 0.9;
        let iteration = 0;

        // Recursive compression loop to ensure it fits the target size
        while (compressedFile.size > targetSizeBytes && quality > 0.1 && iteration < 5) {
            const options = {
                maxSizeMB: targetSizeMB,
                maxWidthOrHeight: iteration > 2 ? 2048 : 4096, // Reduce resolution if quality reduction isn't enough
                useWebWorker: true,
                initialQuality: quality,
            };

            try {
                compressedFile = await imageCompression(file, options);
                quality -= 0.2;
                iteration++;
                console.log(`Iteration ${iteration}: Compressed to ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
            } catch (error) {
                console.error('Image compression iteration failed:', error);
                break;
            }
        }
        return compressedFile;
    } 
    
    if (fileType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        console.log(`🚀 Auto-optimizing PDF: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            
            // Maximum structural optimization
            const compressedPdfBytes = await pdfDoc.save({
                useObjectStreams: true,
                addDefaultPage: false,
                updateMetadata: false,
            });

            if (compressedPdfBytes.length < file.size) {
                console.log(`✅ Optimized PDF: ${(compressedPdfBytes.length / 1024 / 1024).toFixed(2)}MB`);
                return new Blob([compressedPdfBytes], { type: 'application/pdf' });
            }
            return file;
        } catch (error) {
            console.error('PDF optimization failed:', error);
            return file;
        }
    }

    return file;
}
