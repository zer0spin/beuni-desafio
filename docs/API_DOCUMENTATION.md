# Beuni API Documentation

## 🚀 Overview

Beuni API provides a comprehensive set of endpoints for managing employee birthdays, user authentication, and corporate information.

## 🔐 Authentication

### Login
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticate user and generate JWT token

#### Request
```json
{
    "username": "string",
    "password": "string"
}
```

#### Response
- **200 OK**:
```json
{
    "access_token": "jwt_token_string",
    "user": {
        "id": "string",
        "username": "string",
        "role": "admin|user"
    }
}
```
- **401 Unauthorized**: Invalid credentials

## 👥 Users Module

### Get Current User
- **Endpoint**: `GET /usuarios/me`
- **Authentication**: Required (JWT)
- **Description**: Retrieve current user's profile

#### Response
```json
{
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "admin|user"
}
```

### Create User
- **Endpoint**: `POST /usuarios`
- **Authentication**: Admin only
- **Description**: Create a new user

#### Request
```json
{
    "username": "string",
    "email": "string",
    "password": "string",
    "role": "admin|user"
}
```

## 👷 Collaborators Module

### List Collaborators
- **Endpoint**: `GET /colaboradores`
- **Authentication**: Required (JWT)
- **Query Parameters**:
  - `page`: Number (default: 1)
  - `limit`: Number (default: 10)

#### Response
```json
{
    "data": [
        {
            "id": "string",
            "name": "string",
            "birthdate": "date",
            "department": "string"
        }
    ],
    "total": "number",
    "page": "number",
    "limit": "number"
}
```

### Create Collaborator
- **Endpoint**: `POST /colaboradores`
- **Authentication**: Admin only

#### Request
```json
{
    "name": "string",
    "birthdate": "date",
    "email": "string",
    "department": "string"
}
```

## 🏠 CEP (Address) Module

### Validate CEP
- **Endpoint**: `GET /cep/:cep`
- **Description**: Validate and retrieve address details

#### Response
```json
{
    "cep": "string",
    "logradouro": "string",
    "complemento": "string",
    "bairro": "string",
    "localidade": "string",
    "uf": "string"
}
```

## 🛡️ Error Handling

### Standard Error Response
```json
{
    "statusCode": "number",
    "message": "string",
    "error": "string"
}
```

## 📊 Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

## 🔒 Security Notes
- All endpoints requiring authentication use JWT
- Rate limiting is implemented
- Input validation for all endpoints
- CORS configured
- HTTPS recommended in production
