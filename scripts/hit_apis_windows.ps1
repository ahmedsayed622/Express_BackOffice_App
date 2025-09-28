# Express BackOffice API - Compliance Module Test Script (Windows PowerShell)
# Usage: powershell -ExecutionPolicy Bypass -File hit_apis_windows.ps1 [-BaseUrl "http://localhost:3000"]
# Example: powershell -ExecutionPolicy Bypass -File hit_apis_windows.ps1 -BaseUrl "http://10.1.118.69:3000"

param(
    [Parameter(Mandatory = $false)]
    [string]$BaseUrl = "http://localhost:3000"
)

$ApiBase = "$BaseUrl/api/v1"

# Function to make API calls with error handling
function Invoke-Api {
    param(
        [string]$Method,
        [string]$Uri,
        [string]$Description,
        [hashtable]$Body = $null
    )
    
    Write-Host "`n=== $Description ===" -ForegroundColor Blue
    Write-Host "$Method $Uri" -ForegroundColor Yellow
    
    try {
        if ($Body) {
            $response = Invoke-RestMethod -Method $Method -Uri $Uri -Body ($Body | ConvertTo-Json) -ContentType "application/json" -ErrorAction Stop
        }
        else {
            $response = Invoke-RestMethod -Method $Method -Uri $Uri -ContentType "application/json" -ErrorAction Stop
        }
        
        Write-Host "Status: 200 OK" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 10 | Write-Host
        
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        $statusDescription = $_.Exception.Response.StatusDescription
        
        Write-Host "Status: $statusCode $statusDescription" -ForegroundColor Red
        
        # Try to get the error response body
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $responseBody = $reader.ReadToEnd()
            $reader.Close()
            
            if ($responseBody) {
                $errorJson = $responseBody | ConvertFrom-Json
                $errorJson | ConvertTo-Json -Depth 10 | Write-Host
            }
        }
        catch {
            Write-Host "Error response body could not be parsed" -ForegroundColor Red
        }
    }
    
    Write-Host "---" -ForegroundColor Green
}

# Start testing
Write-Host "🚀 Express BackOffice API - Compliance Module Test" -ForegroundColor Green
Write-Host "Base URL: $BaseUrl" -ForegroundColor Blue
Write-Host "API Base: $ApiBase" -ForegroundColor Blue

# Health Check
Invoke-Api -Method "GET" -Uri "$ApiBase/health/integrations" -Description "Health Check - Database Integrations"

# Client Monthly Data endpoints
Invoke-Api -Method "GET" -Uri "$ApiBase/client-monthly-data" -Description "Client Monthly Data - List All"
Invoke-Api -Method "GET" -Uri "$ApiBase/client-monthly-data/gte-2025" -Description "Client Monthly Data - Data >= 2025"
Invoke-Api -Method "GET" -Uri "$ApiBase/client-monthly-data/year/2025" -Description "Client Monthly Data - Filter by Year (2025)"
Invoke-Api -Method "GET" -Uri "$ApiBase/client-monthly-data/year/2025/month/9" -Description "Client Monthly Data - Year 2025, Month 9"
Invoke-Api -Method "GET" -Uri "$ApiBase/client-monthly-data/inactivity-to-year/2024" -Description "Client Monthly Data - Inactivity to Year 2024"
Invoke-Api -Method "GET" -Uri "$ApiBase/client-monthly-data/inactivity-to-year/2024/month/12" -Description "Client Monthly Data - Inactivity to 2024/12"
Invoke-Api -Method "GET" -Uri "$ApiBase/client-monthly-data/search?q=test" -Description "Client Monthly Data - Search 'test'"
Invoke-Api -Method "GET" -Uri "$ApiBase/client-monthly-data/12345" -Description "Client Monthly Data - Get by ID (may return 404)"

# Client Control
Invoke-Api -Method "GET" -Uri "$ApiBase/client-control" -Description "Client Control - List All"

# Summary endpoints
Invoke-Api -Method "GET" -Uri "$ApiBase/summary" -Description "Summary - List All"
Invoke-Api -Method "GET" -Uri "$ApiBase/summary/latest/2025" -Description "Summary - Latest for Year 2025"

# Summary View
Invoke-Api -Method "GET" -Uri "$ApiBase/summary-view" -Description "Summary View - List All"

# Procedure execution (node-oracledb)
Write-Host "`n=== Procedures (node-oracledb) ===" -ForegroundColor Blue
Write-Host "Note: This may return 409 (ALREADY_RUNNING) or 423 (TIMEOUT) - both are normal" -ForegroundColor Red

Invoke-Api -Method "POST" -Uri "$ApiBase/procedures/dormant-orchestrator?timeout=0" -Description "Dormant Orchestrator - No Timeout"

# Test with timeout as well
Invoke-Api -Method "POST" -Uri "$ApiBase/procedures/dormant-orchestrator?timeout=30" -Description "Dormant Orchestrator - 30s Timeout"

# Summary
Write-Host "`n✅ API Testing Complete!" -ForegroundColor Green
Write-Host "`nExpected Status Codes:" -ForegroundColor Blue
Write-Host "  • 200 - Success" -ForegroundColor Green
Write-Host "  • 404 - Not Found (normal for specific IDs)" -ForegroundColor Yellow
Write-Host "  • 409 - Already Running (normal for procedures)" -ForegroundColor Red
Write-Host "  • 423 - Lock Timeout (normal for procedures)" -ForegroundColor Red
Write-Host "  • 500 - Server Error (investigate if occurs)" -ForegroundColor Red

Write-Host "`nEnvironment URLs:" -ForegroundColor Blue
Write-Host "  • Development: http://localhost:3000"
Write-Host "  • Test: http://10.1.118.200:3000"
Write-Host "  • Production: http://10.1.118.69:3000"

Write-Host "`nFor detailed testing, use the Postman collection:" -ForegroundColor Green
Write-Host "  Import: postman/ComplianceAPI.postman_collection.json"

Write-Host "`nUsage Examples:" -ForegroundColor Blue
Write-Host '  powershell -ExecutionPolicy Bypass -File scripts\hit_apis_windows.ps1'
Write-Host '  powershell -ExecutionPolicy Bypass -File scripts\hit_apis_windows.ps1 -BaseUrl "http://10.1.118.69:3000"'