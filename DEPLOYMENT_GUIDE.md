# Netlify Deployment Guide

## Configuration Changes Made

1. **URL Settings**: 
   - `url: ""` (empty for Netlify)
   - `baseurl: ""` (empty for root domain deployment)

2. **Pagination**: Disabled in main config to avoid conflicts

3. **Netlify Config**: Added simplified `netlify.toml` with essential build settings (no external plugins required)

## Netlify Build Settings

- **Build command**: `bundle exec jekyll build`
- **Publish directory**: `_site`
- **Jekyll version**: 4.2.0
- **Ruby version**: 3.1.0
- **Bundler version**: 2.6.9

## Compatibility Fixes Applied

- **Jekyll Version**: Upgraded to 4.2.0 for Ruby 3.1.0 compatibility
- **Ruby Version**: Set to 3.1.0 to meet Bundler 2.6.9 requirements
- **Bundler Version**: Specified 2.6.9 for compatibility (available on Netlify)
- **Dependencies**: Removed webrick gem (not needed for Jekyll 4.x)

## Next Steps

1. Commit these changes:
   ```bash
   git add .
   git commit -m "Configure for Netlify deployment"
   git push origin main
   ```

2. In Netlify:
   - Connect your GitHub repository
   - Build command: `bundle exec jekyll build`
   - Publish directory: `_site`
   - Deploy!

## Why This Fixes 404 Errors

- **Before**: Site expected to be served from `/al-folio` subdirectory
- **After**: Site expects to be served from root domain
- **Result**: All internal links and assets resolve correctly

## Simplified Netlify Configuration

The `netlify.toml` file is now simplified and contains only essential build settings:
- **No external plugins** required (removes dependency issues)
- **Basic build configuration** that Netlify can handle natively
- **Version specifications** for Ruby, Jekyll, and Bundler 