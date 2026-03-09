# Troubleshooting Guide

## Common Startup Errors

### 1. MySQL Connection Error

**Error:** `Access denied for user 'root'@'localhost'` or `Communications link failure`

**Solutions:**
- **Check MySQL is running:**
  ```bash
  # Windows
  net start MySQL80
  # Or check Services (services.msc)
  ```

- **Verify database exists:**
  ```sql
  mysql -u root -p
  SHOW DATABASES;
  CREATE DATABASE IF NOT EXISTS fintrack;
  ```

- **Update credentials in `application.properties`:**
  ```properties
  spring.datasource.username=root
  spring.datasource.password=YOUR_PASSWORD
  ```

- **Test connection manually:**
  ```bash
  mysql -u root -p -h localhost -P 3306
  ```

### 2. Port Already in Use

**Error:** `Port 8080 is already in use`

**Solutions:**
- **Find and kill process using port 8080:**
  ```bash
  # Windows
  netstat -ano | findstr :8080
  taskkill /PID <PID> /F
  ```

- **Or change port in `application.properties`:**
  ```properties
  server.port=8081
  ```

### 3. JWT Secret Key Error

**Error:** `The specified key byte array is 0 bits which is not secure enough`

**Solution:** The JWT secret must be at least 256 bits (32 bytes). Update `application.properties`:
```properties
app.jwt.secret=YourVeryLongSecretKeyThatIsAtLeast32BytesLong12345678901234567890123456789012
```

### 4. Missing Dependencies

**Error:** `ClassNotFoundException` or `NoClassDefFoundError`

**Solution:**
```bash
mvn clean install
```

### 5. Get Detailed Error Logs

Run with verbose logging:
```bash
mvn spring-boot:run -X
# Or
mvn spring-boot:run -e
```

## Quick Diagnostic Steps

1. **Check MySQL:**
   ```bash
   mysql -u root -p
   USE fintrack;
   SHOW TABLES;
   ```

2. **Check if port is free:**
   ```bash
   netstat -ano | findstr :8080
   ```

3. **Verify Java version:**
   ```bash
   java -version
   # Should be Java 17+
   ```

4. **Clean and rebuild:**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

## Database Setup Checklist

- [ ] MySQL Server is running
- [ ] Database `fintrack` exists
- [ ] User `root` has access (or update credentials)
- [ ] Password matches `application.properties`
- [ ] Port 3306 is accessible




