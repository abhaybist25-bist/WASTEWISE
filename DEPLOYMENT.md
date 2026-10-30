# WasteWise Deployment Guide

This guide details how to build and deploy both the **Spring Boot backend** and the **Vite React frontend** for production.

---

## 1. MongoDB Database Setup (MongoDB Atlas)

1. Create a free M0 cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user with read/write permissions.
3. Whitelist your deployment server IPs (or `0.0.0.0/0` for initial cloud tests).
4. Obtain the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/wastewise_db?retryWrites=true&w=majority
   ```

---

## 2. Backend Production Deployment

### Build Executable JAR
```bash
cd backend
mvn clean package -DskipTests
```
The packaged standalone JAR will be created at:
`backend/target/wastewise-backend-1.0.0.jar`

### Environment Variables for Production
Set the following environment variables in your hosting provider (Render, Railway, AWS EC2, or Docker container):

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Web server listening port | `8080` |
| `SPRING_DATA_MONGODB_URI` | MongoDB Atlas URI | `mongodb+srv://...` |
| `JWT_SECRET` | 256-bit+ secure signing key | `9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f` |
| `JWT_EXPIRATION_MS` | Token expiry in ms | `86400000` (24 hours) |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `CORS_ALLOWED_ORIGINS` | Production frontend domain | `https://your-wastewise-app.vercel.app` |

### Run Standalone JAR
```bash
java -jar target/wastewise-backend-1.0.0.jar
```

### Docker Deployment (Optional Dockerfile)
```dockerfile
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY target/wastewise-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 3. Frontend Production Deployment (Vercel / Netlify)

### Environment Variable
Create `.env.production` in `frontend/`:
```env
VITE_API_BASE_URL=https://your-backend-api-domain.com/api
```

### Build Command
```bash
cd frontend
npm run build
```
Output directory: `frontend/dist`

### Vercel / Netlify Configuration
For client-side routing with React Router, include a rewrite rule:

**Vercel (`vercel.json`):**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Netlify (`_redirects`):**
```
/*    /index.html   200
```

