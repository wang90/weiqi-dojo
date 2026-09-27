# Weiqi Dojo

**[中文说明 → README.md](README.md)**

**[Live demo → https://wang90.github.io/weiqi-dojo/](https://wang90.github.io/weiqi-dojo/)**

A **pure static, zero-dependency, offline-capable** website for learning Go (Weiqi / Baduk / 囲碁 / 바둑). Open it in a browser and you can play, solve problems and replay game records — no install, no server, no build step.

Originally written for parents who are teaching their kids from scratch.

**Available in four languages:** 中文 · English · 日本語 · 한국어 — switch with the buttons in the top-right corner.

## Features

### Play (home page)
- **Play against the computer** (default) or two players; 9×9, 13×13 and 19×19 boards
- **Handicap stones**: 2–9 stones placed on the standard star points; White moves first afterwards
- **Four difficulty levels**: Beginner / Easy / Intermediate / Advanced
- **Live move review** — after every move you play, it tells you the pros and cons, for example:
  - Pros: *Captured 2 stones* / *Rescued your stone from atari* / *Took a star point*
  - Cons: *On the first line — barely encloses any territory* / **Careful! Your opponent can capture 3 of your stones next move** / *Actually E4 would capture a stone*
- **Complete rules**: captures, no suicide, ko — all implemented correctly
- **Automatic scoring**: counts the board at the end and shows the result (komi 6.5)
- **Remembers your board size** between visits (stored locally in your browser, nothing is uploaded)

### Life & Death problems
- 16 capture problems, from "one liberty" up to three-move chases
- **Interactive**: you play a move and the computer answers with White's most stubborn defence
- A built-in solver checks whether White can still escape, so wrong moves are called out immediately
- Progress is tracked; finishing all 16 shows a **"🏆 All done"** celebration and offers a fresh start

### Game records (SGF)
- **Load your own SGF files** — click to choose, or just drag the file in
- Playback: `|◀ ◀ ▶ ▶ ▶|` plus slow / mid / fast auto-play
- Clickable move list, last move marked in red on the board
- Handles variations (follows the main line), `AB`/`AW` setup stones and passes

### Beginner tutorial
- 10 illustrated chapters, 19 auto-generated board diagrams
- Starts from liberties, then capturing, connecting and cutting, eyes and life, four capturing techniques, ko, opening principles, counting
- Ends with **"10 tips for teaching kids"**

## Running locally

Just open `index.html`. **Everything works offline** — there are no network requests and no external dependencies.

If you prefer a local server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying to GitHub Pages

```bash
git init
git add .
git commit -m "Weiqi Dojo"
git branch -M main
git remote add origin https://github.com/<your-name>/<repo>.git
git push -u origin main
```

Then in the repository go to **Settings → Pages**:

- **Source**: `Deploy from a branch`
- **Branch**: `main`, folder `/ (root)`
- Save and wait about a minute

Your site will be at `https://<your-name>.github.io/<repo>/`

## Project layout

```
index.html          Play page (site entry point)
go-practice.html    Life & death problems + SGF records
go-tutorial.html    Beginner tutorial
i18n.js             Translations — build artifact, generated from i18n/
i18n/               Translation sources + build / verify scripts
test/               Regression tests
README.md           中文说明
README.en.md        This file
favicon.svg         Site icon
.nojekyll           Tells GitHub Pages to skip Jekyll
LICENSE             MIT
```

## Editing translations

| File | Contents |
|---|---|
| `i18n/core.js` | Infrastructure (translate function, DOM walker, language switcher) |
| `i18n/board.js` | Play page strings |
| `i18n/practice.js` | Problems + SGF page strings |
| `i18n/tutorial-text.py` | The tutorial's 124 translated paragraphs |
| `i18n/extra.js` | Page titles and misc strings |

After editing:

```bash
python3 i18n/build.py     # rebuild i18n.js
python3 i18n/verify.py    # list any Chinese text still untranslated
git add -A && git commit -m "update translations" && git push
```

`verify.py` replays exactly the same traversal logic as the browser code, so it reports anything that would be left untranslated. Run `node i18n/dump-keys.js` once beforehand to export the key list.

## Regression tests

```bash
node test/perf.js    # longest main-thread block while the AI thinks
node test/ai.js      # playing strength: capture / escape atari / avoid eye-filling
node test/flow.js    # full flow: move -> reply, rapid clicking, cancelling stale searches
```

## How it works

- Pure HTML + CSS + vanilla JavaScript — **single-file apps, no build step**
- The board is drawn on a Canvas and adapts to any window or phone screen
- **Playing AI**: heuristic evaluation (captures, escaping atari, connecting, line values, eyes) plus a one-move risk check, then Monte Carlo search over a shortlist to avoid blunders
- **Life & death solver**: depth-first search with memoisation and a node cap, used both to generate the problems and to judge your moves
- **i18n**: Chinese source strings are used as keys; a DOM walker replaces text nodes, attributes, and whole blocks (so translated paragraphs with inline `<b>` tags keep correct word order). A MutationObserver handles dynamically inserted text.
- All problems and game records are embedded in the pages, so there are no external resources

## License

MIT
