((line_comment) @injection.content
  (#set! injection.language "comment"))

(call_expression
  name: (identifier) @_regex
  arguments: (argument_list
    (expression
      (literal
        (string_literal
          (string_content) @injection.content))))
  (#eq? @_regex "regex")
  (#set! injection.language "regex"))
