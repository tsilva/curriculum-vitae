---
emoji: 🥋
title: Nihonaid
headingUrl: https://sourceforge.net/projects/nihonaid/
tldr: Japanese Language Learning Assistant
start: '2006'
client: Me
location: Porto, Portugal
technologies:
  - C#
  - SQL Server
links:
  - label: Sourceforge project
    url: https://sourceforge.net/projects/nihonaid/
---

Nihonaid is a tool I developed to assist with learning Japanese, specifically for memorizing the Kanji character set.

The app presented each character in order of complexity, prompting the user for its meaning. After revealing the correct meaning, the user would rate how well they remembered it. This feedback was processed by a Neural Network, which tracked the user's knowledge of each character and determined the optimal time to reintroduce it for review.

The system focused on characters the user either didn't know or was predicted to have forgotten. For example, if a user didn't recognize a character, the app would present it again in the next session. If the user remembered it, the app would space out the reviews progressively, showing it again in two days, then a week, and so on.

With this system, daily sessions ensured the user retained previously learned characters, as the app adapted to their individual learning and forgetting curve.
