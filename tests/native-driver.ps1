param([string]$Action,[long]$Handle,[int]$X=0,[int]$Y=0,[int]$HoldMs=100,[string]$Title)
$ErrorActionPreference='Stop'
Add-Type -Path (Join-Path $PSScriptRoot 'native-driver.cs')
if($Action -eq 'summon'){[HaloTestDriver]::Summon($Handle,$HoldMs)}
elseif($Action -eq 'focus'){[HaloTestDriver]::FocusTestProcess([uint32]$Handle)}
elseif($Action -eq 'escape'){[HaloTestDriver]::Escape($Handle)}
elseif($Action -eq 'test-title'){[HaloTestDriver]::FocusTestTitle($Title)}
elseif($Action -eq 'click'){[HaloTestDriver]::Click($Handle,$X,$Y)}
