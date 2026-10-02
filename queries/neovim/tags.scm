(proc_definition
  name: (identifier) @name) @definition.function

(call_expression
  function: [
      (identifier) @name
  ]) @reference.call
