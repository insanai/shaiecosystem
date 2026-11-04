# Shanghai Ecosystem Atlas

Written by Vikrant Rathore, with contributions from Lauren Zhao, Vicky Ni, Jennifer Yuan, Ronak Rathore, Kanak Rathore and Emily Yue Xu.

We publish an interactive website and illustrated PDF books in English, Simplified Chinese, Hindi, Japanese, Korean, German and Spanish using [Guidedog](https://github.com/insanai/guidedog).
The research edition is dated 4 November 2026 and contains 133 organization profiles, 53 funding and cost-support routes, and 144 cited sources across Shanghai's 16 districts.
We include profiles for all 40 undergraduate institutions in the June 2026 Ministry of Education Shanghai register, with separate registers of 29 diploma colleges and 12 adult institutions.
Coverage is a researched selection, rather than an exhaustive census of every program.
We distinguish published policies, closed calls and opportunities whose current intake needs confirmation.

The website is published from [insanai/shaiecosystem](https://github.com/insanai/shaiecosystem) to **https://bettershanghai.com** using GitHub Pages.
The language-neutral home page uses our saved language choice, then the browser's preferred supported language, with English as the fallback.
Links to a specific language stay in that language, and the language menu saves our choice on this browser.
Chinese browser preferences open the Simplified Chinese edition.

## Preview and build

We use Guidedog `1.0.0-beta.12` and Node.js 22 or later.
The repository includes native RST documents, PO catalogs, templates, fonts and illustration assets, so a single-edition preview needs no content-generation step:

```sh
guidedog serve docs
guidedog serve docs -D language=zh_CN --port 8001
guidedog serve docs -D language=ja --port 8002
```

A native single-edition preview contains the current language only.
The seven-language menu and book downloads appear in the assembled publication, where their destinations exist.

We build and check the complete publication with:

```sh
node tools/build.mjs
node tools/verify.mjs
node tools/serve.mjs
```

We open **http://127.0.0.1:8123/en/index.html**.
The assembly helper calls Guidedog's native HTML and PDF builders for each language; it does not render a separate website or book format.
Ordinary builds do not regenerate maintained documents or translations.
Compiled publications and temporary reports remain ignored by Git.

| Language | Guidedog locale | Website folder | Book filename suffix |
| --- | --- | --- | --- |
| English | `en` | `en` | `en` |
| 简体中文 | `zh_CN` | `zh-CN` | `zh_CN` |
| हिन्दी | `hi` | `hi` | `hi` |
| 日本語 | `ja` | `ja` | `ja` |
| 한국어 | `ko` | `ko` | `ko` |
| Deutsch | `de` | `de` | `de` |
| Español | `es` | `es` | `es` |

Books are named `shanghai-ecosystem-atlas-<locale>.pdf`.
The assembled site is written to `docs/_build/site/` and the downloadable books to `docs/downloads/`.

## Research and translation maintenance

We maintain the organization and citywide funding records in `data/catalog.json`, district funding in `data/district-funding.json`, university records in `data/universities.json`, and editorial chapters and application workflows in `data/chapters.json`.
Official source indexes and institutional registers remain in `data/`.
The five additional translation sets are in `data/i18n.json`; Simplified Chinese accompanies the canonical records.
The native website interface translations are maintained in `docs/locales/<locale>/LC_MESSAGES/guidedog.po`.
The book's multilingual front matter is in `docs/_templates/book-labels.json`.

After changing research records or structured translations, we run:

```sh
node tools/refresh.mjs
```

The refresh helper regenerates the RST and map inputs, extracts gettext templates with Guidedog, updates the six translated PO catalogs with `guidedog intl update`, synchronizes structured translations and reports native translation coverage with `guidedog intl stat`.
We review and commit the updated RST, PO and static dataset inputs together with the research changes.
These maintained publication inputs stay in Git so `guidedog serve docs` works in a fresh checkout.

`tools/verify.mjs` checks every edition's local links, organization and funding profiles, PDF downloads, language alternates and translation completeness.
`node tools/check-language-entry.mjs` checks browser-language matching, saved preferences and entry-page redirects.
It also compares RMB amounts across all seven languages and checks that PDF coverage metadata matches the dataset.
The November review corrected literal startup terminology, translated front matter, missing funding conditions and material currency discrepancies.
Program names and original source titles remain searchable in their official forms.
We publish names, telephone numbers and official contact websites, while omitting email addresses from the repository's content, books, datasets and CSV exports.

## Shanghai template and artwork

The custom theme follows Shanghai's white magnolia and the city's Pearl of the Orient identity: pearl white, ink, jade, mineral blue, coral and sunrise gold.
A wide dawn painting blends into the landing page beneath centered hero text; a matching portrait illustration is used for the books.
Inside the books, numbered serif chapter openings and four editorial sections replace repeated cover-image banners.
Larger body text, a dedicated print-map legend, linked contents and mirrored folios support reading across spreads.
The cover painting appears once; chapter illustrations are maps and technical diagrams tied to the surrounding text.
The illustrations were generated in a Chinese ink-and-color style and are artistic compositions, rather than surveyed views.

- `docs/_templates/layout.html`: native HTML layout and seven-language navigation.
- `docs/_static/shanghai.css` and `shanghai.js`: responsive theme, local district map, search, filters and shortlist.
- `docs/_templates/book.typ`: native Typst layout in a 240 x 300 mm art-book format.
- `docs/_templates/book-labels.json` and `coverage.json`: multilingual book labels and maintained coverage metadata.
- `docs/_static/atlas/shanghai-ink-dawn-hero.png` and `shanghai-ink-dawn-book.png`: retained publication artwork.
- `data/ink-dawn-art.json`: exact prompts and built-in image generation provenance.
- `docs/figures/`: CeTZ `0.3.4`, Fletcher `0.5.8` and Graphviz diagrams.

Bundled Libertinus, DejaVu and Noto fonts support Latin, CJK and Devanagari typesetting.
Font licenses and provenance accompany the assets in `docs/fonts/` and `docs/_static/fonts/`.
The map, fonts, scripts and data are served locally, with no external runtime dependencies.

## GitHub Pages and Cloudflare

`.github/workflows/pages.yml` builds all seven HTML editions and PDF books, runs verification and deploys the assembled directory with GitHub's official Pages actions.
Guidedog is installed from a checksum-pinned release by `.github/actions/guidedog/action.yml`.
GitHub Pages must use the **GitHub Actions** publishing source and the custom domain **bettershanghai.com**.
`pages.toml` also describes the assembled folder for Guidedog's optional local publisher; we keep Actions as the active deployment route.

We first verify ownership of `bettershanghai.com` through [the repository owner's Pages settings](https://github.com/organizations/insanai/settings/pages).
GitHub handles TXT ownership verification at the owner level, and we bind the custom domain specifically to [this repository's Pages site](https://github.com/insanai/shaiecosystem/settings/pages).
After selecting **Add a domain**, we copy GitHub's generated TXT value into Cloudflare with the name `_github-pages-challenge-insanai`, then complete verification in GitHub and retain the TXT record.
We use the exact value GitHub supplies; the A and CNAME records below do not replace that verification.
GitHub describes this process in [Verifying a custom domain for GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages).

At Cloudflare, we configure the following records for GitHub Pages:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `insanai.github.io` |

We use DNS-only records during domain validation and certificate provisioning, then enable **Enforce HTTPS** in the repository's Pages settings when GitHub makes it available.
The GitHub custom-domain setting, rather than the artifact's `CNAME` file, controls the domain for an Actions deployment.
GitHub documents the records and validation steps in [Managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
