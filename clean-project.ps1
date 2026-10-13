# 🧹 Clean Project Script - Next.js + Android
# ===================================================

Write-Host "🚀 بدء تنظيف المشروع..." -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# 🗑️ قائمة المجلدات والملفات اللي هتتمسح
$toDelete = @(
    # Next.js build cache
    ".next",
    
    # Gradle cache
    ".gradle",
    
    # Android build outputs
    "android/app/build",
    "android/.gradle",
    "android/build",
    
    # Log files
    "build-release-error.log",
    
    # Generated files
    "tree.txt",
    "next-env.d.ts",
    "tsconfig.tsbuildinfo",
    
    # APK files (هنعمل build جديد)
    "*.apk",
    
    # IDE and OS junk
    ".idea",
    ".vs",
    "Thumbs.db",
    ".DS_Store"
)

# ⚠️ ملفات هامة مش هنمسحها أبداً
$keepSafe = @(
    ".env.local",           # فيه الـ API keys
    "android.keystore",     # مفتاح توقيع الـ APK
    "node_modules",         # ممكن تمسحه لو عاوز تعمل reinstall (بس كبير)
    "local.properties",     # Android Studio بيعمله
    "package-lock.json"     # مهم للـ dependencies
)

Write-Host "`n🔍 الملفات اللي هتتمسح:" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

$deletedCount = 0
$freedBytes = 0

foreach ($item in $toDelete) {
    # Handle wildcards like *.apk
    if ($item -like "*.*" -and $item -notlike "*/*") {
        $files = Get-ChildItem -Path $item -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            Write-Host "  🗑️  $($file.Name)" -ForegroundColor Red
            $freedBytes += $file.Length
            Remove-Item $file -Force -ErrorAction SilentlyContinue
            $deletedCount++
        }
    }
    else {
        $path = Get-Item $item -ErrorAction SilentlyContinue
        if ($path) {
            $size = if ($path.PSIsContainer) { 
                (Get-ChildItem $path -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum 
            } else { 
                $path.Length 
            }
            
            Write-Host "  🗑️  $item" -ForegroundColor Red
            Remove-Item $path -Recurse -Force -ErrorAction SilentlyContinue
            $freedBytes += $size
            $deletedCount++
        }
    }
}

# 📊 التقرير النهائي
$freedMB = [math]::Round($freedBytes / 1MB, 2)

Write-Host "`n=================================" -ForegroundColor Cyan
Write-Host "✅ التنظيف اكتمل!" -ForegroundColor Green
Write-Host "📊 عدد العناصر المحذوفة: $deletedCount" -ForegroundColor Green
Write-Host "💾 المساحة المحررة: $freedMB MB" -ForegroundColor Green
Write-Host "=================================`n" -ForegroundColor Cyan

# 🛡️ الملفات المهمة اللي فضلت
Write-Host "🛡️ الملفات المهمة اللي مش اتمسحت:" -ForegroundColor Yellow
foreach ($safe in $keepSafe) {
    if (Test-Path $safe) {
        Write-Host "  ✅ $safe" -ForegroundColor Green
    }
}

Write-Host "`n💡 نصيحة: لو عاوز تمسح node_modules كمان، شغل:" -ForegroundColor Cyan
Write-Host "   Remove-Item -Recurse -Force node_modules" -ForegroundColor White
Write-Host "   وبعدين: npm install" -ForegroundColor White
Write-Host ""

# 🔄 إعادة البناء
$rebuild = Read-Host "🔨 هل تريد إعادة البناء الآن؟ (y/n)"
if ($rebuild -eq 'y' -or $rebuild -eq 'Y') {
    Write-Host "`n🏗️  جاري بناء Next.js..." -ForegroundColor Magenta
    npm run build
    
    Write-Host "`n📱 جاري بناء Android APK..." -ForegroundColor Magenta
    ./gradlew assembleRelease
}

Write-Host "`n✨ تم! المشروع نظيف وجاهز.`n" -ForegroundColor Green