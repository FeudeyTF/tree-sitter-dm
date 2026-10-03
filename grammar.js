/**
 * @file DreamMaker grammar
 * @author FeudeyTF <yanmordanenko089@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  ASSIGNMENT: -2,
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
  UNARY: 12,
  CALL: 13,
  FIELD: 14,
  CONDITIONAL: 15,
  GOTO_LABEL: 16,
};

export default grammar({
  name: "dm",

  extras: $ => [
    /[\s\f\uFEFF\u2060\u200B]|\r?\n/,
    $.line_continuation,
    $.comment,

    // Preprocessor directives are parsed in the
    // same way as comments, but they have a structure.
    $.preproc_if,
    $.preproc_ifdef,
    $.preproc_else,
    $.preproc_endif,
    $.preproc_elif,
    $.preproc_elifdef,
    $.preproc_def,
    $.preproc_function_def,
    $.preproc_undef,
    $.preproc_error,
    $.preproc_warn,
  ],

  supertypes: $ => [
    $.expression
  ],

  conflicts: $ => [
    [$.goto_label, $.expression],
  ],

  externals: $ => [
    $._newline,
    $._indent,
    $._dedent,
    $.string_start,
    $._string_content,
    $.escape_interpolation,
    $.string_end,

    // Allow the external scanner to check for the validity of closing brackets
    // so that it can avoid returning dedent tokens between brackets.
    ']',
    ')',
    '}',

    // Allows the external scanner to for the validity of '/', so that it can avoid 
    // returning  'newline' + 'indent' where they are not needed
    '/'
  ],

  word: $ => $.identifier,

  reserved: {
    global: _ => [
      'FALSE', 'else', 'break', 'in', 'TRUE',
      'return', 'continue', 'for', 'try', 'as',
      'while', 'if', 'var'
    ],
  },

  rules: {
    source_file: $ => repeat($._instruction),

    _instruction: $ => choice(
      $.type_definition,
      $.var_definition,
      $.proc_definition,

      $.preproc_pragma,
      $.preproc_include,

      // Honestly, instead of this preprocessor rule, it should be proc_override. 
      // Unfortunately, they are ambiguous, and this directive is used more often.
      $.preproc_call,

      '/'
    ),

    /// Preprocessor

    preproc_pragma: $ => seq(
      preprocessor('pragma'),
      $.identifier,
      optional($.identifier),
      $._newline
    ),

    preproc_include: $ => seq(
      preprocessor('include'),
      field('path', $.file_literal),
      $._newline,
    ),


    preproc_undef: $ => seq(
      preprocessor('undef'),
      field('name', $.identifier),
      $._newline
    ),

    preproc_def: $ => seq(
      preprocessor('define'),
      field('name', $.identifier),
      field('value', optional(choice(
        $.preproc_arg,
        $.expression
      ))),
      $._newline
    ),

    preproc_function_def: $ => seq(
      preprocessor('define'),
      field('name', $.identifier),
      field('parameters', $.preproc_params),
      field('value', optional($.preproc_arg)),
      $._newline
    ),

    // TODO: implement preprocessor argument parsing
    preproc_arg: _ => token(prec(-1, /\S([^/\n]|\/[^*]|\\\r?\n)*/)),

    preproc_if: $ => seq(
      preprocessor('if'),
      field('condition', $.expression),
      $._newline
    ),

    preproc_ifdef: $ => seq(
      choice(preprocessor('ifdef'), preprocessor('ifndef')),
      field('name', $.identifier),
      $._newline
    ),

    preproc_endif: $ => seq(
      preprocessor('endif'),
      $._newline
    ),

    preproc_else: $ => seq(
      preprocessor('else'),
      $._newline
    ),

    preproc_elif: $ => seq(
      preprocessor('elif'),
      field('condition', $.expression),
      $._newline
    ),

    preproc_elifdef: $ => seq(
      choice(preprocessor('elifdef'), preprocessor('elifndef')),
      field('name', $.identifier),
      $._newline
    ),

    preproc_call: $ => seq(
      field('directive', $.identifier),
      $.argument_list,
      $.block,
    ),

    preproc_params: $ => seq(
      token.immediate('('), commaSep(choice($.identifier, '...')), ')',
    ),

    preproc_warn: $ => seq(
      preprocessor('warn'),
      $.preproc_message,
      $._newline
    ),

    preproc_error: $ => seq(
      preprocessor('error'),
      $.preproc_message,
      $._newline
    ),

    preproc_message: _ => /.*/,

    /// Pathes

    type_definition: $ => path($,
      field("root", $.identifier),
      optional(fork($,
        $._type_statement,
        field("name", $.identifier),
      )),
    ),

    subtype_definition: $ => path($,
      $.identifier,
      fork($,
        $._type_statement,
        field("name", $.identifier),
      ),
    ),

    _type_statement: $ => choice(
      $.subtype_definition,
      alias($.type_var_assignment, $.var_assignment),
      $.var_definition,
      $.proc_definition,
      $.verb_definition,
      $.proc_override,
      $.operator_override
    ),

    proc_definition: $ => path($,
      'proc',
      optional(forkEnd($,
        seq(
          $._proc_signature,
          optional($.block)
        )
      )),
    ),

    verb_definition: $ => path($,
      'verb',
      optional(forkEnd($,
        seq(
          $._proc_signature,
          optional($.block)
        )
      )),
    ),

    operator_override: $ => path($,
      'proc',
      forkEnd($, seq(
        "operator",
        field("operator", choice(
          '=', '+=', '-=', '*=',
          '/=', '%=', '%%=', '&=',
          '|=', '^=', '<<=', '>>=',
          ':=', '&&=', '||=', '[]=',
          '+', '-', '*', '/',
          '||', '%', '%%', '&&',
          '|', '^', '&', '!=',
          '==', '<>', '>', '~=',
          '~!', '>=', '<', '<=',
          '<=>', '<<', '>>', '[]',
          '""'
        )),
        '(',
        commaSep($.proc_parameter),
        ')',
        optional($.as_operator),
        optional($.block)
      )),
    ),

    proc_override: $ => seq(
      $._proc_signature,
      $.block
    ),

    _proc_signature: $ =>
      seq(
        field("name", $.identifier),
        '(',
        commaSep($.proc_parameter),
        ')',
        optional($.as_operator)
      )
    ,

    proc_parameter: $ => choice(
      $.inline_var_definition,
      '...'
    ),

    var_definition: $ => path($,
      'var',
      optional(fork($,
        choice(
          $.var_type,
          $.var_modifier,
          $.var_assignment
        ),
        field("name", $.identifier),
      )),
    ),

    var_type: $ => path($,
      field("root", $.identifier),
      fork($,
        choice($.var_subtype, $.var_assignment),
        field("name", $.identifier),
      ),
    ),

    var_subtype: $ => path($,
      $.identifier,
      fork($,
        choice($.var_subtype, $.var_assignment),
        field("name", $.identifier),
      ),
    ),

    var_modifier: $ => path($,
      choice(
        'static',
        'global',
        'tmp',
        'const',
        'final'
      ),
      fork($,
        choice($.var_type, $.var_assignment),
        field("name", $.identifier),
      ),
    ),

    type_var_assignment: $ => seq(
      field("name", $.identifier),
      repeat(seq('[', optional($.number_literal), ']')),
      choice(
        seq(
          seq("=", $.expression),
          optional($.as_operator)
        ),
        $.as_operator
      )
    ),

    var_assignment: $ => seq(
      field("name", $.identifier),
      repeat(seq('[', optional($.number_literal), ']')),
      optional(seq(
        "=",
        $.expression
      )),
      optional($.as_operator)
    ),

    /// Blocks

    block: $ => choice(
      $._braced_block,
      $._statements,
      $._indented_block
    ),

    _braced_block: $ => seq(
      "{",
      repeat(seq(
        $._statement, optional(';')
      )),
      "}"
    ),

    _indented_block: $ => seq(
      $._newline,
      optional(seq(
        $._indent,
        seq(
          repeat1($._statements),
          $._dedent,
        ))
      )
    ),

    _statements: $ => seq(
      sep1($._statement, ';'),
      optional(';'),
      $._newline,
    ),

    /// Statements

    _statement: $ => choice(
      $.var_definition,
      $.for_statement,
      $.while_statement,
      $.spawn_statement,
      $.switch_statement,
      $.set_statement,
      $.goto_statement,
      $.goto_label,
      $.if_statement,
      $.else_clause,
      $.try_catch_statement,
      $.throw_statement,
      $.continue_statement,
      $.break_statement,
      $.return_statement,
      seq($.expression, optional($.as_operator))
    ),

    spawn_statement: $ => seq(
      'spawn',
      optional(seq(
        '(',
        $.expression,
        ')'
      )),
      $.block
    ),

    set_statement: $ => seq(
      'set',
      field("setting", $.identifier),
      choice('=', 'in'),
      field("value", $.expression)
    ),

    switch_statement: $ => seq(
      'switch',
      '(',
      field('condition', $.expression),
      ')',
      $.block
    ),

    continue_statement: _ => prec.left("continue"),

    break_statement: _ => prec.left("break"),

    return_statement: $ => prec.left(seq(
      'return',
      optional($.expression),
    )),

    for_statement: $ => seq(
      'for',
      '(',
      field("condition", choice(
        $._for_list_condition,
        $._for_loop_condition
      )),
      ')',
      field("body", $.block),
    ),

    _for_list_condition: $ => seq(
      $.inline_var_definition,
      optional(seq(
        ",",
        field("value", $.expression)
      )),
      optional(seq(
        'in',
        field("list", $.expression)
      )),
      optional(seq(
        'step',
        field("step", $.number_literal)
      )),
    ),

    _for_loop_condition: $ => seq(
      optional(field('initial', $.inline_var_definition)),
      choice(',', ';'),
      optional(field('condition', $.expression)),
      choice(',', ';'),
      optional(field('increment', $.expression))
    ),

    while_statement: $ => choice(
      seq(
        'while',
        '(',
        field('condition', $.expression),
        ')',
        field("body", $.block)
      ),
      seq(
        'do',
        field("body", $.block),
        'while',
        '(',
        field('condition', $.expression),
        ')',
      )
    ),

    if_statement: $ => seq(
      'if',
      '(',
      field('condition', commaSep1($.expression)),
      ')',
      field("consequence", $.block),
    ),

    else_clause: $ => seq(
      'else',
      field("body", $.block)
    ),

    try_catch_statement: $ => prec(1, seq(
      'try',
      field("body", $.block),
      'catch',
      optional(
        seq('(',
          optional(seq('var', '/')),
          choice(
            $.type,
            field("name", $.identifier)
          ),
          ')')
      ),
      $.block
    )),

    throw_statement: $ => seq(
      'throw',
      field("exception", $.expression)
    ),

    goto_statement: $ => seq(
      'goto',
      field("label", $.identifier)
    ),

    goto_label: $ => seq(
      field("name", $.identifier),
      ':',
      field("body", $.block),
    ),

    inline_var_definition: $ => prec(1, seq(
      optional(seq('var', '/')),
      choice(
        $.type,
        field("name", $.identifier)
      ),
      repeat(seq('[', optional($.number_literal), ']')),
      optional(seq('=', $.expression)),
      optional($.as_operator)
    )),

    as_operator: $ => seq(
      'as',
      sep1($.as_type, '|')
    ),

    as_type: $ => choice(
      'anything',
      'text',
      'num',
      'file',
      $.null,
      $.type_literal,
    ),

    /// Expressions

    expression: $ => choice(
      $.identifier,
      $.builtin_vars,
      $.builtin_macro,
      $.null,
      $.binary_expression,
      $.update_expression,
      $.unary_expression,
      $.call_expression,
      $.new_expression,
      $.number_literal,
      $.type_literal,
      $.string_literal,
      $.return_value,
      $.parent_proc,
      $.conditional_expression,
      $.field_expression,
      $.array_expression,
      $.assignment_expression,
      $.parenthesized_expression
    ),

    assignment_expression: $ => prec.right(PREC.ASSIGNMENT, seq(
      field('left', choice(
        $.identifier,
        $.call_expression,
        $.field_expression,
        $.array_expression,
        $.parenthesized_expression,
        $.return_value
      )),
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
        '||=',
        '[]='
      )),
      field('right', $.expression),
    )),

    parenthesized_expression: $ => prec(1, seq(
      '(',
      $.expression,
      ')',
    )),

    conditional_expression: $ => prec.right(PREC.CONDITIONAL, seq(
      field('condition', $.expression),
      '?',
      optional(field('consequence', $.expression)),
      ':',
      field('alternative', $.expression),
    )),

    array_expression: $ => seq(
      $.expression,
      choice('[', '?['),
      field('size', $.expression),
      ']'
    ),

    call_expression: $ => prec(PREC.CALL, seq(
      field('function', $.expression),
      field("arguments", $.argument_list)
    )),

    field_expression: $ => seq(
      prec(PREC.FIELD, seq(field('argument', $.expression),
        field('operator', $.field_operator))),

      field('field', $.identifier),
    ),

    field_operator: _ => choice(
      token.immediate('.'),
      '?.',
      ':',
      '::'
    ),

    argument_list: $ => seq(
      '(',
      commaSep(choice(
        $.expression,
        $.pair
      )),
      ')'
    ),

    pair: $ => seq(
      field("key", $.expression),
      "=",
      field("value", $.expression)
    ),

    new_expression: $ => prec.right(seq(
      'new',
      optional(choice(
        $.type_literal,
        $.identifier
      )),
      optional(field("arguments", $.argument_list))
    )),

    unary_expression: $ => prec.left(PREC.UNARY, seq(
      field('operator', choice('!', '~', '-', '+')),
      field('argument', $.expression),
    )),

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

    update_expression: $ => {
      const argument = field('argument', $.expression);
      const operator = field('operator', choice('--', '++'));
      return prec.right(PREC.UNARY, choice(
        seq(operator, argument),
        seq(argument, operator),
      ));
    },

    /// Literals

    type_literal: $ => seq(
      '/',
      $.type
    ),

    type: $ => seq(
      field("root", $.identifier),
      repeat(
        seq(
          token.immediate('/'),
          $.identifier
        )
      )
    ),

    number_literal: _ => seq(
      optional(/[-\+]/),
      choice(
        /\d+/,
        /\d+\.\d*/,
        /0x[0-9a-fA-F]+/,
        /\d+e-?\d+/,
        /\d\.?#INF/,
        /\d\.?#IND/
      ),
    ),

    file_literal: _ => seq(
      '"',
      repeat(choice(/[^'\\]/, /\\./)),
      '"'
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
        /['"snt\\<>]/,
        /N\{[^}]+\}/,
        /[Tt]he/,
        /[Aa]n/,
        /[Aa]/,
        /[Hh]e/,
        /[Ss]he/,
        /[Hh]is/,
        "him",
        "himself",
        "hers",
        "proper",
        "improper",
        "th",
        "icon",
        "ref",
        /[Rr]oman/,
        "..."
      ),
    ))),

    _not_escape_sequence: _ => token.immediate('\\'),

    return_value: _ => '.',

    parent_proc: _ => '..',

    builtin_vars: _ => choice(
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

    identifier: _ => /[a-zA-Z_][a-zA-Z0-9_]*/,

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
});

/**
 * Creates an indented block with repeating `value` that ends with the `end`.
 * Represents branches of DM's path tree.
 *
 * @param {GrammarSymbols<string>} $
 *
 * @param {Rule} value
 *
 * @param {Rule} end
 *
 * @returns {SeqRule}
 */
function fork($, value, end) {
  return seq(
    $._indent,
    repeat1(
      choice(
        value,
        seq(
          end,
          $._newline
        ),
      )
    ),
    $._dedent
  );
}

/**
 * Creates an indented block with repeating `end`.
 * Represents branches of DM's path tree.
 *
 * @param {GrammarSymbols<string>} $
 *
 * @param {Rule} end
 *
 * @returns {SeqRule}
 */
function forkEnd($, end) {
  return seq(
    $._indent,
    repeat1(end),
    $._dedent
  );
}

/**
 * Creates a sequence of value, children and newline token.
 * Represents start of DM's path tree.
 *
 * @param {GrammarSymbols<string>} $
 *
 * @param {Rule|String} value
 *
 * @param {Rule} children
 *
 * @returns {SeqRule}
 */
function path($, value, children) {
  if (children === undefined) {
    return seq(
      value,
      $._newline,
    );
  }

  return seq(
    value,
    $._newline,
    children,
  );
};

/**
 * Creates a rule to optionally match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @returns {ChoiceRule}
 */
function commaSep(rule) {
  return optional(commaSep1(rule));
}

/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {RuleOrLiteral} rule
 *
 * @returns {SeqRule}
 */
function commaSep1(rule) {
  return seq(sep1(rule, ','), optional(','));
}

/**
 * Creates a rule to match one or more occurrences of `rule` separated by `sep`
 *
 * @param {RuleOrLiteral} rule
 *
 * @param {RuleOrLiteral} separator
 *
 * @returns {SeqRule}
 */
function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

/**
 * Creates a preprocessor regex rule
 *
 * @param {RegExp | Rule | string} command
 *
 * @returns {AliasRule}
 */
function preprocessor(command) {
  return alias(new RegExp('#[ \t]*' + command), '#' + command);
}

