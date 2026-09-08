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
# Only package tracked extension files, never local notes or hidden files that
# happen to be present in a source directory.
git ls-files -- manifest.json icons popup sample src vendor > "$temporary_directory/package-files.txt"
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
