((line_comment) @injection.content
  (#set! injection.language "comment"))

((call_expression
  function: (identifier) @_regex
  arguments: (argument_list
    (string_literal
      (string_content) @injection.content))
  (#eq? @_regex "regex")
  (#set! injection.language "regex")))

