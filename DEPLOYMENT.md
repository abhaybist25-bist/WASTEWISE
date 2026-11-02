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

Vercel hosts the frontend in this repository. Deploy the Spring Boot API separately
to a Java application host such as Render or Railway, and deploy MongoDB on Atlas.
The frontend must be configured with the public URL of that API.

### Build Executable JAR
```bash
cd backend
mvn clean package
```
The packaged standalone JAR will be created at:
`backend/target/wastewise-backend-1.0.0.jar`

### Environment Variables for Production
Set the following environment variables in your hosting provider (Render, Railway, AWS EC2, or Docker container):

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas URI | `mongodb+srv://...` |
| `JWT_SECRET` | Strong, unique signing key (keep it secret) | Set a generated secret in the host dashboard |
| `JWT_EXPIRATION_MS` | Token expiry in ms | `86400000` (24 hours) |
| `GEMINI_API_KEY` | Optional Google Gemini API key | Set in the host dashboard if AI insights are enabled |
| `CORS_ALLOWED_ORIGINS` | Production frontend origin | `https://your-wastewise-app.vercel.app` |

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

## 3. Frontend Production Deployment (Vercel)

1. Import the GitHub repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Use `npm run build` as the build command and `dist` as the output directory.
4. Add the `VITE_API_BASE_URL` environment variable in the Vercel project settings,
   including `/api` at the end (for example, `https://your-backend.example.com/api`).
   Set this for each environment you deploy (Production, Preview, and Development).
5. Deploy or redeploy the project after setting the environment variable.

`frontend/vercel.json` contains the rewrite needed for React Router routes to work
when opened directly or refreshed.

### Build locally
```bash
cd frontend
npm run build
```
The build output is `frontend/dist`. Do not commit deployment secrets or a
production `.env` file.
