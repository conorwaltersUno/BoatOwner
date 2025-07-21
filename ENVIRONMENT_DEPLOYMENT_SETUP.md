# Environment-Specific Deployment Setup

This document explains the new environment-specific deployment architecture for BoatOwner.

## 🏗️ Architecture Overview

Each environment (local, dev, staging, prod) has its own:
- **Docker Compose file**: `docker-compose.{env}.yml`
- **Environment variables file**: `server/.env.{env}`
- **Database configuration**: Separate RDS instances per environment
- **Deployment workflow**: Environment-specific CI/CD

## 📁 File Structure

```
├── docker-compose.yml         # Local development only
├── docker-compose.dev.yml     # DEV environment
├── docker-compose.staging.yml # STAGING environment  
├── docker-compose.prod.yml    # PRODUCTION environment
└── server/
    ├── .env.local              # Local development
    ├── .env.dev                # DEV environment
    ├── .env.staging            # STAGING environment
    ├── .env.prod               # PRODUCTION environment
    └── .env.example            # Template for all environments
```

## 🗄️ Database Configuration

### DEV Environment
- **Host**: `boatowner-dev-db.cnmog8qkotxj.eu-west-1.rds.amazonaws.com`
- **Database**: `boatowner_dev`
- **User**: `boatowner_dev_user`
- **Password**: `boatowner_dev_password`
- **Port**: `5432`

### Future Environments
- **STAGING**: `boatowner-staging-db.eu-west-1.rds.amazonaws.com`
- **PRODUCTION**: `boatowner-prod-db.eu-west-1.rds.amazonaws.com`

## 🚀 Deployment Commands

### Local Development
```bash
# Start local development environment
docker-compose up -d

# Includes: PostgreSQL + Flyway + API with hot reload
```

### DEV Environment
```bash
# Deploy to DEV
docker-compose -f docker-compose.dev.yml up -d

# Uses: Pre-built Docker image + AWS RDS DEV database
```

### Future Environments
```bash
# Deploy to STAGING
docker-compose -f docker-compose.staging.yml up -d

# Deploy to PRODUCTION  
docker-compose -f docker-compose.prod.yml up -d
```

## 🔐 GitHub Actions Secrets

### Required Secrets for DEV Environment
```
DEV_EC2_HOST=<ec2-public-ip-or-dns>
DEV_EC2_USER=<ssh-username>
DEV_EC2_SSH_KEY=<private-key-content>
DEV_DB_URL=postgresql://boatowner_dev_user:boatowner_dev_password@boatowner-dev-db.cnmog8qkotxj.eu-west-1.rds.amazonaws.com:5432/boatowner_dev
DEV_DB_USER=boatowner_dev_user
DEV_DB_PASSWORD=boatowner_dev_password
API_DB_URL=<same-as-dev-db-url-for-docker-build>
```

### Future Secrets for STAGING/PROD
```
STAGING_EC2_HOST=<staging-ec2-host>
STAGING_EC2_USER=<staging-ssh-user>
STAGING_EC2_SSH_KEY=<staging-private-key>
STAGING_DB_URL=<staging-database-url>
STAGING_DB_USER=<staging-db-user>
STAGING_DB_PASSWORD=<staging-db-password>

PROD_EC2_HOST=<prod-ec2-host>
PROD_EC2_USER=<prod-ssh-user>
PROD_EC2_SSH_KEY=<prod-private-key>
PROD_DB_URL=<prod-database-url>
PROD_DB_USER=<prod-db-user>
PROD_DB_PASSWORD=<prod-db-password>
```

## 🔄 CI/CD Workflow

### Current DEV Workflow
1. **Trigger**: Push to `develop` branch with `server/**` changes
2. **Build**: Create Docker image with DEV database URL
3. **Upload**: Copy Docker image, `.env.dev`, and `docker-compose.dev.yml` to EC2
4. **Deploy**: Run `docker-compose -f docker-compose.dev.yml up -d`

### Future Workflows
- **STAGING**: Triggered by push to `staging` branch
- **PRODUCTION**: Triggered by push to `main` branch or manual approval

## 🛠️ Environment Setup Steps

### 1. Set Up DEV RDS Database
```sql
-- Connect to your DEV RDS instance as master user
CREATE DATABASE boatowner_dev;
CREATE USER boatowner_dev_user WITH PASSWORD 'boatowner_dev_password';
GRANT ALL PRIVILEGES ON DATABASE boatowner_dev TO boatowner_dev_user;
```

### 2. Update GitHub Secrets
Add all the DEV_* secrets to your GitHub repository settings.

### 3. Update Local Environment Files
Copy and customize the environment files for your needs:
```bash
cp server/.env.example server/.env.local
# Edit server/.env.local for local development

cp server/.env.example server/.env.dev  
# Edit server/.env.dev for DEV environment (already done)
```

### 4. Test Deployment
```bash
# Test locally
docker-compose up -d

# Test DEV deployment by pushing to develop branch
git add .
git commit -m "feat: environment-specific deployment setup"
git push origin develop
```

## 🔍 Troubleshooting

### Check Environment File Loading
```bash
# On EC2, verify the environment file exists and has correct content
cat ~/BoatOwner/server/.env.dev

# Check Docker container environment
docker exec boatowner_api_dev env | grep DATABASE_URL
```

### Database Connection Issues
```bash
# Test RDS connection from EC2
psql -h boatowner-dev-db.cnmog8qkotxj.eu-west-1.rds.amazonaws.com -U boatowner_dev_user -d boatowner_dev -p 5432
```

### Docker Compose Issues
```bash
# Check which compose file is being used
docker-compose -f docker-compose.dev.yml config

# View container logs
docker logs boatowner_api_dev
```

## ✅ Benefits of This Approach

1. **Clear Separation**: Each environment is completely isolated
2. **Easy Management**: Simple to add new environments
3. **Security**: Environment-specific secrets and database credentials
4. **Maintainability**: No complex profiles or conditional logic
5. **Scalability**: Easy to extend to staging and production
6. **Debugging**: Clear file structure makes troubleshooting easier

## 📋 Next Steps

1. **Test DEV deployment** with new configuration
2. **Set up STAGING environment** when ready
3. **Configure PRODUCTION environment** with proper security
4. **Add environment-specific monitoring** and logging
5. **Set up automated backups** for each RDS instance
