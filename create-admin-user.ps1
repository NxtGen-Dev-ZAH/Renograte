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
    # Send the request to create the admin user
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $body -Headers $headers -ErrorAction Stop
    
    # Display the response
    Write-Host "Admin user created successfully!" -ForegroundColor Green
    Write-Host "User ID: $($response.user.id)"
    Write-Host "Name: $($response.user.name)"
    Write-Host "Email: $($response.user.email)"
    Write-Host "Role: $($response.user.role)"
    Write-Host "Message: $($response.message)"
} catch {
    # Display the error message
    Write-Host "Error creating admin user:" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host $errorResponse.error -ForegroundColor Red
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
} 