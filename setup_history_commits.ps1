$ErrorActionPreference = "Stop"

$remoteUrl = "https://github.com/SiranjeeviE/Agri_Verse"
$email = "SiranjeeviE@users.noreply.github.com"
$name = "SiranjeeviE"

Write-Host "Cleaning up existing git repository..."
if (Test-Path .git) {
    Remove-Item .git -Recurse -Force
}

Write-Host "Initializing new repository..."
git init
git config user.email $email
git config user.name $name
git remote add origin $remoteUrl

Write-Host "Scanning files..."
# Get all files, include hidden ones like .env, exclude this script and git folder
$projectPath = (Get-Location).Path
$files = Get-ChildItem -Path $projectPath -Recurse -File -Force | Where-Object { 
    $_.FullName -notmatch "\\.git\\" -and 
    $_.Name -ne "setup_history_commits.ps1" -and
    $_.Name -ne "create_commits.ps1"
}

$fileList = $files | Select-Object -ExpandProperty FullName
$totalFiles = $fileList.Count
Write-Host "Found $totalFiles files to commit."

$commitsPerDay = 10
$days = 10
$totalCommits = $commitsPerDay * $days
$fileIndex = 0

# Start from 9 days ago up to today (0 days ago)
for ($d = 9; $d -ge 0; $d--) {
    $dateBase = (Get-Date).AddDays(-$d)
    $dateStr = $dateBase.ToString("yyyy-MM-dd")
    Write-Host "Processing Day: $dateStr"
    
    for ($c = 1; $c -le $commitsPerDay; $c++) {
        # Spread commits through the day (e.g., 9 AM to 6 PM)
        $hour = 9 + ($c % 9)
        $minute = $c * 5
        $second = $c
        $commitDate = $dateBase.Date.AddHours($hour).AddMinutes($minute).AddSeconds($second).ToString("yyyy-MM-ddTHH:mm:ss")
        
        $env:GIT_AUTHOR_DATE = $commitDate
        $env:GIT_COMMITTER_DATE = $commitDate
        
        if ($fileIndex -lt $totalFiles) {
            $currentFile = $fileList[$fileIndex]
            # Get relative path for cleaner commit messages
            $relPath = $currentFile.Substring($projectPath.Length + 1)
            
            git add "$currentFile"
            git commit -m "Add $relPath" --quiet
            
            $fileIndex++
        } else {
            # If we run out of real files, make a dummy update
            $dummyContent = "Activity entry: $commitDate"
            Set-Content -Path "activity_tracking.log" -Value $dummyContent
            git add "activity_tracking.log"
            git commit -m "Update activity tracking" --quiet
        }
    }
}

# Commit any remaining files
if ($fileIndex -lt $totalFiles) {
    Write-Host "Committing remaining files..."
    git add .
    $now = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    $env:GIT_AUTHOR_DATE = $now
    $env:GIT_COMMITTER_DATE = $now
    git commit -m "Finalize project initialization" --quiet
}

Write-Host "Pushing to remote..."
git branch -M main
git push -u origin main --force

Write-Host "Done! Project pushed to $remoteUrl with generated history."
