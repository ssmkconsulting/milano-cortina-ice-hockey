# Milano Cortina 2026 Ice Hockey Classic

Web-based Olympic-style hockey tournament + live playable match mode.

## Tournament Rules

- Choose division first: `Men's` or `Women's`.
- Pick your national team.
- Group standings use Olympic points:
- `Regulation win = 3`
- `OT/SO win = 2`
- `OT/SO loss = 1`
- `Regulation loss = 0`
- Tiebreakers: points, goal difference, goals scored, head-to-head, then seeding/draw.

### Men

- 12 teams in 3 groups.
- Group stage: each team plays 3 games.
- Group winners + best second-place team go directly to quarterfinals.
- Seeds `5-12` play qualification (`5v12`, `6v11`, `7v10`, `8v9`).
- Then quarterfinals, semifinals, bronze, gold.

### Women

- Group A and Group B format.
- Group stage: round-robin within group.
- All Group A teams + top 3 from Group B advance.
- Then quarterfinals, semifinals, bronze, gold.

## How To Play (Live Match)

- Objective: score by putting the puck in the opponent net.
- Current on-ice setup: `1 forward + 1 goalie` per team.
- Controls:
- Move: `Arrow keys` or `Mouse/Trackpad`
- Shoot hard: `Space`
- Body check: `Shift`
- Score is shown at the top during play.
- Goal effects include goal light + horn.
- At final buzzer, ice greys out and final score is shown for 10 seconds before returning to tournament view.

## Run Locally

No build step or dependencies are required.

1. Open a terminal in this folder.
2. Start a local static server (recommended):
3. `python3 -m http.server 8080`
4. Open `http://localhost:8080` in your browser.

You can also open `index.html` directly, but using a local server is preferred.
