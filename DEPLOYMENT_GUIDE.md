# Netlify Deployment Guide

## Configuration Changes Made

1. **URL Settings**: 
   - `url: ""` (empty for Netlify)
   - `baseurl: ""` (empty for root domain deployment)

2. **Pagination**: Disabled in main config to avoid conflicts

3. **Netlify Config**: Added `netlify.toml` with proper build settings

## Netlify Build Settings

- **Build command**: `bundle exec jekyll build`
- **Publish directory**: `_site`
- **Jekyll version**: 4.3.2

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