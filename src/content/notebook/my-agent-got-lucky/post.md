I asked a small AI model on my Mac to email a file.

> Email report.pdf to Sarah (sarah@example.com).

It has no email tool and no internet, so the right answer is "I can't do that." The first time, it got this right in a
single step: it found the file, said it had no way to send email, and told me how to do it myself.

Then I ran the exact same setup again. Same model, same task, same files, same settings. This time it tried `mail`. Then
`mail` with different flags. Then `sendmail`. Then it checked which mail programs were installed, and tried `mailx`. It
used all 20 of its steps trying to send an email it had no way to send, and never told me it couldn't. (It was in a
sandbox with no network, so nothing went out.)

That pair of runs is the whole story of the last few weeks for me. I set out to make a small local model dependable at
everyday file tasks. What I actually learned was how to tell when it had improved, and how often it hadn't.

## The setup

The model is Qwen3.5-4B, 8-bit, running locally on a Mac through Apple's MLX. I gave it a shell and a few file tools
and a set of small, real tasks of the kind I'd want help with: sort a downloads folder, delete duplicate files, turn
invoices into a CSV, rename a CSS class across a website, fix broken links, answer a question from a spreadsheet,
refuse things it can't do. Each task can be generated many times with different files (a "seed"), and a script checks
the actual files at the end, not what the model says it did.

Then I started changing things around the model (better tools, reminders, checks) and measuring whether it got better.

## The +5 points that weren't

One of my first ideas was to make the agent check its own work before saying it was done, and to warn it when it was
running out of steps. On 120 tasks:

| Setup | Tasks passed (of 120) |
|---|---|
| Plain setup | 69 |
| Plain setup + self-check + recovery | **75** |

Six more tasks passed: five points. I was ready to keep it.

Before I did, I ran the plain setup a second time. Nothing changed: same code, same tasks, same settings.

| Setup | Tasks passed (of 120) |
|---|---|
| Plain setup, run 1 | 69 |
| Plain setup, run 2 | **65** |

The setup I hadn't touched moved by four tasks on its own. Underneath the totals it was worse: **26 of the 120 tasks
flipped**, passing in one run and failing in the other. My "+5 points" was smaller than the gap between two runs of the
same thing. I dropped the self-check.

![Grid of 12 tasks by 10 versions, the same setup run twice. 26 of 120 results flipped: 15 passed then failed, 11 failed then passed. Run 1: 69 passed. Run 2: 65 passed.](/notebook/my-agent-got-lucky/1-same-setup-twice.png)

## Same score, different answers

A few days later I tried a different idea: have the agent keep a checklist and re-read it as it works. It scored 30 out
of 130 tasks. So did the version without the checklist: 30 vs 30. No change, I thought.

Then I looked at which tasks passed. **19 tasks passed only with the checklist, and 19 different tasks passed only
without it.** Same total, very different results. The checklist did change the agent's behaviour. It just broke as many
things as it fixed, and the total hid all of it.

That's when I stopped trusting totals.

## "Fine, I'll turn the randomness off"

The obvious explanation is sampling. Models pick each word with some randomness (the "temperature"), so of course two
runs differ. Set the temperature to zero, always take the most likely word, and the runs should match.

They don't. I ran 50 tasks from a public tool-use benchmark (BFCL) twice with the randomness off, eight at a time. **Only 25 of the 50 came
out identical.** When I changed how many tasks ran at once, nearly every answer changed.

This one sent me reading, and it turns out it's well known and fairly recent:

- When a model runs several requests together (a batch), the computer adds up the same numbers in a different order.
  Floating-point addition isn't exactly associative, so the order changes the last digits of the result. A 2025
  paper found that with greedy decoding, just changing the batch size, the number of GPUs or the GPU type moved a
  7B reasoning model's accuracy by up to **9%**, and its answer length by up to 9,000 tokens
  ([Yuan et al., arXiv 2506.09501](https://arxiv.org/abs/2506.09501)).
- Thinking Machines showed in September 2025 that the main cause is that common inference kernels give different
  results depending on batch size, and built "batch-invariant" kernels that make the output identical every time, at a
  speed cost (["Defeating Nondeterminism in LLM Inference"](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/); [Simon Willison's summary](https://simonwillison.net/2025/Sep/11/defeating-nondeterminism)).

A tiny difference in the last digits only matters when two words are almost tied. But an agent makes hundreds of
choices per task, and in one of my runs the two versions matched for 27 messages, then split at message 28 on exactly
such a near-tie. After that they were two different agents, taking different steps for the rest of the task. A chatbot answer that differs by one word is still the same answer. An agent that takes a different step at
message 28 has a different future.

## Where the noise actually came from

Once I went looking, I found four separate sources, and only one of them was the one everybody talks about.

1. **Sampling randomness.** The temperature. Expected, and easy to control with a fixed seed... if each task gets its
   own seed. Mine first shared one random stream across the batch, so the order in which tasks finished changed every
   other task's random numbers.
2. **The machine's maths.** Batching changes the arithmetic, as above. On my Mac I couldn't make this go away for
   batched runs; I could only keep the batch size fixed whenever I compared two setups.
3. **The environment leaking in.** This one surprised me most. When the agent listed files, the output included each
   file's modified time, and that was the real clock time of the run. Every run showed the model slightly different
   text, so every run was a slightly different task. Absolute file paths (which differ depending on where a run was
   stored) did the same.
4. **Small test sets.** Even with all of the above fixed, a few dozen tasks is a small sample. And tasks aren't
   independent: if the model can't do a task, it usually can't do it on any seed.

## What I fixed

For the first three, I could make runs repeatable:

- every task gets its own random seed, independent of the batch;
- a fake clock: file times are set by the step number, not the wall clock, so the model never sees real time;
- file paths rewritten to relative ones, so the model's view doesn't depend on where the run is stored.

After that, the same setup run twice, one task at a time with the randomness off, gave **13 of 13 tasks
byte-for-byte identical**, every message and every tool call. That doesn't make the model better. It means that when
something changes, I know it was my change.

## How I measure now

For the fourth source, the fix isn't in the code. It's in how you compare.

- **Run the unchanged setup twice** (an "A/A" run). The difference between the two is your noise. Any improvement
  smaller than that is not an improvement.
- **Compare task by task, not totals.** Run both versions on exactly the same tasks and seeds, and count the tasks that
  flipped each way. 30 vs 30 with 19 flips each way is not "no change".
- **Group by task when you judge.** In one recent comparison, my setup beat the plain model by 21 points and a standard
  test said that was unlikely to be luck (p = 0.04). But those results came from just 12 tasks, four versions each, and
  seeds of the same task tend to pass or fail together. Grouping the results by task, the honest way, the same result
  gave **p = 0.22**: quite possibly luck. Same data, a third of the evidence I thought I had.
- **Decide what counts before you look.** Write down which tasks a change should help and how much would be worth
  keeping, then run it. Afterwards, every pattern looks like it was the point.
- **Keep some tasks you never tune on**, and confirm the final result there.

![Change in tasks passed, my setup minus the plain model, out of 4 tries per task: Fix broken links +4, Invoices to CSV +4, Spending question +2, Refuse missing file, Organise photos, Rename a CSS class and Find a file each +1, three tasks 0, Refuse send an email -1, Delete duplicates -3. Total +10 of 48. Counting each try as independent: p = 0.04. Grouping tries by task: p = 0.22.](/notebook/my-agent-got-lucky/2-gain-from-two-tasks.png)

## The part nobody has solved

All of that is about measuring the model honestly. It doesn't change the model. And the model itself really is
inconsistent: given three tries at each task, it passed **59% of tasks on the first try, but only 43% on all three**.
It can do most of these tasks. It just doesn't do them every time.

![Share of 120 tasks solved with three tries at each: 73% in at least one of three tries, 59% in a single try, 43% in all three tries.](/notebook/my-agent-got-lucky/3-one-try-vs-every-try.png)

This is not a small-model problem. The τ-bench paper introduced a measure for exactly this, pass^k: the chance an agent
succeeds on all k tries of the same task. GPT-4o, on its retail customer-service tasks, succeeded on all 8 tries less
than 25% of the time ([Yao et al., τ-bench](https://arxiv.org/abs/2406.12045)). Benchmarks usually report
the first try, which is the flattering number.

What helped me a little: the model often finished a task wrong and said "Done!" anyway. A report showing it the mistake
didn't work: in one test the report pointed out the mistake in 25 episodes, and the model fixed it in none of them. What did work, in a small test, was blocking
"done" with one concrete sentence naming the exact problem (something like "a row in invoices.csv has 4 fields, the
others have 3").
On the task where it always failed, it then fixed the file 5 times out of 5. That's a small run, so it's a lead, not a
result. But it pointed the same way as everything else: a small model doesn't need more instructions; it needs fewer,
sharper ones, at the moment they matter.

## If you're testing an agent

1. Run your unchanged setup twice before you trust any improvement. The gap is your noise.
2. Give every task its own seed, and keep clocks, paths and anything else environmental out of the model's view.
3. Compare the same tasks in both versions and count flips, not totals.
4. Judge by task, not by episode: ten seeds of one task are not ten independent results.
5. Report how often it succeeds on every try, not just the first one.

My agent didn't get better that night in November. It got lucky. The hardest part of this project hasn't been making a
small model smarter. It's been learning to tell the difference.

> [!NOTE] About the numbers
> All numbers are from my own runs on in-house tasks with Qwen3.5-4B (8-bit, MLX) on a Mac, except where a paper is cited. The 120-task, 130-task and 50-task results are from development runs; the 59% / 43% figure is from a pre-registered test on held-back seeds; the p = 0.04 / 0.22 comparison and the 5 of 5 result are exploratory.
