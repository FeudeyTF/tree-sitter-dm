(comment) @comment @spell
(identifier) @variable
((identifier) @constant
 (#match? @constant "^[A-Z][A-Z\\d_]*$"))

(pair
  key: (literal (identifier) @member))

[
  "while"
  "for"
  "in"
  "step"
  (continue_statement)
  (break_statement)
  "goto"
] @keyword.repeat

[
  "if"
  "else"
  "switch"
  "to"
  "as"
] @keyword.conditional

[
  "try"
  "catch"
] @keyword.exception

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

"..." @punctuation.special

[
  "("
  ")"
  "["
  "]"
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

(conditional_expression
  [
    "?"
    ":"
  ] @keyword.conditional.ternary)

(type_operator) @punctuation.delimiter

"return" @keyword.return
[
  "static"
  "global"
  "final"
  "const"
  "tmp"
] @keyword

"new" @keyword

(preproc_message) @string

(preproc_ifdef
  name: (identifier) @keyword)

(preproc_def
 name: (identifier) @keyword) 

(preproc_undef
 name: (identifier) @keyword) 

(preproc_defproc
  name: (identifier) @keyword)

(preproc_call_expression
  directive: (identifier) @keyword)

[
 "?."
 "."
] @delimiter

(interpolation
  "[" @punctuation.special
  "]" @punctuation.special) @embedded
[
 (string_start)
 (string_content)
 (string_end)
 (file_literal)
] @string

(null) @keyword
(number_literal) @number
(builtin_const) @keyword
(builtin_macro) @keyword

(primitive_type) @type
(var_keyword) @keyword
(proc_keyword) @keyword

(var_definition
  name: (identifier) @variable)

(proc_definition
  name: (identifier) @function)

(type_proc_definition
  name: (identifier) @function)

(proc_override
  name: (identifier) @function)

(proc_parameter
  name: (identifier) @variable)

(call_expression
  name: (identifier) @function.call)

(field_proc_expression
  proc: (identifier) @function.call)

(field_expression
 field: (identifier) @property) 

(as_type) @keyword

