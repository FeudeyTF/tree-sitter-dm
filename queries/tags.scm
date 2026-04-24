(proc_definition
  name: (identifier) @name) @definition.function

(type_definition
  (type_path 
    (type_identifier) @name)) @definition.type

(type_path_expression 
  (type_identifier) @name) @reference.type

(call_expression
  name: [
      (identifier) @name
  ]) @reference.call
