---
name: notebook-post
description: Write, import or edit a blog post for the Notebook on Rohan's portfolio (rohan2010.github.io, /notebook/). Use whenever Rohan wants a new post, a guide, a write-up of a project or experiment, a post imported from Medium, or changes to an existing post's text, takeaways, sources, cover or images, even if he just says "blog", "article", "write-up" or "post about X". Covers the interview, the structure, his voice, the entry.json + post.md format, sources, images, the cover motif and the checks.
---

# Writing a Notebook post

The Notebook (`/notebook/`) is Rohan's writing: guides people can follow and experiments he's running. It exists so readers can **learn from what he built and what went wrong**. Prompts and components are not here; they belong on the Playground (see the `playground-item` skill).

A post is a folder: `src/content/notebook/<slug>/entry.json` (the facts) and `post.md` (the text). Images go in `public/notebook/<slug>/`. Adding the folder adds the post: the index, the post page and the RSS feed (`/notebook/feed.xml`) all read from it. You don't need to edit any page code.

## 1. Interview first, write second

Rohan's posts are only worth reading because they're his. Never invent an experience, a result, a number, a quote or a mistake. Before drafting, get these from him (ask in one message, not one at a time):

1. **What's the post for?** One sentence a reader should be able to repeat.
2. **Type:** `Tutorial` (the reader builds something), `Experiment` (he tried something, here's what happened) or `Notes` (lessons from a project).
3. **What he actually did:** the steps, the code or notebook, the setup.
4. **What went wrong, and what he'd do differently.** This is the heart of the site, so ask for it even in a tutorial. One real mistake beats five tips.
5. **The numbers and sources:** results he measured, and links for any claim that isn't his.
6. **Material:** screenshots, a chart, a Colab link, a Medium draft.

If he gives a draft or a Medium post, that text is the post. Edit for format, not for voice (see section 4).

## 2. Structure

```
Opening (no heading): 2–4 short paragraphs. Who it's for, the problem, what we'll do.
## Part 1: <plain name>
## Part 2: …                     ← each Part is one step or one idea
## What went wrong               ← or "What I'd do differently"; required for Experiment and Notes
## Where to go from here?        ← next steps, the notebook link, what's still open
```

- **Opening:** he opens with an address to the reader, such as "Welcome, traveler." / "Welcome back, traveler." (he plays Steam games and the voice nods to them). Keep it if he uses it; don't force it on a post he writes differently.
- **`## Part N: Title`:** these headings feed the contents rail beside the post (the "Part N:" prefix is stripped there), so every top-level section is a `##`. Use `###` inside a Part, never `#`.
- **Length:** a tutorial runs as long as the steps need. An experiment usually reads best at 800–1,500 words.

## 3. entry.json

```json
{
  "type": "Tutorial",
  "title": "The *Empathy* Engine: Fine-Tuning Gemma 3 with LoRA",
  "dek": "One or two sentences: what you'll get from reading it.",
  "date": "2026-10-27",
  "tags": ["Fine-tuning", "LoRA"],
  "motif": "layers",
  "takeaways": ["3 to 4 full sentences a skimmer can act on."],
  "youNeed": ["Tutorials only: accounts, skills, hardware, data."],
  "resources": [{ "label": "Unsloth", "by": "GitHub", "note": "what it's for here", "url": "https://…" }],
  "sources": [{ "label": "Exact article title", "by": "Publisher", "url": "https://…" }],
  "original": { "site": "Medium", "url": "https://medium.com/@rohanpant2010/…" }
}
```

- **`title`:** exactly one word in `*asterisks*`. It's set in Instrument Serif italic and becomes the big word on the cover. Pick the word that carries the idea ("Decide", "Empathy").
- **`date`:** `YYYY-MM-DD`. Posts sort newest first, and the newest one is featured at the top of the index.
- **`takeaways`:** shown as "Key takeaways" above the text and on the featured card. Write them as claims, not teasers ("LoRA trains a thin layer…", not "Learn about LoRA").
- **`resources`:** where to go further (tools, datasets, papers). **`sources`:** where the post's facts and figures come from, numbered on the page. Every number that isn't Rohan's own needs a source. Open each URL before adding it.
- **`original`:** only for a post first published elsewhere. The page credits that site and sets it as the canonical URL, so search engines don't treat this copy as a duplicate.
- **`motif`:** the drawing on the cover, from `MOTIFS` in `src/notebook/Cover.tsx` (today: `decide`, `layers`). A new kind of post usually deserves its own motif. Draw it there in the same style: a few strokes in the tokens, the post's own idea as a small object, no stock images.

## 4. Formatting post.md (and his voice)

- **Keep his wording.** Dry, plain, a little sarcastic. Short sentences. Don't swap in "leverage", "delve", "seamless", "robust", "game-changer" or any other filler, and don't add hype. Keep his spelling as he writes it.
- **Medium imports** come in as one-line paragraphs. Merge the lines that belong together into real paragraphs, and turn runs of parallel lines into lists, without rewording.
- **Callouts:** use `> [!NOTE] Optional title`, `> [!TIP] …` or `> [!CAUTION] …` on the first line, with the body on the next `>` lines. They render as a fully bordered box. Never imitate a callout with a tinted block or a left accent bar; that look reads as AI-made, and Rohan has rejected it. Use at most a few per post, for what a reader must not miss.
- **Code:** fenced, with a language (` ```python `). Every block gets a Copy button automatically. Inline code copies on click.
- **Images:** `![alt](/notebook/<slug>/name.png)`, with the file in `public/notebook/<slug>/`. The alt text says what the image shows; for a chart, include the actual numbers. Keep files web-sized (under about 300 KB; PNG for charts, JPG/WebP for photos) and strip photo metadata.
- **Links:** inline Markdown links. Write the link text as what you'll get, not "here".
- **Never name his employer.** Write "my day job" instead. The résumé numbers are fine without the name.

## 5. Check it

1. `npm run check`: validates every post's fields, motif, images and the employer rule, and every Playground item.
2. `npx next build`: the post must build into `out/notebook/<slug>/`.
3. Open `/notebook/` and `/notebook/<slug>/` in a real browser (Playwright) at desktop and phone width. Check the cover, the contents rail, each callout, the images, and that nothing scrolls sideways.
4. Show Rohan the post before committing. Commits never carry Claude attribution.
