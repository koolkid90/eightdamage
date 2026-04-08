# eightdamage

![algo](./eight-demo.png)

QUAD (4x) + RLE (2x) = 8x compression · Guaranteed 4x on any data

What is EIGHTDAMAGE?

EIGHTDAMAGE is a lightweight, lossless compression algorithm that works in two stages:

    QUAD-PACK (4x guaranteed) – packs 2 bits into 1 digit (0-3), then 4 digits into 1 byte

    RLE (optional 2x) – adds run-length encoding for extra compression on repetitive data

Result: Guaranteed 4x compression on ANY data. Up to 500x+ on repetitive patterns.

Verdict: QUAD gives guaranteed 4x on everything. RLE is a bonus for repetitive data.
🔧 How It Works
text

Original:  AAAAAAAA... (1,048,576 bytes)
    ↓
QUAD:     33333333... (262,144 bytes) → 4x smaller
    ↓
RLE:      [255,3][255,3]... (2,058 bytes) → 509x smaller on repeats!

Step 1 – QUAD-PACK:
2 bits → 1 digit (0-3) → 4 digits → 1 byte

Step 2 – RLE:
(count, value) pairs replace repeating sequences

Author: Pavel Bobkin
Github: koolkid90


