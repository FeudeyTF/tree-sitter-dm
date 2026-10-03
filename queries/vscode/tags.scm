(proc_definition
  name: (identifier) @name) @definition.function

(proc_override
  name: (identifier) @name) @definition.function

(subtype_definition
  (identifier) @name
  (var_assignment)
) @definition.type

(type_definition
  root: (identifier) @name
  (var_assignment)
) @definition.type

(type
  (identifier) @name) @reference.type

(var_type
  root: (identifier)  @name) @reference.type

(var_subtype
  (identifier) @name) @reference.type

(call_expression
  [
    function: (identifier) @name
    (field_expression field: (identifier) @name .)
  ]
) @reference.call


