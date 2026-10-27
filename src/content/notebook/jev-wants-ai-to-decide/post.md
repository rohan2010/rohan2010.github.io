Welcome back, traveler.

For the last few years, we have become very good at making AI **talk**. Ask ChatGPT to explain quantum computing. Ask Claude to debug your React application. Ask Gemini to summarize a hundred-page document.

Large Language Models have become surprisingly good at taking messy human language and turning it into something useful. But there is an interesting problem.

Sometimes, we don’t actually need AI to **write anything**. We just need it to make a decision.

## Part 1: LLMs Changed How We Work

An LLM works by generating tokens.

You give it:

> *“A customer says checkout has failed three times and they are losing sales.”*

An LLM might respond:

> *“This appears to be a high-priority technical issue. I recommend escalating this to the engineering team.”*

That response is useful for a human. But imagine you are building software. Your application probably doesn’t need the paragraph. It needs something closer to:

```
team = engineering
priority = high
escalate = true
```

Today, developers often use an LLM, ask it to return JSON, validate that JSON, handle failures, retry if necessary, and finally extract the decision.

> [!NOTE]
> That feels a little like hiring a novelist every time you need someone to press **Yes or No**.

And this is where Jev becomes interesting.

## Part 2: What is Jev?

Jev is [TypeSafe AI’s](https://typesafe.ai/blog/introducing-system-one-models-and-jev) first **System One Model**.

Instead of generating sentences, Jev takes some state and answers predefined questions using structured outputs.

For example:

**State**

> *Checkout has been failing for the customer for three days.*

**Questions**

- Department?
- Urgency?
- Should we escalate?

Jev can return something conceptually like:

```
department → engineering
urgency → high
escalate → 91% yes
```

The important difference is that these are not sentences that your program later needs to understand. **They are the output.**

Jev currently works around three decision primitives: choosing between predefined options, scoring something on a scale, and assigning a probability to a yes/no question. It also returns probabilities and confidence information with its decisions.

That doesn’t mean Jev cannot be wrong. It can. What it cannot do is suddenly return an unexpected essay when your software asked it to choose between frontend, backend, and design. The answer space is constrained by the developer.

## Part 3: Why Is Jev Suddenly Getting Attention?

Jev was released on September 15, 2026, so calling it an established technology would be premature.

But developer interest has been unusually fast.

[Vercel reported](https://aiweekly.co/alerts/typesafes-jev-hits-13-of-vercel-paid-teams-in-24-hours) that within 24 hours of Jev appearing on its AI Gateway, nearly **13% of its paid teams had used it**, more than twice the adoption of any previous model launch on the platform.

[Cloudflare has already exposed Jev](https://ts2.tech/en/jev-reaches-13-of-vercel-paid-teams-as-cloudflare-adds-typesafes-model/) through Workers AI, and LangChain has started experimenting with it inside agent workflows and evaluation systems.

I think the reason is relatively simple.

AI agents make **a lot of small decisions**:

- Which tool should I use?
- Should I retry?
- Is this answer good enough?
- Which agent should handle this?
- Does a human need to review this?

Today we frequently send each of those questions to a large generative model. That works. But it may be far more intelligence than the decision actually requires.

## Part 4: LLM vs. LLM + Jev

This is where we need to be careful with the numbers.

> [!CAUTION]
> There is currently no broad independent study proving that **Claude Code + Jev > Claude Code** for software development in general. That is actually one of the experiments I want to run.

What we *do* have are some interesting early results.

[TypeSafe’s own workflow experiments](https://typesafe.ai/blog/introducing-system-one-models-and-jev) report headline results of up to **193.6× faster** and **444.6× cheaper** than LLM-based approaches for the System-One-shaped workflows they tested.

Even TypeSafe notes that these figures are likely toward the **higher end of real-world improvements**, so they should not be treated as universal numbers.

More interestingly, LangChain recently ran [its own small experiment](https://www.langchain.com/blog/jev-agent-evals-langsmith) using Jev as an evaluator for AI agents.

On their binary evaluation task, Jev agreed with the human reference on all **500 repeated decisions**. GPT-5.6 Terra scored 99.8%, GPT-5.6 Luna 96.4%, and Claude Sonnet 4.6 scored 80%.

Jev’s continuous scores also showed **92× to 913× lower variance** than the LLM judges tested, while averaging about **$0.00035 per call** and **0.44 seconds**.

That is impressive. But the test was intentionally narrow: five fixed weather-agent examples repeated many times. LangChain itself describes the results as promising but early, and [the benchmark code is public](https://github.com/danielgshea/jev-as-a-judge).

![Bar chart of LangChain's narrow agent-evaluator test, agreement with a human oracle: Jev 100%, GPT-5.6 Terra 99.8%, GPT-5.6 Luna 96.4%, Claude Sonnet 4.6 80%. Five fixed weather-agent cases, 100 repetitions each; not a general model benchmark.](/notebook/jev/figure.png)

So I don’t think the interesting question is:

> ***Jev or LLM?***

I think it is:

> ***Which decisions actually require an LLM?***

Imagine an AI coding system. The LLM can still understand the user’s request, reason about architecture, write code, debug problems, and explain what changed.

But Jev could potentially handle the repetitive decisions around it:

- Which agent should handle this?
- Is this change risky?
- Should the agent continue or stop?
- Does this output satisfy the requirement?
- Should we ask the developer for clarification?

The architecture starts looking less like one giant AI brain and more like a software system:

| Layer | Its job |
| --- | --- |
| **LLM** | reason and create |
| **Jev** | classify and decide |
| **Code** | enforce the rules |

That combination is what interests me.

## Part 5: My Experiment Starts Here

I have just started experimenting with Jev. One of the things I want to test is whether placing Jev between a user’s request and an AI coding agent can improve consistency.

Instead of giving Claude Code a prompt and allowing it to make every decision internally, the idea is to separate some decisions explicitly.

For example:

```text
A  Prompt → Jev → structured project decisions → Claude Code → implementation
B  Prompt → Claude Code → implementation
```

Same prompt. Same environment. Different architecture.

I’ll be measuring things such as:

- development time
- cost
- consistency between runs
- number of revisions
- the quality of the final implementation

Maybe Jev makes the workflow substantially better. Maybe the extra decision layer adds complexity without enough benefit. That is the fun part. We don’t know yet.

So rather than declaring that System One Models are the future of AI, I’m going to build with one and measure what actually happens.

**More results soon.**
