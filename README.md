# QR Code Generator

A simple, fast QR code generator that runs in the browser. Type something, get a QR code, download it. That's pretty much it.

## Features

- Generates QR codes instantly as you type
- Presets for URLs, plain text, email, phone numbers, and Wi-Fi credentials
- Custom foreground and background colours
- Download as PNG (up to 1024×1024) or SVG
- Works well on mobile

## Stack

- [Next.js](https://nextjs.org) — framework
- [Tailwind CSS](https://tailwindcss.com) — styling
- [qrcode](https://github.com/soldair/node-qrcode) — QR generation
- Deployed on [Vercel](https://vercel.com)

## Running locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).
