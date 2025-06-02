# PowerShell script to create an admin user in Renograte
# Usage: .\create-admin-user.ps1 -Name "Admin Name" -Email "admin@example.com" -Password "SecurePassword123"

param(
    [Parameter(Mandatory=$true)]
    [string]$Name,
    
    [Parameter(Mandatory=$true)]
    [string]$Email,
    
    [Parameter(Mandatory=$true)]
    [string]$Password
)

# Define the API endpoint (assuming the app is running on localhost:3000)
$apiUrl = "http://localhost:3000/api/admin/create-user"

# Check if the server is running
try {
    $serverCheck = Invoke-WebRequest -Uri "http://localhost:3000" -Method HEAD -TimeoutSec 5 -ErrorAction Stop
    Write-Host "Server is running. Proceeding with user creation..." -ForegroundColor Green
} catch {
    Write-Host "Error: Cannot connect to the server at http://localhost:3000" -ForegroundColor Red
    Write-Host "Make sure your Next.js server is running with 'npm run dev' before using this script." -ForegroundColor Yellow
    exit 1
}

# Create the request body
$body = @{
    name = $Name
    email = $Email
    password = $Password
    role = "admin"
} | ConvertTo-Json

# Set the content type header
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "Creating admin user: $Name ($Email)..."

try {
    # Send the request to create the admin user with detailed error handling
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $body -Headers $headers -ErrorAction Stop
    
    # Display the response
    Write-Host "Admin user created successfully!" -ForegroundColor Green
    Write-Host "User ID: $($response.user.id)"
    Write-Host "Name: $($response.user.name)"
    Write-Host "Email: $($response.user.email)"
    Write-Host "Role: $($response.user.role)"
    Write-Host "Message: $($response.message)"
} catch {
    # Display the error message with more details
    Write-Host "Error creating admin user:" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        try {
            $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host $errorResponse.error -ForegroundColor Red
        } catch {
            Write-Host $_.ErrorDetails.Message -ForegroundColor Red
        }
    } else {
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
    
    # Additional context based on the error
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "Authentication required. Make sure you're logged in or running in development mode." -ForegroundColor Yellow
    }
    elseif ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "Only existing administrators can create new admin users in production mode." -ForegroundColor Yellow
    }
    elseif ($_.Exception.Response.StatusCode -eq 500) {
        Write-Host "Server error occurred. Check if:" -ForegroundColor Yellow
        Write-Host "1. The database connection is working properly" -ForegroundColor Yellow
        Write-Host "2. The Prisma schema is properly migrated" -ForegroundColor Yellow
        Write-Host "3. The server logs for more details" -ForegroundColor Yellow
        
        # Try to get more detailed error information
        try {
            $rawError = Invoke-WebRequest -Uri $apiUrl -Method POST -Body $body -Headers $headers -ErrorAction SilentlyContinue
        } catch {
            if ($_.Exception.Response) {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                Write-Host "Detailed error: $responseBody" -ForegroundColor Red
            }
        }
    }
} 