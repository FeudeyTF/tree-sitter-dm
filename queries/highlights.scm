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

(preproc_call_expression
  directive: (identifier) @keyword)

(comment) @comment
(number_literal) @number
(string_literal) @string
(file_literal) @string
(var_modifier) @keyword
"return" @keyword.return
(continue_statement) @keyword.repeat
(break_statement) @keyword.repeat
"if" @keyword.conditional
"to" @keyword.conditional
"else" @keyword.conditional
"switch" @keyword.conditional
"for" @keyword.repeat
"in" @keyword.repeat
"while" @keyword.repeat
"new" @keyword
(builtin_const) @keyword
(null_const) @keyword
(builtin_macro) @keyword

"#include" @keyword.directive
"#define" @keyword.directive
"#undef" @keyword.directive
"#if" @keyword.directive
"#elif" @keyword.directive
"#else" @keyword.directive
"#endif" @keyword.directive
"#ifdef" @keyword.directive
"#ifndef" @keyword.directive
"#warn" @keyword.directive
"#error" @keyword.directive

(preproc_message) @string

(preproc_ifdef
  name: (identifier) @keyword)

(preproc_def
 name: (identifier) @keyword) 

(preproc_undef
 name: (identifier) @keyword) 

(preproc_defproc
  name: (identifier) @keyword)
