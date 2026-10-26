## problem

A filter that judges every video by topic needs to see every title you're shown. A hosted "focus" service would mean sending that to someone's server. bloomScroll makes the call on your own computer instead.

It reads the title and channel of each video on the page and asks one question: is this what I came for? Off-topic videos dissolve and the gap closes. A "hidden" list shows what was removed and why, with one click to bring a video back.

## arrangement

Each video goes through a cascade, and the cheapest stage that is sure decides. Your own corrections come first, then cached decisions. Rules settle the obvious titles. MiniLM embeddings, running in the browser, compare a title with your topics and with a few off-topic examples. An optional local model, run as a small server on the same machine, decides the unclear few.

On the 40-title test feed, rules and embeddings settled 35 videos in 261 ms. The local model took the other 5. When you show or hide a video by hand, that label is checked before anything else on later visits. That's the loop in the diagram.

The local model is Laya, an existing model installed from PyPI. The repo holds everything around it: the extension, the cascade, a one-command setup script and the tests. A hosted model is available as an opt-in, and Settings shows a warning while it's on, because titles then leave the machine.

## detail-a

If no model answers, the video is shown, not hidden. The filter never hides something it couldn't judge.

Those "shown because nobody answered" verdicts aren't cached, so the tiles are asked again once the model is reachable. The other stages lean the same way. A keyword can show a video, but a missing keyword never hides one. Calibration re-tunes the cutoffs from your own corrections, and counts a wrongly hidden video twice as much as a wrongly shown one.

## detail-b

The embeddings run in the browser, with Transformers.js and ONNX. A Chrome extension's service worker can't run WebAssembly, so the model lives in an offscreen document. If a message to it goes unanswered, the worker recreates the document and retries once. Topic vectors are kept in IndexedDB, so a worker restart doesn't recompute them.

Cached decisions are keyed on a hash of everything they depend on: topics, thresholds, prompt version and backend. Change a setting and the stale answers stop matching on their own.

## test-record

- **The feed took 39 seconds to settle** on my 2017 dual-core MacBook Pro. Measuring showed the cost tracked prompt length, about 6.5 ms per token, because the model re-reads the whole question for every tile. Bigger batches didn't help. A shorter prompt took it from 980 to 394 ms per tile, with the same AUC (1.000) on the 40-title test feed.
- **The first tile was slow after a pause:** macOS paged the idle model server out, 7.3 s cold against 0.47 s warm. The extension now sends a one-tile warm-up when YouTube opens.
- **A faster model I didn't ship:** int8 quantization was about 30% faster but flipped 16 of 40 decisions, so the model stays at fp32.
- **On an Apple M4,** a tile costs about 24 ms instead of 394. fp16 there was no faster, held about 1 GB more GPU memory and made a score depend on batch size, so it runs in fp32.
- **CI runs on every push to main and every pull request:** type checks, unit tests, a build, and end-to-end tests in Chromium with Playwright.

## try-it

A made-up feed for someone learning Rust. Press run and each title is settled by the cheapest stage that's sure. Off-topic ones dissolve, and one the model can't answer stays. The titles, scores and verdicts are invented for the demo; the real extension runs on YouTube.
