# Create multiple commits with small groups of files
$commitMessages = @(
    "Initial project setup and configuration",
    "Add core application files",
    "Implement authentication components",
    "Add dashboard and navigation",
    "Implement crop advisory feature",
    "Add disease prediction functionality",
    "Implement market analysis tools",
    "Add farm automation features",
    "Implement fertilizer calculator",
    "Add user profile and settings",
    "Implement notifications system",
    "Add multi-language support",
    "Update UI components and styling",
    "Add API integration files",
    "Implement form validations",
    "Add error handling and logging",
    "Update documentation",
    "Fix minor bugs and improvements",
    "Add test files",
    "Update dependencies and configurations"
)

# Initialize variables
$commitCount = 0
$fileGroup = @()
$filesPerCommit = 8  # Number of files per commit
$pushEvery = 5       # Push every N commits

# Get all files (excluding .git directory and .env files)
$allFiles = Get-ChildItem -Recurse -File -Exclude @("*.ps1", "*.env", "*.lock", "*.log", "*.tmp") | 
            Where-Object { $_.FullName -notlike '*\.git\*' -and $_.FullName -notlike '*\node_modules\*' }

# Group files by directory for better commit organization
$filesByDir = @{}
foreach ($file in $allFiles) {
    $dir = Split-Path -Parent $file.FullName
    if (-not $filesByDir.ContainsKey($dir)) {
        $filesByDir[$dir] = @()
    }
    $filesByDir[$dir] += $file.FullName
}

# Process each directory
foreach ($dir in $filesByDir.Keys) {
    $files = $filesByDir[$dir]
    
    # Process files in this directory in chunks
    for ($i = 0; $i -lt $files.Count; $i += $filesPerCommit) {
        $fileGroup = $files | Select-Object -Skip $i -First $filesPerCommit
        $commitCount++
        
        # Get a commit message based on directory
        $dirName = Split-Path -Leaf $dir
        $commitMessage = "Add/Update $dirName files"
        if ($commitCount -lt $commitMessages.Count) {
            $commitMessage = $commitMessages[$commitCount - 1] + " (Part $commitCount)"
        }
        
        Write-Host "Creating commit $commitCount with $($fileGroup.Count) files from $dirName"
        
        # Add and commit the files
        git add $fileGroup
        git commit -m $commitMessage
        
        # Push every N commits
        if ($commitCount % $pushEvery -eq 0) {
            Write-Host "Pushing commit $commitCount to remote..."
            git push -u origin main
            Start-Sleep -Seconds 1
        }
    }
}

# Final push
Write-Host "Pushing final commits to remote..."
git push -u origin main

Write-Host "`nTotal commits created: $commitCount"
Write-Host "Repository successfully updated with multiple commits!"
