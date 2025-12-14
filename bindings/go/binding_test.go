package tree_sitter_dm_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_dm "github.com/feudeytf/tree-sitter-dm/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_dm.Language())
	if language == nil {
		t.Errorf("Error loading DreamMaker grammar")
	}
}
