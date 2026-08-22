# The Recipe Box

A small, static recipe website. No database, no build step — just HTML, CSS, and one JSON file.

```
recipe-site/
├── index.html                       the homepage (grid of recipe cards)
├── recipe.html                       the detail page template (reads ?id=... from the URL)
├── add-recipe.html                   a form that generates a new recipe file for you
├── styles.css                         all styling
├── script.js                           loads the manifest + recipe files and renders the pages
├── data/
│   ├── manifest.json                list of recipe ids to load, in order
│   └── recipes/
│       └── gammeldags-aeblekage.json  one file per recipe
└── images/
    └── aeblekage.jpg                 photos referenced by recipe files
```

Each recipe is its own file under `data/recipes/`, so recipes can be added, edited, or
removed independently without touching a shared file. `data/manifest.json` is just a plain
list of ids that tells the site which files to load — order in the list is the order recipes
appear on the homepage.

## Try it locally

Because the pages fetch files from `data/`, opening `index.html` directly from
disk (`file://...`) will be blocked by the browser. Run a tiny local server instead:

```bash
cd recipe-site
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Deploy it for free

### Option A — GitHub Pages (recommended, no command line needed after setup)

1. Create a new **public** repository on [github.com](https://github.com) (e.g. `recipe-box`).
2. Upload this whole `recipe-site` folder's contents into the repo (drag-and-drop on the
   "Add file → Upload files" page works fine).
3. In the repo, go to **Settings → Pages**.
4. Under "Build and deployment", set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`.
5. Save. After a minute your site is live at `https://<your-username>.github.io/recipe-box/`.

### Option B — Netlify

1. Go to [app.netlify.com](https://app.netlify.com) and sign in.
2. Drag the `recipe-site` folder straight onto the "Sites" page (the "Deploy manually" drop zone).
3. Netlify gives you a live URL immediately. You can rename it or attach your own domain
   under Site settings.

Both options are free for a personal site like this one.

## Adding a new recipe

There's no backend, so "uploading" a recipe means adding one new file under
`data/recipes/`, listing its id in `data/manifest.json`, and (optionally) a photo to
`images/`. Two ways to do it:

**Easiest — use the built-in form:**
1. Open `add-recipe.html` on your live site (there's a "+ Add a recipe" button on the homepage).
2. Fill in the fields, adding one "section" per stage of the recipe (e.g. "Apple Compote",
   "Assembly") with ingredients and steps typed one per line.
3. Click **Generate JSON**. You'll get three things: a filename (e.g.
   `data/recipes/my-dish.json`), the file's contents, and one id to add to the manifest.
4. On GitHub.com: create the new file at that path with that content, then open
   `data/manifest.json`, add the id to the list, and commit both. GitHub Pages rebuilds
   automatically within a minute.

**If you're comfortable editing JSON directly:** copy an existing file in
`data/recipes/` as a template, fill in your own values, save it as
`data/recipes/your-recipe-id.json`, and add `"your-recipe-id"` to `data/manifest.json`.

### Removing or reordering recipes

Delete a recipe by removing its file from `data/recipes/` and its id from
`data/manifest.json`. Reorder the homepage by reordering the ids in `data/manifest.json`.

### Adding a photo

Drop the image file into the `images/` folder (upload it on GitHub.com the same way), then
reference it as `images/your-file.jpg` in the recipe's `image` field.

## Converting an existing recipe PDF

There isn't a one-click "PDF → recipe card" converter here — PDFs are laid out for print,
not for a responsive webpage, so the layout wouldn't translate cleanly. The fast path is to
open the PDF, and copy the title, ingredients, and steps into the `add-recipe.html` form —
that usually takes a couple of minutes per recipe and gives a much better-looking result than
an automated conversion would.

## Customizing the look

Colors, fonts, and spacing all live in `styles.css` under the `:root` block at the top
(`--rust`, `--sage`, `--walnut`, etc). Change a value there and it updates everywhere.
