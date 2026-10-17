#!/usr/bin/env bash
set -e
echo "🔄 पूरे प्रोजेक्ट को एकीकृत और सिंक किया जा रहा है..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com
git branch -M main
git add -A
git commit -m "Integrate system code, Smart AI PWA, Gemini config and UI updates" --allow-empty
echo "🚀 बिना किसी रुकावट के सीधे GitHub पर फोर्स पुश जारी..."
git push -u origin main --force
echo "✅ बधाई हो! कोड सफलतापूर्वक मर्ज हो गया है और Vercel पर लाइव हो रहा है।"
