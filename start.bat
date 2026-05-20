@echo off
title 今天鉴赏了什么番
cd /d "%~dp0"
echo ================================
echo   今天鉴赏了什么番
echo ================================
echo.
echo 启动本地服务...
echo 电脑访问: http://localhost:8000
echo 手机访问: http://你的电脑IP:8000
echo.
start "" http://localhost:8000
python -m http.server 8000
pause
