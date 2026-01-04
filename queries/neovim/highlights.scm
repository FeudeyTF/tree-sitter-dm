(comment) @comment @spell

[
  "while"
  "for"
  "in"
  (continue_statement)
  (break_statement)
] @keyword.repeat


[
  "if"
  "else"
  "switch"
  "to"
] @keyword.conditional

[
  "#if"
  "#ifdef"
  "#ifndef"
  "#else"
  "#elif"
  "#endif"
  "#error"
  "#warn"
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
  "new"
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

"return" @keyword.return
"static" @keyword

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

"?." @delimiter
"." @delimiter

(string_literal) @string
(null) @constant
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

