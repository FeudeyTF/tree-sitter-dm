/**
 * @file DreamMaker grammar
 * @author FeudeyTF <yanmordanenko089@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

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
      $.block_comment,
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
      optional($.proc_body)
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

    proc_body: $ => choice(
      $.indented_block,
      $.braced_block
    ),

    indented_block: $ => prec.right(seq(
      repeat1(seq('\t', $._statement)),
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
      $.expression
    ),

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
    expression: $ => choice(
      $.identifier,
      $.number_literal,
      $.string_literal,
      $.type_path,
      $.call_expression
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
    comment: _ => token(
      seq('//', /(\\+(.|\r?\n)|[^\\\n])*/),
    ),

  }
})

function commaSep(rule) {
  return optional(commaSep1(rule));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}
