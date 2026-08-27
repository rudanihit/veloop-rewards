# VELoop Rewards — Referral Backend

Backend service for the VELoop Rewards referral system. It provides authenticated referral management, verified ad-event processing, milestone-based rewards, referral completion, fraud/device checks, audit logging, and transactional reward crediting.

## 1. Overview

The backend is built with Node.js, Express, and MongoDB using Mongoose.

The backend is the source of truth for:

```text
Referral creation
      ↓
Ad event verification
      ↓
Eligible ad-watch progress
      ↓
Reward milestone processing
      ↓
Reward transaction + balance update
      ↓
Final milestone
      ↓
Successful referral + XP reward
```

The frontend should display values returned by the backend rather than calculating or authorizing rewards itself.

## 2. Main Features

- Referral creation and attribution
- Referral dashboard and statistics
- Referral progress tracking
- Verified video-ad event recording
- Duplicate ad-event protection using `eventId`
- Configurable reward milestones
- SVE, Spins, Tokens, Gems, and XP balances
- Idempotent milestone reward processing
- Successful-referral completion
- Self-referral detection
- Email and phone relationship risk signals
- Device association detection
- Fraud-risk scoring and review status
- Audit logging
- MongoDB transactions for reward processing
- JWT authentication
- API rate limiting
- Helmet security headers
- CORS support
- Request logging with Morgan
- Development login endpoint disabled in production

## 3. Tech Stack

- Node.js
- Express 5
- MongoDB
- Mongoose
- JSON Web Tokens (`jsonwebtoken`)
- Helmet
- CORS
- Morgan
- Express Rate Limit
- dotenv
- Nodemon for development

## 4. Project Structure

```text
backend/
├── scripts/
│   ├── seed.js
│   ├── test-fraud-detection.js
│   └── test-reward-idempotency.js
│
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── adEvent.controller.js
│   │   ├── auth.controller.js
│   │   ├── device.controller.js
│   │   ├── referral.controller.js
│   │   └── rewardMilestone.controller.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── models/
│   │   ├── AdEvent.js
│   │   ├── AuditLog.js
│   │   ├── Referral.js
│   │   ├── ReferralProgress.js
│   │   ├── ReferralReward.js
│   │   ├── RewardMilestone.js
│   │   ├── RewardTransaction.js
│   │   ├── SpamReferral.js
│   │   ├── User.js
│   │   └── UserDevice.js
│   │
│   ├── routes/
│   │   ├── adEvent.routes.js
│   │   ├── auth.routes.js
│   │   ├── device.routes.js
│   │   ├── health.routes.js
│   │   ├── referral.routes.js
│   │   └── rewardMilestone.route.js
│   │
│   ├── services/
│   │   ├── adEvent.service.js
│   │   ├── auditLog.service.js
│   │   ├── auth.service.js
│   │   ├── deviceRisk.service.js
│   │   ├── fraudDetection.service.js
│   │   ├── referral.service.js
│   │   ├── reward.service.js
│   │   └── rewardMilestone.service.js
│   │
│   ├── utils/
│   │   ├── ApiError.js
│   │   └── ApiResponse.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env.example
├── .gitignore
├── package.json
└── package-lock.json
```

## 5. Reward Milestones

The seeded milestone configuration is:

| Requirement | Reward |
|---|---:|
| 15 eligible ad watches | 5,000 SVE |
| 20 eligible ad watches | 2 Spins |
| 30 eligible ad watches | 5,000 Tokens |
| 35 eligible ad watches | 10 Gems |
| Successful referral | 20 XP |

Milestones are stored in the `RewardMilestone` collection and can be activated/deactivated through the database.

The successful-referral XP milestone does not have `requiredAds`; it is awarded when the referral reaches the final active ad-watch milestone and is completed successfully.

## 6. Referral Lifecycle

### 6.1 Create referral

An authenticated referrer creates a referral by supplying:

- `referredUserId`
- `referralCode`
- optional `attributionSource`
- optional `deviceId`

The referral service performs validation and fraud/risk assessment before allowing the referral to progress.

### 6.2 Track eligible ad watches

The referred user submits a verified ad event.

Only events accepted as verified increase:

```text
ReferralProgress.eligibleAdsWatched
```

Each eligible event also updates the referral progress `lastVerifiedAt` value.

### 6.3 Process milestone rewards

After every verified ad event, the backend processes all reached active milestones.

For each milestone it:

1. Checks whether a `ReferralReward` already exists.
2. Creates the referral reward if necessary.
3. Creates a `RewardTransaction`.
4. Creates an audit log.
5. Updates the appropriate user balance.

The milestone is identified by:

```text
referralId + milestoneId
```

which is also protected by a unique database index.

### 6.4 Complete successful referral

When the referred user reaches the final active ad-watch milestone:

```text
35 eligible ad watches
```

the referral can become:

```text
SUCCESSFUL
```

The backend then awards the configured Successful Referral XP milestone:

```text
+20 XP
```

The referral receives a `completedAt` timestamp.

## 7. Reward Processing and Idempotency

Reward processing is designed so that repeating the same processing operation does not create duplicate rewards.

`ReferralReward` has a unique compound index:

```text
referralId + milestoneId
```

`RewardTransaction` has a unique:

```text
idempotencyKey
```

The idempotency key is generated from:

```text
referralId + milestoneId
```

This protects both reward creation and reward transactions from accidental duplication.

## 8. Transaction Safety

Reward processing uses MongoDB sessions and transactions.

For a verified ad event, the related operations are coordinated so that the following changes can succeed or fail together:

```text
AdEvent
ReferralProgress
ReferralReward
RewardTransaction
AuditLog
User balance
Referral completion / XP
```

`completeReferral()` accepts an optional existing MongoDB session. When called from the ad-event flow, it reuses the current transaction instead of creating a separate transaction.

## 9. Anti-Fraud and Device Risk

The backend contains a dedicated fraud-risk service.

### Self-referral

A referrer cannot refer the same user:

```text
referrerUserId === referredUserId
```

This produces a high-risk/rejected result.

### Email relationship signal

Matching referrer and referred-user email addresses increase the risk score.

### Phone relationship signal

Matching phone numbers increase the risk score.

### Referral-history signal

Existing related referral history increases the risk score.

### Device association

Raw device identifiers are hashed with SHA-256 before storage.

The `UserDevice` collection stores:

```text
userId
deviceIdHash
firstSeenAt
lastSeenAt
isActive
```

If a device is already associated with another account, the device service reports:

```text
isAssociatedWithAnotherUser: true
```

The fraud assessment can also add:

```text
DEVICE_ASSOCIATED_WITH_ANOTHER_USER
```

as a risk signal.

### Risk scoring

The current fraud assessment uses these signals:

| Signal | Score |
|---|---:|
| Matching email | +50 |
| Matching phone | +40 |
| Related referral history | +20 |
| Device associated with another user | +40 |
| Direct self-referral | 100 / rejected |

Risk status is determined as:

```text
0–39   → LOW_RISK
40–79  → FRAUD_REVIEW
80–100 → REJECTED
```

## 10. Authentication

Protected endpoints require:

```http
Authorization: Bearer <JWT>
```

The authentication middleware verifies the JWT using `JWT_SECRET` and attaches the authenticated user ID to:

```js
req.user.id
```

Missing, invalid, or expired tokens return HTTP 401.

### Development login

The project contains a development-only login endpoint:

```http
POST /api/auth/dev-login
```

It accepts an existing development user's email and returns a short-lived JWT.

This route is registered only when:

```text
NODE_ENV !== production
```

It must not be used as a production authentication mechanism.

## 11. API Reference

Base URL during local development:

```text
http://localhost:4000
```

### Health

#### GET `/api/health`

Authentication: No

Response:

```json
{
  "success": true,
  "message": "VELoop API is working"
}
```

### Development authentication

#### POST `/api/auth/dev-login`

Authentication: No, development only

Request:

```json
{
  "email": "dev@veloop.local"
}
```

Returns a JWT and development-user information.

### Referrals

All referral endpoints require authentication.

#### POST `/api/referrals`

Creates a referral.

Request:

```json
{
  "referredUserId": "USER_ID",
  "referralCode": "DEV12345",
  "attributionSource": "direct",
  "deviceId": "DEVICE_ID"
}
```

#### GET `/api/referrals/me`

Returns the authenticated user's referral dashboard.

The dashboard includes values such as:

- referral code
- referral link
- total referrals
- successful referrals
- pending referrals
- spam referrals
- total SVE earned
- total XP earned
- total Gems earned
- total Tokens earned
- recent referral progress

#### GET `/api/referrals/stats`

Returns referral statistics for the authenticated user.

#### GET `/api/referrals/:referralId/progress`

Returns progress for an authorized referral.

#### POST `/api/referrals/:referralId/complete`

Completes a qualified referral and awards the successful-referral XP reward.

### Reward milestones

#### GET `/api/rewards/milestones`

Authentication: Yes

Returns active reward milestones.

Example milestone:

```json
{
  "name": "15 Ad Watch Milestone",
  "requiredAds": 15,
  "rewardAmount": 5000,
  "rewardType": "SVE",
  "isActive": true
}
```

### Ad events

#### POST `/api/ad-events`

Authentication: Yes

Request:

```json
{
  "eventId": "TRANSACTION-TEST-003",
  "eventType": "VIDEO_AD_COMPLETED",
  "devVerified": true
}
```

Optional:

```json
{
  "occurredAt": "2026-08-27T04:04:45.796Z"
}
```

Currently accepted event type:

```text
VIDEO_AD_COMPLETED
```

The endpoint validates the event timestamp and prevents duplicate `eventId` values.

A verified event increments referral progress and triggers milestone reward processing.

### Devices

#### POST `/api/devices/register`

Authentication: Yes

Request:

```json
{
  "deviceId": "DEVICE-FRAUD-E2E-001"
}
```

The backend hashes the device ID before storing it.

A device already associated with another user is reported without exposing the raw device identifier.

## 12. Standard Error Format

The global error middleware returns errors in the following shape:

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

Examples include:

```text
UNAUTHORIZED
INVALID_REQUEST
AD_EVENT_ALREADY_EXISTS
REFERRAL_NOT_FOUND
REFERRAL_PROGRESS_NOT_FOUND
REFERRAL_NOT_ELIGIBLE
SELF_REFERRAL_DETECTED
RATE_LIMIT_EXCEEDED
```

## 13. Rate Limiting and Security Middleware

The application uses:

- Helmet for security-related HTTP headers
- CORS
- Express JSON/urlencoded parsing
- Morgan request logging
- Global API rate limiting

Global API limit:

```text
100 requests / 15 minutes
```

Ad-event limit:

```text
60 requests / 15 minutes
```

Development-login limit:

```text
10 requests / 15 minutes
```

## 14. Database Models

### User

Stores user identity, referral code, and reward balances.

Balances include:

```text
sve
spins
tokens
gems
xp
```

### Referral

Stores:

- referrer
- referred user
- referral code
- status
- attribution source
- completion timestamp

### ReferralProgress

Stores:

- referral ID
- referred user
- eligible ad-watch count
- last verified timestamp

### RewardMilestone

Stores configurable:

- milestone name
- reward type
- reward amount
- required ad count
- active status

### ReferralReward

Stores each milestone reward associated with a referral.

The schema prevents duplicate referral/milestone combinations.

### RewardTransaction

Stores the financial/reward ledger entry:

- user
- referral
- referral reward
- reward type
- amount
- direction
- status
- idempotency key
- reason
- processing timestamp

### AdEvent

Stores submitted ad events and their verification/eligibility state.

### UserDevice

Stores hashed device associations.

### SpamReferral

Stores referral fraud/spam review information.

### AuditLog

Stores security and reward-related audit events and associated metadata.

## 15. Environment Variables

Create a `.env` file in the backend root.

Use `.env.example` as the template:

```env
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_connection_string
PORT=4000
```

Never commit the real `.env` file.

For production, use a strong secret and a production MongoDB connection string.

## 16. Installation

Clone the backend repository and enter the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```text
.env
```

Configure:

```env
JWT_SECRET=...
MONGODB_URI=...
PORT=4000
```

## 17. Run the Backend

Development:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

The default local server is:

```text
http://localhost:4000
```

Health check:

```text
GET http://localhost:4000/api/health
```

## 18. Seed Development Data

The project includes:

```text
scripts/seed.js
```

Run:

```bash
node scripts/seed.js
```

The seed script creates/finds development users and configures the reward milestones.

Development data includes:

```text
dev@veloop.local
referred@veloop.local
```

The seed script should be treated as a development/testing utility and should not be used as a production data initialization strategy without review.

## 19. Testing

The project includes scripts for key backend behaviors.

### Fraud detection

```bash
node scripts/test-fraud-detection.js
```

This exercises the referral fraud assessment service.

### Reward idempotency

```bash
node scripts/test-reward-idempotency.js
```

This compares reward and transaction counts before and after processing and verifies that duplicate rewards are not created.

### Manual end-to-end reward test

A typical verified-ad sequence is:

```text
15 events → 5,000 SVE
20 events → 2 Spins
30 events → 5,000 Tokens
35 events → 10 Gems
35 events → Successful referral + 20 XP
```

The same event ID should never be accepted twice.

## 20. Frontend Integration

The referral frontend consumes the backend dashboard and milestone APIs.

The frontend should use backend responses for:

- Referral code/link
- Referral counts
- Reward totals
- Current referral progress
- Milestone configuration
- Referral status

The frontend must not be treated as the authority for awarding or crediting rewards.

For local development, configure the frontend API base URL to point to the backend:

```text
http://localhost:4000
```

For production, use the deployed backend URL instead.

## 21. Production Checklist

Before production deployment:

- Set `NODE_ENV=production`.
- Configure a production `MONGODB_URI`.
- Configure a strong `JWT_SECRET`.
- Do not commit `.env`.
- Keep `.env.example` in the repository.
- Ensure development login is disabled.
- Configure the frontend to use the production backend.
- Restrict CORS to trusted frontend origins where appropriate.
- Review rate limits for production traffic.
- Remove or isolate development/test data.
- Verify MongoDB transaction support in the production deployment.
- Run the reward idempotency and fraud checks before release.

## 22. Security Notes

### Never trust client reward values

The client should not be allowed to directly specify:

```text
rewardAmount
rewardType
eligibleAdsWatched
balances
```

Reward amounts and milestone eligibility are determined by backend configuration and processing.

### Protect JWT secrets

Never expose:

```text
JWT_SECRET
MONGODB_URI
```

to the frontend or commit them to source control.

### Device privacy

Device identifiers are hashed with SHA-256 before persistence. The stored `deviceIdHash` is used for association/risk checks rather than exposing the raw identifier.

## 23. Response Convention

Successful API responses generally use the project's `ApiResponse` utility:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

Errors are normalized by the global error middleware.

## 24. Current Architecture Summary

```text
Client
  │
  ▼
Express Routes
  │
  ▼
Authentication / Rate Limits
  │
  ▼
Controllers
  │
  ▼
Services
  │
  ├── Referral Service
  ├── Ad Event Service
  ├── Reward Service
  ├── Fraud Detection Service
  ├── Device Risk Service
  └── Audit Log Service
  │
  ▼
Mongoose Models
  │
  ▼
MongoDB
```

Reward processing is backend-controlled and transaction-aware:

```text
Verified Ad Event
       │
       ▼
Referral Progress +1
       │
       ▼
Reached Milestones?
       │
       ├── No → finish
       │
       └── Yes
             │
             ▼
       ReferralReward
             │
             ▼
       RewardTransaction
             │
             ▼
         AuditLog
             │
             ▼
        User Balance
             │
             ▼
       Final Milestone?
             │
             └── Yes
                   │
                   ▼
            Successful Referral
                   │
                   ▼
                 +20 XP
```

## 25. Repository Hygiene

The repository should include source code, scripts, configuration templates, and documentation.

Do not commit:

```text
.env
node_modules/
```

Use:

```text
.env.example
```

for required environment variable names.

---

## Author

VELoop Rewards Referral Backend

Built as the backend component of the VELoop Rewards referral-page project.
