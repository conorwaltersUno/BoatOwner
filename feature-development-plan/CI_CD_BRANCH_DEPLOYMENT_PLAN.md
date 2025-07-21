# CI/CD, Branching, and Deployment Plan for BoatOwner App

## Goal
- Enable cost-effective, automated deployment for both backend (server + db) and React Native app.
- Use a `develop` branch for all feature/integration work.
- Auto-deploy backend and UI on every push to `develop` (and optionally `main`/`master`).
- Use only affordable, developer-friendly cloud services (no legacy/expensive hosts).

---

## Step-by-Step Implementation Plan

### 1. **Branching Strategy**
- Create a `develop` branch from `main` (or `master`).
- All feature branches branch off `develop` and are merged back via PRs.
- `main`/`master` is for production releases only.

### 2. **Repository Setup**
- Ensure both backend and frontend code are in the same monorepo (as currently).
- Add `.github/workflows/` directory for GitHub Actions CI/CD.

### 3. **Backend (Server + DB) Deployment**
- Use Docker for backend and database orchestration (already present: `docker-compose.yml`).
- Choose a low-cost cloud provider (e.g., AWS EC2 for backend, RDS for Postgres).
- Add a Dockerfile for the backend (already present: `server/dockerfile`).
- Add a GitHub Actions workflow to:
  - Build the backend Docker image.
  - Run tests and lint.
  - Deploy to the chosen cloud provider on push to `develop` (and optionally `main`).
  - Run DB migrations automatically after deploy.
- Store secrets (DB URL, JWT secret, etc.) in GitHub repo secrets and/or cloud provider secrets manager.

### 4. **Frontend (React Native) Deployment**
- No separate build or deployment is required for the frontend during development.
- Use Expo Go for all dev and test purposes:
  - Developers run `npx expo start` locally.
  - Team members scan the QR code with Expo Go on their devices to run the latest app version instantly.
  - No EAS build or OTA update is needed for dev/test.
- Store API URLs and secrets in environment variables (never hardcoded).

### 5. **CI/CD Pipeline (GitHub Actions)**
- Create `.github/workflows/backend.yml` for backend CI/CD:
  - On push to `develop` or PR to `main`.
  - Steps: checkout, set up Node, build Docker image, run tests, deploy, run migrations.
- No frontend CI/CD workflow is needed for dev/test, as Expo Go is used for all frontend testing.
- Use status checks to block merges to `main` unless CI passes.

### 6. **Networking & Environment**
- Expose backend API to the public internet (HTTPS, secure ports).
- Configure CORS and API URL for mobile app to point to the deployed backend.
- Use `.env` files and/or cloud provider secrets for all sensitive config.
- Use a managed Postgres DB (AWS RDS) for lowest ops cost.

### 7. **Cost Optimization**
- Use free/low-cost tiers for all services (AWS EC2, RDS, etc.).
- Use auto-sleep/auto-suspend features for dev/test environments.
- Monitor usage and set up alerts for cost overruns.

### 8. **Documentation**
- Document all setup steps, environment variables, and deployment URLs in `README.md` and a new `DEPLOYMENT.md`.
- Add instructions for local development and how to trigger deployments manually if needed.

---

## Step-by-Step: Secrets Management & Cloud Setup (AWS + Expo)

### 1. **Backend (Node.js API) Secrets & AWS Setup**

#### a. **Provision AWS Resources**
- **EC2 (API Server):**
  - Use AWS Lightsail or a t4g.micro/t3.micro EC2 instance (cheapest, sufficient for dev).
  - OS: Ubuntu 22.04 LTS.
- **RDS (PostgreSQL DB):**
  - Use Amazon RDS, db.t4g.micro (or db.t3.micro) instance, PostgreSQL 15+.
  - Enable public access for dev (restrict by IP in security group).
  - Set initial DB name, username, and password.

#### b. **Collect Required Secrets/Values**
- **API Server (Node.js/Express):**
  - `DATABASE_URL`:
    - Format: `postgresql://<username>:<password>@<host>:<port>/<dbname>?schema=public`
    - Get from RDS console: DB endpoint, port, username, password, dbname.
  - `JWT_SECRET`:
    - Generate a strong random string (e.g., `openssl rand -base64 32`).
  - `REFRESH_TOKEN_SECRET`:
    - Generate another strong random string.
  - `NODE_ENV`: `development` or `production` as appropriate.
  - `PORT`: (e.g., `4000`)
  - Any 3rd party API keys (e.g., Google Maps, S3, etc.)

- **AWS Credentials (for CI/CD deploy):**
  - Create an IAM user with programmatic access, minimal permissions for EC2 (or Lightsail) and RDS.
  - Save `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.
  - Region: e.g., `us-east-1`.

#### c. **Where to Store in GitHub**
- Go to GitHub repo → Settings → Secrets and variables → Actions.
- Add the following secrets:
  - `DATABASE_URL` (from above)
  - `JWT_SECRET`
  - `REFRESH_TOKEN_SECRET`
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION` (e.g., `us-east-1`)
  - Any other API keys needed by backend

#### d. **.env File for Local Dev**
- Create a `.env` file in `server/`:
  ```env
  DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<dbname>?schema=public
  JWT_SECRET=your_jwt_secret
  REFRESH_TOKEN_SECRET=your_refresh_secret
  NODE_ENV=development
  PORT=4000
  ```
- **Never commit `.env` to git!**

---

### 2. **Frontend (Expo) Secrets & Setup**

#### a. **Expo Project Setup**
- In `ui/mobile/BoatOwner/eas.json`, configure builds for dev.
- In `app/constants/api.ts` (or similar), set API URL to AWS EC2 public IP or DNS (e.g., `https://<ec2-public-dns>:4000`).
- Use Expo's [app.config.js](https://docs.expo.dev/guides/environment-variables/) to inject env vars.

#### b. **Required Secrets/Values**
- `API_URL`: The public URL of your backend API (e.g., `https://<ec2-public-dns>:4000`)
- Any mobile-only API keys (e.g., Google Maps, Apple/Google OAuth client IDs)

#### c. **Where to Store in GitHub**
- Add to GitHub repo → Settings → Secrets and variables → Actions:
  - `EXPO_TOKEN` (create at https://expo.dev/settings)
  - `API_URL` (as above)
  - Any Expo/Google/Apple keys needed for builds

#### d. **.env File for Local Dev**
- In `ui/mobile/BoatOwner/`, create `.env`:
  ```env
  API_URL=https://<ec2-public-dns>:4000
  EXPO_GOOGLE_MAPS_API_KEY=your_google_maps_key
  ...
  ```
- Use [expo-constants](https://docs.expo.dev/versions/latest/sdk/constants/) or [react-native-dotenv](https://github.com/goatandsheep/react-native-dotenv) to load env vars.

---

### 3. **Connecting Expo App to Dev Backend**
- Ensure EC2 security group allows inbound 4000/tcp from your dev IP and Expo's cloud build IPs.
- In Expo Go, scan the QR code after `npx expo start` or after EAS build.
- The app will use the `API_URL` to connect to your AWS backend.
- For OTA updates, use `expo publish` (dev) or EAS build for device install.

---

### 4. **Summary Table: GitHub Actions Secrets**
| Secret Name              | Where Used         | How to Get/Generate                |
|--------------------------|--------------------|------------------------------------|
| DATABASE_URL             | Backend CI/CD      | RDS Console                        |
| JWT_SECRET               | Backend CI/CD      | `openssl rand -base64 32`          |
| REFRESH_TOKEN_SECRET     | Backend CI/CD      | `openssl rand -base64 32`          |
| AWS_ACCESS_KEY_ID        | Backend CI/CD      | IAM Console                        |
| AWS_SECRET_ACCESS_KEY    | Backend CI/CD      | IAM Console                        |
| AWS_REGION               | Backend CI/CD      | AWS Console                        |
| API_URL                  | Frontend CI/CD     | EC2 Public DNS/IP                  |
| EXPO_TOKEN               | Frontend CI/CD     | https://expo.dev/settings          |
| EXPO_GOOGLE_MAPS_API_KEY | Frontend/Backend   | Google Cloud Console               |

---

### 5. **Security Notes**
- Never commit secrets to git.
- Use IP allowlists for EC2/RDS security groups.
- Rotate secrets regularly.
- Use HTTPS for all API endpoints.

---

**See below for detailed AWS and Expo setup instructions.**

---

## Example Directory Structure
```
BoatOwner/
  .github/workflows/
    backend.yml
    frontend.yml
  server/
    dockerfile
    docker-compose.yml
    ...
  ui/mobile/BoatOwner/
    eas.json
    ...
  README.md
  DEPLOYMENT.md
```

---

## Next Steps
- Choose your preferred cloud provider for backend/db (Fly.io, Railway, Render, etc.).
- Set up secrets in GitHub and cloud provider.
- Implement the above workflows and configs.
- Test the full pipeline with a test push to `develop`.

---

**Author:** GitHub Copilot
**Date:** 2025-07-20

---

## Detailed AWS Setup: Deploying Backend Server on a Small AWS EC2 Instance (No Lightsail)

### 1. **Provisioning the EC2 Instance**
- Go to AWS EC2 console: https://console.aws.amazon.com/ec2/
- Launch a new instance:
  - **AMI:** Ubuntu 22.04 LTS (or latest LTS)
  - **Instance type:** t4g.micro or t3.micro (free tier eligible, low cost)
  - **Storage:** 8–16GB (default is fine for dev)
  - **Key pair:** Create/download a new SSH key pair (PEM format)
  - **Network:** Default VPC is fine for dev
  - **Security group:**
    - Allow inbound TCP 22 (SSH) from your dev IP only
    - Allow inbound TCP 4000 (or your API port) from your dev IPs and Expo cloud IPs
    - (Optional) Allow 80/443 for HTTP/HTTPS if you want to use a domain/SSL
  - **Elastic IP:** Allocate and associate an Elastic IP for a static public address

### 2. **Initial Server Setup**
- SSH into the instance:
  ```zsh
  ssh -i /path/to/your-key.pem ubuntu@<elastic-ip>
  ```
- Update and install Docker:
  ```zsh
  sudo apt update && sudo apt upgrade -y
  sudo apt install docker.io docker-compose -y
  sudo usermod -aG docker $USER
  # Log out and back in for group change
  ```
- (Optional) Install Node.js if you want to run locally, but Docker is recommended

### 3. **Deploying Your App**
- **Manual:**
  - Clone your repo, copy `.env`, and run Docker Compose:
    ```zsh
    git clone <your-repo>
    cd BoatOwner/server
    cp .env.example .env  # Fill in secrets
    docker compose up -d --build
    ```
- **CI/CD (Recommended):**
  - Use GitHub Actions to SSH and deploy (see below for workflow)
  - Store your PEM key as `AWS_SSH_KEY` in GitHub secrets (base64-encoded or as a secret string)
  - Store your Elastic IP as `AWS_SERVER_IP` in GitHub secrets

### 4. **Database (RDS) Setup**
- Use Amazon RDS (db.t4g.micro, PostgreSQL 15+)
- Enable public access (dev only), restrict by IP
- Note DB endpoint, username, password, dbname for `DATABASE_URL`

### 5. **Environment Variables**
- Store all secrets in `.env` (see previous section)
- For CI/CD, add to GitHub repo → Settings → Secrets and variables → Actions

### 6. **CI/CD Deployment via GitHub Actions**
- Use `appleboy/ssh-action` or similar to SSH and deploy on push to `develop`:
  - Steps:
    1. Build/test Docker image
    2. SSH to EC2
    3. Pull latest code
    4. Copy new `.env` if needed
    5. Run `docker compose up -d --build`
- Store SSH private key as `AWS_SSH_KEY` in GitHub secrets
- Store instance IP as `AWS_SERVER_IP` in GitHub secrets

### 7. **Security**
- Restrict SSH and API ports to your dev IPs
- Never expose DB to the world (use security groups)
- Use HTTPS (self-signed or Let's Encrypt for dev)

### 8. **Accessing the API**
- Use the Elastic IP or DNS of your EC2 instance, e.g., `https://<elastic-ip>:4000`
- Point your Expo app's `API_URL` to this address

---

**You now have a cost-effective, secure AWS EC2 setup for your Node.js backend, ready for CI/CD and Expo integration.**

---

## Using AWS SSO (AWS IAM Identity Center) for Dev, Staging, and Prod Authentication (Sign-In/Sign-Up/Auth Flows)

### 1. **Overview**
- Integrate AWS SSO (AWS IAM Identity Center) for authentication in all environments except LOCAL.
- Users authenticate via AWS SSO; app receives user info (sub, email, etc.).
- On first login, create user in local DB if not present, using AWS SSO user ID as the canonical user ID.
- Maintain existing JWT/refresh token flow for session management, but issue tokens after SSO login.
- In LOCAL, continue using standard email/password or OAuth as before. All other servers (DEV, STG, and PROD) will integrate with AWS SSO.

### 2. **AWS SSO Setup (DEV, STG, PROD)**
- Use AWS IAM Identity Center (formerly AWS SSO) as the identity provider.
- Register your Expo app as an OAuth client in AWS IAM Identity Center:
  - Set callback URLs for Expo (see Expo AuthSession docs)
  - Enable email, openid, and profile scopes
- Note SSO instance ARN, App Client ID, and region

#### Registering Your Expo App as an OAuth Client in AWS IAM Identity Center (Step-by-Step)

1. **Access AWS IAM Identity Center (formerly AWS SSO):**
   - Go to the AWS Console: https://console.aws.amazon.com/
   - In the search bar, type "IAM Identity Center" and select it.
   - Make sure you are in the correct AWS region (top right corner).

2. **Set Up an Application for OIDC/OAuth:**
   - In the IAM Identity Center left menu, go to **Applications**.
   - Click **Add application**.
   - Choose **Add a custom SAML 2.0 or OIDC application**.
   - Select **OIDC** (OpenID Connect) as the protocol.
   - Enter a name (e.g., "BoatOwner Expo Dev").
   - (Optional) Add a description and logo.
   - Click **Save changes**.

3. **Configure OIDC Client Details:**
   - After saving, you'll see the application details page.
   - Under **OIDC client information**, click **Create OIDC client**.
   - Enter a client name (e.g., "BoatOwner Expo Dev Client").
   - For **Redirect URIs**, add the callback URLs for Expo AuthSession:
     - For local dev: `exp://127.0.0.1:19000/--/` (or your Expo dev server IP)
     - For Expo Go: `https://auth.expo.io/@your-expo-username/your-app-slug`
     - For EAS builds: `yourapp://redirect/` (if using deep linking)
     - See [Expo AuthSession docs](https://docs.expo.dev/guides/authentication/#redirect-uris) for details.
   - **Scopes:**
     - Add `openid`, `email`, and `profile` (these are required for user info).
   - Click **Create**.

4. **Collect OIDC Client Information:**
   - After creation, note the following values:
     - **Client ID**: Used in your Expo app and backend
     - **Client Secret**: (if provided; may not be needed for public clients)
     - **Issuer URL**: The OIDC discovery endpoint (e.g., `https://<your-aws-domain>.awsapps.com/start`)
     - **Redirect URIs**: Confirm these match your Expo app config
     - **SSO Instance ARN**: Found in the IAM Identity Center dashboard
     - **Region**: The AWS region you are using

5. **Assign Users/Groups to the Application:**
   - In the application details, go to **Assigned users** or **Assigned groups**.
   - Assign the users or groups who should be able to sign in via SSO (for dev, add your dev team accounts).

6. **Update Expo App and Backend Config:**
   - In your Expo app, update the AuthSession/OIDC config with:
     - `clientId`: (from above)
     - `issuer`: (Issuer URL from above)
     - `redirectUri`: (must match one of the URIs registered)
     - `scopes`: `openid email profile`
   - In your backend, update `.env` with:
     ```env
     AWS_SSO_INSTANCE_ARN=...   # From IAM Identity Center dashboard
     AWS_SSO_CLIENT_ID=...      # From OIDC client info
     AWS_SSO_REGION=...         # Your AWS region
     AWS_SSO_DOMAIN=...         # Your AWS SSO domain (e.g., d-xxxxxxxx.awsapps.com)
     USE_AWS_SSO=true
     ```

7. **Test the Flow:**
   - Start your Expo app and use the "Sign in with AWS SSO" button.
   - You should be redirected to the AWS SSO login page, then back to your app.
   - The app should receive an ID token (JWT) and user info.
   - The backend should verify the token and create or update the user as needed.

---

**Reference:**
- [AWS IAM Identity Center OIDC Docs](https://docs.aws.amazon.com/singlesignon/latest/userguide/oidc.html)
- [Expo AuthSession Guide](https://docs.expo.dev/guides/authentication/)

### 3. **Frontend Changes (Unified Sign-In/Sign-Up Experience)**

#### a. **Current Auth Flow Analysis**
- The current sign-in and sign-up screens use email/password forms and call custom hooks (`useSignIn`, `useSignUp`) that hit backend endpoints for authentication.
- Social login buttons for Apple and Google are present as UI placeholders, but do not have working logic yet.
- The main "Sign In" button is used for all environments and should remain unchanged in appearance and label.
- All API calls use `authFetch` for token handling.

#### b. **Planned Unified Auth Flow (All Non-LOCAL Envs)**
- The "Sign In" button will:
  - In LOCAL: continue to use email/password auth as now.
  - In DEV/STG/PROD: trigger the AWS SSO (IAM Identity Center) OIDC flow under the hood (user sees only the regular form/button).
    - After successful SSO, the backend will create or update the user and issue local JWT/refresh tokens as before.
- The "Sign Up" button will:
  - In LOCAL: continue to use email/password/username/boat info as now.
  - In DEV/STG/PROD: trigger the AWS SSO flow (user sees only the regular form/button), and after SSO, collect any extra info (username, boat name/model) if needed.
- Apple and Google sign-in buttons:
  - Implement real Apple and Google OAuth flows using Expo AuthSession or `expo-auth-session/providers`.
  - On success, send the OAuth token to the backend, which will verify and map to a user (and optionally federate with AWS SSO if desired).
  - The backend should support `/auth/apple` and `/auth/google` endpoints for this purpose.

#### c. **Frontend Implementation Steps**
1. **Sign In/Up Button Logic:**
   - Refactor the `handleSignIn` and `handleSignUp` functions to:
     - Detect environment (LOCAL vs. non-LOCAL via env var or config).
     - In non-LOCAL, launch the AWS SSO OIDC flow (using Expo AuthSession or a suitable OIDC client).
     - On success, send the ID token to the backend for verification and session creation.
     - On failure, show a generic error (do not mention AWS to the user).
2. **Apple/Google Sign-In:**
   - Implement Apple and Google sign-in using Expo AuthSession providers.
   - On success, send the OAuth token to the backend for verification and user mapping.
   - Handle errors gracefully and show generic messages.
3. **UI/UX:**
   - Keep the "Sign In" and "Sign Up" buttons and forms as they are (no AWS branding or mention).
   - Show loading indicators and error messages as currently implemented.
   - Optionally, after SSO sign-up, prompt for any required extra info (username, boat name/model) if not provided by SSO.
4. **Token Handling:**
   - Continue to use `saveTokens` and `authFetch` for all token storage and API calls.
5. **Testing:**
   - Test all flows (email/password, Apple, Google, AWS SSO) in all environments.
   - Ensure fallback to email/password in LOCAL.

#### d. **Summary Table: Auth Flows by Environment**
| Environment | Sign In Button | Apple/Google | Backend Endpoint(s) |
|-------------|---------------|--------------|---------------------|
| LOCAL       | Email/Password| Apple/Google | /auth/signin, /auth/apple, /auth/google |
| DEV/STG/PROD| AWS SSO OIDC  | Apple/Google | /auth/aws-sso, /auth/apple, /auth/google |

---

**This plan ensures a seamless, unified sign-in/sign-up experience for users, with AWS SSO, Apple, and Google all integrated under the hood, and no AWS branding or mention in the UI.**
