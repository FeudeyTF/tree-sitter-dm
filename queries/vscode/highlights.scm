(comment) @comment
((identifier) @macro
 (#match? @macro "^[A-Z][A-Z\\d_]*$"))
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

(pair
  key: (identifier) @member)

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
  "#define"
  "#undef"
  "#include"
] @keyword

[
  (preproc_message)
  (preproc_arg)
] @string

(preproc_def
    name: (identifier) @constant)

(preproc_function_def
    name: (identifier) @function)

"return" @keyword

[
  "while"
  "for"
  "step"
  "continue"
  "break"
  "goto"
  "do"
] @keyword

[
  "if"
  "else"
  "switch"
  "to"
  "as"
  "in"
] @keyword

[
  "try"
  "catch"
  "throw"
] @keyword

(interpolation
  "[" @punctuation.special
  "]" @punctuation.special) @embedded

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
] @macro

[
  "static"
  "global"
  "final"
  "const"
  "tmp"
  "var"
  "new"
  "anything"
  "text"
  "num"
  "proc" 
  "operator"
  "verb"
] @macro

[
  "," "." ";" ":" "?." "?."
] @punctuation.delimiter

[
 "(" ")" "[" "]" "{" "}"
] @punctuation.bracket

"set" @keyword

"spawn" @function


(type_definition
  root: (identifier) @type)

(subtype_definition
  (identifier) @type)

(type
 (identifier) @type)

(var_type
 (identifier) @type)

(inline_var_definition
  name: (identifier) @variable)

(inline_var_definition 
 (type (identifier) @variable .))

[
 (string_start)
 (string_content)
 (string_end)
] @string

(file_literal) @string

(null) @macro

(number_literal) @number

(builtin_vars) @macro

(builtin_macro) @macro

