# pdebus.github.io

Personal website of Pascal Debus. Built with [Astro](https://astro.build) and a few React islands, deployed to GitHub Pages.

## Develop

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run check    # type check
```

## Update content

Everything you'd normally change lives in `src/data/` and `src/i18n/`:

| What | File |
|---|---|
| Talks | `src/data/talks.json` |
| Publications | `src/data/publications.json` (`topics`: `ai`, `q`) |
| Press articles | `src/data/media.json` |
| News list on the home page | `src/data/news.json` (EN + DE text, HTML allowed) |
| Links, Scholar metrics, form key, CV, portrait | `src/data/site.ts` |
| Bio and all interface text (EN + DE) | `src/i18n/ui.ts` |
| Legal pages | `src/pages/impressum.astro`, `src/pages/datenschutz.astro` |

Photos live in `public/img/` (portrait 4:5, reel photos 4:3). The reel order and captions are in `src/data/reel.json`; talk thumbnails and video links are the `photo` / `video` fields in `talks.json`. For the CV pill, put `cv.pdf` into `public/` and set `cv: '/cv.pdf'` in `site.ts`.

## Contact form

The form posts to [Web3Forms](https://web3forms.com). Create a free access key for your inbox there and paste it into `web3formsKey` in `src/data/site.ts`. The key only identifies the form; your email address is never part of the page.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`. One-time setup in the GitHub repo: **Settings → Pages → Source: GitHub Actions**.
