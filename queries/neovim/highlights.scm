(comment) @comment @spell

(identifier) @variable

(proc_definition
  name: (identifier) @function)

(proc_override
  name: (identifier) @function)

(call_expression
  [
    function: (identifier) @function.call
    (field_expression field: (identifier) @function.call .)
  ]
)


((identifier) @constant
 (#match? @constant "^[A-Z][A-Z][A-Z\\d_]*$"))

[
  "#if"
  "#ifdef"
  "#ifndef"
  "#else"
  "#elif"
  "#endif"
  "#error"
  "#warn"
  "#pragma"
] @keyword.directive

[
  "#define"
  "#undef"
] @keyword.directive.define

"#include" @keyword.import

[
  (preproc_message)
  (preproc_arg)
] @string

(preproc_def
    name: (identifier) @constant.macro)

(preproc_function_def
    name: (identifier) @function)

"return" @keyword.return

[
  "while"
  "for"
  "step"
  "continue"
  "break"
  "goto"
  "do"
] @keyword.repeat

[
  "if"
  "else"
  "switch"
  "to"
  "as"
  "in"
] @keyword.conditional

(conditional_expression
  [
    "?"
    ":"
  ] @keyword.conditional.ternary)

[
  "try"
  "catch"
  "throw"
] @keyword.exception

"..." @variable.parameter.builtin

"/" @punctuation.delimiter

[
  "("
  ")"
  "{"
  "}"
] @punctuation.bracket


[
  "="
  "-"
  "*"
  "/"
  "+"
  "%"
  "%%"
  "|"
  "&"
  "^"
  "<<"
  ">>"
  "<"
  "<="
  ">="
  ">"
  "=="
  "<>"
  "~="
  "~!"
  ":="
  "!="
  "!"
  "&&"
  "||"
  "-="
  "+="
  "*="
  "/="
  "%="
  "|="
  "&="
  "^="
  ">>="
  "<<="
  "--"
  "++"
  "&&="
  "||="
  "%%="
] @operator

[
  "TRUE"
  "FALSE"
] @boolean

(field_operator) @delimiter

[
  "static"
  "global"
  "final"
  "const"
  "tmp"
] @keyword.modifier

"set" @keyword

"spawn" @function

(type_definition
  root: (identifier) @type)

(type
  root: (identifier) @type)

(var_type
  root: (identifier) @type)

(subtype_definition
  (identifier) @type)

(var_subtype
  (identifier) @type)

(type
  (identifier) @type)

(inline_var_definition
  name: (identifier) @variable)

(inline_var_definition 
 (type (identifier) @variable .))

(number_literal) @number

(interpolation
  "[" @punctuation.special
  "]" @punctuation.special) @embedded

[
 (string_literal)
 (file_literal)
] @string

(escape_sequence) @string.escape

[
  "var"
  "new"
  "anything"
  "text"
  "num"
] @keyword

[
  "proc" 
  "operator"
  "verb"
] @keyword.function

(null) @keyword

(builtin_vars) @variable.builtin

(builtin_macro) @constant.macro


