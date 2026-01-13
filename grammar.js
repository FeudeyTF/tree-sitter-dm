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

const SEMICOLON = ';';

module.exports = grammar({
  name: "dm",

  extras: $ => [
    $.comment,
    /[\s\f\uFEFF\u2060\u200B]|\r?\n/,
    $.line_continuation
  ],

  conflicts: $ => [
    [$.type_path],
    [$.type_path_expression],
    [$.return_statement],
    [$.field_expression, $.field_proc_expression],
    [$.preproc_call_expression],
    [$.type_path, $.type_path_expression],
    [$.builtin_const, $.primitive_type],
    [$.global_var_definition, $._statement]
  ],

  externals: $ => [
    $.newline,
    $.indent,
    $.dedent,

    $.string_start,
    $._string_content,
    $.escape_interpolation,
    $.string_end,
  ],

  rules: {
    source_file: $ => repeat($._instruction),

    _instruction: $ => choice(
      $.proc_definition,
      $.proc_override,
      $.type_definition,
      $.global_var_definition,
      $.preproc_call_expression,
      $.preproc_def,
      $.preproc_pragma,
      $.preproc_include,
      $.preproc_undef,
      $.preproc_defproc,
      $.preproc_if,
      $.preproc_ifdef,
      $.preproc_warn,
      $.preproc_error
    ),

    // Preproccessor directives

    preproc_pragma: $ => seq(
      preprocessor('pragma'),
      $.identifier,
      optional($.identifier),
      '\n'
    ),

    preproc_include: $ => seq(
      preprocessor('include'),
      field('file', choice($.string_literal, $.file_literal))
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
      $.newline,
      // This shouldn't be here, but it fixes some issues with calling the preproc directive
      optional($.block)
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

    // Main instructions

    type_definition: $ => prec.dynamic(-1, seq(
      $.type_path,
      $.type_operator,
      field('name', $.identifier),
      optional($.type_body)
    )),

    type_body: $ => choice(
      $.type_body_intended,
      $.type_body_braced
    ),

    type_body_intended: $ => seq(
      $.newline,
      optional(
        seq(
          $.indent,
          repeat1(seq($._type_statement, $.newline)),
          $.dedent)
      )
    ),

    type_body_braced: $ => seq(
      '{',
      sep1($._type_statement, SEMICOLON),
      '}'
    ),

    _type_statement: $ => choice(
      seq(
        alias($.identifier, $.type_member),
        optional(seq('=', $.expression)
        )
      ),
      $.var_definition,
      $.preproc_call_expression,
      $.type_proc_definition
    ),

    type_proc_definition: $ => prec.left(seq(
      seq(optional(choice($.type_operator, '/')), $.proc_keyword, $.type_operator),
      field('name', $.identifier),
      $.proc_parameters,
      optional($.block)
    )),

    proc_override: $ => prec.left(prec.dynamic(-1, seq(
      $.type_path,
      $.type_operator,
      field('name', $.identifier),
      $.proc_parameters,
      optional($.block)
    ))),

    proc_definition: $ => prec.right(prec.dynamic(1, seq(
      optional($.type_path),
      seq(optional(choice($.type_operator, '/')), $.proc_keyword, $.type_operator),
      field('name', $.identifier),
      $.proc_parameters,
      optional($.block)
    ))),

    proc_parameters: $ => seq(
      '(',
      commaSep($.proc_parameter),
      ')'
    ),

    proc_parameter: $ => choice(
      $.var_definition,
      seq(
        optional(seq($.type_path, $.type_operator)),
        field('name', $.identifier),
        optional(seq('=', $.expression))
      ),
      '...'
    ),

    global_var_definition: $ => seq(choice(
      $.var_definition,
      seq(
        optional($.type_path),
        $.type_operator,
        $.var_keyword,
        $.type_operator,
        optional(seq($.var_modifier, $.type_operator)),
        field('name', $.identifier),
        optional(seq('=', $.expression)),
      )
    ), $.newline),

    // Statements

    _statement: $ => choice(
      $.var_definition,
      $.expression,
      $.return_statement,
      $.break_statement,
      $.continue_statement,
      $.if_statement,
      $.for_statement,
      $.switch_statement,
      $.while_statement
    ),

    var_definition: $ => seq(
      $.var_keyword,
      optional(seq($.type_operator, $.var_modifier)),
      optional($.type_path),
      $.type_operator,
      field('name', $.identifier),
      optional(seq('=', $.expression)),
    ),

    for_statement: $ => seq(
      'for',
      '(',
      $.for_condition,
      ')',
      $.block,
    ),

    for_condition: $ => choice(
      $.forlist_condition,
      $.forloop_condition
    ),

    forlist_condition: $ => prec(1, choice(
      seq(
        $.var_definition,
        optional(seq('as', sep1($.as_type, '|'))),
        optional(seq('in', $.expression))
      ),
      seq(
        $.var_definition,
        'in',
        $.number_literal,
        'to',
        $.number_literal,
        optional(seq('step', $.number_literal))
      ),
      seq(
        field('key', $.var_definition),
        optional(seq('as', sep1($.as_type, '|'))),
        ',',
        field('value', $.identifier),
        'in',
        $.expression
      )
    )),

    forloop_condition: $ => choice(
      seq(
        field('initial', $.var_definition),
        ',',
        field('condition', $.expression),
        ',',
        field('increment', $.expression)
      ),
      seq(
        field('initial', $.var_definition),
        ';',
        field('condition', $.expression),
        ';',
        field('increment', $.expression)
      ),
    ),

    while_statement: $ => seq(
      'while',
      '(',
      field('condition', $.expression),
      ')',
      $.block
    ),

    switch_statement: $ => seq(
      'switch',
      '(',
      field('condition', $.expression),
      ')',
      $.block
    ),

    if_statement: $ => seq(
      'if',
      '(',
      field('condition', $.expression),
      ')',
      $.block,
      repeat(field('alternative', $.elseif_clause)),
      optional(field('alternative', $.else_clause)),
    ),

    elseif_clause: $ => seq(
      /else\ *if/,
      '(',
      field('condition', $.expression),
      ')',
      $.block
    ),

    else_clause: $ => prec(1, seq('else', $.block)),

    return_statement: $ => seq(
      'return',
      optional($.expression)
    ),

    break_statement: _ => 'break',

    continue_statement: _ => 'continue',

    // Expressions

    expression: $ => choice(
      $.literal,
      $.builtin_const,
      $.builtin_macro,
      $.null,
      $.new_expression,
      $.call_expression,
      $.parent_proc_expression,
      $.binary_expression,
      $.assignment_expression,
      $.unary_expression,
      $.field_expression,
      $.field_proc_expression,
      $.array_expression,
      $.conditional_expression,
      $.parenthesized_expression,
      $.type_path_expression,
      $.proc_return_value,
    ),

    as_expression: $ => seq(
      $.expression,
      'as',
      sep1($.as_type, '|')
    ),

    call_expression: $ => prec(1, seq(
      field('name', choice($.identifier, $.builtin_proc)),
      field("arguments", $.argument_list)
    )),

    argument_list: $ => seq(
      '(',
      commaSep(
        choice(
          $.expression,
          $.pair
        )
      ),
      ')'
    ),

    unary_expression: $ => prec.left(PREC.UNARY,
      seq(
        field('operator', choice('!', '--', '++', '~', '*', '&')),
        field('argument', $.expression)
      )
    ),

    binary_expression: $ => {
      const table = [
        ['+', PREC.ADD],
        ['-', PREC.ADD],
        ['*', PREC.MULTIPLY],
        ['/', PREC.MULTIPLY],
        ['||', PREC.LOGICAL_OR],
        ['%', PREC.MULTIPLY],
        ['%%', PREC.MULTIPLY],
        ['&&', PREC.LOGICAL_AND],
        ['|', PREC.INCLUSIVE_OR],
        ['^', PREC.EXCLUSIVE_OR],
        ['&', PREC.BITWISE_AND],
        ['!=', PREC.EQUAL],
        ['==', PREC.EQUAL],
        ['<>', PREC.EQUAL],
        ['>', PREC.RELATIONAL],
        ['~=', PREC.EQUAL],
        ['~!', PREC.EQUAL],
        ['>=', PREC.RELATIONAL],
        ['<', PREC.RELATIONAL],
        ['<=', PREC.RELATIONAL],
        ['<=>', PREC.RELATIONAL],
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
      field('left', choice($.identifier, $.field_expression, $.array_expression, $.proc_return_value)),
      field('operator', choice(
        '=',
        '+=',
        '-=',
        '-=',
        '*=',
        '/=',
        '%=',
        '%%=',
        '&=',
        '|=',
        '^=',
        '<<=',
        '>>=',
        ':=',
        '&&=',
        '||='
      )),
      field('right', $.expression),
    )),

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

    array_expression: $ => prec(1, seq(
      choice($.identifier, $.field_expression),
      optional(token.immediate('?')),
      '[',
      field('size', $.expression),
      ']'
    )),

    field_expression: $ => seq(
      field('argument', $.expression),
      field('operator', $.field_operator),
      field('field', $.identifier),
    ),

    field_operator: $ => choice(token.immediate('.'), '?.'),

    field_proc_expression: $ => seq(
      field('argument', $.expression),
      field('operator', $.field_operator),
      field('proc', $.identifier),
      $.argument_list
    ),

    new_expression: $ => prec.right(seq(
      'new',
      optional(
        choice(
          $.type_path,
          $.identifier
        )
      ),
      optional(field("arguments", $.argument_list)),
    )),

    parent_proc_expression: _ => '..()',

    type_path_expression: $ => prec.left(choice(
      seq(
        optional('/'),
        $.primitive_type,
        repeat1(seq($.type_operator, alias($.identifier, $.type_identifier))),
      ),
      seq(
        '/',
        $.primitive_type
      )
    )),

    // Simple structures for expressions and statements

    // Type path of object. Example: /obj/item/weapon.
    type_path: $ => seq(
      optional(choice('/', $.type_operator)),
      $.primitive_type,
      repeat(seq($.type_operator, alias($.identifier, $.type_identifier))),
    ),

    // Default block of proc or type definition.
    block: $ => choice(
      $.indented_block,
      $.braced_block,
    ),

    _statements: $ => seq(
      sep1($._statement, SEMICOLON),
      optional(SEMICOLON),
      $.newline,
    ),

    indented_block: $ => choice(
      alias($._statements, $.indented_block_1),
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

    pair: $ => seq(
      field("key", choice($.literal, $.type_path_expression)),
      "=",
      field("value", $.expression)
    ),

    // Literals and identifiers
    literal: $ => choice(
      $.identifier,
      $.file_literal,
      $.string_literal,
      $.number_literal
    ),

    proc_return_value: $ => '.',

    identifier: _ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    number_literal: _ => seq(
      optional(/[-\+]/),
      choice(
        /\d+/,
        /\d+\.\d*/,
        /0x[0-9a-fA-F]+/,
      ),
    ),

    file_literal: $ => seq(
      "'",
      repeat(choice(/[^'\\]/, /\\./)),
      "'"
    ),

    string_literal: $ => seq(
      $.string_start,
      repeat(choice($.interpolation, $.string_content)),
      $.string_end,
    ),

    string_content: $ => prec.right(repeat1(
      choice(
        $.escape_interpolation,
        $.escape_sequence,
        $._not_escape_sequence,
        $._string_content,
      ))),

    interpolation: $ => seq(
      '[',
      field('expression', $.expression),
      ']',
    ),

    escape_sequence: _ => token.immediate(prec(1, seq(
      '\\',
      choice(
        /u[a-fA-F\d]{4}/,
        /U[a-fA-F\d]{8}/,
        /x[a-fA-F\d]{2}/,
        /\d{1,3}/,
        /\r?\n/,
        /['"abfrntv\\]/,
        /N\{[^}]+\}/,
      ),
    ))),

    _not_escape_sequence: _ => token.immediate('\\'),

    as_type: $ => choice(
      'anything',
      'text',
      $.null
    ),

    var_keyword: _ => 'var',

    proc_keyword: _ => choice(
      'proc',
      'verb',
      'operator'
    ),

    builtin_proc: _ => choice(
      'alist',
      'list',
      'call',
      'input',
      'locate',
      'pick',
      'arglist',
      'CRASH',
      'ASSERT',
      'EXCEPTION',
      'REGEX_QUOTE',
      'REGEX_QUOTE_REPLACEMENT'
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
      'mutable_appearance',
      'exception',
      'generator',
      'icon',
      'image',
      'alist',
      'matrix',
      'particles',
      'pixloc',
      'regex',
      'savefile',
      'sound',
      'vector',
      'database'
    ),

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

    null: _ => 'null',

    // Delimiter for names of types or procs
    type_operator: _ => choice(
      token.immediate('/'),
      token.immediate('::'),
      token.immediate(':')
    ),

    // Comment blocks
    comment: $ => choice(
      $.line_comment,
      $.block_comment
    ),

    block_comment: _ => token(seq(
      '/*',
      /[^*]*\*+([^/*][^*]*\*+)*/,
      '/',
    )),

    line_comment: _ => token(
      seq('//', /(\\+(.|\r?\n)|[^\\\n])*/),
    ),

    line_continuation: _ => token(seq('\\', choice(seq(optional('\r'), '\n'), '\0'))),
  }
})

function commaSep(rule) {
  return optional(commaSep1(rule));
}

function commaSep1(rule) {
  return sep1(rule, ',');
}

function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

function preprocessor(command) {
  return alias(new RegExp('#[ \t]*' + command), '#' + command);
}
