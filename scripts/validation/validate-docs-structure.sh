#!/bin/bash
# Documentation Structure Validator
# Verifies that all documentation follows the organized structure

echo "📚 Beuni Platform - Documentation Structure Validation"
echo "=================================================="

# Check main documentation files
main_docs=("README.md" "ARCHITECTURE.md" "SECURITY.md" "TESTING.md" "TROUBLESHOOTING.md" "REFACTORING.md" "RECENT_UPDATES.md")

echo "✅ Checking main documentation files..."
for doc in "${main_docs[@]}"; do
    if [ -f "docs/$doc" ]; then
        echo "  ✓ $doc"
    else
        echo "  ✗ $doc (missing)"
    fi
done

# Check organized folders
folders=("api" "deploy" "development" "monitoring" "project" "quality" "security" "testing" "troubleshooting" "refactoring" "legacy")

echo ""
echo "📁 Checking organized folder structure..."
for folder in "${folders[@]}"; do
    if [ -d "docs/$folder" ]; then
        file_count=$(find "docs/$folder" -name "*.md" | wc -l)
        echo "  ✓ $folder/ ($file_count files)"
    else
        echo "  ✗ $folder/ (missing)"
    fi
done

# Check scripts organization
echo ""
echo "🔧 Checking scripts organization..."
if [ -d "scripts" ]; then
    echo "  ✓ scripts/ folder exists"
    for subfolder in "setup" "deployment" "verification"; do
        if [ -d "scripts/$subfolder" ]; then
            script_count=$(find "scripts/$subfolder" -name "*.*" | wc -l)
            echo "    ✓ scripts/$subfolder/ ($script_count files)"
        else
            echo "    ✗ scripts/$subfolder/ (missing)"
        fi
    done
else
    echo "  ✗ scripts/ folder missing"
fi

# Summary
echo ""
echo "📊 Organization Summary:"
echo "  - Main docs in root level: $(ls docs/*.md 2>/dev/null | wc -l)"
echo "  - Organized folders: $(ls -d docs/*/ 2>/dev/null | wc -l)"
echo "  - Total markdown files: $(find docs -name "*.md" 2>/dev/null | wc -l)"
echo "  - Scripts organized: $(find scripts -name "*.*" 2>/dev/null | wc -l)"

echo ""
echo "✅ Documentation structure validation complete!"