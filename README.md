# Shanghai Ecosystem Atlas

We build an English and Simplified Chinese website and two illustrated PDF books with Guidedog's native HTML, PDF, gettext and multilingual workflows.
We use a custom Shanghai theme with white magnolia, pearl white, ink, jade and champagne gold.
The cover is an original Chinese ink-style illustration of Shanghai with a subtle AI constellation.

The research edition is dated 4 November 2026.
It contains 113 organization profiles, 38 funding routes and 99 cited sources across all 16 districts.
We include profiles for all 40 undergraduate institutions in the June 2026 Ministry of Education Shanghai register, plus registers of 29 diploma colleges and 12 adult institutions.
Program coverage is a researched selection, not an exhaustive census of every Shanghai program.
We distinguish closed calls, published policies and opportunities whose current intake needs confirmation.

## Build

We need Node.js 22 or later, Guidedog with its embedded Typst and Graphviz backends, and the Noto Sans CJK SC and Noto Serif CJK SC system fonts.
The installed Guidedog version used for this edition is `1.0.0-beta.12`.
The Typst packages are pinned to CeTZ `0.3.4` and Fletcher `0.5.8`.
The configuration uses the local Typst package cache.
If the packages are missing, we can first run `guidedog build html docs -D pdf_packages=download` to populate the native cache.

```sh
node tools/build.mjs
node tools/verify.mjs
node tools/serve.mjs
```

We open the English website at <http://127.0.0.1:8123/en/index.html> and the Chinese website at <http://127.0.0.1:8123/zh-CN/index.html>.
The preview server only serves static files produced by Guidedog.
No website hosting service, framework or alternate PDF renderer is involved.

The books are [English](docs/downloads/shanghai-ecosystem-atlas-en.pdf) and [Simplified Chinese](docs/downloads/shanghai-ecosystem-atlas-zh_CN.pdf).
The assembled bilingual site is in `docs/_build/site/`.
Both books are available from each website edition.
We can copy that directory to static hosting without a build server.
No remote publication is configured or performed.

For live source editing, we can also use Guidedog's own preview:

```sh
node tools/generate.mjs
node tools/map.mjs
guidedog serve docs --port 8124
```

The preparation commands create the native RST sources and map assets in a fresh checkout.
After preparation, we can use `guidedog build`, `guidedog serve`, `guidedog intl` and `guidedog clean` with `docs/conf.toml`.

## Native publishing steps

`tools/build.mjs` runs these native stages, in order:

```sh
node tools/generate.mjs
node tools/map.mjs
guidedog build -b gettext docs docs/locales/templates -W
guidedog intl update -p docs/locales/templates -l zh_CN docs
node tools/translate.mjs
guidedog build -b pdf docs docs/_build/pdf/en -D language=en -W --budget=2048
guidedog build -b pdf docs docs/_build/pdf/zh_CN -D language=zh_CN -W --budget=2048
guidedog build -b html docs docs/_build/site/en -D language=en -W
guidedog build -b html docs docs/_build/site/zh-CN -D language=zh_CN -W
```

The build script copies the two PDFs into `docs/downloads/` before the HTML builds, so native `html_extra_path` publishes working downloads.
It also writes a small English-first entry page above the two native editions.

## Sources and maintenance

We edit research records in `data/catalog.mjs`, `data/district-funding.mjs`, `data/universities.mjs` and `data/chapters.mjs`.
The generator writes the RST documents, research JSON and translation pairs from those records.
We do not edit generated RST or PO text independently of the canonical records.
Guidedog extracts messages and maintains the native PO catalogs in `docs/locales/zh_CN/LC_MESSAGES/`.
The translation step fills those catalogs from the paired editorial text and fails when a translation is missing.

We track the research records, source snapshots, templates, diagram sources, cover artwork, fonts and build tools.
We ignore generated RST, translation catalogs, research exports, reports, PDFs, HTML and Guidedog caches.
The bilingual data records retain the authored translations, so we can regenerate both editions from the tracked files.

`data/published-sources.json` contains the sources actually cited in the publication.
`data/research-index.json` and `data/extra-sources.json` are discovery indexes and also include leads that were not selected.
The source workbooks `data/moe-universities-2026.xls` and `data/moe-adult-colleges-2026.xls` come from the Ministry of Education's 18 June 2026 publication.
The JSON registers preserve the Shanghai institution names and codes from those workbooks.

The map uses a local DataV district geometry snapshot.
District and campus anchors are explicitly distinguished from approximate street locations.
The map is for ecosystem exploration, not navigation or legal boundary determination.
Global programs are not represented as local offices.

Profiles link to official notices or operators and give published contacts where established.
Where a direct contact is unverified, we provide the official authority or operator route.
Application checklists are editorial unless a profile identifies a notice-specific procedure.
We have not contacted organizations or submitted applications.
We recheck deadlines, operators, eligibility, funding mechanisms and duplicate-funding rules before using a route.

## Design files

The native Jinja website layout is `docs/_templates/layout.html`.
The native Typst book layout is `docs/_templates/book.typ`.
The website theme and interactive map are `docs/_static/shanghai.css` and `docs/_static/shanghai.js`.
Graphviz, CeTZ and Fletcher sources are in `docs/figures/` and compile through Guidedog directives for HTML and PDF.
The two books use a 240 by 300 mm page, illustrated chapter openings and individual profile pages.

The [cover artwork](docs/_static/atlas/shanghai-ink-cover.png) was created with the built-in image generation tool.
The full production prompt and artwork provenance are recorded in [data/cover-art.json](data/cover-art.json).
The illustration is an artistic composition, not a geographically exact view.
The magnolia mark and district map are original project SVG compositions.
DM Sans and Libre Caslon Display are served locally, with their SIL Open Font Licenses retained in `docs/_static/fonts/`.
The website, map and search do not need an external JavaScript or map service.
