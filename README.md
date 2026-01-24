# 🎫 Flight Booking Service

Complete booking lifecycle management microservice with auto-expiry, payment processing, and real-time seat management.

**Port:** 3001 | **Database:** Shared MySQL (Flights DB) | **ORM:** Sequelize

---

## 📋 Table of Contents

- [Service Overview](#service-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Database Schema](#database-schema)
- [Booking Lifecycle](#booking-lifecycle)
- [Payment Processing](#payment-processing)
- [Integration Guide](#integration-guide)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Service Overview

**Flight Booking Service** handles the complete booking lifecycle from creation through cancellation. It manages bookings, enforces the 20-minute expiry window, processes payments, and coordinates with Flight System for seat management.

### Key Responsibilities

✅ Create bookings with flight and seat selection  
✅ Auto-expire bookings after 20 minutes  
✅ Process payments (simulated)  
✅ Update flight seat availability  
✅ Handle booking cancellation/refunds  
✅ Track booking status (pending, confirmed, cancelled, expired)  
✅ User-protected bookings (only own bookings visible)

---

## Features

### 1. Booking Creation

- Create booking with flight and seat selection
- Automatic seat reservation
- 20-minute expiry timer
- User-specific booking creation

### 2. Payment Processing

- Simulated payment gateway
- Payment status tracking
- Amount validation
- Receipt generation

### 3. Auto Expiry Mechanism

- Cron job runs every minute
- Expires unpaid bookings after 20 minutes
- Releases reserved seats
- Updates flight availability

### 4. Booking Management

- View all user bookings
- View booking details
- Cancel bookings (refunds seats)
- Update booking status

### 5. Seat Management

- Reserve seats on booking creation
- Release seats on cancellation/expiry
- Real-time availability tracking
- Seat conflict prevention

### 6. Payment Integration

- Process bookings only after payment
- Track payment status
- Handle payment failures
- Retry mechanism

---

## Technology Stack

- **Runtime:** Node.js v14+
- **Framework:** Express.js v4.18.2
- **Database:** MySQL 5.7+
- **ORM:** Sequelize v6.35.0
- **Task Scheduler:** node-cron
- **HTTP Client:** axios v1.6.0
- **Logging:** Winston v3.11.0
- **Code Formatter:** Prettier

---

## Installation & Setup

### Prerequisites

```bash
# Verify Node.js (v14+)
node --version

# Verify npm (v6+)
npm --version

# Verify MySQL is running and Flights DB exists
mysql -u <your-username> -p -e "USE Flights; SELECT 1;"
```

### Step 1: Install Dependencies

```bash
cd flight-booking-service
npm install
```

### Step 2: Configure Environment

Create `.env` file:

```bash
PORT=3001
NODE_ENV=development
AUTH_SERVICE_URL=http://localhost:3002/api/v1
FLIGHT_SERVICE_URL=http://localhost:3000/api/v1
```

### Step 3: Database Setup

```bash
# Migrations run automatically on startup
# Or manually run:
npx sequelize-cli db:migrate

# Seed sample data (optional)
npx sequelize-cli db:seed:all
```

### Step 4: Start Service

```bash
# Development
npm run dev

# Production
npm start
```

**Expected Output:**

```
Booking Service is running on http://localhost:3001
Cron jobs started
```

---

## Configuration

### Environment Variables

```bash
# Server
PORT=3001
NODE_ENV=development

# Service URLs
AUTH_SERVICE_URL=http://localhost:3002/api/v1
FLIGHT_SERVICE_URL=http://localhost:3000/api/v1

# Booking
BOOKING_EXPIRY_MINUTES=20
```

### Cron Job Configuration

File: `src/utils/common/cron-jobs.js`

```javascript
// Runs every minute to check expired bookings
cron.schedule('*/1 * * * *', async () => {
  // Check for bookings older than 20 minutes without payment
  // Update their status to EXPIRED
  // Release seats
});
```

---

## API Endpoints

### Base URL

```
http://localhost:3001/api/v1
```

### All Endpoints (User-Protected)

| Method | Endpoint            | Auth    | Description              |
| ------ | ------------------- | ------- | ------------------------ |
| GET    | `/bookings`         | ✅ user | Get all user bookings    |
| GET    | `/bookings/:id`     | ✅ user | Get booking details      |
| POST   | `/bookings`         | ✅ user | Create new booking       |
| PATCH  | `/bookings/:id`     | ✅ user | Update booking (payment) |
| DELETE | `/bookings/:id`     | ✅ user | Cancel booking           |
| POST   | `/bookings/:id/pay` | ✅ user | Process payment          |

---

## Usage Examples

### Create Booking

```bash
curl -X POST http://localhost:3001/api/v1/bookings \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "flightId": 1,
    "seatId": 5,
    "userId": 1,
    "email": "user@example.com",
    "totalCost": 299.99
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "flightId": 1,
    "seatId": 5,
    "email": "user@example.com",
    "totalCost": 299.99,
    "status": "PENDING",
    "createdAt": "2026-01-21T10:00:00.000Z",
    "expiresAt": "2026-01-21T10:20:00.000Z"
  }
}
```

### Get All User Bookings

```bash
curl http://localhost:3001/api/v1/bookings \
  -H "Authorization: Bearer $USER_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "flightId": 1,
      "seatId": 5,
      "status": "PENDING",
      "totalCost": 299.99,
      "createdAt": "2026-01-21T10:00:00.000Z"
    }
  ]
}
```

### Process Payment

```bash
curl -X POST http://localhost:3001/api/v1/bookings/1/pay \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 299.99,
    "paymentMethod": "credit_card"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "id": 1,
    "status": "CONFIRMED",
    "paymentId": "PAY_123456",
    "amount": 299.99,
    "paidAt": "2026-01-21T10:05:00.000Z"
  }
}
```

### Cancel Booking

```bash
curl -X DELETE http://localhost:3001/api/v1/bookings/1 \
  -H "Authorization: Bearer $USER_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "id": 1,
    "status": "CANCELLED",
    "refundAmount": 299.99,
    "cancelledAt": "2026-01-21T10:30:00.000Z"
  }
}
```

---

## Database Schema

### Bookings Table

```sql
CREATE TABLE Bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  flightId INT NOT NULL,
  seatId INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  totalCost DECIMAL(10,2) NOT NULL,
  status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED') DEFAULT 'PENDING',
  paymentId VARCHAR(255),
  expiresAt DATETIME NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (flightId) REFERENCES Flights(id) ON DELETE CASCADE,
  FOREIGN KEY (seatId) REFERENCES Seats(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_flightId (flightId),
  INDEX idx_status (status),
  INDEX idx_expiresAt (expiresAt)
);
```

### Column Descriptions

| Column      | Type     | Description                    |
| ----------- | -------- | ------------------------------ |
| `id`        | INT      | Booking unique identifier      |
| `userId`    | INT      | Reference to Auth Service user |
| `flightId`  | INT      | Flight being booked            |
| `seatId`    | INT      | Specific seat reserved         |
| `email`     | VARCHAR  | User email for confirmation    |
| `totalCost` | DECIMAL  | Booking amount                 |
| `status`    | ENUM     | Current booking state          |
| `paymentId` | VARCHAR  | Payment gateway reference      |
| `expiresAt` | DATETIME | Auto-expiry timestamp (20 min) |

---

## Booking Lifecycle

### State Machine

```
PENDING ──(payment processed)──> CONFIRMED
   │
   ├──(20 min expires)──> EXPIRED (seat released)
   │
   └──(user cancels)──> CANCELLED (seat released)

CONFIRMED ──(user cancels)──> CANCELLED (refund)
```

### Timeline

1. **T=0:** User creates booking
   - Status: `PENDING`
   - Seat marked: `isBooked = true`
   - Flight available seats: `-1`
   - Expires at: `T+20min`

2. **T=5 (user pays):** Payment processed
   - Status: `CONFIRMED`
   - Payment ID stored
   - Email confirmation sent

3. **T=25 (if no payment):** Cron job expires booking
   - Status: `EXPIRED`
   - Seat marked: `isBooked = false`
   - Flight available seats: `+1`

4. **Any time:** User cancels
   - Status: `CANCELLED`
   - Seat marked: `isBooked = false`
   - Refund calculated

---

## Payment Processing

### Simulated Gateway

The service uses a simulated payment gateway for demonstration:

```javascript
// src/services/booking-service.js
async function processPayment(bookingId, amount) {
  // Simulate 95% success rate
  const success = Math.random() > 0.05;

  return {
    success,
    paymentId: generateId(),
    amount,
    timestamp: new Date(),
  };
}
```

### Payment Status Tracking

- **Pending:** Awaiting payment
- **Confirmed:** Payment received, booking locked
- **Failed:** Payment declined, retry available
- **Refunded:** Cancellation refund processed

### Retry Mechanism

```bash
# Retry failed payment
curl -X POST http://localhost:3001/api/v1/bookings/1/pay \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 299.99,
    "paymentMethod": "credit_card"
  }'
```

---

## Integration Guide

### Auth Service Integration

Every request validates user token:

```javascript
// Verify user token
POST http://localhost:3002/api/v1/auth/verify-token
Headers: { Authorization: Bearer $TOKEN }

// Response includes user ID for booking creation
{
  "id": 1,
  "email": "user@example.com",
  "role": "user"
}
```

### Flight Service Integration

Booking service communicates with Flight Service:

```javascript
// Get flight details
GET http://localhost:3000/api/v1/flights/:flightId

// Get seat details
GET http://localhost:3000/api/v1/seats/:seatId

// Update seat availability
PATCH http://localhost:3000/api/v1/seats/:seatId
{
  "isBooked": true  // or false for refund
}
```

### Inter-Service Communication Flow

```
User Request (with token)
    ↓
Verify Token (Auth Service)
    ↓
Get Flight Details (Flight Service)
    ↓
Create Booking + Reserve Seat
    ↓
Return Booking Confirmation
    ↓
Wait for Payment (20 min window)
    ↓
Process Payment or Auto-Expire
```

---

## Testing

### Test Health Check

```bash
curl http://localhost:3001/api/v1/info
```

### Get Token (for user bookings)

```bash
# Register a user
curl -X POST http://localhost:3002/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "TestPassword123!"
  }'

# Login to get token
curl -X POST http://localhost:3002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123!"
  }'
# Save returned token as $USER_TOKEN
```

### Test Complete Booking Flow

```bash
# 1. Create booking
BOOKING_ID=$(curl -s -X POST http://localhost:3001/api/v1/bookings \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "flightId": 1,
    "seatId": 5,
    "userId": 1,
    "email": "testuser@example.com",
    "totalCost": 299.99
  }' | jq -r '.data.id')

# 2. Check booking created
curl http://localhost:3001/api/v1/bookings/$BOOKING_ID \
  -H "Authorization: Bearer $USER_TOKEN"

# 3. Process payment
curl -X POST http://localhost:3001/api/v1/bookings/$BOOKING_ID/pay \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 299.99, "paymentMethod": "credit_card"}'

# 4. Verify booking confirmed
curl http://localhost:3001/api/v1/bookings/$BOOKING_ID \
  -H "Authorization: Bearer $USER_TOKEN"
```

### Test Cancellation

```bash
curl -X DELETE http://localhost:3001/api/v1/bookings/$BOOKING_ID \
  -H "Authorization: Bearer $USER_TOKEN"
```

### Test Auto-Expiry

```bash
# Create booking but don't pay for 20+ minutes
# Cron job will auto-expire and release seat
# Check booking status after expiry
curl http://localhost:3001/api/v1/bookings/$BOOKING_ID \
  -H "Authorization: Bearer $USER_TOKEN"
# Status should be EXPIRED
```

---

## Troubleshooting

### Booking Expiry Not Working

**Problem:** Cron job not running  
**Solution:**

```bash
# Check if cron job is started
# In logs, verify: "Cron jobs started"

# Manually trigger expiry check
curl -X POST http://localhost:3001/api/v1/admin/cron/expire-bookings \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Payment Always Fails

**Problem:** Simulated gateway rejecting all payments  
**Solution:**

```javascript
// Check payment logic in src/services/booking-service.js
// Increase success rate for testing:
const success = Math.random() > 0.95; // 95% success rate
```

### Seat Not Reserved

**Problem:** Booking created but seat not marked as booked  
**Solution:**

```bash
# Verify Flight Service is running
curl http://localhost:3000/api/v1/info

# Check seat update endpoint works
curl -X PATCH http://localhost:3000/api/v1/seats/5 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isBooked": true}'
```

### Inter-Service Communication Fails

**Problem:** Cannot reach Flight or Auth Service  
**Solution:**

```bash
# Check environment variables
grep SERVICE_URL .env

# Verify services running
curl http://localhost:3000/api/v1/info  # Flight Service
curl http://localhost:3002/api/v1/info  # Auth Service

# Check logs for detailed error
tail -f logs/all_logs.log
```

---

## Performance Optimization

### Database Indexes

All foreign keys and status fields are indexed:

```sql
INDEX idx_userId (userId)
INDEX idx_status (status)
INDEX idx_expiresAt (expiresAt)
```

### Cron Job Optimization

The auto-expiry cron runs every minute and only updates expired bookings:

```javascript
// Efficient query with index on expiresAt
WHERE status = 'PENDING' AND expiresAt < NOW()
```

### Connection Pooling

Sequelize uses connection pooling for database efficiency.

---

## See Also

- [Main Project README](../README.md)
- [Auth Service](../auth-service/README.md)
- [Flight Booking System](../flight-booking-system/README.md)

---

**Last Updated:** January 21, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
