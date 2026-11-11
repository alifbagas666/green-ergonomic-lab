# Green Ergonomic Lab website

Static website (HTML, CSS, JavaScript, no build step) for the Green Ergonomic Lab, Department of Industrial Engineering and Management, Yuan Ze University.

## Folder layout

| Path | Purpose |
| --- | --- |
| `index.html`, `research.html`, `publications.html`, `members.html`, `news.html`, `contact.html` | The six pages |
| `css/style.css`, `js/main.js`, `js/tree.js` | Styling, shared behaviour, interactive research tree |
| `js/i18n.js` | English / Traditional Chinese switch (all page text and the Chinese translations live here) |
| `assets/` | Images (`yogi.png` / `yogi-web.jpg` on the Members page, `yzu-logo.png` in the top bar) |
| `build_publications.py` | The single data pipeline script |
| `data/publications.json` | Public paper list used by the site |
| `data/categories.json` | Research tree (root, branches, sub-branches, paper ids, counts) |
| `data/abstracts.txt` | Plain-text abstracts for AI reading. Not used by the site and not meant to be published |
| `data/excluded.json` | Papers removed as belonging to a different author, with the reason, for human review |
| `data/abstract_cache.json` | Cache of downloaded abstracts so reruns are faster |

## View the site locally

The pages read `data/*.json`, so browsers need a local server (opening the file directly blocks `fetch`). From this folder:

```
python -m http.server 8000
```

Then open http://localhost:8000. If the JSON files are missing the pages show a placeholder message instead of breaking.

## Language

The site opens in Traditional Chinese for browsers set to a Chinese language and in English otherwise. The button in the header switches language and remembers the choice. To change a Chinese sentence, edit the `PAGE`, `ATTR`, `TITLE`, `CAT` or `UI` tables in `js/i18n.js`. To add new page text, add the English text exactly as it appears in the HTML as a key in `PAGE`; calling `LabI18n.missing()` in the browser console lists any text on the current page that has no translation. Paper titles, authors and venues stay in their original language. The Chinese lab name 綠色人因工程實驗室 is a translation, so confirm the official name.

## Rerun the data pipeline

```
pip install requests scikit-learn numpy
python build_publications.py
```

The script:

1. Finds the OpenAlex author profile for "Yogi Tri Prasetyo" with a Yuan Ze University affiliation and downloads all works. Abstracts are rebuilt from `abstract_inverted_index`.
2. Fills missing abstracts from Semantic Scholar (batch, per DOI, then title search) and Crossref.
3. Merges duplicate versions (same DOI, same normalized title, or near-identical title within one year).
4. Compares against the YZU faculty page, removes papers that belong to a different author with a similar name (written to `data/excluded.json`), and adds faculty-page items OpenAlex missed as title-only entries with source "faculty page".
5. Categorizes with a keyword taxonomy, then TF-IDF similarity for leftovers. Papers with no abstract are categorized from title, venue and keywords, and have `abstract_source` set to `none`.
6. Prints counts per category, the excluded count, and the difference from the faculty page list.

Google Scholar is not scraped (it blocks automated access). OpenAlex works without a key for small runs. If you hit its daily limit, get a free key and run `set OPENALEX_API_KEY=your_key` (Windows) before the script. The script stops instead of writing partial data when OpenAlex fails.

To change categories, edit the `TAXONOMY` and `SUBTAXONOMY` dictionaries in `build_publications.py` and rerun. Review `data/excluded.json` after each run in case a real paper was removed. To force a paper to be kept, check that its title appears on the faculty page, or adjust `exclusion_reason`.

## Deploy on GitHub Pages

1. Create a GitHub repository (for example `green-ergonomic-lab`) and upload the site files. The included `.gitignore` keeps the private project notes file, `data/abstracts.txt`, `data/abstract_cache.json`, `data/excluded.json` and log files out of the upload. Abstracts are not shown publicly, so do not remove that rule.
2. In the repository, open Settings, then Pages. Under "Build and deployment" choose "Deploy from a branch", select the `main` branch and the `/ (root)` folder, and save.
3. After a minute the site is live at `https://<username>.github.io/<repository>/`. All paths in the site are relative, so no further change is needed.
4. A custom domain needs professor approval first. Once approved, add the domain under Settings, Pages, Custom domain, and create the DNS records GitHub lists.

## Items that need human input

- Member names, photos and bios (PhD, master's and alumni cards are placeholders).
- News entries marked placeholder, and exact dates for awards.
- Lab phone, opening hours and visitor directions on the Contact page (the address, Yuan Ze Building 2, Room R2519, is filled in).
- Confirm the official Chinese lab name and review the Traditional Chinese wording.
- Review of `data/excluded.json` and of the title-only faculty-page entries.
