{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        # Node is only a build-time tool here. Nothing it produces is served at runtime; the
        # deployable artifact is the static `dist/` directory, so the exact Node version only has
        # to be new enough for Astro (>=18.20.8, and Astro 5 wants >=20.3).
        nodejs = pkgs.nodejs_22;

        commonTools = with pkgs; [
          nodejs
          just
          ripgrep
          jq
          nixfmt
          # Image handling for the photo pipeline. `sharp` is what Astro's <Image> uses under the
          # hood and it vendors its own libvips, but these are for one-off work on source photos.
          imagemagick
          exiftool
          # `svgo` minifies the logo SVGs once they exist
          svgo
          # `just share` packs the offline copy of the site into something emailable
          zip
        ];
      in
      {
        devShells.default = pkgs.mkShell {
          packages = commonTools;
          shellHook = ''
            # Keep npm's cache and global prefix inside the repo so the shell is self-contained
            # and `just clean` can actually clean.
            export NPM_CONFIG_CACHE="$PWD/.npm-cache"
            export ASTRO_TELEMETRY_DISABLED=1
          '';
        };

        # run `nix fmt` to format all nix files
        formatter = pkgs.nixfmt-tree;
      }
    );
}
