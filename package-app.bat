@echo off
setlocal
echo Creating a portable package for Media Progress Tracker...

:: Clear and create output directory
echo Cleaning output directories...
if exist "portable-package" rmdir /s /q "portable-package"
mkdir "portable-package" 2>nul
mkdir "portable-package\resources" 2>nul
mkdir "portable-package\resources\app" 2>nul

:: Copy application files to resource/app
echo Copying application files...
xcopy "index.html" "portable-package\resources\app\" /Y
xcopy "main.js" "portable-package\resources\app\" /Y
xcopy "preload.js" "portable-package\resources\app\" /Y
xcopy "package.json" "portable-package\resources\app\" /Y
xcopy "LICENSE" "portable-package\resources\app\" /Y
xcopy "README.md" "portable-package\resources\app\" /Y

:: Copy assets folder
echo Copying assets...
mkdir "portable-package\resources\app\assets" 2>nul
xcopy "assets\*" "portable-package\resources\app\assets\" /E /Y

:: Copy images folder if it exists
if exist "images" (
  echo Copying images...
  mkdir "portable-package\resources\app\images" 2>nul
  xcopy "images\*" "portable-package\resources\app\images\" /E /Y
)

:: Create a launcher
echo Creating launcher scripts...
(
  echo @echo off
  echo echo Starting Media Progress Tracker...
  echo cd /d %%~dp0
  echo start "" electron.exe
) > "portable-package\run.bat"

:: Create README for the portable package
echo Creating README...
(
  echo Media Progress Tracker - Portable Edition
  echo.
  echo This is a portable version of Media Progress Tracker.
  echo To launch the application, run "run.bat"
  echo.
  echo Your progress data is stored in AppData\Roaming\tv-show-tracker-electron
) > "portable-package\README.txt"

:: Use existing Electron distribution
echo Checking for pre-built Electron in dist folder...
if exist "dist\win-unpacked\Media Progress Tracker.exe" (
  echo Found pre-built Electron executable, using it...
  copy "dist\win-unpacked\*.dll" "portable-package\" /Y
  copy "dist\win-unpacked\*.bin" "portable-package\" /Y
  copy "dist\win-unpacked\*.pak" "portable-package\" /Y
  copy "dist\win-unpacked\*.dat" "portable-package\" /Y
  copy "dist\win-unpacked\*.exe" "portable-package\" /Y
  
  if exist "dist\win-unpacked\resources" (
    mkdir "portable-package\resources\electron" 2>nul
    xcopy "dist\win-unpacked\resources\*" "portable-package\resources\electron\" /E /Y
  )
  
  if exist "dist\win-unpacked\locales" (
    mkdir "portable-package\locales" 2>nul
    xcopy "dist\win-unpacked\locales\*" "portable-package\locales\" /E /Y
  )
) else (
  echo Copying node_modules to package...
  mkdir "portable-package\resources\app\node_modules" 2>nul
  xcopy "node_modules\*" "portable-package\resources\app\node_modules\" /E /Y /EXCLUDE:node_modules\electron
  
  echo Pre-built Electron not found. Please run the application using 'npm start' or build it first.
)

echo.
echo Package created successfully in the 'portable-package' directory!
echo Run the application by executing 'run.bat'
echo.

endlocal
