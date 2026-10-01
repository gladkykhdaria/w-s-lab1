# Homework Report: Comparing Small Language Models

**Daria Gladkykh · Group 1231EB · 1 October 2026**

## Setup

I gave three small models the same prompt, "What is the purpose of the life?", and let each one write up to 80 new tokens. The three models were distilgpt2 (82M parameters), facebook/opt-125m (125M) and gpt2-medium (355M). I tried six different settings on every model, so there were 18 runs in total. I used the same random seed for every run, so the comparison is fair.

The six settings worked like this:

- **greedy** always picks the most likely next word.
- **beam_5** looks at five possible sentences at the same time, keeps the best one, and is not allowed to repeat any 2-word pair.
- **temp_0.5** picks words randomly but carefully, because the temperature is low.
- **temp_1.3** picks words randomly in a very wild way, because the temperature is high.
- **top_p_0.9** only picks from the words that together make up 90% of the probability.
- **lab_combo** uses the settings from the lab: temperature 0.8, top-k 50, top-p 0.9 and repetition penalty 1.2.

I measured four things:

- **Speed** is the number of tokens per second.
- **Diversity (distinct-2)** is the share of word pairs that are different. Higher means more varied text.
- **Repetition** is the share of 3-word phrases that appear more than once. Lower is better.
- **Coherence** I judged by reading every answer myself. I also scored each answer with gpt2-medium (perplexity), where a lower number should mean more natural text.

## Results

These are the full results of my run:

```
            model  params_M    config  new_tokens  time_s  tok_per_s  distinct_1  distinct_2  rep_3gram  judge_ppl
       distilgpt2        82    greedy          80    0.82       97.7        0.00        0.00       0.00       21.9
       distilgpt2        82    beam_5          45    1.50       29.9        0.81        1.00       0.00       12.7
       distilgpt2        82  temp_0.5          80    0.93       85.7        0.27        0.34       0.65        3.7
       distilgpt2        82  temp_1.3          80    1.29       62.0        0.95        1.00       0.00      517.1
       distilgpt2        82 top_p_0.9          80    2.93       27.3        0.10        0.11       0.88        1.7
       distilgpt2        82 lab_combo          80    1.18       67.7        0.96        1.00       0.00       25.8
      gpt2-medium       355    greedy          80    2.62       30.5        0.21        0.33       0.59        2.0
      gpt2-medium       355    beam_5          80    2.78       28.8        0.71        0.98       0.00        3.3
      gpt2-medium       355  temp_0.5          80    4.37       18.3        0.20        0.27       0.70        1.9
      gpt2-medium       355  temp_1.3          80    1.63       49.1        0.98        1.00       0.00      760.6
      gpt2-medium       355 top_p_0.9          80    1.46       54.9        0.54        0.79       0.11        6.2
      gpt2-medium       355 lab_combo          80    1.51       53.0        0.97        1.00       0.00       16.5
facebook/opt-125m       125    greedy          80    1.89       42.3        0.18        0.23       0.77        2.3
facebook/opt-125m       125    beam_5          22    0.40       54.6        0.88        1.00       0.00        5.6
facebook/opt-125m       125  temp_0.5          32    0.53       60.3        0.64        0.79       0.17       10.2
facebook/opt-125m       125  temp_1.3          80    0.92       87.1        0.98        1.00       0.00     6228.5
facebook/opt-125m       125 top_p_0.9          36    0.33      108.6        0.82        0.96       0.00        9.8
facebook/opt-125m       125 lab_combo          80    0.78      102.1        0.70        0.78       0.21       10.5
```

These are the averages for each model over all six settings:

```
                   tok_per_s  distinct_2  rep_3gram  judge_ppl
distilgpt2             61.72        0.58       0.26      97.15
facebook/opt-125m      75.83        0.79       0.19    1044.48
gpt2-medium            39.10        0.73       0.23     131.75
```

These are some example outputs, cut short:

```
[gpt2-medium | greedy]    The purpose of life is to live. What is the purpose of the death?
                          The purpose of death is to die. What is the purpose of the life? ...
[gpt2-medium | beam_5]    The purpose is to serve God. The life is a means to that end. It is
                          not an end in itself; it is merely the means by which God's will is fulfilled ...
[opt-125m | greedy]       I'm not sure. I'm just curious. I'm curious about the life.
                          I'm curious about the life. I'm curious about the life. ...
[opt-125m | beam_5]       I don't know. I'm just trying to figure out what I want to do with it.
[distilgpt2 | top_p_0.9]  What the purpose of the life is, and what the purpose of the life is,
                          and what the purpose of the life is, ...
[opt-125m | temp_1.3]     Provide lecture hours? INTERESTED in mind Anpers Vitae docking
                          TaconicTech weekends feeding out renewable relief ...
```

<img width="503" height="505" alt="results_table" src="https://github.com/user-attachments/assets/fbee76e9-9ea2-4391-96fa-90e0f5c19105" />

<img width="1790" height="440" alt="charts" src="https://github.com/user-attachments/assets/8e92324e-e82a-4fbc-95a4-228dffdb3900" />


## Comparing the models

gpt2-medium wrote the most sensible text, opt-125m was the fastest, and distilgpt2 was the weakest.

**Coherence:** gpt2-medium was the only model that really talked about the meaning of life, and with beam search it wrote a clear, logical paragraph. opt-125m gave short and simple answers that made sense. distilgpt2 mostly went off topic.

**Repetition:** all three models got stuck in loops with greedy decoding. opt-125m, for example, repeated "I'm curious about the life." again and again.

**Diversity:** opt-125m was the most varied on average. Part of the reason is that it often stopped early, after only 22 to 36 tokens, so it had less time to repeat itself.

**Speed:** opt-125m was the fastest and gpt2-medium was the slowest, which makes sense because gpt2-medium is about four times bigger. Single timings jumped around a bit, so the averages are more reliable.

## Effect of each argument

The repetition penalty and beam search fixed the loops, while a high temperature destroyed the meaning.

**greedy** is safe but boring and loops easily, with repetition up to 0.77. distilgpt2 even produced only empty lines with it.

**beam_5** gave zero repetition in every model and the most organized text, but it can sound stiff and copied.

**temp_0.5** was too careful: distilgpt2 and gpt2-medium still looped, with repetition of 0.65 and 0.70.

**temp_1.3** gave the maximum diversity (1.00), but the text was pure nonsense with made-up words like "Concamiliarity".

**top_p_0.9** gave mixed results. It worked well for opt-125m and gpt2-medium, but distilgpt2 got stuck in a loop (repetition 0.88).

**lab_combo** produced readable text with almost no repetition (0.00 to 0.21), but the models slowly drifted off topic.

## Best result and reflection

The best combination was gpt2-medium with beam_5, because it gave the most coherent answer with zero repetition. If you want text that sounds more natural, gpt2-medium with top_p_0.9 or lab_combo is a good second choice. Overall, the settings mattered almost as much as the size of the model.

The most surprising thing was that the automatic "coherence" score (perplexity) rewarded the worst answers. The best score, 1.7, went to distilgpt2 repeating the same sentence over and over. A loop is very easy to predict, so the judge model thinks it is "natural". This showed me that one number is not enough to judge the quality of text, and you still have to read the outputs yourself.
