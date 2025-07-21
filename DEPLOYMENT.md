# ...existing code...

## Adding and Managing Secrets for CI/CD and Local Development

### 1. **GitHub Actions Secrets (for Backend CI/CD)**
- Go to your GitHub repo → Settings → Secrets and variables → Actions.
- Add the following secrets (copy values from your AWS Console, Cognito/SSO, or .env files):
  - `DATABASE_URL` — from AWS RDS
  - `JWT_SECRET` — generate with `openssl rand -base64 32`
  - `REFRESH_TOKEN_SECRET` — generate with `openssl rand -base64 32`
  - `AWS_ACCESS_KEY_ID` — from AWS IAM user
  - `AWS_SECRET_ACCESS_KEY` — from AWS IAM user
  - `AWS_REGION` — e.g., `us-east-1`
  - `AWS_SERVER_IP` — your EC2 Elastic IP
  - `AWS_SSH_KEY` — your EC2 PEM private key (paste contents, do not commit to repo)
  - Any other API keys needed by backend (e.g., Google Maps, S3)

### 2. **.env Files for Local Development**
- Copy `server/.env.example` to `server/.env` and fill in real values for backend local dev.
- Copy `ui/mobile/BoatOwner/.env.example` to `ui/mobile/BoatOwner/.env` and fill in real values for frontend local dev.
- **Never commit `.env` files with real secrets to git!**

### 3. **Where Secrets Are Used**
- **Backend:** Reads secrets from environment variables (see `server/.env.example`).
- **Frontend:** Reads API URLs and keys from environment variables (see `ui/mobile/BoatOwner/.env.example`).
- **CI/CD:** GitHub Actions injects secrets into workflow jobs for deployment and migration.

### 4. **Security Best Practices**
- Rotate secrets regularly and after any suspected leak.
- Use IP allowlists for EC2 and RDS security groups.
- Use HTTPS for all API endpoints.
- Never share PEM keys or secrets in chat, email, or code.

---

For more details, see the full secrets table and setup steps above.

# ...existing code...