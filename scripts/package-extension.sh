#!/usr/bin/env bash

set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
version="$(sed -n 's/.*"version": "\([^"]*\)".*/\1/p' "$project_root/manifest.json" | head -n 1)"
archive_name="rtl-markdown-viewer-${version}.zip"
output_directory="$project_root/dist"
output_archive="$output_directory/$archive_name"
temporary_directory="$(mktemp -d)"

cleanup() {
  rm -rf "$temporary_directory"
}
trap cleanup EXIT

mkdir -p "$output_directory"

cd "$project_root"
# Package tracked extension files and the required localization assets. Never
# include arbitrary untracked notes or hidden files from a source directory.
{
  git ls-files -- manifest.json LICENSE PRIVACY.md icons popup sample src vendor _locales
  printf '%s\n' src/i18n.js _locales/en/messages.json _locales/ar/messages.json
} | LC_ALL=C sort -u > "$temporary_directory/package-files.txt"
zip -Xqr "$temporary_directory/$archive_name" \
  -@ < "$temporary_directory/package-files.txt"

unzip -tq "$temporary_directory/$archive_name"
mv "$temporary_directory/$archive_name" "$output_archive"
(
  cd "$output_directory"
  shasum -a 256 "$archive_name" > "$archive_name.sha256"
)

printf 'Created %s\n' "$output_archive"
printf 'Created %s\n' "$output_archive.sha256"
