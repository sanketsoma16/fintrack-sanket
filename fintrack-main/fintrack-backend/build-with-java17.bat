@echo off
echo Checking for Java 17...
where java >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java is not in PATH
    echo Please install Java 17 from: https://adoptium.net/temurin/releases/?version=17
    pause
    exit /b 1
)

echo Current Java version:
java -version

echo.
echo Building project...
echo NOTE: If you get compilation errors, you may need to install Java 17
echo and set JAVA_HOME to point to it.
echo.

mvn clean install

pause


