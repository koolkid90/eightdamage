# eightdamage

![algo](./eight-demo.png)

QUAD (4x) + RLE (2x) = 8x compression · Guaranteed 4x on any data

What is EIGHTDAMAGE?

EIGHTDAMAGE is a lightweight, lossless compression algorithm that works in two stages:

    QUAD-PACK (4x guaranteed) – packs 2 bits into 1 digit (0-3), then 4 digits into 1 byte

    RLE (optional 2x) – adds run-length encoding for extra compression on repetitive data

Result: Guaranteed 4x compression on ANY data. Up to 500x+ on repetitive patterns.

## 🚀 Quick Start

### Installation

```bash
npm install eightdamage

Or include directly in browser

<script src="eightdamage.js"></script>

Basic Usage

const EightDamage = require('eightdamage');

// Your data
const original = "Hello World! This is a test message.";

// Compress with QUAD (guaranteed 4x)
const compressed = EightDamage.compressQuad(original);
console.log(`${original.length} → ${compressed.length} bytes`);

// Decompress
const decompressed = EightDamage.decompressQuad(compressed, original.length);
console.log(new TextDecoder().decode(decompressed));

Author: Pavel Bobkin
Github: koolkid90


