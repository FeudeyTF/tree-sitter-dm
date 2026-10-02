; Scopes

[
 (block)
 (subtype_definition)
 (type_definition)
] @local.scope

; Definitions

(var_assignment
  name: (identifier))  @local.definition

; References

(var_type
  root: (identifier) @ignore)

(var_subtype
  (identifier) @ignore)

(type_literal
  (type
    (identifier)  @ignore))

(type_definition
  (identifier) @ignore)

(subtype_definition
  (identifier) @ignore)

(identifier) @local.reference
