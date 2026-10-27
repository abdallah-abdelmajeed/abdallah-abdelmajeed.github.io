# Abdallah Abdelmajeed - Personal Website (Static HTML)

## Overview
This project is a static HTML, CSS, and JavaScript version of Abdallah Abdelmajeed's personal website. It is designed for easy deployment and fast loading, with no server-side dependencies. The original site was built with Next.js, but this version is fully static for maximum compatibility.

## Structure
- `index.html` — Main entry point and layout
- `css/styles.css` — Custom styles and responsive design
- `js/main.js` — Tab navigation and dynamic content loading
- `tabs/` — HTML files for each tab (About Me, Research, CV, Publications, Datasets, Interests, Contact)
- `assets/` — Images, profile photo, CV PDF, and other static files

## Features
- **Modern, responsive design** for desktop and mobile
- **Tab-based navigation** with smooth transitions
- **Downloadable CV** (PDF)
- **Contact form** — Now sends messages to `ay1214@fayoum.edu.eg` via [Formspree](https://formspree.io/)
- **Social and academic profile links** (LinkedIn, Google Scholar, ORCID)
- **Accessible and clean UI** with professional theming

## How to Use
### Local Testing
- Open `index.html` directly in your browser, or
- Use a local server (e.g., Live Server extension in VS Code) for best results

### Deployment
You can deploy this static site to any web host. Popular options:
- **GitHub Pages** (recommended)
- Netlify
- Vercel
- Amazon S3
- Any static web hosting provider

#### Deploying to GitHub Pages
1. Push all files to your GitHub repository (see `GITHUB_SETUP.md` for details)
2. In your repo settings, enable GitHub Pages and select the `main` branch
3. (Optional) Set up a custom domain (see `SETUP_INSTRUCTIONS.md`)

#### Contact Form Setup
- The contact form uses [Formspree](https://formspree.io/f/xanoqaqe) to send messages to `ay1214@fayoum.edu.eg`
- No backend or server code is required
- You can change the Formspree endpoint in `tabs/contact.html` if needed

## Keeping Your CV Updated
- Replace `assets/Abdallah Abdelmajeed_CV-EN.pdf` with your latest CV
- The download button will always link to this file

## License
This project is for personal and academic use. For reuse or adaptation, please contact Abdallah Abdelmajeed.

---
For more setup help, see the included `COMPLETE_SETUP_GUIDE.md` and other markdown guides in this repository.