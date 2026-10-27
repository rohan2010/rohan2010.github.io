## problem

Preference datasets decide what a language model learns to prefer, and they get reused a lot. When the paper was written, Anthropic's hh-rlhf alone had been downloaded at least 109,200 times and used to train or fine-tune more than 156 models.

Every preference in those datasets is a judgment call by an annotator, human or AI. Very little research had asked which human values those calls add up to, so a team training on them couldn't say what it was teaching.

## arrangement

Two phases, the second built on the first. In phase one, people did the work: a taxonomy of seven human values, drawn from the ethics literature, became the codebook for hand-labelling 6,501 preferences sampled from hh-rlhf.

In phase two, a model did the work. Those labels trained a RoBERTa classifier, which then labelled three datasets in full: hh-rlhf (338,704 preferences, chosen and rejected), OpenAI WebGPT Comparisons (19,578) and Alpaca GPT-4-LLM (52,002). Last, people checked 500 of the classifier's labels by hand.

## detail-a

The categories come from the literature, not from the data or from intuition. The team searched nine journals in moral philosophy, axiology and Science, Technology & Society for "human value", with no date limit. Each paper was given a value by its central theme, and the values were grouped from the bottom up. Then two more checks: every sub-value really is part of its group (trustworthiness under Duty & Accountability, say), and each group sits within one ethical paradigm.

That gave seven values: Information Seeking, Wisdom & Knowledge, Duty & Accountability, Civility & Tolerance, Empathy & Helpfulness, Well-being & Peace, and Justice & Human/Animal Rights.

Before the main labelling, five annotators with backgrounds in ethics, computing and HCI each coded the same 200 preferences on their own. Their agreement was 0.85 on Krippendorff's alpha, high enough to show the taxonomy could be applied consistently.

## detail-b

Labelling stopped at 6,501 preferences by hand. The three datasets hold more than 400,000, so the hand labels became training data for a RoBERTa sequence classifier. Training ran on the Hugging Face Trainer with an 80/20 split, 128-token inputs, batches of 64, and up to 8 epochs with early stopping.

The labels are lopsided (2,403 Information Seeking against 203 Justice & Rights), so training used class weights and weighted random sampling. Five of the seven values scored an F1 above 0.8. The two weak ones, Empathy & Helpfulness (0.629) and Well-being & Peace (0.649), were among the rarest in the hand labels. When people checked 500 of the classifier's outputs, it had picked the right value 84% of the time.

## findings

Information and usefulness dominate. Justice and rights barely register. That pattern holds in all three datasets.

- **In the 6,501 hand-labelled preferences:** Information Seeking 36.96% and Wisdom & Knowledge 30.75%, against Well-being & Peace 5.94% and Justice & Human/Animal Rights 3.12%.
- **Wisdom & Knowledge was the most common value in every dataset:** WebGPT 78.17%, Alpaca GPT-4 66.56%, hh-rlhf chosen 33.84%, hh-rlhf rejected 33.71%.
- **Justice & Human/Animal Rights was the least common in every dataset:** WebGPT 0.04%, Alpaca GPT-4 0.17%, and 1.76% in both halves of hh-rlhf.
- **Some harmful replies were marked as preferred.** The hand labelling found unethical responses in hh-rlhf's "chosen" column, the side a reward model learns to favour. That's a reason to audit preference data before training on it.

The same figures show something else: the chosen and rejected halves of hh-rlhf have almost the same mix of values. At the level of these seven categories, the replies people preferred and the ones they rejected look alike.

All numbers are from the paper (Obi et al., NeurIPS 2024). [Read the paper](https://arxiv.org/abs/2411.11937), or get the hand-labelled set and the classified datasets from [the paper's repository](https://github.com/hv-rsrch/valueimprint) (CC BY 4.0).

## try-it

The classifier reads a preference and scores it against the seven values. The third one is the kind it gets wrong: it reaches for Information Seeking, the most common value, and a person relabels it as Justice & Rights. Then the audit, with the paper's own figures.

## around

The paper names its limits. A preference often carries more than one value, and picking the dominant one is a judgment call. The taxonomy leans Western, like the journals it came from and the three datasets. And it doesn't fit specialised preference data such as code or maths.

Value Imprint was published in the Datasets and Benchmarks track at NeurIPS 2024 and presented as a spotlight poster. Ike Obi led the work as first author. The co-authors were me (second author), Srishti Shekhar Agrawal, Maham Ghazanfar and Aaron Basiletti, all at Purdue University, where I was doing my M.S. in Human-Computer Interaction.
