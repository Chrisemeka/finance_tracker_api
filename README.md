# Finance Tracker API

A comprehensive RESTful API for managing personal finances, built with Node.js, Express, TypeScript, and Prisma ORM with MySQL database.

## Features

- **User Management**: Registration, login, profile updates, and account deletion
- **Transaction Management**: Create, read, update, and delete income/expense transactions
- **Budget Management**: Set and track monthly budgets by category
- **Financial Reports**: Generate monthly financial summaries with savings rate calculations
- **JWT Authentication**: Secure API endpoints with token-based authentication
- **Input Validation**: Comprehensive data validation using Zod schemas
- **Pagination**: Efficient data retrieval with pagination support

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: Zod
- **Development**: Nodemon for hot reloading

## Prerequisites

- Node.js (v18 or higher)
- MySQL database
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finance_tracker_api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/finance_tracker"
   JWT_SECRET="your-super-secret-jwt-key"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

#### Register User
```http
POST /users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Login User
```http
POST /users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### User Management

#### Update Profile
```http
PUT /users/update-profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "currencyPreference": "USD",
  "monthlyIncome": 5000.00
}
```

#### Delete Account
```http
DELETE /users/delete-account
Authorization: Bearer <token>
```

### Transactions

#### Get All Transactions (with pagination)
```http
GET /users/transactions?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Single Transaction
```http
GET /users/transactions/:id
Authorization: Bearer <token>
```

#### Create Transaction
```http
POST /users/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "expense",
  "category": "groceries",
  "amount": 75.50,
  "description": "Weekly grocery shopping",
  "date": "2025-06-25"
}
```

#### Update Transaction
```http
PUT /users/transactions/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 80.00,
  "description": "Updated grocery amount"
}
```

#### Delete Transaction
```http
DELETE /users/transactions/:id
Authorization: Bearer <token>
```

### Budgets

#### Get Current Month Budgets
```http
GET /users/budgets
Authorization: Bearer <token>
```

#### Create Budget
```http
POST /users/budgets
Authorization: Bearer <token>
Content-Type: application/json

{
  "category": "groceries",
  "amount": 400.00,
  "month": "2025-06"
}
```

### Reports

#### Get Monthly Financial Report
```http
GET /report/monthly
Authorization: Bearer <token>
```

**Response:**
```json
{
  "month": "2025-06",
  "income": 5000.00,
  "expense": 3200.00,
  "savings": 1800.00,
  "savingsRate": 36.00
}
```

## Data Models

### User
- `id`: Auto-incrementing primary key
- `email`: Unique email address
- `password`: Hashed password
- `name`: User's full name
- `currencyPreference`: 3-letter currency code (default: USD)
- `monthlyIncome`: Monthly income amount
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

### Transaction
- `id`: Auto-incrementing primary key
- `userId`: Foreign key to User
- `type`: "income" or "expense"
- `category`: Transaction category
- `amount`: Transaction amount
- `date`: Transaction date
- `description`: Optional description
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Budget
- `id`: Auto-incrementing primary key
- `userId`: Foreign key to User
- `category`: Budget category
- `amount`: Budget amount
- `month`: Budget month
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## Validation Rules

### User Registration
- **Name**: 2-100 characters, letters and spaces only
- **Email**: Valid email format, automatically lowercased
- **Password**: Minimum 8 characters with uppercase, lowercase, number, and special character

### Transactions
- **Type**: Must be "income" or "expense"
- **Category**: 1-50 characters, automatically lowercased
- **Amount**: Positive number, max 99,999,999.99
- **Description**: Optional, max 200 characters
- **Date**: Valid date format

### Budgets
- **Category**: 1-50 characters, automatically lowercased
- **Amount**: Positive number, max 99,999,999.99
- **Month**: YYYY-MM format

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "fieldName",
      "message": "Specific validation error"
    }
  ]
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate resource)
- `500`: Internal Server Error

## Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### Project Structure

```
src/
├── middleware/
│   ├── auth.ts          # JWT authentication middleware
│   └── validate.ts      # Zod validation middleware
├── routes/
│   ├── users.ts         # User management routes
│   ├── transactions.ts  # Transaction CRUD routes
│   ├── budgets.ts       # Budget management routes
│   └── report.ts        # Financial reporting routes
├── schemas/
│   ├── userSchemas.ts   # User validation schemas
│   ├── transactionSchemas.ts # Transaction validation schemas
│   └── budgetSchemas.ts # Budget validation schemas
├── prisma.ts            # Prisma client configuration
└── index.ts             # Main application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

