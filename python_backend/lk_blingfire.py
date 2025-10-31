"""Fallback shim for the native `lk_blingfire` extension.

The official LiveKit wheel bundles a compiled extension that currently only ships
for CPython 3.11+. On environments that still run Python 3.10 (like this project)
the import `import lk_blingfire` fails, which prevents `livekit.agents` from
booting. This module mimics the tiny surface area the library expects using the
pure-Python basic tokenizers that ship with `livekit.agents`.
"""

from __future__ import annotations

from typing import List, Tuple

from livekit.agents.tokenize import _basic_sent, _basic_word

SentenceOffsets = List[Tuple[int, int]]
WordOffsets = List[Tuple[int, int]]


def _sentence_tokens(text: str) -> tuple[List[str], SentenceOffsets]:
    tokens = _basic_sent.split_sentences(  # reuse builtin fallback tokenizer
        text,
        min_sentence_len=0,
        retain_format=True,
    )

    sentences: List[str] = []
    offsets: SentenceOffsets = []
    for sentence, start, end in tokens:
        normalized = sentence.strip()
        if not normalized:
            continue
        sentences.append(normalized)
        offsets.append((start, end))

    return sentences, offsets


def _word_tokens(text: str) -> tuple[List[str], WordOffsets]:
    tokens = _basic_word.split_words(
        text,
        ignore_punctuation=False,
        split_character=True,
        retain_format=False,
    )

    words: List[str] = []
    offsets: WordOffsets = []
    for word, start, end in tokens:
        normalized = word.strip()
        if not normalized:
            continue
        words.append(normalized)
        offsets.append((start, end))

    return words, offsets


def text_to_sentences(text: str) -> str:
    sentences, _ = _sentence_tokens(text)
    return "\n".join(sentences)


def text_to_sentences_with_offsets(text: str) -> tuple[str, SentenceOffsets]:
    sentences, offsets = _sentence_tokens(text)
    return "\n".join(sentences), offsets


def text_to_words(text: str) -> str:
    words, _ = _word_tokens(text)
    return " ".join(words)


def text_to_words_with_offsets(text: str) -> tuple[str, WordOffsets]:
    words, offsets = _word_tokens(text)
    return " ".join(words), offsets


__all__ = [
    "text_to_sentences",
    "text_to_sentences_with_offsets",
    "text_to_words",
    "text_to_words_with_offsets",
]
