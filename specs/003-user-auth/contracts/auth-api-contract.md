# API Contract: Authentication Service

## Overview
API contract for authentication service with user background profiling. This defines the endpoints, request/response formats, and error handling for the authentication module.

## Base URL
All endpoints are relative to `/api/auth`

## Authentication
- Most endpoints require a valid session token in the Authorization header
- Format: `Bearer {session_token}`

## Common Headers
- `Content-Type: application/json`
- `Authorization: Bearer {token}` (for protected endpoints)

## Endpoints

### POST /signup
Register a new user with background profiling data.

#### Request
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "software_experience": ["JavaScript", "Python", "React"],
  "hardware_familiarity": ["Arduino", "Raspberry Pi"],
  "years_experience": 3,
  "primary_domain": "web development"
}
```

#### Response (201 Created)
```json
{
  "user": {
    "id": "user_1234567890",
    "email": "user@example.com",
    "created_at": "2025-12-17T10:30:00Z",
    "updated_at": "2025-12-17T10:30:00Z",
    "software_experience": ["JavaScript", "Python", "React"],
    "hardware_familiarity": ["Arduino", "Raspberry Pi"],
    "skill_level": "intermediate",
    "years_experience": 3,
    "primary_domain": "web development"
  },
  "session": {
    "id": "session_1234567890",
    "expires_at": "2025-12-17T11:30:00Z"
  }
}
```

#### Error Responses
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Email already exists
- `500 Internal Server Error`: Server error

### POST /signin
Authenticate an existing user.

#### Request
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### Response (200 OK)
```json
{
  "user": {
    "id": "user_1234567890",
    "email": "user@example.com",
    "created_at": "2025-12-17T10:30:00Z",
    "updated_at": "2025-12-17T10:30:00Z",
    "software_experience": ["JavaScript", "Python", "React"],
    "hardware_familiarity": ["Arduino", "Raspberry Pi"],
    "skill_level": "intermediate",
    "years_experience": 3,
    "primary_domain": "web development"
  },
  "session": {
    "id": "session_1234567890",
    "expires_at": "2025-12-17T11:30:00Z"
  }
}
```

#### Error Responses
- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: Invalid credentials
- `500 Internal Server Error`: Server error

### GET /profile
Retrieve the authenticated user's profile.

#### Headers
```
Authorization: Bearer {session_token}
```

#### Response (200 OK)
```json
{
  "id": "user_1234567890",
  "email": "user@example.com",
  "created_at": "2025-12-17T10:30:00Z",
  "updated_at": "2025-12-17T10:30:00Z",
  "software_experience": ["JavaScript", "Python", "React"],
  "hardware_familiarity": ["Arduino", "Raspberry Pi"],
  "skill_level": "intermediate",
  "years_experience": 3,
  "primary_domain": "web development"
}
```

#### Error Responses
- `401 Unauthorized`: Invalid or expired session
- `500 Internal Server Error`: Server error

### PUT /profile
Update the authenticated user's profile.

#### Headers
```
Authorization: Bearer {session_token}
```

#### Request
```json
{
  "software_experience": ["JavaScript", "Python", "React", "Node.js"],
  "hardware_familiarity": ["Arduino", "Raspberry Pi", "ROS"],
  "years_experience": 4,
  "primary_domain": "full-stack development"
}
```

#### Response (200 OK)
```json
{
  "id": "user_1234567890",
  "email": "user@example.com",
  "created_at": "2025-12-17T10:30:00Z",
  "updated_at": "2025-12-17T11:00:00Z",
  "software_experience": ["JavaScript", "Python", "React", "Node.js"],
  "hardware_familiarity": ["Arduino", "Raspberry Pi", "ROS"],
  "skill_level": "intermediate",  // May be updated based on new data
  "years_experience": 4,
  "primary_domain": "full-stack development"
}
```

#### Error Responses
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid or expired session
- `500 Internal Server Error`: Server error

### POST /signout
End the current user session.

#### Headers
```
Authorization: Bearer {session_token}
```

#### Response (204 No Content)
No response body.

#### Error Responses
- `401 Unauthorized`: Invalid or expired session
- `500 Internal Server Error`: Server error

## Error Format
All error responses follow this format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details (optional)"
  }
}
```

## Common Error Codes
- `INVALID_INPUT`: Request data doesn't meet validation requirements
- `UNAUTHORIZED`: Authentication required or failed
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `CONFLICT`: Request conflicts with existing data (e.g., duplicate email)
- `RATE_LIMITED`: Too many requests from the same source
- `INTERNAL_ERROR`: Server-side error occurred