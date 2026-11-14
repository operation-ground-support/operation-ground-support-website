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
        # to be new enough for Astro (Astro 7.4 wants >=22.22).
        #
        # The major version is read from `.node-version`, which GitHub Actions and Cloudflare Pages
        # also read, so the dev shell, CI, and the production build cannot drift apart. Change it
        # there, to a version nixpkgs has a `nodejs_<major>` for.
        nodejs = pkgs."nodejs_${pkgs.lib.fileContents ./.node-version}";

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
          # `just deploy-preview` uploads `dist-preview/` to Cloudflare Pages. Build-time only, like node:
          # the deployed artifact is still a folder of static files, and the site does not depend
          # on anything Cloudflare provides at runtime.
          wrangler
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
