#!/usr/bin/env python3
import os
from pathlib import Path

# --- Configuration ---
YEAR = "2026"
AUTHOR = "Ashraf Morningstar"
REPO = "https://github.com/AshrafMorningstar"

# The specific header requested for code files
HEADER_CODE = f"""/**
 * @license
 * Copyright © {YEAR} {AUTHOR}
 * {REPO}
 * 
 * Licensed under the MIT License.
 * This is a personal educational recreation.
 * Original concepts remain property of their respective creators.
 * 
 * @author {AUTHOR}
 * @see {REPO}
 */"""

# Python specific header (using hash comments)
HEADER_PY = f"""# @license
# Copyright © {YEAR} {AUTHOR}
# {REPO}
# 
# Licensed under the MIT License.
# This is a personal educational recreation.
# Original concepts remain property of their respective creators.
# 
# @author {AUTHOR}
# @see {REPO}
"""

# HTML specific header
HEADER_HTML = f"""<!--
 @license
 Copyright © {YEAR} {AUTHOR}
 {REPO}
 
 Licensed under the MIT License.
 This is a personal educational recreation.
 Original concepts remain property of their respective creators.
 
 @author {AUTHOR}
 @see {REPO}
-->"""

# README Footer
README_FOOTER = f"""
---

## 📜 Copyright & License

© {YEAR} {AUTHOR}. All Rights Reserved.

**Educational Disclaimer:** This is a personal recreation of an existing project concept, developed for learning and skill development purposes. The original project concept remains the intellectual property of its respective creator(s).

**License:** MIT License - See [LICENSE](./LICENSE) file for details.

**Developer:** [{AUTHOR}]({REPO})

**Portfolio:** Explore more projects at [{REPO.replace('https://', '')}]({REPO})

---

### 🤝 Connect & Contribute

Found this helpful? Give it a ⭐️ on GitHub!

- 💼 Company: MORNINGSTARCONSTRUCTION
- 📍 Location: India
- 🐦 Twitter: [@AMS_Morningstar](https://twitter.com/AMS_Morningstar)
- 📧 Email: ashrafmorningstar@gmail.com
"""

IGNORE_DIRS = {".git", "node_modules", "dist", "build", "__pycache__", ".venv", "venv", ".idea", ".vscode"}
# Extended list of binaries and non-code files to skip for headers
IGNORE_EXT = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".exe", ".zip", ".pdf", 
    ".json", ".ico", ".svg", ".woff", ".woff2", ".ttf", ".eot", ".mp4", 
    ".webm", ".mp3", ".wav", ".lock", ".log", ".txt", ".md", ".xml", ".yml", ".yaml"
}

def is_binary(file):
    try:
        with open(file, "rb") as f:
            return b'\x00' in f.read(1024)
    except:
        return True

def apply_header(file):
    try:
        content = file.read_text(encoding="utf-8", errors="ignore")
        
        # Determine appropriate header
        ext = file.suffix.lower()
        if ext in {".py", ".sh", ".rb"}:
            header_to_use = HEADER_PY
        elif ext in {".html", ".htm", ".xml", ".vue"}: # Vue often uses HTML-like comments in template, but can be tricky. sticking to HTML style for simplicity or avoiding if unsure.
             header_to_use = HEADER_HTML
        else:
            header_to_use = HEADER_CODE

        # Check if header roughly exists already
        if "Copyright" in content and "Ashraf Morningstar" in content:
            # We could update it, but strictly adding if missing is safer to avoid duplication
            # For this request, we'll skip if found to be safe.
            return

        # Handle Shebangs for scripts
        if content.startswith("#!"):
            lines = content.splitlines(keepends=True)
            if lines:
                new_content = lines[0] + "\n" + header_to_use + "\n" + "".join(lines[1:])
                file.write_text(new_content, encoding="utf-8")
        else:
            file.write_text(header_to_use + "\n" + content, encoding="utf-8")
            
        print(f"Applied header to {file}")
            
    except Exception as e:
        print(f"Failed to apply header to {file}: {e}")

def update_readme(file):
    try:
        content = file.read_text(encoding="utf-8", errors="ignore")
        if "## 📜 Copyright & License" in content:
            return
        
        # Append footer
        file.write_text(content + "\n" + README_FOOTER, encoding="utf-8")
        print(f"Updated README footer in {file}")
    except Exception as e:
        print(f"Failed to update README {file}: {e}")

def main():
    print("Starting copyright and license application...")
    repo_root = Path(".")
    
    for root, dirs, files in os.walk(repo_root):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        for name in files:
            file = Path(root) / name
            
            # Skip this script
            if file.name == "auto_apply_copyright.py":
                continue

            # Handle READMEs specially
            if file.name.lower() == "readme.md":
                update_readme(file)
                continue
                
            # Skip skipped extensions and binaries
            if file.suffix.lower() in IGNORE_EXT:
                continue
            if is_binary(file):
                continue
                
            apply_header(file)

    print("Finished processing files.")

if __name__ == "__main__":
    main()
