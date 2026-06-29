# TaskFlow API

## Secure Task Management Backend

### Project Overview

TaskFlow API is a secure RESTful backend built for a modern Task Management application. The API enables users to register, authenticate, manage their personal tasks, and subscribe to premium plans using Stripe Checkout.

The backend follows industry-standard REST principles with JWT authentication, MongoDB database integration, protected routes, secure middleware, and scalable folder architecture.

The primary objective is to provide a production-ready backend that can be integrated with any React frontend while ensuring security, scalability, and maintainability.

---

# Track

**Backend Development**

---

# Problem Statement

Individuals and teams need a secure platform to organize tasks while protecting user data and providing premium subscription capabilities.

TaskFlow API solves these challenges by providing:

- Secure user authentication
- JWT-based authorization
- User-specific task management
- Stripe payment integration
- Secure REST APIs
- Scalable backend architecture

---

# Technology Stack

## Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcryptjs
- Stripe API

## Security

- Helmet
- Express Rate Limit
- CORS
- dotenv

## Deployment

- Render (Backend)
- MongoDB Atlas (Database)
- Vercel (Frontend)

---

# Core Features (Priority Order)

## P0 - Core MVP

### Authentication

- User Registration
- User Login
- Password Hashing
- JWT Authentication
- Protected Routes

### Task Management

- Create Tasks
- View Tasks
- Update Tasks
- Delete Tasks
- User-specific Task Ownership

---

## P1 - Premium Features

### Stripe Integration

- Create Checkout Session
- Subscription Plans
- Payment Verification
- Secure Webhooks

---

## P2 - Production Features

### Security

- Helmet Protection
- Rate Limiting
- Environment Variables
- Centralized Error Handling
- Secure CORS Configuration

---

# User Roles

## User

Responsible for managing personal tasks.

### Permissions

- Register
- Login
- Create Tasks
- Update Own Tasks
- Delete Own Tasks
- Purchase Subscription

---

# Database Architecture

The application follows MongoDB document architecture.

## Collections

### Users

Stores authentication credentials and profile information.

### Tasks

Stores task title, description, completion status, ownership, and timestamps.

---

# System Architecture

## MVC Architecture

The backend follows a modular MVC architecture.

### Controllers

- Authentication Controller
- Task Controller
- Stripe Controller

### Models

- User
- Task

### Middleware

- JWT Authentication
- Error Handling

### Routes

- Authentication Routes
- Task Routes
- Stripe Routes

---

# API Architecture

## Authentication

POST /api/auth/register

POST /api/auth/login

---

## Tasks

GET /api/tasks

POST /api/tasks

PUT /api/tasks/:id

DELETE /api/tasks/:id

---

## Stripe

POST /api/stripe/create-checkout-session

POST /api/stripe/webhook

---

# Project Structure

```
backend/
│
├── src
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   └── index.js
│
├── package.json
├── .env.example
└── README.md
```

---

# Deployment

## Backend

Deploy on Render

### Build Command

```
npm install
```

### Start Command

```
npm start
```

---

## Frontend

Deploy on Vercel

Configure:

```
VITE_API_URL=https://your-backend.onrender.com
```

---

# Environment Variables

```
MONGODB_URI=

JWT_SECRET=

JWT_EXPIRES_IN=

CLIENT_URL=

STRIPE_SECRET_KEY=

STRIPE_WEBHOOK_SECRET=

STRIPE_PRO_PRICE_ID=

STRIPE_TEAMS_PRICE_ID=

NODE_ENV=production
```

---

# Development Roadmap

## Sprint 1

Authentication & User Management

## Sprint 2

Task CRUD Operations

## Sprint 3

Stripe Payment Integration

## Sprint 4

Security Hardening

## Sprint 5

Deployment & Production Testing

---

# Future Enhancements

- Task Categories
- Task Labels
- File Attachments
- Email Notifications
- Team Collaboration
- Activity Logs
- AI Task Suggestions
- Task Analytics Dashboard

---

# Author

Harshit

Backend Capstone Project