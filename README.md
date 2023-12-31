#  Prototype for URL Shortening service for GDSC NITS

This project is a URL shortener built with Express.js, Prisma, and MongoDB. It allows users to shorten long URLs into more manageable and shareable links.

## Getting Started

Prerequisites
Node.js (>= version 14)
MongoDB (Make sure MongoDB is installed and running)
## Installation

Clone the repository:
```bash
  git clone https://github.com/gdsc-nits-org/proto-shorturl-backend.github
```
Change into the project directory:
```bash
  cd proto-shorturl-backend
```
Install dependencies:
```bash
   npm install
```
Create a '.env' file in the root directory and set the following environment variables:
```bash
   PORT=3000
  DATABASE_URI=mongodb://localhost:3000/proto-shorturl-backend
```
Adjust the 'PORT' and 'DATABASE_URI' values as needed.

##  Database Setup

1. Ensure that your MongoDB server is running.
2. Create a database named 'url-shortener' (or the name specified in your '.env' file).

## API Endpoints
1. Method : POST
2. Endpoint: /api/shorten
3. Body:
```json
{
  "url": "https://example.com"
}
```
3. Responses:
```json
{
  "originalUrl": "https://example.com",
  "shortUrl": "http://localhost:3000/abc123"
}
```
#### Redirect to Original URL:

1. Endpoint: GET /:shortCode
2. Redirects to the original long URL associated with the provided short code.

## Contributing

Contributions are always welcome!
