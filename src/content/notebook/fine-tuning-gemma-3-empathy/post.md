Welcome, traveler. You stand at the threshold of modern AI development. Perhaps you’ve used ChatGPT or Gemini, and you’ve thought, *“This is great, but I wish it knew exactly how to handle my specific data.”*

Today, we are going to build exactly that. We aren’t just running a model; we are teaching it.

Our goal is to take **Gemma 3** and fine-tune it using **[Unsloth](https://github.com/unslothai/unsloth)** (a library that makes training 2x faster and uses 60% less memory). We will turn a standard model into an empathetic mental health assistant using the **[MentalChat16K](https://huggingface.co/datasets/ShenLab/MentalChat16K)** dataset.

> [!CAUTION] Before you build
> A small model fine-tuned on a few thousand conversations is a way to learn fine-tuning, not a support service. Don’t put it in front of people who need real help.

Grab your coffee. Open Google Colab. Let’s begin.

## Part 1: The Setup (Laying the Foundation)

Before we can build, we must prepare our environment. Fine-tuning used to require massive server farms. Now, thanks to **Unsloth**, we can do it on the free tier of Google Colab.

### The Installation

First, we need to install the Unsloth library and a few specific dependencies (like `xformers` and `trl`).

> [!NOTE] The logic
> The code below automatically detects if you are in Google Colab and installs the correct version of PyTorch and Xformers. This ensures your GPU runs as efficiently as possible.

```python
import os, re
# Check if we are in Google Colab
if "COLAB_" not in "".join(os.environ.keys()):
    !pip install unsloth
else:
    # If in Colab, install specific versions for stability and speed
    import torch; v = re.match(r"[0-9]{1,}\.[0-9]{1,}", str(torch.__version__)).group(0)
    xformers = "xformers==" + ("0.0.33.post1" if v=="2.9" else "0.0.32.post2" if v=="2.8" else "0.0.29.post3")
    !pip install --no-deps bitsandbytes accelerate {xformers} peft trl triton cut_cross_entropy unsloth_zoo
    !pip install sentencepiece protobuf "datasets==4.3.0" "huggingface_hub>=0.34.0" hf_transfer
    !pip install --no-deps unsloth
!pip install transformers==4.56.2
!pip install --no-deps trl==0.22.2
```

## Part 2: Summoning the Model

We are using **[Gemma 3 (270M)](https://huggingface.co/unsloth/gemma-3-270m-it)**.

- **Why 270M?** It is lightweight and incredibly fast. It’s perfect for learning the *mechanics* of fine-tuning without waiting hours for results.
- **The Trick:** We load the model, but we don’t load the whole heavy thing into memory at full resolution. (Though in this specific script, `load_in_4bit` is set to `False` because the model is already small enough! For larger models like 8B, you would set this to `True` to save memory).

```python
from unsloth import FastModel
import torch

max_seq_length = 2048 # The length of text the model can read at once
model, tokenizer = FastModel.from_pretrained(
    model_name = "unsloth/gemma-3-270m-it", # The base model
    max_seq_length = max_seq_length,
    load_in_4bit = False, # Set to True if using a larger model (e.g., 8B)
    load_in_8bit = False,
    full_finetuning = False,
)
```

## Part 3: The Magic of LoRA (Low-Rank Adaptation)

Here is a secret: We aren’t actually retraining the *entire* brain of the model. That would take months.

Instead, we use **[LoRA](https://arxiv.org/abs/2106.09685)**. Imagine sticking a transparent layer of sticky notes over a textbook. You write your new notes on the sticky layer. The original textbook stays the same, but when you read it, you see your new notes combined with the old knowledge.

This makes the model updateable with tiny amounts of computing power.

```python
model = FastModel.get_peft_model(
    model,
    r = 128, # The "Rank". Higher numbers = more capacity to learn new things, but slower.
    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj",
                      "gate_proj", "up_proj", "down_proj",], # The layers we are sticking notes to
    lora_alpha = 128,
    lora_dropout = 0,
    bias = "none",
    use_gradient_checkpointing = "unsloth", # Unsloth optimization for long contexts
    random_state = 3407,
)
```

## Part 4: Preparing the Curriculum (Data Prep)

A model is only as good as what it reads. We are using `ShenLab/MentalChat16K`, a dataset of mental health conversations.

However, the model doesn’t understand raw CSV files. It understands **Chat Templates**. Gemma 3 has a very specific way of speaking:

```text
<start_of_turn>user
Hello<end_of_turn>
<start_of_turn>model
Hi<end_of_turn>
```

### Step 4a: Loading the Data

```python
from datasets import load_dataset
dataset = load_dataset("ShenLab/MentalChat16K", split = "train[:10000]") # Using 10k examples
```

### Step 4b: Formatting the Data

We need to map the columns `instruction`, `input`, and `output` into the standard "User/Assistant" format.

- **System Prompt:** We tell the model *who* it is (“You are an empathetic mental health assistant”).
- **User Input:** We combine the instruction and the input.
- **Assistant Output:** This is the ideal empathetic response we want the model to learn.

```python
def convert_to_chatml(example):
    # Set the persona
    system_content = example.get("instruction") or "You are an empathetic mental health assistant."

    # Combine instruction and input
    if example.get("input"):
        user_content = f"{example['instruction']}\n\n{example['input']}"
    else:
        user_content = example["instruction"]
    # Structure it for the model
    return {
        "conversations": [
            {"role": "system", "content": "You are a helpful and empathetic mental health support assistant."},
            {"role": "user", "content": user_content},
            {"role": "assistant", "content": example["output"]}
        ]
    }
dataset = dataset.map(convert_to_chatml)
```

### Step 4c: Applying the Gemma 3 Template

Finally, we apply the Unsloth tokenizer to convert that structure into the actual text tokens the model reads.

```python
from unsloth.chat_templates import get_chat_template

tokenizer = get_chat_template(tokenizer, chat_template = "gemma3")
def formatting_prompts_func(examples):
    convos = examples["conversations"]
    texts = [tokenizer.apply_chat_template(convo, tokenize = False, add_generation_prompt = False).removeprefix('<bos>') for convo in convos]
    return { "text" : texts, }
dataset = dataset.map(formatting_prompts_func, batched = True)
```

## Part 5: Training the Model

We use the [`SFTTrainer`](https://huggingface.co/docs/trl/sft_trainer) (Supervised Fine-Tuning Trainer).

> [!TIP] Crucial technique: training on responses only
> We use `train_on_responses_only`. Why? Because we don't need the model to learn how to ask the user's questions (the input). We only want to grade it on how well it writes the *answers*. This makes training significantly sharper and more efficient.

```python
from trl import SFTTrainer, SFTConfig
from unsloth.chat_templates import train_on_responses_only

trainer = SFTTrainer(
    model = model,
    tokenizer = tokenizer,
    train_dataset = dataset,
    args = SFTConfig(
        dataset_text_field = "text",
        per_device_train_batch_size = 8,
        gradient_accumulation_steps = 1,
        warmup_steps = 5,
        num_train_epochs = 1, # One full pass through the data
        learning_rate = 5e-5,
        optim = "adamw_8bit", # 8-bit optimizer saves memory
        output_dir="outputs",
    ),
)
# Mask the user inputs so we only calculate loss on the assistant's replies
trainer = train_on_responses_only(
    trainer,
    instruction_part = "<start_of_turn>user\n",
    response_part = "<start_of_turn>model\n",
)
trainer_stats = trainer.train()
```

> [!NOTE]
> Depending on your GPU, this step takes the longest. Watch the loss curve go down — that’s the model learning!

## Part 6: Inferencing

The training is done. The “sticky notes” are applied to the brain. Let’s see if it worked.

We set the model to inference mode (which makes it faster for generating text) and feed it a fake user query to see if it responds with empathy.

```python
# Prepare the query
user_question = "I feel really overwhelmed with my workload."

messages = [
    {'role': 'system', 'content': 'You are a helpful and empathetic mental health support assistant.'},
    {'role': 'user', 'content': user_question}
]
# Format the query
text = tokenizer.apply_chat_template(
    messages,
    tokenize = False,
    add_generation_prompt = True,
).removeprefix('<bos>')
# Generate the response
from transformers import TextStreamer
_ = model.generate(
    **tokenizer(text, return_tensors = "pt").to("cuda"),
    max_new_tokens = 256,
    temperature = 1, # Creativity level
    streamer = TextStreamer(tokenizer, skip_prompt = True),
)
```

## Part 7: Comparison with original model

A good scientist always has a control group. In the final step of the notebook, we load the **original** Gemma 3 model (without our finetuning) and ask it the same question.

- **The Original:** Might give a generic, robotic answer.
- **Your Fine-Tune:** Should use the tone, structure, and empathetic phrasing found in the MentalChat16K dataset.

This comparison confirms that your training actually changed the model’s behavior.

## Where to go from here?

- Try a larger model (Gemma 3 4B or 8B) by enabling `load_in_4bit = True`.
- Swap the dataset for something else (e.g., legal documents, creative writing, or coding Q&A).
- Export your model to GGUF format (supported by Unsloth) to run it locally on your laptop using [Ollama](https://ollama.com) or [LM Studio](https://lmstudio.ai).

Happy Finetuning!
