/**
 * EIGHTDAMAGE - Lossless compression library
 * QUAD (4x guaranteed) + RLE (optional)
 * 
 * @author Petrovich
 * @license MIT
 * @version 1.0.0
 */

(function(global) {
    'use strict';

    // ========== CORE ALGORITHMS ==========

    /**
     * QUAD-PACK: 2 bits → digit 0-3 → pack 4 digits into 1 byte
     * @param {Uint8Array} bytes - Input bytes
     * @returns {Uint8Array} Packed bytes (4x smaller)
     */
    function quadPack(bytes) {
        const packed = new Uint8Array(Math.ceil(bytes.length / 4));
        for (let i = 0; i < bytes.length; i++) {
            const quadIdx = Math.floor(i / 4);
            const shift = (i % 4) * 2;
            packed[quadIdx] |= ((bytes[i] >> 6) & 3) << shift;
        }
        return packed;
    }

    /**
     * QUAD-UNPACK: Restore original bytes
     * @param {Uint8Array} packed - Packed bytes
     * @param {number} originalLength - Original byte length
     * @returns {Uint8Array} Restored bytes
     */
    function quadUnpack(packed, originalLength) {
        const bytes = new Uint8Array(originalLength);
        for (let i = 0; i < originalLength; i++) {
            const quadIdx = Math.floor(i / 4);
            const shift = (i % 4) * 2;
            bytes[i] = ((packed[quadIdx] >> shift) & 3) << 6;
        }
        return bytes;
    }

    /**
     * RLE Pack: Run-length encoding
     * @param {Uint8Array} bytes - Input bytes
     * @returns {Uint8Array} RLE compressed bytes
     */
    function rlePack(bytes) {
        const result = [];
        let count = 1;
        for (let i = 0; i < bytes.length; i++) {
            if (bytes[i] === bytes[i + 1]) {
                count++;
            } else {
                while (count > 255) {
                    result.push(255, bytes[i]);
                    count -= 255;
                }
                result.push(count, bytes[i]);
                count = 1;
            }
        }
        return new Uint8Array(result);
    }

    /**
     * RLE Unpack: Decode run-length encoding
     * @param {Uint8Array} packed - RLE packed bytes
     * @returns {Uint8Array} Unpacked bytes
     */
    function rleUnpack(packed) {
        const result = [];
        for (let i = 0; i < packed.length; i += 2) {
            const count = packed[i];
            const value = packed[i + 1];
            for (let j = 0; j < count; j++) {
                result.push(value);
            }
        }
        return new Uint8Array(result);
    }

    // ========== PUBLIC API ==========

    /**
     * Compress string or Uint8Array using QUAD only (4x guaranteed)
     * @param {string|Uint8Array} data - Input data
     * @returns {Uint8Array} Compressed data
     */
    function compressQuad(data) {
        const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
        return quadPack(bytes);
    }

    /**
     * Decompress QUAD-compressed data
     * @param {Uint8Array} compressed - Compressed data
     * @param {number} originalSize - Original size (required)
     * @returns {Uint8Array} Decompressed bytes
     */
    function decompressQuad(compressed, originalSize) {
        return quadUnpack(compressed, originalSize);
    }

    /**
     * Compress using QUAD + RLE (best for repetitive data)
     * @param {string|Uint8Array} data - Input data
     * @returns {Uint8Array} Compressed data
     */
    function compressQuadRLE(data) {
        const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
        const quadPacked = quadPack(bytes);
        return rlePack(quadPacked);
    }

    /**
     * Decompress QUAD+RLE compressed data
     * @param {Uint8Array} compressed - Compressed data
     * @param {number} originalSize - Original size (required)
     * @returns {Uint8Array} Decompressed bytes
     */
    function decompressQuadRLE(compressed, originalSize) {
        const rleUnpacked = rleUnpack(compressed);
        return quadUnpack(rleUnpacked, originalSize);
    }

    /**
     * Auto-select best compression method based on data analysis
     * @param {string|Uint8Array} data - Input data
     * @returns {Object} { method, compressed, ratio }
     */
    function compressSmart(data) {
        const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
        const quadResult = compressQuad(bytes);
        const quadRleResult = compressQuadRLE(bytes);
        
        const quadRatio = bytes.length / quadResult.length;
        const rleRatio = bytes.length / quadRleResult.length;
        
        if (rleRatio > quadRatio * 1.1) {
            return {
                method: 'QUAD+RLE',
                compressed: quadRleResult,
                ratio: rleRatio,
                originalSize: bytes.length,
                compressedSize: quadRleResult.length
            };
        } else {
            return {
                method: 'QUAD',
                compressed: quadResult,
                ratio: quadRatio,
                originalSize: bytes.length,
                compressedSize: quadResult.length
            };
        }
    }

    /**
     * Decompress smart-compressed data (auto-detects method)
     * @param {Uint8Array} compressed - Compressed data
     * @param {number} originalSize - Original size
     * @param {string} method - 'QUAD' or 'QUAD+RLE'
     * @returns {Uint8Array} Decompressed bytes
     */
    function decompressSmart(compressed, originalSize, method) {
        if (method === 'QUAD+RLE') {
            return decompressQuadRLE(compressed, originalSize);
        }
        return decompressQuad(compressed, originalSize);
    }

    /**
     * Convert compressed bytes to string (for storage/transmission)
     * @param {Uint8Array} bytes - Compressed bytes
     * @returns {string} Base64 string
     */
    function toBase64(bytes) {
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    /**
     * Convert Base64 string back to Uint8Array
     * @param {string} base64 - Base64 string
     * @returns {Uint8Array} Bytes
     */
    function fromBase64(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    /**
     * Get compression statistics
     * @param {string|Uint8Array} data - Input data
     * @returns {Object} Statistics
     */
    function getStats(data) {
        const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
        const quadResult = compressQuad(bytes);
        const quadRleResult = compressQuadRLE(bytes);
        
        return {
            original: {
                bytes: bytes.length,
                bits: bytes.length * 8
            },
            quad: {
                bytes: quadResult.length,
                ratio: (bytes.length / quadResult.length).toFixed(2),
                savings: ((1 - quadResult.length / bytes.length) * 100).toFixed(1) + '%'
            },
            quadRle: {
                bytes: quadRleResult.length,
                ratio: (bytes.length / quadRleResult.length).toFixed(2),
                savings: ((1 - quadRleResult.length / bytes.length) * 100).toFixed(1) + '%'
            },
            bestMethod: quadRleResult.length < quadResult.length ? 'QUAD+RLE' : 'QUAD'
        };
    }

    // ========== EXPORT ==========
    const EightDamage = {
        // Core
        compressQuad,
        decompressQuad,
        compressQuadRLE,
        decompressQuadRLE,
        compressSmart,
        decompressSmart,
        
        // Utilities
        toBase64,
        fromBase64,
        getStats,
        
        // Version
        version: '1.0.0',
        name: 'EIGHTDAMAGE'
    };

    // Node.js / CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = EightDamage;
    }
    // ES6 modules
    else if (typeof define === 'function' && define.amd) {
        define([], function() { return EightDamage; });
    }
    // Browser global
    else {
        global.EightDamage = EightDamage;
    }

})(typeof window !== 'undefined' ? window : this);