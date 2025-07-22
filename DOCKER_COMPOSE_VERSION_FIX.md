# Docker Compose Version Compatibility Fix

## Issue Identified

The EC2 deployment server is running an older version of Docker that uses the legacy `docker-compose` command syntax (with hyphen) instead of the newer `docker compose` command (space-separated).

## Error Analysis

```
err: unknown shorthand flag: 'f' in -f
err: See 'docker --help'.
```

This error occurs when Docker tries to interpret `docker compose -f` as `docker -f compose`, which is incorrect syntax.

## Root Cause

The EC2 instance has Docker installed but not the newer Docker Compose V2 plugin. Instead, it has the legacy standalone `docker-compose` binary.

## Fix Applied

### ✅ Updated `deploy_api.yml` workflow

**Before (failing):**
```bash
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml logs --tail=20
docker compose -f docker-compose.dev.yml ps
```

**After (working):**
```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml logs --tail=20
docker-compose -f docker-compose.dev.yml ps
```

## Files Updated

1. **`.github/workflows/deploy_api.yml`** - Updated all Docker Compose commands to use legacy syntax

## Docker Version Compatibility

### Modern Docker (V2) - Newer installations
```bash
docker compose -f docker-compose.dev.yml up -d
```

### Legacy Docker Compose - Older installations  
```bash
docker-compose -f docker-compose.dev.yml up -d
```

## Template Files Status

The staging and production workflow templates already include fallback commands:
```bash
docker-compose -f docker-compose.staging.yml up -d || docker compose -f docker-compose.staging.yml up -d
```

## Next Steps

### Option 1: Update EC2 Docker (Recommended for long-term)
```bash
# Install Docker Compose V2 plugin on EC2
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Verify installation
docker compose version
```

### Option 2: Keep using legacy syntax (Current fix)
- Continue using `docker-compose` commands
- Works with existing EC2 Docker installation
- No changes needed on server

## Deployment Status

✅ **Fixed**: GitHub Actions workflow now uses compatible Docker Compose syntax  
🟢 **Ready**: DEV environment deployment should now work properly  
📋 **Next**: Test deployment to verify fix

## Testing the Fix

1. **Push a change to `develop` branch**
2. **Monitor GitHub Actions workflow**
3. **Verify containers start successfully**
4. **Test API health endpoint**

---

**Created**: 2025-07-22  
**Issue**: Docker Compose version compatibility  
**Status**: Fixed and ready for testing
