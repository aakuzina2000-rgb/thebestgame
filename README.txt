ROMANTIC GAME — FIRST PROTOTYPE

What is already included:
1. Secret-code login.
2. Player name.
3. Main chapter screen.
4. PART 1 — INDONESIA.
5. Placeholder story map.
6. Global "Your debt" pain-au-chocolat counter.
7. Debt saved in browser localStorage.
8. Tinder-style mini-game.
9. Swipe with mouse/finger OR buttons.
10. Three lives.
11. Losing all lives restores lives and adds +1 pain au chocolat.
12. Final Anastasia card cannot be swiped left.
13. Match screen.

HOW TO RUN

Option A — easiest:
Open index.html in Chrome/Safari.

Option B — recommended in VS Code:
1. Install VS Code.
2. Open this folder.
3. Install the extension "Live Server".
4. Right-click index.html.
5. Choose "Open with Live Server".

Prototype access code:
indonesia

IMPORTANT FILES
index.html — screens / structure.
style.css — design.
game.js — all game logic and profiles.

WHERE TO CHANGE THE ACCESS CODE
Open game.js and change:

const ACCESS_CODE = "indonesia";

WHERE TO EDIT TINDER CHARACTERS
Open game.js and find:

const profiles = [...]

Each profile contains:
name
age
emoji
bio
meta
like reaction
nope reaction

NEXT ITERATION
Replace emoji with real/generated character images.
Add welcome screen.
Add real map artwork.
Add Part indicators and completion stars.
Add chat mini-game after Anastasia match.


VERSION 2 — 2000s RPG LOOK
- Low-resolution illustrated profile portraits instead of emoji.
- Pixel-style pain au chocolat asset.
- More geographic Eurasia / Indonesia map.
- Old PC/RPG frames, panels and texture treatment.

RECOMMENDED WEB INFRASTRUCTURE
GitHub repository + Vercel.

Workflow:
1. Create a GitHub account if you do not have one.
2. Create a new PRIVATE repository, e.g. our-game.
3. Upload index.html, style.css, game.js and the assets folder.
4. Create/sign in to Vercel.
5. Import the GitHub repository.
6. Deploy it as a static site.
7. Vercel gives you a URL.
8. Every future change pushed to GitHub automatically updates that URL.

NOTE:
The current password check is frontend-only. It is good enough for a surprise link, but anyone technical can inspect the JavaScript and find the code. Later, if you want actual authentication, move the access check to a small backend/serverless function.


VERSION 3 CHANGES
- Persistent structured save profile in localStorage.
- Saves completed mini-games, attempts, best lives, unlocks and pain-au-chocolat debt.
- Closing/reloading the browser does not reset progress.
- Tinder completion is remembered.
- Main Part 1 card shows completion count.
- Brighter/colorful overall RPG palette.
- Tinder section uses a white + pink/orange dating-app palette.
- Slightly larger typography.

CURRENT LIMITATION
The save is currently per browser/device. It survives refreshes and closing the browser, but a different device starts a new save. Once hosting is working, cloud save can be added with Supabase so the same player state follows the login across devices.
