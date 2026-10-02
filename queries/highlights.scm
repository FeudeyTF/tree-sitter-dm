(comment) @comment

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
  "," "." ";" ":" "?." "?."
] @punctuation.delimiter

[
 "(" ")" "[" "]" "{" "}"
] @punctuation.bracket

"set" @keyword

"spawn" @function

[
  "static"
  "global"
  "final"
  "const"
  "tmp"
] @keyword

(type_definition
  root: (identifier) @type)

(type
  root: (identifier) @type)

(var_type
  root: (identifier) @type)

[
 (string_start)
 (string_content)
 (string_end)
] @string

(file_literal) @string

(null) @keyword

(number_literal) @number

(builtin_vars) @keyword

(builtin_macro) @keyword

[
  "var"
  "new"
  "anything"
  "text"
  "num"
  "proc" 
  "operator"
  "verb"
] @keyword

