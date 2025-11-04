# Tag Master — Learn HTML & CSS Tags

This is a static, client-side learning site built with pure HTML5, CSS3 and vanilla JavaScript. It demonstrates a modern glassmorphism UI and includes interactive features: tag cards with live previews, a playground, a quiz, bookmarks, and a cheat-sheet download.

Features included
- Glassmorphism + gradient backgrounds
- Responsive, mobile-first layout
- Tag cards with code, live preview and copy-to-clipboard
- Search and filter by category
- Interactive playground (HTML + CSS) with live iframe preview
- Small quiz with progress saved to localStorage
- Bookmarks/favorites and progress saved in localStorage
- Dark / light theme toggle

How to run locally
1. Open a terminal in the project folder
2. Run a local static server. For example, with Python 3:

```powershell
# Run from Windows PowerShell in the project directory:
python -m http.server 5500; # then open http://localhost:5500
```

3. Open the served URL in your browser.

Notes & next steps
- Add more tags and CSS property demos to `data/tags.json` and implement CSS property cards
- Improve syntax highlighting (currently minimal) — consider integrating a lightweight highlighter like Prism.js
- Add persistence UI for bookmarks and progress dashboard

Files
- `index.html` — main HTML
- `css/styles.css` — site styles
- `js/app.js` — main JavaScript
- `data/tags.json` — tags data (sample)
- `data/quiz.json` — quiz data (sample)

This scaffold is intended as a starting point. It's designed to be expanded with more examples, animations, and learning material.

---

## 🔗 Live Demo

Experience Tag Master for yourself:

👉 **Live Project: [https://taxonomy-pro.netlify.app/](https://taxonomy-pro.netlify.app/)**

---

