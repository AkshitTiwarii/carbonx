# Exception Handling Implementation

## Overview

Comprehensive exception handling has been implemented across the entire Gamified Sustainability Rewards System to ensure reliability, user experience, and proper error tracking.

## Backend Exception Handling

### API Routes (`backend/routers/rewards.py`)

All API endpoints now include:

1. **Input Validation**
   - Pydantic models with validators for type checking
   - Field-level validation (user_id, action_type, amount)
   - Sanitization of user inputs

2. **Structured Error Responses**
   ```python
   {
     "success": false,
     "status": "error_type",
     "message": "User-friendly message",
     "code": "ERROR_CODE",
     "details": {...}  # Optional, only in debug mode
   }
   ```

3. **Database Error Handling**
   - JSON parsing errors with automatic backup
   - File permission errors
   - Data corruption recovery
   - Graceful fallbacks for missing data

4. **Logging**
   - All errors logged with stack traces
   - Warning logs for recoverable issues
   - Info logs for successful operations

### Error Codes

- `INVALID_USER_ID` - Invalid or missing user ID
- `VALIDATION_ERROR` - Request validation failed
- `DB_ACCESS_ERROR` - Database read error
- `DB_UPDATE_ERROR` - Database write error
- `DB_LOAD_ERROR` - Database load error
- `INTERNAL_ERROR` - Unexpected server error

## Frontend Exception Handling

### API Routes (`src/app/api/rewards/*`)

1. **Request Validation**
   - JSON parsing with error handling
   - Type checking for all inputs
   - Required field validation

2. **Network Error Handling**
   - Connection timeout (30 seconds)
   - Backend connection failures
   - Network interruption handling

3. **Response Parsing**
   - Safe JSON parsing
   - Invalid response handling
   - Error response normalization

### Components

1. **Error Boundaries** (`ErrorBoundary.tsx`)
   - Catches React component errors
   - Displays user-friendly error UI
   - Logs errors for debugging
   - Provides reset functionality

2. **Toast Notifications** (`ToastContainer.tsx`)
   - Success, error, warning, and info toasts
   - Auto-dismiss with configurable duration
   - Action buttons for user interaction

3. **Fallback UI**
   - Empty states for failed data loads
   - Loading states during operations
   - Graceful degradation

### Hooks

**useRewards Hook** (`src/hooks/useRewards.ts`)
- Validates user ID before operations
- Handles API errors with user feedback
- Manages badge NFT minting errors separately
- Shows appropriate toast notifications
- Continues operation even if NFT minting fails

## Blockchain Integration

### Badge NFT Minting (`src/lib/badgeNFT.ts`)

1. **Input Validation**
   - Wallet address format validation
   - Badge ID validation
   - Metadata structure validation

2. **Transaction Error Handling**
   - User rejection handling
   - Insufficient funds detection
   - Network error handling
   - Gas estimation failures
   - Contract not configured gracefully

3. **Error Codes**
   - `INVALID_WALLET_ADDRESS`
   - `INVALID_BADGE_ID`
   - `INVALID_METADATA`
   - `CONTRACT_NOT_CONFIGURED`
   - `USER_REJECTED`
   - `INSUFFICIENT_FUNDS`
   - `NETWORK_ERROR`
   - `GAS_ESTIMATION_ERROR`
   - `MINT_ERROR`

## Logging System

### Centralized Logger (`src/lib/logger.ts`)

- Log levels: debug, info, warn, error
- Structured logging with context
- External service integration ready (Sentry, Logtail)
- Global error handlers for unhandled rejections

### Error Tracking

Errors are logged with:
- Timestamp
- Log level
- Error message
- Stack trace (when available)
- Context data

## User Experience

### Error Messages

All error messages are:
- **User-friendly**: No technical jargon
- **Actionable**: Tell users what to do next
- **Consistent**: Same format across the app

### Examples

- ❌ "Error: TypeError: Cannot read property 'ecoPoints' of undefined"
- ✅ "Failed to load your rewards. Please refresh the page."

- ❌ "Transaction failed"
- ✅ "Transaction rejected. Please try again or check your wallet connection."

### Toast Notifications

- **Success**: Green toast for successful operations
- **Error**: Red toast for errors (7s duration)
- **Warning**: Yellow toast for warnings
- **Info**: Blue toast for informational messages

## Testing Error Scenarios

### Backend

1. **Invalid Input**
   ```bash
   curl -X POST http://localhost:8000/api/rewards/update \
     -H "Content-Type: application/json" \
     -d '{"user_id": "", "action_type": "invalid"}'
   ```

2. **Database Corruption**
   - Manually corrupt `rewards_db.json`
   - System should recover automatically

3. **Network Timeout**
   - Simulate slow backend response
   - Frontend should timeout after 30s

### Frontend

1. **Network Disconnection**
   - Disable network during API call
   - Should show network error toast

2. **Wallet Rejection**
   - Reject MetaMask transaction
   - Should show user-friendly message

3. **Component Crash**
   - Error boundary should catch and display fallback UI

## Monitoring

### Production Logging

In production, integrate with:
- **Sentry**: Error tracking and alerting
- **Logtail**: Centralized log aggregation
- **Custom Analytics**: Track error rates and types

### Error Metrics

Track:
- Error rate by endpoint
- Most common error codes
- User impact (how many users affected)
- Recovery time

## Best Practices

1. **Never expose internal errors to users**
   - Use generic messages in production
   - Include details only in debug mode

2. **Always provide fallback UI**
   - Empty states instead of crashes
   - Loading states during operations

3. **Log everything**
   - Errors, warnings, and important info
   - Include context for debugging

4. **Graceful degradation**
   - Continue operation if non-critical parts fail
   - Don't block user flow for optional features

5. **User feedback**
   - Always inform users of errors
   - Provide actionable next steps

## Future Enhancements

- [ ] Retry logic for transient errors
- [ ] Circuit breaker pattern for backend calls
- [ ] Error analytics dashboard
- [ ] Automated error reporting to team
- [ ] User error reporting feature

