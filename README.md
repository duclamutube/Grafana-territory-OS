# Territory Dashboard - Auto-Build Setup

## What's Included

```
├── summary.md              # YOU EDIT THIS - your territory data
├── template.html           # Dashboard styling (don't edit)
├── scripts/
│   └── build.js            # Converts summary → HTML (don't edit)
├── .github/
│   └── workflows/
│       └── build.yml       # GitHub Action (auto-triggers)
└── index.html              # Auto-generated dashboard
```

## How It Works

1. You edit `summary.md` with your territory data
2. Push to GitHub
3. GitHub Action automatically runs `build.js`
4. `index.html` is regenerated with new data
5. GitHub Pages serves the updated dashboard

**Password:** NorthCentral

## Setup Instructions

### Step 1: Replace Files in Your Repo

1. Go to your repo: `github.com/duclamutube/Grafana-territory-OS`
2. Delete existing `index.html`
3. Upload all files from this package (drag-drop the folder contents)
4. Make sure the folder structure matches above

### Step 2: Enable GitHub Actions

1. Go to repo **Settings** → **Actions** → **General**
2. Under "Workflow permissions" select **"Read and write permissions"**
3. Click **Save**

### Step 3: Test It

1. Edit `summary.md` (change any score or status)
2. Commit the change
3. Go to **Actions** tab - you'll see the workflow running
4. After ~30 seconds, check your dashboard URL

## Editing summary.md

### Format

Each account follows this structure:

```markdown
### Account Name
- Score: 85
- Tier: 1
- Status: Active sequence
- Outreach Start: 2026-01-15
- Revisit: 2026-03-01
- Why NOW: Your text here...
- Why GRAFANA: Your text here...
- Why ANYTHING: Your text here...
- Data Freshness: HIGH
- Outcome: Your outcome focus here...
```

### Rules

- Keep the exact field names (Score, Tier, Status, etc.)
- Tier can be: 1, 2, 3, or "Nurture"
- Data Freshness can be: HIGH, MEDIUM, or LOW
- Outreach Start and Revisit are optional

## Troubleshooting

**Action not running?**
- Check Settings → Actions → Workflow permissions = Read and write

**Dashboard not updating?**
- Go to Actions tab, check if build succeeded
- If failed, click the run to see error details

**Changes not showing on site?**
- GitHub Pages can take 1-2 minutes to update
- Try hard refresh (Ctrl+Shift+R)
