#!/usr/bin/env bash
set -e
echo "🔄 प्रोजेक्ट को एकीकृत और पुश किया जा रहा है..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com"
git branch -M main
git add -A
git commit -m "Integrate Smart AI PWA, Gemini config and UI updates" --allow-empty
echo "🚀 GitHub पर मर्ज और लाइव पुश शुरू..."
git push -u origin main --force
echo "✅ सफलता! कोड GitHub पर मर्ज हो चुका है और Vercel पर लाइव हो रहा है।"
