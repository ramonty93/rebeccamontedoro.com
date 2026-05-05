# rebecca montedoro — portfolio

## files
- `index.html` — page structure (edit this to change the artist statement)
- `styles.css` — all styling
- `script.js` — lightbox + drag-to-reposition + cursor behavior
- `favicon.svg` — browser tab icon (🖼️)
- `images/01.png` … `12.png` — placeholder black PNGs (replace with real artwork)

## editing the artist statement
Open `index.html` and find the `<aside class="statement">` block near the top.
Edit the text inside the `<p>` tags. Multiple paragraphs are separated by
adjacent `<p>...</p>` blocks.

## behavior
- **click** an image → opens lightbox (image fills screen, title + date in bottom-right, ✕ top-right; click outside the image, click ✕, or press Esc to close)
- **click and drag** an image (mouse only) → repositions it on the page; position is saved to your browser
- 5px threshold separates a click from a drag — small accidental movements still open the lightbox
- positions persist across page reloads via `localStorage`

### resetting drag positions
If you've moved images around and want to restore the original scattered layout:
1. Open the browser dev console (F12 → Console)
2. Run: `localStorage.removeItem('rm-portfolio-positions'); location.reload();`

## replacing artwork
Drop new files into `/images/` using the same filenames (`01.png` through `12.png`).

### aspect ratios are flexible
Images do **not** have to match the placeholder's orientation. A vertical
placeholder can be replaced with a horizontal painting (or vice versa).
The layout uses `width: 100%; height: auto`, so each image fills its allotted
width and the height adapts to preserve the original aspect ratio.

### what to watch for when swapping
1. **`--w` controls how big each piece looks.** If you replace a vertical
   placeholder with a wide horizontal painting at the same `--w`, the image
   will render very tall on the page. Reduce `--w` for that slot
   (e.g. `--w: 30vw` → `--w: 20vw`) to bring it back into proportion.

2. **`--top` values may need re-tuning.** The scattered positions were chosen
   assuming the current mix of aspect ratios. If you swap several verticals
   for horizontals (or vice versa), some images may overlap or leave large
   empty gaps. Adjust `--top` values to re-space them.

3. **File formats:** PNG, JPG, and WebP all work. Keep file sizes under
   ~500kb each for fast loading. WebP is the best choice for photos of
   paintings.

### recommended workflow
1. Drop real artwork in as `01.png` through `12.png`
2. View the page in the browser
3. For any pieces that feel too big, too small, or too close to neighbors,
   tweak the `--w` and `--top` values inline in `index.html` and refresh

To rename, change the title, or add more works, edit the `<button class="work">`
blocks in `index.html`. Each one accepts:

```html
<button type="button" class="work" data-title="Untitled 7" data-date="2023"
        style="--left: 22vw; --top: 305vh; --w: 32vw;">
```

- `--left`: horizontal position (vw units)
- `--top`: vertical position (vh units)
- `--w`: image width (vw units)
- `data-title` / `data-date`: shown in lightbox bottom-right caption

## run locally
```
python3 -m http.server 8000
```
Then open `http://localhost:8000` in a browser.
