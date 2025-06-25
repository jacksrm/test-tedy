### Create a User
```bash
curl -X POST http://localhost:8080/users \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"Password@123", "name": "John Doe"}'
```

### Get all users
```bash
curl -X GET http://localhost:8080/users
```

### Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"Password@123"}'
```

### Get one user (Authenticated Only)
```bash
curl -X GET http://localhost:8080/users/me \
  -H 'Authorization: Bearer <token>' 
```