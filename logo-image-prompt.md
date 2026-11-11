# Canary logo: image prompt

Paste this into your image generator. Ask for a PNG on a plain flat background, then send it back and I will cut the background out (anti-aliased silhouette mask), embed it as a base64 data URI and use it in the header and favicon.

**Prompt**

> A hand-cut paper canary in profile, mid-song, beak open, head tilted slightly up. Risograph print look: flat overprinted ink layers in canary yellow (#FFD23F) and ink navy (#14213D), a touch of tomato orange (#F2842C) on the beak, slight colour misregistration between the yellow fill and the navy outline, subtle halftone dots on the wing, soft paper grain. A tiny brass cage-door hook sits behind the bird, partly cut out of the same paper. Original character, plump round body, small bright eye with a white glint, simple tail. Centred, flat front-on silhouette, generous margin, plain solid cream (#FFF6DC) background, no text, no shadow on the background, no gradients, no 3D render, no cartoon mascot styling, not based on any existing bird character or brand. Must stay readable when shrunk to 16 pixels: the head and beak should work on their own.

**Negative prompt** (if supported): shield, padlock, dog, robot, neon, purple gradient, glassmorphism, dark background, text, watermark, existing cartoon characters.

**Notes**
- The current mark is an original SVG in `logo.svg` (full mark) and `logo-favicon.svg` (head and beak only, readable at 16px).
- When you send the PNG back, I will replace the SVG mark in the header, footer and favicon with it.
