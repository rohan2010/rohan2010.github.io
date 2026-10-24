# bloomScroll

You open YouTube to learn something and the feed pulls you somewhere else. bloomScroll is a Chrome extension that hides the off-topic videos, and nothing you watch leaves your computer.

## How it decides

A cascade, cheapest first:

1. **Rules** settle the obvious titles.
2. **MiniLM embeddings**, running in the browser, compare a title with what you came for.
3. An optional **local model** decides the unclear few.

If no model answers, the video is shown, not hidden. It never hides something it couldn't judge.

## A number I'm proud of

On my 2017 dual-core MacBook Pro, a feed used to take about 39 seconds to settle. Measuring showed the cost tracked prompt length, so I shortened the prompt and added a warm-up: about 2.7 seconds, with no loss in accuracy on a 40-title test feed.

**Stack:** TypeScript, Chrome MV3, Transformers.js + ONNX (MiniLM), a local Python model server, Vitest, Playwright, GitHub Actions.
