# samisabarna.github.io

Personal site of **Sami Sabarna**, Intelligent Automation Engineer in Amman, Jordan.

Live: https://samisabarna.github.io/

- Plain HTML, CSS and JavaScript. No build step and no dependencies.
- English and Arabic in one page. The language button switches between them (`?lang=ar` opens Arabic directly).
- The hero shows an animated BPMN-style process. It pauses off screen and respects reduced-motion settings.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The page, with both languages |
| `assets/site.css` | Styles |
| `assets/site.js` | Language switch, email link and the process animation |
| `assets/favicon-32.png`, `assets/favicon-192.png`, `assets/apple-touch-icon.png` | Icons (the "S" with the cyan dot from the logo) |
| `assets/og.png` | Link preview image |
| `assets/Sami_Sabarna_CV.pdf` | The CV behind the "Download CV" buttons |
| `404.html` | Not-found page |
| `tools/` | Sources for the PNG images |

## Editing

Each piece of text appears twice, once in an element with `lang="en"` and once with `lang="ar"`. Change both.

## Updating the CV

Replace `assets/Sami_Sabarna_CV.pdf` with the new PDF under the same file name. The buttons keep working with no other change.
On GitHub: open `assets/`, choose **Add file > Upload files**, drop the new PDF with the same name, and commit. The site updates in about a minute.
