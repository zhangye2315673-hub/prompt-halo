$ErrorActionPreference = 'Stop'
[Console]::InputEncoding = New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes
Add-Type -Path (Join-Path $PSScriptRoot 'windows-input.cs') -ReferencedAssemblies UIAutomationClient,UIAutomationTypes
[Console]::WriteLine('{"ready":true}')
while ($null -ne ($line = [Console]::ReadLine())) {
  try {
    $req = $line | ConvertFrom-Json
    $result = @{}
    switch ($req.action) {
      'state' {
        $handle = [HaloInput]::GetForegroundWindow().ToInt64()
        $targetProcessId = [HaloInput]::WindowPid($handle)
        $processName = try { [Diagnostics.Process]::GetProcessById($targetProcessId).ProcessName } catch { "unavailable" }
        $result = @{ hwnd = [string]$handle; pid = [HaloInput]::WindowPid($handle); focus = [string][HaloInput]::FocusWindow($handle); windowClass = [HaloInput]::WindowClass($handle); focusClass = [HaloInput]::WindowClass([HaloInput]::FocusWindow($handle)); processName =  $processName; leftButton = [HaloInput]::KeyDown(1); space = [HaloInput]::KeyDown(32); alt = [HaloInput]::KeyDown(18) }
      }
      'capture' {
        $handle = [HaloInput]::GetForegroundWindow().ToInt64()
        $targetProcessId = [HaloInput]::WindowPid($handle)
        $result = @{ hwnd=[string]$handle; pid=$targetProcessId; focus=[string][HaloInput]::FocusWindow($handle); processName=[Diagnostics.Process]::GetProcessById($targetProcessId).ProcessName; editorToken=[HaloInput]::CaptureEditor($handle,$targetProcessId) }
      }
      'activate' { $result = @{ ok = [HaloInput]::Activate([long]$req.hwnd, [uint32]$req.pid, [long]$req.focus); stage=[HaloInput]::LastStage; sent=[HaloInput]::LastSent; win32Error=[HaloInput]::LastError; actualHwnd=[string][HaloInput]::GetForegroundWindow().ToInt64(); actualFocus=[string][HaloInput]::FocusWindow([long]$req.hwnd); targetIntegrity=[HaloInput]::Integrity([uint32]$req.pid); helperIntegrity=[HaloInput]::Integrity([uint32]$PID) } }
      'paste' { $result = @{ ok = [HaloInput]::Paste([long]$req.hwnd, [uint32]$req.pid, [long]$req.focus); stage=[HaloInput]::LastStage; sent=[HaloInput]::LastSent; win32Error=[HaloInput]::LastError; actualHwnd=[string][HaloInput]::GetForegroundWindow().ToInt64(); actualFocus=[string][HaloInput]::FocusWindow([long]$req.hwnd); targetIntegrity=[HaloInput]::Integrity([uint32]$req.pid); helperIntegrity=[HaloInput]::Integrity([uint32]$PID) } }
      'type' { $result = @{ ok = [HaloInput]::TypeText([long]$req.hwnd, [uint32]$req.pid, [long]$req.focus, [string]$req.editorToken, [string]$req.text); stage=[HaloInput]::LastStage; sent=[HaloInput]::LastSent; win32Error=[HaloInput]::LastError; actualHwnd=[string][HaloInput]::GetForegroundWindow().ToInt64(); actualFocus=[string][HaloInput]::FocusWindow([long]$req.hwnd); targetIntegrity=[HaloInput]::Integrity([uint32]$req.pid); helperIntegrity=[HaloInput]::Integrity([uint32]$PID) } }
      'sequence' { $result = @{ sequence = [HaloInput]::GetClipboardSequenceNumber() } }
      default { throw 'Unknown input command' }
    }
    $result.id = $req.id
    [Console]::WriteLine(($result | ConvertTo-Json -Compress))
  } catch {
    [Console]::WriteLine((@{id=$req.id;error=$_.Exception.Message} | ConvertTo-Json -Compress))
  }
}


