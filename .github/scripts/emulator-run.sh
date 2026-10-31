#!/usr/bin/env bash
# Called by the emulator-test workflow once the emulator has booted.
set -u
PKG=com.groundlearn.curio
mkdir -p out
adb wait-for-device
adb shell getprop ro.build.version.release > out/android-version.txt
adb install -r -g curio.apk > out/install.txt 2>&1 || { cat out/install.txt; exit 1; }
cat out/install.txt
adb logcat -c
adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1
for t in 5 15 30 45; do
  sleep $((t - ${prev:-0})); prev=$t
  adb exec-out screencap -p > "out/screen-${t}s.png"
  echo "after ${t}s pid: $(adb shell pidof $PKG || echo none)" | tee -a out/status.txt
done
# Tap the middle of the screen and wait a little more, in case the crash comes later.
adb shell input tap 540 1200
sleep 10
adb exec-out screencap -p > out/screen-tap.png
echo "after tap pid: $(adb shell pidof $PKG || echo none)" | tee -a out/status.txt
adb logcat -d -v threadtime > out/logcat.txt
adb logcat -d -b crash -v threadtime > out/logcat-crash.txt
grep -nE "FATAL|AndroidRuntime|ReactNativeJS|libc  |DEBUG   |Abort|SIGSEGV|SIGABRT|curio|chromium" out/logcat.txt | head -400 > out/logcat-highlights.txt
echo "--- crash buffer"; head -150 out/logcat-crash.txt
true
