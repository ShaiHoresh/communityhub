$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

function New-CanvasBitmap([int]$Width, [int]$Height) {
  $bmp = New-Object System.Drawing.Bitmap($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  return @{ Bitmap = $bmp; Graphics = $g }
}

function Save-Png([System.Drawing.Bitmap]$Bitmap, [string]$OutPath) {
  $dir = Split-Path -Parent $OutPath
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $tmp = Join-Path $dir (".tmp-" + [System.Guid]::NewGuid().ToString("N") + "-" + (Split-Path -Leaf $OutPath))
  $Bitmap.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png)
  return $tmp
}

function Crop-And-Resize-Png(
  [string]$InPath,
  [string]$OutPath,
  [int]$TargetW,
  [int]$TargetH
) {
  $img = [System.Drawing.Image]::FromFile((Resolve-Path $InPath))
  $tmpOut = $null
  try {
    $srcW = $img.Width
    $srcH = $img.Height

    $targetAspect = [double]$TargetW / [double]$TargetH
    $srcAspect = [double]$srcW / [double]$srcH

    if ($srcAspect -gt $targetAspect) {
      $cropH = $srcH
      $cropW = [int][Math]::Round($srcH * $targetAspect)
    } else {
      $cropW = $srcW
      $cropH = [int][Math]::Round($srcW / $targetAspect)
    }

    $cropX = [int][Math]::Round(($srcW - $cropW) / 2.0)
    $cropY = [int][Math]::Round(($srcH - $cropH) / 2.0)
    $srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)

    $canvas = New-CanvasBitmap -Width $TargetW -Height $TargetH
    try {
      $dstRect = New-Object System.Drawing.Rectangle(0, 0, $TargetW, $TargetH)
      $canvas.Graphics.DrawImage($img, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
      $tmpOut = Save-Png -Bitmap $canvas.Bitmap -OutPath $OutPath
    } finally {
      $canvas.Graphics.Dispose()
      $canvas.Bitmap.Dispose()
    }
  } finally {
    $img.Dispose()
  }

  if ($tmpOut) {
    if (Test-Path -LiteralPath $OutPath) { Remove-Item -Force -LiteralPath $OutPath }
    Move-Item -Force -LiteralPath $tmpOut -Destination $OutPath
  }
}

function Make-Portrait-Screenshot(
  [string]$InPath,
  [string]$OutPath,
  [int]$TargetW,
  [int]$TargetH
) {
  $img = [System.Drawing.Image]::FromFile((Resolve-Path $InPath))
  $tmpOut = $null
  try {
    $canvas = New-CanvasBitmap -Width $TargetW -Height $TargetH
    try {
      $canvas.Graphics.Clear([System.Drawing.Color]::FromArgb(255, 17, 24, 39))

      $scaleToFit = [Math]::Min([double]$TargetW / $img.Width, [double]$TargetH / $img.Height)
      $fitW = [int][Math]::Round($img.Width * $scaleToFit)
      $fitH = [int][Math]::Round($img.Height * $scaleToFit)
      $fitX = [int][Math]::Round(($TargetW - $fitW) / 2.0)
      $fitY = [int][Math]::Round(($TargetH - $fitH) / 2.0)
      $fitRect = New-Object System.Drawing.Rectangle($fitX, $fitY, $fitW, $fitH)

      $bgScale = [Math]::Max([double]$TargetW / $img.Width, [double]$TargetH / $img.Height)
      $bgW = [int][Math]::Round($img.Width * $bgScale)
      $bgH = [int][Math]::Round($img.Height * $bgScale)
      $bgX = [int][Math]::Round(($TargetW - $bgW) / 2.0)
      $bgY = [int][Math]::Round(($TargetH - $bgH) / 2.0)
      $bgRect = New-Object System.Drawing.Rectangle($bgX, $bgY, $bgW, $bgH)

      $ia = New-Object System.Drawing.Imaging.ImageAttributes
      $cm = New-Object System.Drawing.Imaging.ColorMatrix
      $cm.Matrix00 = 1.0; $cm.Matrix11 = 1.0; $cm.Matrix22 = 1.0; $cm.Matrix33 = 0.20; $cm.Matrix44 = 1.0
      $ia.SetColorMatrix($cm)

      $dstBgRect = $bgRect
      $srcFull = New-Object System.Drawing.Rectangle(0, 0, $img.Width, $img.Height)
      $canvas.Graphics.DrawImage($img, $dstBgRect, 0, 0, $img.Width, $img.Height, [System.Drawing.GraphicsUnit]::Pixel, $ia)

      $canvas.Graphics.DrawImage($img, $fitRect)
      $tmpOut = Save-Png -Bitmap $canvas.Bitmap -OutPath $OutPath
    } finally {
      $canvas.Graphics.Dispose()
      $canvas.Bitmap.Dispose()
    }
  } finally {
    $img.Dispose()
  }

  if ($tmpOut) {
    if (Test-Path -LiteralPath $OutPath) { Remove-Item -Force -LiteralPath $OutPath }
    Move-Item -Force -LiteralPath $tmpOut -Destination $OutPath
  }
}

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Crop-And-Resize-Png -InPath "public/icon-192.png" -OutPath "public/icon-192.png" -TargetW 192 -TargetH 192
Crop-And-Resize-Png -InPath "public/icon-512.png" -OutPath "public/icon-512.png" -TargetW 512 -TargetH 512
Crop-And-Resize-Png -InPath "public/screenshot-wide.png" -OutPath "public/screenshot-wide.png" -TargetW 1280 -TargetH 720
Make-Portrait-Screenshot -InPath "public/screenshot-mobile.png" -OutPath "public/screenshot-mobile.png" -TargetW 720 -TargetH 1280

Write-Host "Done. Updated:" -ForegroundColor Green
Write-Host " - public/icon-192.png (192x192)"
Write-Host " - public/icon-512.png (512x512)"
Write-Host " - public/screenshot-wide.png (1280x720)"
Write-Host " - public/screenshot-mobile.png (720x1280)"
