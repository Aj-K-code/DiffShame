# DiffShame - Before/After Room Tracker with AI Roasting

Track your room organization progress month-to-month and get brutally honest AI feedback!

##  Quick Start

### 1. Add Your Photos

Place your photos in `public/photos/{YYYY-MM}/{Section}.jpg`:

```
public/photos/
├── 2024-10/          # Last month
│   ├── Door.jpg
│   ├── Desktop.jpg
│   ├── Bed.jpg
│   ├── Couch.jpg
│   └── Workdesk.jpg
└── 2024-11/          # This month
    ├── Door.jpg
    ├── Desktop.jpg
    ├── Bed.jpg
    ├── Couch.jpg
    └── Workdesk.jpg
```

### 2. Setup Gemini API Key

**Option A: GitHub Secret (Recommended for deployment)**

1. Get your Gemini API key from: https://makersuite.google.com/app/apikey
2. Go to your GitHub repo → Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `GEMINI_API_KEY`
5. Value: Your API key
6. In your GitHub Actions workflow, add:
   ```yaml
   env:
     V ITE_GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
   ```

**Option B: Local Development**

The app will prompt you to enter your API key when you click "Get Roasted by AI". It's saved in your browser's localStorage.

### 3. Deploy to GitHub Pages

The app automatically deploys when you push to main. Make sure GitHub Pages is enabled:
- Go to Settings → Pages
- Source: GitHub Actions

## 🎯 How It Works

1. **Select Section & Comparison Date** - Choose what room and which old photo to compare against
2. **Take Photo** - Capture current state with your camera
3. **See Before/After** - Interactive slider shows the difference
4. **Get Roasted** - AI analyzes what hasn't moved in a month and what new mess appeared

##  Development

```bash
# Install
npm install

# Run locally
npm run dev

# Build
npm run build
```

## 🔐 Environment Variables

- `VITE_GEMINI_API_KEY` - Gemini API key (optional, can also enter in app)

## 📝 GitHub Secret Setup

Add this to your `.github/workflows/deploy.yml`:

```yaml
- name: Build
  env:
    VITE_GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
  run: npm run build
```

Then add `GEMINI_API_KEY` as a repository secret with your Gemini API key.

## 🎨 Sections

- **Door** - Entryway, shoes, coats
- **Desktop** - Work area
- **Bed** - Bedroom
- **Couch** - Living room
- **Workdesk** - Office space

Take photos from the same angle each month for best results!

## 🚀 Deployed

Visit: https://Aj-K-code.github.io/DiffShame/

