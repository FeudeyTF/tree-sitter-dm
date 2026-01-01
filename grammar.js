/**
 * @file DreamMaker grammar
 * @author FeudeyTF <yanmordanenko089@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const TYPE_DELIMITER = '/';

module.exports = grammar({
  name: "dm",
  conflicts: $ => [
    [$.type_path]
  ],
  rules: {
    source_file: $ => repeat($._definition),

    _definition: $ => choice(
      $.proc_definition,
      $.comment
    ),

    proc_definition: $ => seq(
      optional($.type_path),
      $.proc_keyword,
      field("name", $.identifier),
      $.parameter_list,
      optional($.block)
    ),

    primitive_type: $ => choice(
      'obj',
      'datum',
      'mob',
      'turf',
      'area',
      'alist',
      'list',
      'atom',
      'atom/movable'
    ),

    type_path: $ => seq(
      seq($.type_delimiter, $.primitive_type),
      repeat(seq($.type_delimiter, $.identifier))
    ),

    parameter_list: $ => seq(
      '(',
      ')'
    ),

    block: $ => choice(
      $.indented_block,
      $.braced_block
    ),

    indented_block: $ => seq(
      repeat1(seq($._indent, $._statement)),
      $._dedent,
    ),

    braced_block: $ => seq(
      '{',
      repeat($._statement),
      '}',
    ),

    _statement: $ => choice(
      $.return_statement,
      $.var_declaration,
    ),

    return_statement: $ => seq(
      'return',
      optional($.expression),
      optional(';')
    ),
    
    var_declaration: $ => seq(
      $.var_keyword,
      optional($.type_path),
      '/',
      field("name", $.identifier),
      optional(seq('=', $.expression)),
      optional(';')
    ),

    expression: $ => choice(
      $.identifier,
      $.number,
      $.string,
      $.null,
      $.type_path
    ),

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
    number: $ => choice(
      /\d+/,
      /\d+\.\d*/,
      /0x[0-9a-fA-F]+/,
    ),

    string: $ => choice(
      seq('"', repeat(choice(/[^"\\]/, /\\./)), '"'),
      seq("'", repeat(choice(/[^'\\]/, /\\./)), "'"),
    ),

    null: _ => 'null',
    proc_keyword: _ => '/proc/',
    var_keyword: _ => 'var',
    type_delimiter: $ => TYPE_DELIMITER,
    comment: _ => token(choice(
      seq('//', /(\\+(.|\r?\n)|[^\\\n])*/),
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/',
      ),
    )),
    _indent: $ => "\t",
    _dedent: $ => "\n",
  }
});

