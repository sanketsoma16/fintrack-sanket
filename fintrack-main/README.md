# FinTrack - Smart Expense Tracking & Financial Analyzer

A full-stack expense tracking application with Spring Boot backend and React frontend.

## Prerequisites

Before running the application, ensure you have the following installed:

1. **Java 21** - [Download](https://www.oracle.com/java/technologies/downloads/#java17)
2. **Maven 3.6+** - [Download](https://maven.apache.org/download.cgi)
3. **MySQL 8.0+** - [Download](https://dev.mysql.com/downloads/mysql/)
4. **Node.js 18+** - [Download](https://nodejs.org/)
5. **npm** (comes with Node.js)

## Database Setup

1. **Start MySQL Server**
   ```bash
   # Windows: Start MySQL service from Services
   # Or use: net start MySQL80
   ```

2. **Create Database**
   ```sql
   mysql -u root -p
   CREATE DATABASE fintrack;
   EXIT;
   ```

3. **Update Database Credentials** (if needed)
   - Edit `fintrack-backend/src/main/resources/application.properties`
   - Update `spring.datasource.username` and `spring.datasource.password` if your MySQL credentials differ

## Backend Setup & Run

1. **Navigate to backend directory**
   ```bash
   cd fintrack-backend
   ```

2. **Build the project** (downloads dependencies)
   ```bash
   mvn clean install
   ```

3. **Run the Spring Boot application**
   ```bash
   mvn spring-boot:run
   ```

   The backend will start on **http://localhost:8080**

4. **Verify backend is running**
   - Open browser: http://localhost:8080/swagger-ui.html
   - You should see Swagger API documentation

## Frontend Setup & Run

1. **Navigate to frontend directory** (in a new terminal)
   ```bash
   cd fintrack-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

   The frontend will start on **http://localhost:5173**

4. **Open in browser**
   - Navigate to: http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/{id}` - Get expense by ID
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `DELETE /api/categories/{id}` - Delete category

### Analytics
- `GET /api/analytics/monthly-summary` - Monthly expense summary
- `GET /api/analytics/yearly-summary` - Yearly expense summary
- `GET /api/analytics/by-category` - Expenses by category
- `GET /api/analytics/trends` - Expense trends
- `GET /api/analytics/predicted-expense` - Predicted next month expense

### Reports
- `GET /api/reports/export/csv` - Export expenses as CSV
- `GET /api/reports/export/pdf` - Export expenses as PDF

## Quick Start Example

1. **Start MySQL** (ensure it's running)

2. **Start Backend** (Terminal 1)
   ```bash
   cd fintrack-backend
   mvn spring-boot:run
   ```

3. **Start Frontend** (Terminal 2)
   ```bash
   cd fintrack-frontend
   npm install
   npm run dev
   ```

4. **Test the API** (using Swagger or Postman)
   - Register: `POST http://localhost:8080/api/auth/register`
     ```json
     {
       "name": "John Doe",
       "email": "john@example.com",
       "password": "password123"
     }
     ```
   - Login: `POST http://localhost:8080/api/auth/login`
     ```json
     {
       "email": "john@example.com",
       "password": "password123"
     }
     ```
   - Use the returned JWT token in Authorization header: `Bearer <token>`

## Troubleshooting

### Backend Issues
- **Port 8080 already in use**: Change port in `application.properties`:
  ```
  server.port=8081
  ```
- **MySQL connection error**: Verify MySQL is running and credentials are correct
- **Maven not found**: Add Maven to PATH or use full path to `mvn` command

### Frontend Issues
- **npm not found**: Install Node.js which includes npm
- **Port 5173 already in use**: Vite will automatically use next available port
- **CORS errors**: Backend is configured to allow frontend origin

### Database Issues
- **Table doesn't exist**: Spring Boot will auto-create tables on first run (ddl-auto=update)
- **Connection refused**: Ensure MySQL service is running

## Project Structure

```
fintrack-backend/
├── src/main/java/com/fintrack/
│   ├── controller/     # REST controllers
│   ├── service/        # Business logic
│   ├── repository/     # Data access
│   ├── model/          # Entity classes
│   ├── dto/            # Data transfer objects
│   ├── config/         # Configuration
│   ├── security/       # JWT security
│   └── exceptions/     # Exception handling

fintrack-frontend/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   └── styles/         # CSS files
```

## Development Notes

- Backend uses JWT authentication - store token in localStorage
- Default categories are auto-created on first startup
- All expense operations require authentication
- Date validation: expenses cannot have future dates
- Amount validation: must be greater than 0




