# upchunk.github.io

Personal portfolio of **Habibul Rahman Qalbi (Habi)**, AI Engineer based in Surabaya, Indonesia.

Live: https://upchunk.github.io

## Stack

Plain HTML, CSS and vanilla JavaScript. No build step, so GitHub Pages serves it directly.

```
index.html        # content + inlined CSS (light/dark theme, layout, figures)
main.js           # figure bar animation, inline case-study deep links, theme toggle, copy email
og.png            # social preview image (LinkedIn, WhatsApp, X)
fonts/            # self-hosted Schibsted Grotesk (OFL)
robots.txt, sitemap.xml  # search engine indexing
avatar.jpg/.webp  # profile photo
Habibul_Rahman_Qalbi_CV.pdf  # public CV (no phone number), printed from cv.html
cv.html           # CV source: single column, A4, ATS-friendly text layer
```

## Updating the CV

Edit `cv.html`, then print it to PDF with headless Chrome from the repo root. Chrome needs an absolute path; a bare `cv.html` is read as a hostname:

```
chrome --headless=new --no-pdf-header-footer --print-to-pdf=Habibul_Rahman_Qalbi_CV.pdf "$(pwd)/cv.html"
```

Check the result reads cleanly as plain text (what an ATS sees) with `pdftotext Habibul_Rahman_Qalbi_CV.pdf -`.

## Confidentiality

Projects built for employers are described at a high level only. This repository contains no proprietary source code, internal designs, prompts or client information.
