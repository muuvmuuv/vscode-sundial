NAME=$(cat package.json | jq -r '.name')
DISPLAY_NAME=$(cat package.json | jq -r '.displayName')
DESCRIPTION=$(cat package.json | jq -r '.description')
VERSION=$(cat package.json | jq -r '.version')
LICENSE=$(cat package.json | jq -r '.license')
AUTHOR=$(cat package.json | jq -r '.author.name')
AUTHOR_EMAIL=$(cat package.json | jq -r '.author.email')
PKG=$(cat package.json | jq -r '.homepage')

BANNER="/**
 * $DISPLAY_NAME ($NAME)
 *
 * $DESCRIPTION
 *
 * @version $VERSION
 * @license $LICENSE
 * @author $AUTHOR <$AUTHOR_EMAIL>
 * @pkg $PKG
 */"

source .env

mkdir -p tmp/ext
mkdir -p tmp/data

echo "  Running esbuild..."
echo ""
echo "$BANNER"

node_modules/.bin/esbuild src/extension.ts \
  --platform=node \
  --bundle \
  --format=cjs \
  --target=es2020 \
  --external:vscode \
  --outfile=dist/extension.js \
  --sourcemap=external \
  --banner:js="$BANNER" \
  "$@"
