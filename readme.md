# HireEcho - Job Hiring Platform (Backend)

This is the backend server for **HireEcho**, a job hiring platform where users can post jobs, apply for jobs, and manage job applications. The server is built with **Express.js** and connected to a **MongoDB Atlas** database.

## 🔧 Technologies Used

- Node.js
- Express.js
- MongoDB (Atlas)
- JSON Web Token (JWT)
- Cookie Parser
- CORS
- Dotenv

---

## 🚀 Getting Started

### Prerequisites

- Node.js and npm installed
- MongoDB Atlas cluster
- `.env` file with your credentials

## Environment Variables

```
USER_ID=yourMongoUser
USER_PASS=yourMongoPassword
API_SECRET_KEY=yourJWTSecretKey
PORT=5000
NODE_ENV=development
```

### Installation

```bash
##Clone the repository

git clone https://github.com/yourusername/hireecho-backend.git
cd hireecho-backend

## Install dependencies
npm install
```

## 📌 API Endpoints

### Authentication
POST /jwt – Generate JWT token and set as HTTP-only cookie

POST /logout – Clear the token cookie

### Jobs
GET /allJobs – Get all jobs (with optional filters: category, search, email)

POST /addJobs – Post a new job (requires JWT)

GET /jobDetails/:id – Get job details (requires JWT)

PUT /jobDetailsUpdate/:id – Update a job (requires JWT)

DELETE /myJob/:id – Delete a job (requires JWT)

### Companies

GET /companies – Get list of top companies

### Applications

GET /appliedJobs – Get all jobs the user applied to (filters: email, filterBy)

POST /appliedJobs – Apply for a job (requires JWT)

### User Stats

GET /jobAppliedCount – Number of jobs a user has applied for (requires JWT)

GET /jobPostedCount – Number of jobs posted by the user (requires JWT)

## 🔐 Middleware

verifyToken
A middleware to protect routes using JWT. It checks the cookie for a valid token and decodes it before allowing access.

## 📝 Notes

CORS is configured to allow specific origins including development and production URLs.

JWT tokens are stored in HTTP-only cookies for better security.

MongoDB URI is constructed using environment variables for security and flexibility.

## 📦 Deployment

This server can be deployed on platforms like:

Vercel (via serverless functions or API routes)

## 🌐 Live Demo

https://hire-echo.web.app/

## 🙌 Author

MD SOJIB HOSSAIN
Backend Developer of HireEcho
Email: sojibhossain.cse@gmail.com
