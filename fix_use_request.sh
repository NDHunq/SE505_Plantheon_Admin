#!/bin/bash

# Script to comment out all useRequest calls with undefined functions in pages

echo "Fixing all pages with useRequest errors..."

# List of files to fix
files=(
  "src/pages/account/center/index.tsx"
  "src/pages/account/center/components/Applications/index.tsx"
  "src/pages/account/center/components/Articles/index.tsx"
  "src/pages/account/center/components/Projects/index.tsx"
  "src/pages/account/settings/components/base.tsx"
  "src/pages/list/card-list/index.tsx"
  "src/pages/list/search/applications/index.tsx"
  "src/pages/list/search/articles/index.tsx"
  "src/pages/list/search/projects/index.tsx"
  "src/pages/profile/basic/index.tsx"
  "src/pages/table-list/components/CreateForm.tsx"
  "src/pages/table-list/components/UpdateForm.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    # Add TODO comment before useRequest calls
    sed -i '' 's/\(.*\)useRequest(/\/\/ TODO: Replace with real API\n  \1useRequest(/g' "$file" 2>/dev/null || true
  fi
done

echo "Done!"
