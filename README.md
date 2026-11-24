# Sabrina's portfolio

Midnight Companion is Sabrina's navy and warm-yellow portfolio design. The current site is a static design preview: one scrolling homepage for Home, Projects, Art, Skills, and Blog, plus a separate CV page. Artwork, project screenshots, and formal CV details are still being collected. Next.js remains the planned framework for the eventual application.

## Edit and check

The editable design source is `design/midnight-collaborative-review-v6.html`. Change this source first; `scripts/export-preview.cjs` generates the standalone public files and removes the in-chat editing controls.

Requirements: a current Node.js LTS release. No npm dependencies are required.

```powershell
node scripts/export-preview.cjs
node scripts/verify-preview.cjs
```

Checks cover continuous homepage sections, section links, the separate CV document and return links, carousel behavior, and local assets. They use a minimal DOM fixture; browser layout review is a separate step.

## GitHub and Vercel

The intended workflow is: edit here, run the checks, commit and push to GitHub, then let Vercel build and deploy.

The repository is [aidibekova03-droid/portfolio](https://github.com/aidibekova03-droid/portfolio), owned by Sabrina. It is connected to the existing `sabrina-portfolio` Vercel project. Keep the Vercel Root Directory at the repository root. The root `vercel.json` specifies the build command and generated public directory. Use `main` as the production branch; other branches and pull requests can have preview deployments.

Automatic production deployment was verified from a commit to `main`. The [live site](https://sabrina-portfolio-hazel.vercel.app/) has the scrolling homepage and a separate [CV](https://sabrina-portfolio-hazel.vercel.app/cv.html). Saqlain's invitation to edit and merge is pending acceptance. A direct CLI deployment alone does not establish the Git connection.

## Collaboration and content

Read `AGENTS.md` for confirmed design decisions and factual copy. Keep proposed library and visual changes labelled as proposals until reviewed. Preserve the one-page homepage and separate CV structure.

No credentials, `.env` files, local CLI sessions, or `.vercel` account metadata belong in the repository. The preview deliberately remains marked `noindex` while its placeholder content is being refined. Reference images and older exploratory designs remain local historical material.
