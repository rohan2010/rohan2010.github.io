# Value Imprint

Before a model is aligned with "human preferences", whose values are actually in that data?

We built a two-phase pipeline to find out. First, an ethics-based taxonomy of human values, mapped onto **6,501 curated RLHF annotations**. Then a transformer classifier trained on them, used to audit real alignment datasets: Anthropic's hh-rlhf, OpenAI's WebGPT and Alpaca GPT-4.

**What we found:** the data leaned toward information and usefulness over prosocial values.

The datasets are open-sourced. Published at NeurIPS 2024 (Datasets & Benchmarks track); I'm second of five authors.
