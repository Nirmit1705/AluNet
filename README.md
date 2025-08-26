# Student-Alumni Interaction Platform

## Setup Instructions

### Server Setup:

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file with the following content:
```
MONGO_URI=mongodb://localhost:27017/student-alumni-platform
JWT_SECRET=your_jwt_secret_here
PORT=5000
FRONTEND_URL=http://localhost:5173
```

4. Start the server:
```bash
npm run dev
```

### Client Setup:

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the client:
```bash
npm run dev
```

## Important Notes

- Make sure MongoDB is running on your local machine
- The default admin account credentials are:
  - Email: verify@admin.com
  - Password: admin123
