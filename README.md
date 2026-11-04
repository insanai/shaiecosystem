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

For native builds, we need Guidedog with its embedded Typst and Graphviz backends, and the Noto Sans CJK SC and Noto Serif CJK SC system fonts.
The optional publication and content-refresh helpers also need Node.js 22 or later.
The installed Guidedog version used for this edition is `1.0.0-beta.12`.
The Typst packages are pinned to CeTZ `0.3.4` and Fletcher `0.5.8`.
Guidedog downloads missing pinned Typst packages on the first build and caches them locally.
After the cache is populated, we can select offline builds with `-D pdf_packages=offline`.

A fresh checkout contains the native RST sources, Simplified Chinese PO catalogs and required map assets.
We can preview English directly, without a Node preparation step:

```sh
guidedog serve docs
```

We open <http://127.0.0.1:8000/>.
For a Simplified Chinese preview, we run `guidedog serve docs -D language=zh_CN --port 8001` and open <http://127.0.0.1:8001/>.
Each native preview serves one edition.
Language switching and book downloads appear in the assembled bilingual publication below.

We can also build either format directly:

```sh
guidedog build html docs -W
guidedog build pdf docs -W
guidedog build pdf docs -D language=zh_CN -W
```

To assemble both website editions and both book downloads together, we use:

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

We use `guidedog build`, `guidedog serve`, `guidedog intl` and `guidedog clean` with `docs/conf.toml` to manage the native project.

## Native publishing steps

`tools/build.mjs` runs these native stages, in order:

```sh
guidedog build -b pdf docs docs/_build/pdf/en -D language=en -W --budget=2048
guidedog build -b pdf docs docs/_build/pdf/zh_CN -D language=zh_CN -W --budget=2048
guidedog build -b html docs docs/_build/site/en -D language=en -D html_context.assembled_site=true -W
guidedog build -b html docs docs/_build/site/zh-CN -D language=zh_CN -D html_context.assembled_site=true -W
```

The build script copies the two PDFs into `docs/downloads/` before the HTML builds, so native `html_extra_path` publishes working downloads.
It also writes a small English-first entry page above the two native editions.

## Sources and maintenance

We edit research records in `data/catalog.mjs`, `data/district-funding.mjs`, `data/universities.mjs` and `data/chapters.mjs`.
The generator writes the RST documents, research JSON and translation pairs from those records.
After changing those records, we run the explicit refresh workflow:

```sh
node tools/refresh.mjs
```

It updates the RST documents and map assets, runs Guidedog's gettext and `intl update` commands, and fills the native PO catalogs from the paired editorial translations.
We review and commit the resulting source changes with the research edits.
We do not edit the RST or PO snapshots independently of the bilingual records, because a later refresh would overwrite those edits.
Normal builds read these reviewed publication inputs and do not refresh them.

We track the research records, RST publication sources, PO translations, map assets, source snapshots, templates, diagram sources, cover artwork, fonts and tools.
We ignore compiled HTML, PDFs and MO catalogs, temporary POT catalogs, intermediate research exports, reports and Guidedog caches.
The tracked `docs/downloads/.gitkeep` preserves the configured downloads directory without committing generated books.
The bilingual data records retain the editorial translations, while the native source snapshots let Guidedog build either edition directly from a fresh checkout.

The tracked `docs/_static/atlas/catalog.json` includes the sources actually cited in the publication.
The refresh helper also writes an ignored intermediate copy to `data/published-sources.json`.
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
