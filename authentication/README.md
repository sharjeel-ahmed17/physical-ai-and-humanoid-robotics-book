# Authentication Module

This module handles user authentication with background profiling for the Physical AI & Humanoid Robotics Textbook project.

## Overview

The authentication module provides:
- Secure user signup and signin using Better Auth
- Collection of user background information (software skills, hardware familiarity)
- User categorization (beginner/intermediate/advanced) based on background data
- Integration with Neon database for user data storage

## Dependencies

- Better Auth: For authentication management
- Neon Database: For persistent user data storage
- Drizzle ORM: For database operations
- Zod: For data validation

## Environment Variables

Create a `.env` file based on `.env.example` with your specific configuration:

```bash
AUTH_SECRET=your_secret_key
DATABASE_URL=your_neon_database_connection_string
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your Neon database and update the DATABASE_URL in your .env file

3. Run database migrations:
```bash
npx drizzle-kit push
```

## Usage

The authentication module is designed to be integrated with the main Docusaurus application to provide user authentication and background profiling capabilities.