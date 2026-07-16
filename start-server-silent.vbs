' Gasser Market System - Silent Server Launcher
' This script runs the PowerShell server in the background (no black window)
Dim objShell
Set objShell = CreateObject("WScript.Shell")
objShell.Run "powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File ""d:\.gemini\antigravity\scratch\supermarket-system\start-server.ps1""", 0, False
Set objShell = Nothing
