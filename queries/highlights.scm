(comment) @comment

(break_statement) @keyword
(continue_statement) @keyword
"else" @keyword
"for" @keyword
"if" @keyword
"in" @keyword
"return" @keyword
"static" @keyword
"switch" @keyword
"while" @keyword

"#define" @keyword
"#undef" @keyword
"#elif" @keyword
"#else" @keyword
"#endif" @keyword
"#if" @keyword
"#ifdef" @keyword
"#ifndef" @keyword
"#include" @keyword
"#warn" @keyword
"#error" @keyword

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
  directive: (identifier) @function.special)

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

"?." @delimiter
"." @delimiter
".[]" @delimiter

(string_literal) @string
(file_literal) @string
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

(proc_override
  name: (identifier) @function)

(proc_parameter
  name: (identifier) @variable)

(call_expression
  name: (identifier) @function)

(field_proc_expression
  proc: (identifier) @function)

(field_expression
 field: (identifier) @property) 

