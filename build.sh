#!/bin/bash

echo "Installing dependencies..."
bundle install

echo "Cleaning previous build..."
rm -rf _site

echo "Building Jekyll site..."
bundle exec jekyll build

if [ $? -eq 0 ]; then
    echo "✅ Build successful! Site generated in _site/ directory"
    echo "📁 Build contents:"
    ls -la _site/
    echo ""
    echo "🚀 Ready to deploy to Netlify!"
else
    echo "❌ Build failed! Please check the error messages above"
    exit 1
fi 