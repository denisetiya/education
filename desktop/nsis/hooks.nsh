!macro GeoEducationKillRunningProcesses
  DetailPrint "Closing running Geo Education Desktop processes..."
  nsExec::ExecToLog '"$SYSDIR\taskkill.exe" /F /T /IM "app.exe"'
  Pop $0
  nsExec::ExecToLog '"$SYSDIR\taskkill.exe" /F /T /IM "geo-education-desktop.exe"'
  Pop $0
  nsExec::ExecToLog '"$SYSDIR\taskkill.exe" /F /T /IM "backend-node.exe"'
  Pop $0
  Sleep 1200
!macroend

!macro NSIS_HOOK_PREINSTALL
  !insertmacro GeoEducationKillRunningProcesses
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  !insertmacro GeoEducationKillRunningProcesses
!macroend
