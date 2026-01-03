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

  conflicts: $ => [
    [$.type_path],
    [$.return_statement],
    [$.builtin_const, $.primitive_type]
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
      $.comment
    ),

    type_definition: $ => seq(
      $.type_path,
      '/',
      field('name', $.identifier),
      optional($.type_body)
    ),

    type_body: $ => prec.right(seq(
      $.indent,
      repeat1(seq($._type_statement, $.newline)),
      $.dedent
    )),

    _type_statement: $ => choice(
      seq($.identifier, '=', $.expression),
      $.var_definition,
      $.identifier,
      $.comment
    ),

    proc_override: $ => seq(
      $.type_path,
      '/',
      field('name', $.identifier),
      $.proc_parameters,
      optional($.block)
    ),

    proc_definition: $ => seq(
      optional($.type_path),
      seq('/', $.proc_keyword, '/'),
      field('name', $.identifier),
      $.proc_parameters,
      optional($.block)
    ),

    proc_parameters: $ => seq(
      '(',
      commaSep($.proc_parameter),
      ')'
    ),

    proc_parameter: $ => choice(
      $.var_definition,
      seq(
        optional(seq($.type_path, '/')),
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
      optional(seq('/', $.var_modifier)),
      optional($.type_path),
      '/',
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
      commaSep(seq(optional(seq($.identifier, "=")), $.expression)),
      ')'
    ),

    _statement: $ => choice(
      $.var_definition,
      $.expression,
      $.return_statement,
      $.if_statement,
      $.switch_statement,
      $.comment
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
      optional(seq(field('alternative', $.else_clause))),
    )),

    else_clause: $ => seq('else', $.block),

    return_statement: $ => seq(
      'return',
      optional($.expression)
    ),

    break_statement: _ => 'break',

    continue_statement: _ => 'continue',

    type_path: $ => seq(
      optional('/'),
      $.primitive_type,
      repeat(seq('/', $.identifier)),
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
      field('left', $.identifier),
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
      $.type_path,
      $.call_expression,
      $.parent_proc_expression,
      $.binary_expression,
      $.assignment_expression,
      $.unary_expression
    ),

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

    line_comment: _ => token(
      seq('//', /(\\+(.|\r?\n)|[^\\\n])*/),
    ),

    comment: $ => choice(
      $.line_comment,
      $.block_comment
    )
  }
})

function commaSep(rule) {
  return optional(commaSep1(rule));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}
