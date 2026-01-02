// Code from tree-sitter-python scanner

#include "tree_sitter/array.h"
#include "tree_sitter/parser.h"

#include <assert.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

enum TokenType {
  NEWLINE,
  INDENT,
  DEDENT,
  COMMENT,
};

typedef enum {
  SingleQuote = 1 << 0,
  DoubleQuote = 1 << 1,
  BackQuote = 1 << 2,
  Raw = 1 << 3,
  Format = 1 << 4,
  Triple = 1 << 5,
  Bytes = 1 << 6,
} Flags;

typedef struct {
  char flags;
} Delimiter;

typedef struct {
  Array(uint16_t) indents;
  Array(Delimiter) delimiters;
  bool inside_interpolated_string;
} Scanner;

static inline void advance(TSLexer *lexer) { lexer->advance(lexer, false); }

static inline void skip(TSLexer *lexer) { lexer->advance(lexer, true); }

bool tree_sitter_dm_external_scanner_scan(void *payload, TSLexer *lexer,
                                          const bool *valid_symbols) {
  Scanner *scanner = (Scanner *)payload;

  bool error_recovery_mode = valid_symbols[INDENT];

  lexer->mark_end(lexer);

  bool found_end_of_line = false;
  uint16_t indent_length = 0;
  int32_t first_comment_indent_length = -1;
  for (;;) {
    if (lexer->lookahead == '\n') {
      found_end_of_line = true;
      indent_length = 0;
      skip(lexer);
    } else if (lexer->lookahead == ' ') {
      indent_length++;
      skip(lexer);
    } else if (lexer->lookahead == '\r' || lexer->lookahead == '\f') {
      indent_length = 0;
      skip(lexer);
    } else if (lexer->lookahead == '\t') {
      indent_length += 8;
      skip(lexer);
    } else if (lexer->lookahead == '/') {
      skip(lexer);
      if (lexer->lookahead == '/' &&
          (valid_symbols[INDENT] || valid_symbols[DEDENT] ||
           valid_symbols[NEWLINE])) {
        if (!found_end_of_line) {
          return false;
        }
        if (first_comment_indent_length == -1) {
          first_comment_indent_length = (int32_t)indent_length;
        }
        while (lexer->lookahead && lexer->lookahead != '\n') {
          skip(lexer);
        }
        skip(lexer);
        indent_length = 0;
      }
    } else if (lexer->lookahead == '\\') {
      skip(lexer);
      if (lexer->lookahead == '\r') {
        skip(lexer);
      }
      if (lexer->lookahead == '\n' || lexer->eof(lexer)) {
        skip(lexer);
      } else {
        return false;
      }
    } else if (lexer->eof(lexer)) {
      indent_length = 0;
      found_end_of_line = true;
      break;
    } else {
      break;
    }
  }

  if (found_end_of_line) {
    if (scanner->indents.size > 0) {
      uint16_t current_indent_length = *array_back(&scanner->indents);

      if (valid_symbols[INDENT] && indent_length > current_indent_length) {
        array_push(&scanner->indents, indent_length);
        lexer->result_symbol = INDENT;
        return true;
      }

      bool next_tok_is_string_start = lexer->lookahead == '\"' ||
                                      lexer->lookahead == '\'' ||
                                      lexer->lookahead == '`';

      if ((valid_symbols[DEDENT] || (!valid_symbols[NEWLINE])) &&
          indent_length < current_indent_length &&
          !scanner->inside_interpolated_string &&
          first_comment_indent_length < (int32_t)current_indent_length) {
        array_pop(&scanner->indents);
        lexer->result_symbol = DEDENT;
        return true;
      }
    }

    if (valid_symbols[NEWLINE] && !error_recovery_mode) {
      lexer->result_symbol = NEWLINE;
      return true;
    }
  }

  return false;
}

unsigned tree_sitter_dm_external_scanner_serialize(void *payload,
                                                   char *buffer) {
  Scanner *scanner = (Scanner *)payload;

  size_t size = 0;

  buffer[size++] = (char)scanner->inside_interpolated_string;

  size_t delimiter_count = scanner->delimiters.size;
  if (delimiter_count > UINT8_MAX) {
    delimiter_count = UINT8_MAX;
  }
  buffer[size++] = (char)delimiter_count;

  if (delimiter_count > 0) {
    memcpy(&buffer[size], scanner->delimiters.contents, delimiter_count);
  }
  size += delimiter_count;

  uint32_t iter = 1;
  for (; iter < scanner->indents.size &&
         size < TREE_SITTER_SERIALIZATION_BUFFER_SIZE;
       ++iter) {
    uint16_t indent_value = *array_get(&scanner->indents, iter);
    buffer[size++] = (char)(indent_value & 0xFF);
    buffer[size++] = (char)((indent_value >> 8) & 0xFF);
  }

  return size;
}

void tree_sitter_dm_external_scanner_deserialize(void *payload,
                                                 const char *buffer,
                                                 unsigned length) {
  Scanner *scanner = (Scanner *)payload;

  array_delete(&scanner->delimiters);
  array_delete(&scanner->indents);
  array_push(&scanner->indents, 0);

  if (length > 0) {
    size_t size = 0;

    scanner->inside_interpolated_string = (bool)buffer[size++];

    size_t delimiter_count = (uint8_t)buffer[size++];
    if (delimiter_count > 0) {
      array_reserve(&scanner->delimiters, delimiter_count);
      scanner->delimiters.size = delimiter_count;
      memcpy(scanner->delimiters.contents, &buffer[size], delimiter_count);
      size += delimiter_count;
    }

    for (; size + 1 < length; size += 2) {
      uint16_t indent_value =
          (unsigned char)buffer[size] | ((unsigned char)buffer[size + 1] << 8);
      array_push(&scanner->indents, indent_value);
    }
  }
}

void *tree_sitter_dm_external_scanner_create() {
#if defined(__STDC_VERSION__) && (__STDC_VERSION__ >= 201112L)
  _Static_assert(sizeof(Delimiter) == sizeof(char), "");
#else
  assert(sizeof(Delimiter) == sizeof(char));
#endif
  Scanner *scanner = calloc(1, sizeof(Scanner));
  array_init(&scanner->indents);
  array_init(&scanner->delimiters);
  tree_sitter_dm_external_scanner_deserialize(scanner, NULL, 0);
  return scanner;
}

void tree_sitter_dm_external_scanner_destroy(void *payload) {
  Scanner *scanner = (Scanner *)payload;
  array_delete(&scanner->indents);
  array_delete(&scanner->delimiters);
  free(scanner);
}
