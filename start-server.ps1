# ==============================================================
# Gasser Market - Smart HTTP Server v2.0
# Serves on ALL network interfaces (LAN + localhost)
# Mobile devices on the same WiFi can connect too!
# ==============================================================

$port = 3000
$rootDir = $PSScriptRoot   # directory of this script

# Start listener on all interfaces (0.0.0.0) and localhost
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:${port}/")
$listener.Prefixes.Add("http://+:${port}/")   # bind to all IPs
$listener.Start()

# Get local network IP for mobile access info
$localIP = (Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.*' } |
    Select-Object -First 1).IPAddress

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🛒 Gasser Market Server v2.0 (PWA Ready)     ║" -ForegroundColor Cyan
Write-Host "╠══════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║  💻  Desktop : http://localhost:$port             ║" -ForegroundColor Green
if ($localIP) {
Write-Host "║  📱  Mobile  : http://${localIP}:${port}         ║" -ForegroundColor Yellow
}
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Press Ctrl+C to stop the server." -ForegroundColor Gray
Write-Host ""

# MIME type mapping
function Get-MimeType($ext) {
    switch ($ext.ToLower()) {
        '.html' { 'text/html; charset=utf-8' }
        '.css'  { 'text/css; charset=utf-8' }
        '.js'   { 'application/javascript; charset=utf-8' }
        '.json' { 'application/json; charset=utf-8' }
        '.png'  { 'image/png' }
        '.jpg'  { 'image/jpeg' }
        '.jpeg' { 'image/jpeg' }
        '.svg'  { 'image/svg+xml; charset=utf-8' }
        '.ico'  { 'image/x-icon' }
        '.webp' { 'image/webp' }
        '.txt'  { 'text/plain; charset=utf-8' }
        '.webmanifest' { 'application/manifest+json' }
        default { 'application/octet-stream' }
    }
}

# Request handling loop
while ($listener.IsListening) {
    try {
        $ctx  = $listener.GetContext()
        $req  = $ctx.Request
        $res  = $ctx.Response

        $urlPath  = $req.Url.LocalPath
        if ($urlPath -eq '/') { $urlPath = '/index.html' }

        # Security: prevent directory traversal
        $safePath = $urlPath.TrimStart('/').Replace('/', '\').Replace('..', '')
        $filePath = Join-Path $rootDir $safePath

        if (Test-Path $filePath -PathType Leaf) {
            $bytes             = [System.IO.File]::ReadAllBytes($filePath)
            $ext               = [System.IO.Path]::GetExtension($filePath)
            $res.ContentType   = Get-MimeType $ext
            $res.ContentLength64 = $bytes.Length

            # Enable PWA / Service Worker by allowing all origins
            $res.AddHeader("Access-Control-Allow-Origin", "*")
            # Cache control: no-cache for HTML/JS, 1hr for assets
            if ($ext -in '.html', '.js') {
                $res.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")
            } else {
                $res.AddHeader("Cache-Control", "public, max-age=3600")
            }

            $res.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $res.StatusCode  = 404
            $msg             = [System.Text.Encoding]::UTF8.GetBytes("404 - File Not Found: $urlPath")
            $res.ContentType = "text/plain; charset=utf-8"
            $res.ContentLength64 = $msg.Length
            $res.OutputStream.Write($msg, 0, $msg.Length)
        }

        $res.OutputStream.Close()
    } catch {
        # Silently continue on client disconnect
    }
}
