# Authentication API Documentation

This document provides comprehensive API documentation for the authentication module with user background profiling.

## Base URL

All endpoints are relative to `/api/auth`

## Authentication

Most endpoints require a valid session token in the Authorization header:
- Format: `Bearer {session_token}`

## Common Headers

- `Content-Type: application/json`
- `Authorization: Bearer {token}` (for protected endpoints)

## Common Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
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

---

## POST /signup

Register a new user with background profiling data.

### Request Body
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "software_experience": ["JavaScript", "Python", "React"],
  "hardware_familiarity": ["Arduino", "Raspberry Pi"],
  "years_coding": 3,
  "years_hardware": 2,
  "primary_languages": ["JavaScript", "Python"],
  "development_area": "web development",
  "preferred_platforms": ["Arduino"],
  "robotics_experience": "basic"
}
```

### Request Body Parameters
- `email` (string, required): User's email address
- `password` (string, required): User's password (min 8 chars with uppercase, lowercase, number, special char)
- `software_experience` (array of strings, optional): Array of programming languages, frameworks, tools (max 10 items, 2-50 chars each)
- `hardware_familiarity` (array of strings, optional): Array of robotics platforms, hardware components, sensors (max 10 items, 2-50 chars each)
- `years_coding` (number, optional): Years of software development experience (0-50 range)
- `years_hardware` (number, optional): Years of hardware experience (0-50 range)
- `primary_languages` (array of strings, optional): Primary programming languages used
- `development_area` (string, optional): Development area (web, mobile, backend, frontend, AI/ML, etc.)
- `preferred_platforms` (array of strings, optional): Preferred platforms (ROS, Arduino, Raspberry Pi, etc.)
- `robotics_experience` (string, optional): Experience level ("none", "basic", "intermediate", "advanced")

### Response (201 Created)
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
    "years_coding": 3,
    "years_hardware": 2,
    "primary_languages": ["JavaScript", "Python"],
    "development_area": "web development",
    "preferred_platforms": ["Arduino"],
    "robotics_experience": "basic",
    "interests": ["JavaScript", "TypeScript", "React"],
    "learning_path": "full-stack-development"
  },
  "session": {
    "id": "session_1234567890",
    "expires_at": "2025-12-17T11:30:00Z"
  }
}
```

### Error Responses
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Email already exists
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## POST /signin

Authenticate an existing user.

### Request Body
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

### Request Body Parameters
- `email` (string, required): User's email address
- `password` (string, required): User's password

### Response (200 OK)
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
    "years_coding": 3,
    "years_hardware": 2,
    "primary_languages": ["JavaScript", "Python"],
    "development_area": "web development",
    "preferred_platforms": ["Arduino"],
    "robotics_experience": "basic",
    "interests": ["JavaScript", "TypeScript", "React"],
    "learning_path": "full-stack-development"
  },
  "session": {
    "id": "session_1234567890",
    "expires_at": "2025-12-17T11:30:00Z"
  }
}
```

### Error Responses
- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: Invalid credentials
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## GET /profile

Retrieve the authenticated user's profile.

### Headers
```
Authorization: Bearer {session_token}
```

### Response (200 OK)
```json
{
  "id": "user_1234567890",
  "email": "user@example.com",
  "created_at": "2025-12-17T10:30:00Z",
  "updated_at": "2025-12-17T10:30:00Z",
  "software_experience": ["JavaScript", "Python", "React"],
  "hardware_familiarity": ["Arduino", "Raspberry Pi"],
  "skill_level": "intermediate",
  "years_coding": 3,
  "years_hardware": 2,
  "primary_languages": ["JavaScript", "Python"],
  "development_area": "web development",
  "preferred_platforms": ["Arduino"],
  "robotics_experience": "basic",
  "interests": ["JavaScript", "TypeScript", "React"],
  "learning_path": "full-stack-development"
}
```

### Error Responses
- `401 Unauthorized`: Invalid or expired session
- `500 Internal Server Error`: Server error

---

## PUT /profile

Update the authenticated user's profile.

### Headers
```
Authorization: Bearer {session_token}
```

### Request Body
```json
{
  "software_experience": ["JavaScript", "Python", "React", "Node.js"],
  "hardware_familiarity": ["Arduino", "Raspberry Pi", "ROS"],
  "years_coding": 4,
  "years_hardware": 2,
  "primary_languages": ["JavaScript", "Python", "TypeScript"],
  "development_area": "full-stack development",
  "preferred_platforms": ["Arduino", "ROS"],
  "robotics_experience": "intermediate"
}
```

### Response (200 OK)
```json
{
  "id": "user_1234567890",
  "email": "user@example.com",
  "created_at": "2025-12-17T10:30:00Z",
  "updated_at": "2025-12-17T11:00:00Z",
  "software_experience": ["JavaScript", "Python", "React", "Node.js"],
  "hardware_familiarity": ["Arduino", "Raspberry Pi", "ROS"],
  "skill_level": "intermediate",  // May be updated based on new data
  "years_coding": 4,
  "years_hardware": 2,
  "primary_languages": ["JavaScript", "Python", "TypeScript"],
  "development_area": "full-stack development",
  "preferred_platforms": ["Arduino", "ROS"],
  "robotics_experience": "intermediate",
  "interests": ["JavaScript", "TypeScript", "React", "Node.js"],
  "learning_path": "full-stack-development"
}
```

### Error Responses
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid or expired session
- `500 Internal Server Error`: Server error

---

## POST /signout

End the current user session.

### Headers
```
Authorization: Bearer {session_token}
```

### Response (204 No Content)
No response body.

### Error Responses
- `401 Unauthorized`: Invalid or expired session
- `500 Internal Server Error`: Server error

---

## Rate Limiting

The authentication API implements rate limiting to prevent abuse:

- **Signup**: Maximum 5 attempts per IP address per 15 minutes
- **Signin**: Maximum 10 attempts per IP address per 5 minutes
- **Profile endpoints**: Maximum 100 requests per IP address per hour

When rate limited, the API returns a `429 Too Many Requests` status with details about when the limit resets.

---

## Security Considerations

1. **Password Requirements**: Passwords must be at least 8 characters with uppercase, lowercase, number, and special character
2. **Input Sanitization**: All inputs are sanitized to prevent injection attacks
3. **Session Security**: Sessions use secure cookies with HttpOnly, SameSite, and Secure flags
4. **CSRF Protection**: Enabled to prevent cross-site request forgery
5. **XSS Protection**: Security headers to prevent cross-site scripting
6. **Rate Limiting**: Protection against brute force attacks
7. **Email Verification**: Required for production security

---

## Error Handling

The API follows consistent error handling patterns:

- All error responses follow the standard error format
- Detailed error messages are provided for client debugging
- Sensitive information is not exposed in error messages
- Appropriate HTTP status codes are used
- Rate limit information is provided when applicable