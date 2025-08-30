# Troubleshooting 404 Error on GitHub Pages 🔍

## Current Issue

You're still getting a 404 error at `https://amyawu.github.io` even after configuring GitHub Pages deployment.

## Step-by-Step Troubleshooting

### **Step 1: Enable GitHub Pages in Repository Settings**

1. **Go to your repository**: `https://github.com/amyawu/amyawu.github.io`
2. **Click Settings** (tab)
3. **Click Pages** (left sidebar)
4. **Under "Source"**, select **"GitHub Actions"**
5. **Save the changes**

### **Step 2: Check GitHub Actions Workflow**

1. **Go to Actions tab** in your repository
2. **Look for the "Deploy Jekyll site to Pages" workflow**
3. **Check if it ran successfully** after your last push
4. **Look for any error messages** in the build logs

### **Step 3: Verify Workflow Configuration**

The workflow should:
- ✅ **Trigger** on push to master branch
- ✅ **Build** successfully with Jekyll
- ✅ **Deploy** to GitHub Pages
- ✅ **Show green checkmark** when complete

### **Step 4: Check Build Output**

If the workflow failed, look for:
- **Ruby version issues**
- **Jekyll build errors**
- **Missing dependencies**
- **SCSS compilation errors**

## Common Issues & Solutions

### **Issue 1: GitHub Pages Not Enabled**
- **Symptom**: 404 error persists
- **Solution**: Enable GitHub Pages in repository settings

### **Issue 2: Workflow Never Ran**
- **Symptom**: No Actions tab shows workflow runs
- **Solution**: Check if workflow file is in `.github/workflows/` directory

### **Issue 3: Build Failed**
- **Symptom**: Workflow shows red X or error
- **Solution**: Check build logs for specific error messages

### **Issue 4: Deployment Pending**
- **Symptom**: Workflow succeeded but site still 404
- **Solution**: Wait 5-10 minutes for GitHub Pages to update

## Manual Verification Steps

1. **Check repository structure**:
   ```
   .github/workflows/deploy.yml  ✅ (should exist)
   _config.yml                   ✅ (should have correct URL)
   .nojekyll                     ✅ (should exist)
   ```

2. **Verify _config.yml settings**:
   ```yaml
   url: https://amyawu.github.io
   baseurl: ""
   ```

3. **Check if workflow file is correct**:
   - Should trigger on `master` branch
   - Should build with Jekyll
   - Should deploy to GitHub Pages

## Next Steps

1. **Enable GitHub Pages** in repository settings
2. **Check Actions tab** for workflow status
3. **Look for any error messages** in build logs
4. **Wait for deployment** to complete (can take 5-10 minutes)

## If Still Getting 404

1. **Check Actions tab** - is the workflow running?
2. **Look for build errors** - what's failing?
3. **Verify Pages settings** - is GitHub Actions selected?
4. **Check deployment logs** - any specific error messages?

**Let me know what you see in the Actions tab and I can help further! 🚀** 