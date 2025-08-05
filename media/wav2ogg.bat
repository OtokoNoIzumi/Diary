@echo off
rem wav2ogg.bat —— 把当前目录下所有 .wav 转成与参考 ogg 相同参数的 .ogg
rem 要求 ffmpeg.exe 位于 "E:\Program Files\ffmpeg.exe"

setlocal enabledelayedexpansion

:: 指定 ffmpeg 的完整路径
set "FFMPEG=E:\Program Files\ffmpeg.exe"

:: 检查 ffmpeg 是否存在
if not exist "!FFMPEG!" (
    echo 找不到 !FFMPEG!
    pause
    exit /b
)

:: 遍历当前目录所有 wav 文件
for %%f in (*.wav) do (
    echo 正在转换: %%f
    "!FFMPEG!" -y -i "%%f" -c:a libvorbis -ar 24000 -ac 1 -b:a 40k "%%~nf.ogg"
)

echo.
echo 全部转换完毕！
pause