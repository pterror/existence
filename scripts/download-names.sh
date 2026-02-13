#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"
DATA="$ROOT/vendor"

mkdir -p "$DATA/census-surnames" "$DATA/ssa-babynames"

# --- US Census 2010 surnames ---
SURNAME_URL="https://www2.census.gov/topics/genealogy/2010surnames/names.zip"
SURNAME_ZIP="$DATA/census-surnames/names.zip"
SURNAME_CSV="$DATA/census-surnames/Names_2010Census.csv"

if [ ! -f "$SURNAME_CSV" ]; then
  echo "Downloading Census 2010 surnames..."
  curl -L -o "$SURNAME_ZIP" "$SURNAME_URL"
  bun -e "
    const fs = require('fs');
    const path = require('path');
    const { unzipSync } = require('fflate');
    const data = fs.readFileSync('$SURNAME_ZIP');
    const files = unzipSync(new Uint8Array(data));
    for (const [name, content] of Object.entries(files)) {
      const out = path.join('$DATA/census-surnames', path.basename(name));
      fs.writeFileSync(out, Buffer.from(content));
      console.log('Extracted:', out);
    }
  "
  rm -f "$SURNAME_ZIP"
  echo "Done: $SURNAME_CSV"
else
  echo "Census surnames already present."
fi

# --- SSA baby names ---
# https://www.ssa.gov/oact/babynames/names.zip
# SSA blocks automated downloads. If curl fails, manually download the zip
# from the URL above and extract into data/ssa-babynames/
SSA_URL="https://www.ssa.gov/oact/babynames/names.zip"
SSA_ZIP="$DATA/ssa-babynames/names.zip"
SSA_MARKER="$DATA/ssa-babynames/yob2000.txt"

if [ ! -f "$SSA_MARKER" ]; then
  echo "Downloading SSA baby names..."
  curl -L -o "$SSA_ZIP" "$SSA_URL"
  # Check if we got an actual zip file
  if file "$SSA_ZIP" | grep -q "Zip archive"; then
    bun -e "
      const fs = require('fs');
      const path = require('path');
      const { unzipSync } = require('fflate');
      const data = fs.readFileSync('$SSA_ZIP');
      const files = unzipSync(new Uint8Array(data));
      for (const [name, content] of Object.entries(files)) {
        const out = path.join('$DATA/ssa-babynames', path.basename(name));
        fs.writeFileSync(out, Buffer.from(content));
      }
      console.log('Extracted SSA baby names');
    "
    rm -f "$SSA_ZIP"
  else
    rm -f "$SSA_ZIP"
    echo ""
    echo "ERROR: SSA blocked the automated download (they reject non-browser requests)."
    echo ""
    echo "  1. Open in your browser:  $SSA_URL"
    echo "  2. Save the zip file, then extract it:"
    echo "     unzip names.zip -d $DATA/ssa-babynames/"
    echo "  3. Re-run this script to verify, then run: bun scripts/build-names.js"
    echo ""
    exit 1
  fi
  echo "Done: $DATA/ssa-babynames/"
else
  echo "SSA baby names already present."
fi

echo "Name data ready in $DATA"
