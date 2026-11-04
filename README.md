# Shanghai Ecosystem Atlas

**Written by Vikrant Rathore**  
**With contributions from Lauren Zhao, Vicky Ni, Jennifer Yuan, Ronak Rathore, Kanak Rathore and Emily Yue Xu**  
**Built with [Guidedog](https://github.com/insanai/guidedog/) — Published in HTML and PDF across 7 languages**

We build a seven-language interactive website and seven illustrated PDF books (`en`, `zh_CN`, `hi`, `ja`, `ko`, `de`, `es`) using Guidedog's native HTML, Typst PDF, gettext, and multilingual `.po` catalog workflows.
We use a custom Shanghai White Magnolia (*Yulania denudata* / 白玉兰) editorial theme with pearl white (`#f8f7f2`), warm ivory (`#fffefa`), deep ink (`#263b36`), mist celadon jade (`#315b50`), and champagne gold (`#a88b53`).
The cover and landing hero feature an original traditional Chinese ink wash painting (*shuimo dan cai* / 水墨淡彩) of the Shanghai skyline and white magnolia blossoms on xuan paper.

The research edition is dated 4 November 2026.
It contains **125 organization profiles**, **45 funding routes**, and **133 cited sources** across all **16 districts** of Shanghai.
We include profiles for all 40 undergraduate institutions in the June 2026 Ministry of Education Shanghai register, plus registers of 29 diploma colleges and 12 adult higher-education institutions.
Program coverage is a researched selection, not an exhaustive census of every Shanghai program.
We distinguish closed calls, published policies, and opportunities whose current intake requires operator confirmation.

## Languages & Editions

All seven language editions are generated natively by Guidedog (`guidedog build -b html` and `guidedog build -b pdf`) from `docs/` and `docs/locales/<lang>/LC_MESSAGES/*.po`:

| Language | Locale (`-D language=`) | Website Path | PDF Book |
| :--- | :--- | :--- | :--- |
| **English** | `en` | `/en/index.html` | `docs/downloads/shanghai-ecosystem-atlas-en.pdf` |
| **Simplified Chinese (简体中文)** | `zh_CN` | `/zh-CN/index.html` | `docs/downloads/shanghai-ecosystem-atlas-zh_CN.pdf` |
| **Hindi (हिन्दी)** | `hi` | `/hi/index.html` | `docs/downloads/shanghai-ecosystem-atlas-hi.pdf` |
| **Japanese (日本語)** | `ja` | `/ja/index.html` | `docs/downloads/shanghai-ecosystem-atlas-ja.pdf` |
| **Korean (한국어)** | `ko` | `/ko/index.html` | `docs/downloads/shanghai-ecosystem-atlas-ko.pdf` |
| **German (Deutsch)** | `de` | `/de/index.html` | `docs/downloads/shanghai-ecosystem-atlas-de.pdf` |
| **Spanish (Español)** | `es` | `/es/index.html` | `docs/downloads/shanghai-ecosystem-atlas-es.pdf` |

## Build & Bundled Fonts

All required web and PDF fonts are bundled directly in the repository (`docs/_static/fonts/` and `docs/fonts/`, configured via `pdf_font_paths = ["_static/fonts", "fonts"]` in `docs/conf.toml`):
- **Latin (`en`, `de`, `es`)**: `DM Sans`, `Libre Caslon Display`, `Libertinus Serif`, `Libertinus Sans`, `Libertinus Mono`
- **Simplified Chinese (`zh_CN`)**: `Noto Serif SC`
- **Hindi (`hi`)**: `Noto Serif Devanagari`, `Noto Sans Devanagari`
- **Japanese (`ja`)**: `Noto Serif JP`
- **Korean (`ko`)**: `Noto Serif KR`

The installed Guidedog version used for this edition is `1.0.0-beta.12`.
The Typst packages are pinned to CeTZ `0.3.4` and Fletcher `0.5.8`.

We can preview any single edition directly with Guidedog:

```sh
guidedog serve docs
guidedog serve docs -D language=zh_CN --port 8001
guidedog serve docs -D language=hi --port 8002
```

To assemble all seven website editions and all seven PDF books together, verify every page/link/catalog, and preview locally:

```sh
node tools/build.mjs
node tools/verify.mjs
node tools/serve.mjs
```

We open the assembled multi-edition publication at <http://127.0.0.1:8123/en/index.html>.
The assembled static site is written to `docs/_build/site/` (including `.nojekyll` for GitHub Pages).

## Native Publishing & Idiomatic Gettext Workflow

All collected research and multilingual domain records are stored as pure JSON in `data/`:
- `data/catalog.json` — 16 Shanghai districts, 69 core ecosystem organizations, and citywide funding routes
- `data/district-funding.json` — district-level funding routes across all 16 districts (45 total funding routes)
- `data/universities.json` — all 40 undergraduate universities in Shanghai plus enriched campus/innovation metadata
- `data/chapters.json` — 6 analytical chapters and 13 application workflows
- `data/i18n.json` — native editorial translations for `hi`, `ja`, `ko`, `de`, and `es`
- `data/university-register.json` & `data/adult-college-register.json` — Ministry of Education Shanghai registers
- `data/shanghai-districts.geojson` — local district geometry snapshot

When updating JSON records in `data/`, run the refresh workflow:

```sh
node tools/refresh.mjs
```

`tools/refresh.mjs` runs:
1. `node tools/generate.mjs` — regenerates the `.rst` source documents, interactive atlas JSON (`docs/_static/atlas/catalog.json`), and interactive JavaScript bundles (`docs/_static/atlas/catalog.js`)
2. `node tools/map.mjs` — regenerates the SVG district map (`docs/_static/atlas/shanghai-districts.svg`) and `docs/_static/atlas/geometry.js`
3. `guidedog build -b gettext docs docs/_build/gettext` — extracts `.pot` message templates from all `.rst` documents and Jinja templates (`_('...')` in `docs/_templates/layout.html`)
4. `guidedog intl update -d docs/locales -p docs/_build/gettext -l zh_CN -l hi -l ja -l ko -l de -l es` — updates all `.po` catalogs across all 6 translated languages
5. `node tools/generate.mjs --sync-po` — syncs the structured translations from `data/*.json` into `docs/locales/<lang>/LC_MESSAGES/*.po`
6. `guidedog intl stat -d docs/locales` — verifies 100% translation completion (`0 fuzzy, 0 untranslated`) across all 205 PO catalogs per language

## GitHub Pages Deployment

The repository is configured for automated GitHub Pages deployment via:
- `pages.toml` — multi-edition static site manifest
- `.github/actions/guidedog/action.yml` — composite action that installs Guidedog `1.0.0-beta.12` and builds HTML/PDF artifacts
- `.github/workflows/pages.yml` — GitHub Actions workflow that builds all 7 PDF and HTML editions (`node tools/build.mjs`), runs `node tools/verify.mjs`, and deploys `docs/_build/site` to GitHub Pages

## Design Files

- `docs/_templates/layout.html` — native Jinja HTML template using `{{ _('...') }}` gettext localization
- `docs/_templates/book.typ` — native Typst book template with script-aware typography for Latin, CJK, and Devanagari editions
- `docs/_static/shanghai.css` & `docs/_static/shanghai.js` — White Magnolia editorial stylesheet and interactive district map / directory filter engine
- `docs/_static/atlas/shanghai-ink-cover.png` — traditional Chinese ink wash (*shuimo dan cai*) cover and hero illustration, documented in `data/cover-art.json`
