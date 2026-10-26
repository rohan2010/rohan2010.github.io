# bloomScroll

You open YouTube to learn something and the feed pulls you somewhere else. bloomScroll is a Chrome extension that hides the off-topic videos. By default it decides on your own computer, so nothing you watch is sent anywhere.

## How it decides

A cascade. The cheapest stage that is sure wins:

1. **Your corrections**, then cached decisions.
2. **Rules** settle the obvious titles.
3. **MiniLM embeddings**, running in the browser, compare a title with what you came for.
4. A **local model** (Laya, run as a small server on the same machine) decides the unclear few.

If no model answers, the video is shown, not hidden. It never hides something it couldn't judge.

## A number worth a look

On my 2017 dual-core MacBook Pro, a 40-title test feed took about 39 seconds to settle. Measuring showed the cost tracked prompt length, so I shortened the prompt and added a warm-up: 2.7 seconds, same accuracy on the same feed.

**Status:** early release. Built and tested on macOS, installed unpacked, not on the Chrome Web Store.

**Stack:** TypeScript, Chrome MV3, Transformers.js + ONNX (MiniLM), IndexedDB, a local Python model server, Vite, Vitest, Playwright, GitHub Actions.

**Code:** https://github.com/rohan2010/bloomScroll
