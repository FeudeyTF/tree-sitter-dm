/**
 * @file DreamMaker grammar
 * @author FeudeyTF <yanmordanenko089@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  PAREN_DECLARATOR: -10,
  ASSIGNMENT: -2,
  CONDITIONAL: -1,
  DEFAULT: 0,
  LOGICAL_OR: 1,
  LOGICAL_AND: 2,
  INCLUSIVE_OR: 3,
  EXCLUSIVE_OR: 4,
  BITWISE_AND: 5,
  EQUAL: 6,
  RELATIONAL: 7,
  OFFSETOF: 8,
  SHIFT: 9,
  ADD: 10,
  MULTIPLY: 11,
  CAST: 12,
  SIZEOF: 13,
  UNARY: 14,
  CALL: 15,
  FIELD: 16,
  SUBSCRIPT: 17,
};

module.exports = grammar({
  name: "dm",
  extras: $ => [
    $.comment,
    /[\s\f\uFEFF\u2060\u200B]|\r?\n/,
    $.line_continuation
  ],

  conflicts: $ => [
    [$.type_path],
    [$.return_statement],
    [$.builtin_const, $.primitive_type],
    [$.field_expression, $.field_proc_expression]
  ],

  externals: $ => [
    $.newline,
    $.indent,
    $.dedent
  ],

  rules: {
    source_file: $ => repeat($._instruction),

    _instruction: $ => choice(
      $.proc_definition,
      $.proc_override,
      $.type_definition,
      $.preproc_call_expression,
      $.preproc_def,
      $.preproc_undef,
      $.preproc_defproc,
      $.preproc_if,
      $.preproc_ifdef,
      $.preproc_warn,
      $.preproc_error
    ),

    preproc_def: $ => prec.right(seq(
      preprocessor('define'),
      field('name', $.identifier),
      optional($.preproc_arg)
    )),

    preproc_undef: $ => seq(
      preprocessor('undef'),
      field('name', $.identifier)
    ),

    preproc_defproc: $ => seq(
      preprocessor('define'),
      field('name', $.identifier),
      token.immediate('('),
      commaSep($.identifier),
      ')',
      $.preproc_arg
    ),

    preproc_if: $ => seq(
      preprocessor('if'),
      field('confition', $.expression),
      $.preproc_if_block,
      repeat(field('alternative', $.preproc_elif)),
      field('alternative', optional($.preproc_else)),
      preprocessor('endif')

    ),

    preproc_ifdef: $ => seq(
      choice(preprocessor('ifdef'), preprocessor('ifndef')),
      field('name', $.identifier),
      $.preproc_if_block,
      repeat(field('alternative', $.preproc_elif)),
      field('alternative', optional($.preproc_else)),
      preprocessor('endif')
    ),

    preproc_elif: $ => seq(
      preprocessor('elif'),
      field('condition', $.expression),
      $.preproc_if_block
    ),

    preproc_else: $ => seq(
      preprocessor('else'),
      $.preproc_if_block
    ),

    preproc_if_block: $ => choice(
      repeat1($._instruction),
      $.block
    ),

    preproc_call_expression: $ => seq(
      field('directive', $.identifier),
      $.argument_list,
      $.newline
    ),

    preproc_arg: $ => seq(prec.right(choice(
      repeat1(seq(
        $.expression,
        $.line_continuation),
      ),
      $.expression
    )),
      $.newline
    ),

    preproc_warn: $ => seq(
      preprocessor('warn'),
      $.preproc_message,
      $.newline
    ),

    preproc_error: $ => seq(
      preprocessor('error'),
      $.preproc_message,
      $.newline
    ),

    preproc_message: $ => /.*/,

    type_definition: $ => prec.dynamic(-1, seq(
      $.type_path,
      $.type_name_delimiter,
      field('name', $.identifier),
      optional($.type_body)
    )),

    type_body: $ => prec.right(seq(
      $.indent,
      repeat1(seq($._type_statement, $.newline)),
      $.dedent
    )),

    _type_statement: $ => choice(
      seq($.identifier, '=', $.expression),
      $.var_definition,
      $.identifier,
    ),

    proc_override: $ => seq(
      $.type_path,
      $.type_name_delimiter,
      field('name', $.identifier),
      $.proc_parameters,
      optional($.block)
    ),

    proc_definition: $ => prec.dynamic(1, seq(
      optional($.type_path),
      seq(choice($.type_name_delimiter, '/'), $.proc_keyword, $.type_name_delimiter),
      field('name', $.identifier),
      $.proc_parameters,
      optional($.block)
    )),

    proc_parameters: $ => seq(
      '(',
      commaSep($.proc_parameter),
      ')'
    ),

    proc_parameter: $ => choice(
      $.var_definition,
      seq(
        optional(seq($.type_path, $.type_name_delimiter)),
        field('name', $.identifier),
        optional(seq('=', $.expression))
      ),
      '...'
    ),

    block: $ => choice(
      $.indented_block,
      $.braced_block,
    ),

    indented_block: $ => choice(
      seq($.indent, $.indented_block_1),
      alias($.newline, $.indented_block_1),
    ),

    indented_block_1: $ => seq(
      repeat($._statement),
      $.dedent,
    ),


    braced_block: $ => seq(
      '{',
      repeat($._statement),
      '}',
    ),

    var_definition: $ => seq(
      $.var_keyword,
      optional(seq($.type_name_delimiter, $.var_modifier)),
      optional($.type_path),
      $.type_name_delimiter,
      field('name', $.identifier),
      optional(seq('=', $.expression)),
    ),

    call_expression: $ => prec(1, seq(
      choice(
        field('name', $.identifier),
        $.type_path
      ),
      field("arguments", $.argument_list)
    )),

    argument_list: $ => seq(
      '(',
      commaSep(
        choice(
          $.expression,
          $.key_value_pair
        )
      ),
      ')'
    ),

    key_value_pair: $ => seq(
      choice($.identifier, $.string_literal, $.type_path),
      "=",
      $.expression
    ),

    _statement: $ => choice(
      $.var_definition,
      $.expression,
      $.return_statement,
      $.if_statement,
      $.for_statement,
      $.switch_statement,
    ),

    for_statement: $ => seq(
      'for',
      '(',
      seq($.var_definition, optional(seq('as', $.as_type))),
      'in',
      $.expression,
      ')',
      $.block,
    ),

    switch_statement: $ => prec.right(seq(
      'switch',
      '(',
      field('condition', $.expression),
      ')',
      $.indent,
      repeat1($.if_statement),
      $.dedent
    )),

    if_statement: $ => prec.right(seq(
      'if',
      '(',
      field('condition', $.expression),
      ')',
      $.block,
      repeat(field('alternative', $.elseif_clause)),
      optional(field('alternative', $.else_clause)),
    )),

    elseif_clause: $ => seq(
      'else', 'if',
      '(',
      field('condition', $.expression),
      ')',
      $.block
    ),

    else_clause: $ => seq('else', $.block),

    return_statement: $ => seq(
      'return',
      optional($.expression)
    ),

    break_statement: _ => 'break',

    continue_statement: _ => 'continue',

    type_path: $ => seq(
      optional(choice('/', $.type_name_delimiter)),
      $.primitive_type,
      repeat(seq($.type_name_delimiter, $.identifier)),
    ),

    primitive_type: _ => choice(
      'obj',
      'mob',
      'world',
      'client',
      'turf',
      'area',
      'datum',
      'atom',
      'list',
      'mutable_appearance'
    ),

    unary_expression: $ => prec.left(PREC.UNARY, seq(field('operator', choice('!', '~', '-', '+')), field('argument', $.expression),)),

    binary_expression: $ => {
      const table = [
        ['+', PREC.ADD],
        ['-', PREC.ADD],
        ['*', PREC.MULTIPLY],
        ['/', PREC.MULTIPLY],
        ['%', PREC.MULTIPLY],
        ['||', PREC.LOGICAL_OR],
        ['&&', PREC.LOGICAL_AND],
        ['|', PREC.INCLUSIVE_OR],
        ['^', PREC.EXCLUSIVE_OR],
        ['&', PREC.BITWISE_AND],
        ['==', PREC.EQUAL],
        ['!=', PREC.EQUAL],
        ['>', PREC.RELATIONAL],
        ['>=', PREC.RELATIONAL],
        ['<=', PREC.RELATIONAL],
        ['<', PREC.RELATIONAL],
        ['<<', PREC.SHIFT],
        ['>>', PREC.SHIFT],
        ['in', PREC.CONDITIONAL],
        ['to', PREC.CONDITIONAL]
      ];

      return choice(...table.map(([operator, precedence]) => {
        return prec.left(precedence, seq(
          field('left', $.expression),
          // @ts-ignore
          field('operator', operator),
          field('right', $.expression),
        ));
      }));
    },

    assignment_expression: $ => prec.right(PREC.ASSIGNMENT, seq(
      field('left', choice($.identifier, $.field_expression, $.array_expression)),
      field('operator', choice(
        '=',
        '*=',
        '/=',
        '%=',
        '+=',
        '-=',
        '<<=',
        '>>=',
        '&=',
        '^=',
        '|=',
      )),
      field('right', $.expression),
    )),

    expression: $ => choice(
      $.identifier,
      $.builtin_const,
      $.number_literal,
      $.string_literal,
      $.builtin_macro,
      $.null_const,
      $.new_expression,
      $.type_path,
      $.call_expression,
      $.parent_proc_expression,
      $.binary_expression,
      $.assignment_expression,
      $.unary_expression,
      $.field_expression,
      $.field_proc_expression,
      $.array_expression,
      $.conditional_expression,
      $.parenthesized_expression
    ),

    conditional_expression: $ => prec.right(PREC.CONDITIONAL, seq(
      field('condition', $.expression),
      '?',
      optional(field('consequence', $.expression)),
      ':',
      field('alternative', $.expression),
    )),

    parenthesized_expression: $ => seq(
      '(',
      $.expression,
      ')'
    ),

    array_expression: $ => seq(
      choice($.identifier, $.field_expression),
      '[',
      field('size', $.expression),
      ']'
    ),

    field_expression: $ => seq(
      field('argument', $.expression),
      field('operator', $.field_operator),
      field('field', $.identifier),
    ),

    field_operator: $ => choice('.', '?.'),

    field_proc_expression: $ => seq(
      field('argument', $.expression),
      field('operator', $.field_operator),
      field('proc', $.identifier),
      $.argument_list
    ),

    new_expression: $ => prec.right(seq(
      'new',
      optional($.type_path),
      optional(field("arguments", $.argument_list)),
    )),

    parent_proc_expression: _ => '..()',

    identifier: _ => /[a-zA-Z_][a-zA-Z0-9_]*|\./,

    number_literal: $ => choice(
      /\d+/,
      /\d+\.\d*/,
      /0x[0-9a-fA-F]+/,
    ),

    string_literal: $ => choice(
      seq('"', repeat(choice(/[^"\\]/, /\\./)), '"'),
      seq("'", repeat(choice(/[^'\\]/, /\\./)), "'"),
    ),
    as_type: _ => 'anything',
    var_keyword: _ => 'var',
    proc_keyword: _ => choice('proc', 'verb', 'operator'),

    var_modifier: _ => choice(
      'static',
      'global',
      'tmp',
      'const',
      'final'
    ),

    builtin_const: _ => choice(
      'usr',
      'world',
      'src',
      'args',
      'vars',
    ),

    builtin_macro: _ => choice(
      'DM_BUILD', 'DM_VERSION', '__FILE__', '__LINE__', '__MAIN__', 'DEBUG', 'FILE_DIR', 'TRUE', 'FALSE'
    ),

    null_const: _ => 'null',

    block_comment: _ => token(seq(
      '/*',
      /[^*]*\*+([^/*][^*]*\*+)*/,
      '/',
    )),

    type_name_delimiter: _ => token.immediate('/'),

    line_comment: _ => token(
      seq('//', /(\\+(.|\r?\n)|[^\\\n])*/),
    ),

    comment: $ => choice(
      $.line_comment,
      $.block_comment
    ),

    line_continuation: _ => token(seq('\\', choice(seq(optional('\r'), '\n'), '\0'))),

  }
})

function commaSep(rule) {
  return optional(commaSep1(rule));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

function preprocessor(command) {
  return alias(new RegExp('#[ \t]*' + command), '#' + command);
}
