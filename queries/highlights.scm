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
(var_modifier) @keyword
"return" @keyword.return
"if" @keyword.conditional
"to" @keyword.conditional
"else" @keyword.conditional
"switch" @keyword.conditional
"for" @keyword.repeat
"in" @keyword.repeat
"new" @keyword
(builtin_const) @keyword
(null_const) @keyword
(builtin_macro) @keyword

"#define" @keyword.directive
(preproc_def
 name: (identifier) @keyword) 
