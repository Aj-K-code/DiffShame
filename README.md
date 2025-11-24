# DiffShame - Visual Progress Tracker

Track your room organization progress over time with before/after photo comparisons.

## 📁 Adding Photos

1. Navigate to `public/photos/`
2. Create folders for each month in `YYYY-MM` format (e.g., `2025-01`)
3. Add photos for each section following this naming:

### Required Sections
- **Door** → `Door.jpg`
- **Desktop** → `Desktop.jpg`
- **Bed** → `Bed.jpg`
- **Couch** → `Couch.jpg`  
- **Workdesk** → `Workdesk.jpg`

### Example Structure
```
public/photos/
├── 2025-01/
│   ├── Door.jpg
│   ├── Desktop.jpg
│   ├── Bed.jpg
│   ├── Couch.jpg
│   └── Workdesk.jpg
├── 2024-12/
│   ├── Door.jpg
│   └── ...
```

### Adding New Months

To add a new month to the comparison dropdown:

1. Open `src/components/Comparison/CompareView.tsx`
2. Find the line: `const AVAILABLE_MONTHS = ['2025-01', '2024-12', '2024-11'];`
3. Add your new month to the array: `['2025-02', '2025-01', '2024-12', '2024-11']`
4. Rebuild: `npm run build`

## 🚀 Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
git add .
git commit -m "Update photos"
git push
```

## 📸 Photography Tips

- Take photos from the same angle each time
- Use consistent lighting
- Keep camera at same height
- Capture the same area in each photo

## 🌐 Deployment

The app automatically deploys to GitHub Pages when you push to the main branch.

Visit: https://Aj-K-code.github.io/DiffShame/
