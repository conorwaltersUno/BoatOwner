# Docker Build Hanging Troubleshooting Guide

## Issue: Docker Build Hanging During npm install

### 🚨 Immediate Solutions

#### 1. **Use the Robust Deployment Workflow**
The project now includes a robust deployment workflow with multiple fallback strategies:

```bash
# Use the robust workflow by renaming files:
mv .github/workflows/deploy_dev_api.yml .github/workflows/deploy_dev_api_backup.yml
mv .github/workflows/deploy_dev_api_robust.yml .github/workflows/deploy_dev_api.yml
```

#### 2. **Test Docker Build Locally**
```bash
# Run the debug script to test locally
make debug_docker_build

# Or manually:
cd server
timeout 15m docker build --build-arg API_DB_URL="test_url" --progress=plain --no-cache -t boatowner-api:latest .
```

#### 3. **Check Runner Resources**
The enhanced workflow now provides detailed resource information to help identify bottlenecks.

### 🔍 Root Causes and Solutions

#### **Cause 1: npm install Hanging**
**Symptoms**: Build stops after showing npm deprecation warnings
**Solutions**:
- ✅ **Fixed**: Updated Dockerfile to use `npm ci` instead of `npm install`
- ✅ **Fixed**: Added npm timeout configurations
- ✅ **Fixed**: Implemented build timeout (15 minutes)

#### **Cause 2: Resource Exhaustion**
**Symptoms**: Build fails without clear error message
**Solutions**:
- ✅ **Fixed**: Added resource monitoring to workflow
- ✅ **Fixed**: Added cleanup steps before build
- ✅ **Fixed**: Added disk space checks

#### **Cause 3: Docker Layer Caching Issues**
**Symptoms**: Build rebuilds everything every time
**Solutions**:
- ✅ **Fixed**: Optimized Dockerfile to copy package.json first
- ✅ **Fixed**: Added `--no-cache` flag to prevent stale cache issues
- ✅ **Fixed**: Created optimized multi-stage Dockerfile

#### **Cause 4: Network Timeouts**
**Symptoms**: Hangs during package downloads
**Solutions**:
- ✅ **Fixed**: Added npm retry configurations
- ✅ **Fixed**: Added overall build timeout
- ✅ **Fixed**: Improved error reporting

### 🛠️ Files Changed

1. **`server/dockerfile`** - Optimized with better caching and npm ci
2. **`server/dockerfile.optimized`** - Multi-stage build with Alpine Linux
3. **`.github/workflows/deploy_dev_api.yml`** - Enhanced with debugging
4. **`.github/workflows/deploy_dev_api_robust.yml`** - Fallback strategies
5. **`debug-docker-build.sh`** - Local testing script
6. **`Makefile`** - Added debug command

### 🧪 Testing Steps

#### **Step 1: Test Locally**
```bash
# Test the current Dockerfile
make debug_docker_build

# If that fails, test the optimized version
cd server
docker build -f dockerfile.optimized --build-arg API_DB_URL="test" -t boatowner-api:latest .
```

#### **Step 2: Test Deployment**
```bash
# Commit the fixes and test deployment
git add .
git commit -m "fix: docker build hanging issues with enhanced debugging"
git push origin develop

# Monitor at: https://github.com/your-username/BoatOwner/actions
```

#### **Step 3: Fallback if Still Failing**
If the build still hangs:

1. **Check Runner Resources**: Look at the debug output in GitHub Actions
2. **Try Optimized Dockerfile**: Switch to `dockerfile.optimized`
3. **Reduce Dependencies**: Temporarily remove problematic packages
4. **Use Different Base Image**: Try `node:22-alpine` instead of `node:22`

### 🚀 Quick Fixes if Still Hanging

#### **Option A: Switch to Optimized Dockerfile**
```bash
cd server
mv dockerfile dockerfile.backup
mv dockerfile.optimized dockerfile
```

#### **Option B: Reduce npm Install Scope**
```bash
# In server/dockerfile, replace npm ci with:
# RUN npm ci --verbose --no-audit --no-fund --production
```

#### **Option C: Use Pre-built Base Image**
```bash
# Create a custom base image with dependencies pre-installed
# Then use that in the Dockerfile instead of installing every time
```

### 📋 Monitoring Checklist

When testing deployment, monitor these in GitHub Actions:

- [ ] **Resource Usage**: Disk space, memory, CPU
- [ ] **Build Progress**: Each Dockerfile step completion
- [ ] **npm Output**: Detailed package installation logs
- [ ] **Timeout Behavior**: Whether timeouts are triggering
- [ ] **Docker System**: Container and image status

### 🆘 Emergency Deployment

If Docker builds continue to fail:

1. **Use Pre-built Image**: Build locally and push to registry
2. **Simplify Dockerfile**: Remove optimizations, use basic setup
3. **Skip Docker**: Deploy directly with node (not recommended for production)

### 📞 Getting Help

If issues persist:
1. Check GitHub Actions logs for specific error patterns
2. Run `make debug_docker_build` locally to compare behavior
3. Review disk space and memory usage in the debug output
4. Consider upgrading GitHub Actions runner specifications

---

**Created**: $(date)  
**Status**: Active troubleshooting guide  
**Next Update**: After successful deployment test
