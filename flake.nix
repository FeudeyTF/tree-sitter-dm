{
  description = "tree-sitter-dm environment";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs";
    utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      utils,
    }:
    utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          name = "tree-sitter-dm environment";

          packages = with pkgs; [
            nodejs
            tree-sitter
            python3
            cmake
            clang-tools
            uncrustify
          ];
        };
      }
    );
}
