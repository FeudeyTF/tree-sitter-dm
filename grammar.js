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
  ],

  rules: {
    source_file: $ => repeat($._instruction),

    _instruction: $ => choice(
      $.var_definition,
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
      '\n',
      repeat1(seq('\t', $._type_statement)),
    )),

    _type_statement: $ => choice(
      seq($.identifier, '=', $.expression),
      $.var_definition,
      $.identifier,
    ),

    proc_override: $ => seq(
      $.type_path,
      '/',
      field('name', $.identifier),
      $.proc_parameters
    ),

    proc_definition: $ => prec.right(seq(
      optional($.type_path),
      seq('/', $.proc_keyword, '/'),
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
        optional(seq($.type_path, '/')),
        field('name', $.identifier),
        optional(seq('=', $.expression))
      )
    ),

    block: $ => choice(
      $.indented_block,
      $.braced_block
    ),

    indented_block: $ => prec.right(seq(
      repeat1(seq('\t', $._statement)),
      '\n'
    )),

    braced_block: $ => seq(
      '{',
      repeat($._statement),
      '}',
    ),

    var_definition: $ => seq(
      $.var_keyword,
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
      $.if_statement
    ),

    if_statement: $ => prec.right(seq(
      'if',
      '(',
      field('condition', $.expression),
      ')',
      $.block,
      optional(field('alternative', $.else_clause)),
    )),

    else_clause: $ => seq('else', $._statement),

    return_statement: $ => seq(
      'return',
      $.expression
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
      'atom',
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

    expression: $ => choice(
      $.identifier,
      $.number_literal,
      $.string_literal,
      $.type_path,
      $.call_expression,
      $.binary_expression,
      $.unary_expression
    ),
    identifier: _ => /[a-zA-Z_][a-zA-Z0-9_]*/,
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
    proc_keyword: _ => 'proc',

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
