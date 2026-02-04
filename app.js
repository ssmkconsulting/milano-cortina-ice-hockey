const TOURNAMENTS = {
  men: {
    key: "men",
    title: "Men's Ice Hockey",
    groups: ["A", "B", "C"],
    progression: "men",
    teams: [
      { name: "Canada", group: "A", rating: 94 },
      { name: "Czechia", group: "A", rating: 88 },
      { name: "Switzerland", group: "A", rating: 86 },
      { name: "France", group: "A", rating: 78 },
      { name: "Sweden", group: "B", rating: 92 },
      { name: "Finland", group: "B", rating: 91 },
      { name: "Slovakia", group: "B", rating: 84 },
      { name: "Italy", group: "B", rating: 79 },
      { name: "United States", group: "C", rating: 93 },
      { name: "Germany", group: "C", rating: 87 },
      { name: "Latvia", group: "C", rating: 82 },
      { name: "Denmark", group: "C", rating: 81 }
    ],
    groupStageRounds: [
      [
        ["Canada", "Czechia", "A"],
        ["Finland", "Sweden", "B"],
        ["United States", "Germany", "C"]
      ],
      [
        ["Canada", "Switzerland", "A"],
        ["Finland", "Slovakia", "B"],
        ["United States", "Latvia", "C"]
      ],
      [
        ["Canada", "France", "A"],
        ["Finland", "Italy", "B"],
        ["United States", "Denmark", "C"]
      ],
      [
        ["Czechia", "Switzerland", "A"],
        ["Sweden", "Slovakia", "B"],
        ["Germany", "Latvia", "C"]
      ],
      [
        ["Czechia", "France", "A"],
        ["Sweden", "Italy", "B"],
        ["Germany", "Denmark", "C"]
      ],
      [
        ["Switzerland", "France", "A"],
        ["Slovakia", "Italy", "B"],
        ["Latvia", "Denmark", "C"]
      ]
    ],
    rules: [
      "Group stage: 3 games per team, 3-2-1-0 points, overtime and shootout.",
      "Top 4 (3 group winners + best second) to quarterfinals, seeds 5-12 play qualification.",
      "Knockout: qualification -> quarterfinals -> semifinals -> bronze and gold medal games."
    ]
  },
  women: {
    key: "women",
    title: "Women's Ice Hockey",
    groups: ["A", "B"],
    progression: "women",
    teams: [
      { name: "Canada", group: "A", rating: 95 },
      { name: "United States", group: "A", rating: 94 },
      { name: "Finland", group: "A", rating: 88 },
      { name: "Czechia", group: "A", rating: 84 },
      { name: "Switzerland", group: "A", rating: 83 },
      { name: "Japan", group: "B", rating: 82 },
      { name: "Sweden", group: "B", rating: 84 },
      { name: "Germany", group: "B", rating: 83 },
      { name: "Italy", group: "B", rating: 77 },
      { name: "France", group: "B", rating: 78 }
    ],
    groupStageRounds: [
      [
        ["United States", "Switzerland", "A"],
        ["Finland", "Czechia", "A"],
        ["Sweden", "France", "B"],
        ["Germany", "Italy", "B"]
      ],
      [
        ["Canada", "Switzerland", "A"],
        ["United States", "Finland", "A"],
        ["Japan", "France", "B"],
        ["Sweden", "Germany", "B"]
      ],
      [
        ["Canada", "Czechia", "A"],
        ["Switzerland", "Finland", "A"],
        ["Japan", "Italy", "B"],
        ["France", "Germany", "B"]
      ],
      [
        ["Canada", "Finland", "A"],
        ["Czechia", "United States", "A"],
        ["Japan", "Germany", "B"],
        ["Italy", "Sweden", "B"]
      ],
      [
        ["Canada", "United States", "A"],
        ["Czechia", "Switzerland", "A"],
        ["Japan", "Sweden", "B"],
        ["Italy", "France", "B"]
      ]
    ],
    rules: [
      "Group stage: each team plays the other teams in its group (4 games each), 3-2-1-0 points.",
      "All Group A teams and top 3 from Group B advance to quarterfinals.",
      "Quarterfinals -> semifinals -> bronze and gold medal games."
    ]
  }
};

const STAGE_LABELS = {
  group: "Group Stage",
  qualification: "Qualification Round",
  quarterfinal: "Quarterfinals",
  semifinal: "Semifinals",
  bronze: "Bronze Medal Game",
  gold: "Gold Medal Game"
};

const dom = {
  menModeBtn: document.getElementById("menModeBtn"),
  womenModeBtn: document.getElementById("womenModeBtn"),
  teamGroups: document.getElementById("teamGroups"),
  selectedTeamChip: document.getElementById("selectedTeamChip"),
  rulesBody: document.getElementById("rulesBody"),
  startBtn: document.getElementById("startBtn"),
  resetBtn: document.getElementById("resetBtn"),
  playBtn: document.getElementById("playBtn"),
  simBtn: document.getElementById("simBtn"),
  phaseChip: document.getElementById("phaseChip"),
  currentMatchCard: document.getElementById("currentMatchCard"),
  eventLog: document.getElementById("eventLog"),
  standingsTables: document.getElementById("standingsTables"),
  bracketView: document.getElementById("bracketView"),
  championChip: document.getElementById("championChip"),
  gameModal: document.getElementById("gameModal"),
  gameTitle: document.getElementById("gameTitle"),
  gameClock: document.getElementById("gameClock"),
  gameScore: document.getElementById("gameScore"),
  rinkCanvas: document.getElementById("rinkCanvas")
};

const state = {
  tournamentKey: null,
  selectedTeam: null,
  started: false,
  phase: "not_started",
  pendingMatches: [],
  completedMatches: [],
  champion: null,
  medals: { gold: null, silver: null, bronze: null },
  userEliminated: false,
  directQuarterSeeds: [],
  bracket: {
    qualification: [],
    quarterfinal: [],
    semifinal: [],
    bronze: [],
    gold: []
  }
};

let matchIdCounter = 1;

function init() {
  renderModeSelector();
  updateRulesCard();
  renderTeamSelector();
  bindEvents();
  renderStandings();
  renderCurrentMatch();
}

function bindEvents() {
  dom.menModeBtn.addEventListener("click", () => selectTournament("men"));
  dom.womenModeBtn.addEventListener("click", () => selectTournament("women"));
  dom.startBtn.addEventListener("click", startTournament);
  dom.resetBtn.addEventListener("click", resetTournament);
  dom.playBtn.addEventListener("click", () => playNextMatch(false));
  dom.simBtn.addEventListener("click", () => playNextMatch(true));
}

function getCurrentTournament() {
  return state.tournamentKey ? TOURNAMENTS[state.tournamentKey] : null;
}

function renderModeSelector() {
  const activeKey = state.tournamentKey;
  dom.menModeBtn.classList.toggle("active", activeKey === "men");
  dom.womenModeBtn.classList.toggle("active", activeKey === "women");
}

function updateRulesCard() {
  const tournament = getCurrentTournament();
  if (!tournament) {
    dom.rulesBody.innerHTML = "<p>Select men's or women's first, then choose your team.</p>";
    return;
  }

  dom.rulesBody.innerHTML = tournament.rules.map((line) => `<p>${line}</p>`).join("");
}

function clearTournamentProgress() {
  state.started = false;
  state.phase = "not_started";
  state.pendingMatches = [];
  state.completedMatches = [];
  state.champion = null;
  state.medals = { gold: null, silver: null, bronze: null };
  state.userEliminated = false;
  state.directQuarterSeeds = [];
  state.bracket = { qualification: [], quarterfinal: [], semifinal: [], bronze: [], gold: [] };
  matchIdCounter = 1;

  dom.phaseChip.textContent = "Waiting";
  dom.championChip.textContent = "Medals: Gold TBD | Silver TBD | Bronze TBD";
  dom.playBtn.disabled = true;
  dom.simBtn.disabled = true;
}

function updateMedalChip() {
  const medals = state.medals || {};
  const gold = medals.gold ? formatTeamName(medals.gold) : "TBD";
  const silver = medals.silver ? formatTeamName(medals.silver) : "TBD";
  const bronze = medals.bronze ? formatTeamName(medals.bronze) : "TBD";
  dom.championChip.textContent = `Medals: Gold ${gold} | Silver ${silver} | Bronze ${bronze}`;
}

function selectTournament(key) {
  if (!TOURNAMENTS[key]) {
    return;
  }

  state.tournamentKey = key;
  state.selectedTeam = null;
  dom.selectedTeamChip.textContent = "No team selected";
  dom.startBtn.disabled = true;
  dom.eventLog.innerHTML = "";

  clearTournamentProgress();
  renderModeSelector();
  updateRulesCard();
  renderTeamSelector();
  renderStandings();
  renderCurrentMatch();
  renderBracket();

  addLog(`${getCurrentTournament().title} selected. Pick your team.`);
}

function renderTeamSelector() {
  const tournament = getCurrentTournament();
  dom.teamGroups.innerHTML = "";

  if (!tournament) {
    dom.teamGroups.innerHTML = "<p class=\"no-mode\">Select Men's or Women's to unlock teams.</p>";
    dom.startBtn.disabled = true;
    return;
  }

  tournament.groups.forEach((group) => {
    const block = document.createElement("section");
    block.className = "group-block";
    const title = document.createElement("h4");
    title.textContent = `Group ${group}`;
    block.appendChild(title);

    const list = document.createElement("div");
    list.className = "group-teams";

    tournament.teams.filter((team) => team.group === group).forEach((team) => {
      const btn = document.createElement("button");
      btn.className = "team-btn";
      btn.type = "button";
      btn.textContent = formatTeamName(team.name);
      btn.addEventListener("click", () => selectTeam(team.name));
      if (state.selectedTeam === team.name) {
        btn.classList.add("active");
      }
      list.appendChild(btn);
    });

    block.appendChild(list);
    dom.teamGroups.appendChild(block);
  });

  dom.startBtn.disabled = !state.selectedTeam;
}

function selectTeam(teamName) {
  if (!getCurrentTournament()) {
    return;
  }
  state.selectedTeam = teamName;
  dom.selectedTeamChip.textContent = formatTeamName(teamName);
  dom.startBtn.disabled = false;
  renderTeamSelector();
}

function resetTournament() {
  state.selectedTeam = null;
  dom.selectedTeamChip.textContent = "No team selected";
  dom.startBtn.disabled = true;
  dom.eventLog.innerHTML = "";
  clearTournamentProgress();
  renderTeamSelector();
  renderModeSelector();
  updateRulesCard();

  if (getCurrentTournament()) {
    addLog("Tournament reset. Select your team to begin.");
  } else {
    addLog("Select Men's or Women's tournament first.");
  }
  renderCurrentMatch();
  renderStandings();
  renderBracket();
}

function startTournament() {
  const tournament = getCurrentTournament();
  if (!tournament || !state.selectedTeam) {
    return;
  }

  clearTournamentProgress();
  state.started = true;
  state.phase = "group";
  state.pendingMatches = buildGroupSchedule();
  dom.eventLog.innerHTML = "";
  addLog(`You selected ${state.selectedTeam}. ${tournament.title} official group schedule loaded.`);

  runAutoUntilUserMatch();
  refreshUI();
}

function buildGroupSchedule() {
  const tournament = getCurrentTournament();
  if (!tournament) {
    return [];
  }

  const matches = [];
  tournament.groupStageRounds.forEach((round, roundIdx) => {
    round.forEach(([home, away, group]) => {
      matches.push(createMatch("group", home, away, { group, round: roundIdx + 1 }));
    });
  });
  return matches;
}

function createMatch(stage, home, away, meta = {}) {
  return {
    id: matchIdCounter++,
    stage,
    home,
    away,
    ...meta
  };
}

function playNextMatch(forceSimulation) {
  if (!state.started || !state.pendingMatches.length) {
    return;
  }

  const next = state.pendingMatches[0];
  const userInMatch = isUserMatch(next);

  if (userInMatch && !forceSimulation && !state.userEliminated) {
    launchUserMatch(next);
    return;
  }

  const result = simulateMatch(next);
  commitMatchResult(next, result);

  runAutoUntilUserMatch();
  refreshUI();
}

function runAutoUntilUserMatch() {
  if (!state.started) {
    return;
  }

  while (state.started) {
    if (!state.pendingMatches.length) {
      const moved = advancePhase();
      if (!moved) {
        break;
      }
      continue;
    }

    const next = state.pendingMatches[0];
    if (isUserMatch(next) && !state.userEliminated) {
      break;
    }

    const result = simulateMatch(next);
    commitMatchResult(next, result);
  }
}

function isUserMatch(match) {
  return match.home === state.selectedTeam || match.away === state.selectedTeam;
}

function advancePhase() {
  const tournament = getCurrentTournament();
  if (!tournament) {
    return false;
  }

  if (state.phase === "group") {
    if (tournament.progression === "men") {
      buildQualificationBracket();
      state.phase = "qualification";
      state.pendingMatches = [...state.bracket.qualification];
      addLog("Group stage complete. Qualification round matchups are set.");
      return true;
    }

    buildWomenQuarterfinals();
    state.phase = "quarterfinal";
    state.pendingMatches = [...state.bracket.quarterfinal];
    addLog("Group stage complete. Quarterfinal matchups are set.");
    return true;
  }

  if (state.phase === "qualification") {
    buildQuarterfinals();
    state.phase = "quarterfinal";
    state.pendingMatches = [...state.bracket.quarterfinal];
    addLog("Qualification complete. Quarterfinals ready.");
    return true;
  }

  if (state.phase === "quarterfinal") {
    buildSemifinals();
    state.phase = "semifinal";
    state.pendingMatches = [...state.bracket.semifinal];
    addLog("Quarterfinals complete. Semifinals locked.");
    return true;
  }

  if (state.phase === "semifinal") {
    buildMedalGames();
    state.phase = "medals";
    state.pendingMatches = [...state.bracket.bronze, ...state.bracket.gold];
    addLog("Medal games are set: bronze and gold.");
    return true;
  }

  if (state.phase === "medals") {
    state.phase = "complete";
    state.pendingMatches = [];
    const goldResult = state.completedMatches.find((m) => m.stage === "gold");
    const bronzeResult = state.completedMatches.find((m) => m.stage === "bronze");
    state.champion = goldResult ? goldResult.winner : null;
    state.medals = {
      gold: goldResult ? goldResult.winner : null,
      silver: goldResult ? goldResult.loser : null,
      bronze: bronzeResult ? bronzeResult.winner : null
    };
    if (state.champion && state.medals.silver && state.medals.bronze) {
      updateMedalChip();
      addLog(
        `Tournament complete. Gold: ${state.medals.gold}, Silver: ${state.medals.silver}, Bronze: ${state.medals.bronze}.`
      );
    } else if (state.champion) {
      updateMedalChip();
      addLog(`Tournament complete. ${state.champion} wins Olympic gold.`);
    }
    return false;
  }

  return false;
}

function commitMatchResult(match, result) {
  state.pendingMatches.shift();

  const completed = {
    id: match.id,
    stage: match.stage,
    group: match.group,
    round: match.round,
    home: match.home,
    away: match.away,
    seedHome: match.seedHome,
    seedAway: match.seedAway,
    homeScore: result.homeScore,
    awayScore: result.awayScore,
    countedHomeGoals: result.countedHomeGoals,
    countedAwayGoals: result.countedAwayGoals,
    winner: result.winner,
    loser: result.loser,
    wentOvertime: result.wentOvertime,
    decidedByShootout: result.decidedByShootout,
    summary: result.summary,
    winnerSeed: result.winnerSeed,
    loserSeed: result.loserSeed
  };

  if (!completed.winnerSeed && match.seedHome && completed.winner === match.home) {
    completed.winnerSeed = match.seedHome;
  }

  if (!completed.winnerSeed && match.seedAway && completed.winner === match.away) {
    completed.winnerSeed = match.seedAway;
  }

  if (!completed.loserSeed && match.seedHome && completed.loser === match.home) {
    completed.loserSeed = match.seedHome;
  }

  if (!completed.loserSeed && match.seedAway && completed.loser === match.away) {
    completed.loserSeed = match.seedAway;
  }

  state.completedMatches.push(completed);

  if (isUserMatch(match)) {
    if (completed.winner === state.selectedTeam) {
      addLog(`You won: ${completed.summary}`);
    } else {
      addLog(`You lost: ${completed.summary}`);
      if (match.stage !== "group") {
        state.userEliminated = true;
        addLog("You are eliminated, but the tournament will continue.");
      }
    }
  } else {
    addLog(completed.summary);
  }

  renderStandings();
  renderBracket();
}

function launchUserMatch(match) {
  dom.playBtn.disabled = true;
  dom.simBtn.disabled = true;

  runArcadeMatch(match)
    .then((baseScore) => {
      const result = finalizeMatch(match, baseScore.homeScore, baseScore.awayScore, true);
      commitMatchResult(match, result);
      runAutoUntilUserMatch();
      refreshUI();
    })
    .catch(() => {
      const fallback = simulateMatch(match);
      commitMatchResult(match, fallback);
      runAutoUntilUserMatch();
      refreshUI();
    });
}

function simulateMatch(match) {
  const home = getTeam(match.home);
  const away = getTeam(match.away);

  const lambdaHome = clamp(2.1 + (home.rating - away.rating) * 0.03, 1.05, 4.6);
  const lambdaAway = clamp(2.1 + (away.rating - home.rating) * 0.03, 1.05, 4.6);

  const homeGoals = poisson(lambdaHome);
  const awayGoals = poisson(lambdaAway);

  return finalizeMatch(match, homeGoals, awayGoals, false);
}

function finalizeMatch(match, homeGoals, awayGoals, userPlayed) {
  const home = getTeam(match.home);
  const away = getTeam(match.away);

  if (homeGoals !== awayGoals) {
    const winner = homeGoals > awayGoals ? home.name : away.name;
    const loser = winner === home.name ? away.name : home.name;

    return {
      homeScore: homeGoals,
      awayScore: awayGoals,
      countedHomeGoals: homeGoals,
      countedAwayGoals: awayGoals,
      winner,
      loser,
      wentOvertime: false,
      decidedByShootout: false,
      summary: `${STAGE_LABELS[match.stage]}: ${match.home} ${homeGoals}-${awayGoals} ${match.away}`
    };
  }

  return resolveTie(match, home, away, homeGoals, awayGoals, userPlayed);
}

function resolveTie(match, home, away, baseHomeGoals, baseAwayGoals, userPlayed) {
  const homeWinProb = ratingWinProbability(home.rating, away.rating);
  let winner = Math.random() < homeWinProb ? home.name : away.name;

  let decidedByShootout = false;
  let wentOvertime = true;
  let displayHomeGoals = baseHomeGoals;
  let displayAwayGoals = baseAwayGoals;

  if (match.stage === "gold") {
    const otPeriods = 1 + Math.floor(Math.random() * 3);
    if (winner === home.name) {
      displayHomeGoals += 1;
    } else {
      displayAwayGoals += 1;
    }

    const loser = winner === home.name ? away.name : home.name;
    return {
      homeScore: displayHomeGoals,
      awayScore: displayAwayGoals,
      countedHomeGoals: displayHomeGoals,
      countedAwayGoals: displayAwayGoals,
      winner,
      loser,
      wentOvertime,
      decidedByShootout: false,
      summary: `${STAGE_LABELS[match.stage]}: ${match.home} ${displayHomeGoals}-${displayAwayGoals} ${match.away} (OT${otPeriods})`
    };
  }

  const shootoutThreshold = match.stage === "group" ? 0.42 : 0.3;
  decidedByShootout = Math.random() < shootoutThreshold;

  if (!decidedByShootout) {
    if (winner === home.name) {
      displayHomeGoals += 1;
    } else {
      displayAwayGoals += 1;
    }
  } else if (userPlayed) {
    const bias = Math.random();
    if (bias > 0.96) {
      winner = winner === home.name ? away.name : home.name;
    }
  }

  const loser = winner === home.name ? away.name : home.name;
  const suffix = decidedByShootout ? "SO" : "OT";

  return {
    homeScore: displayHomeGoals,
    awayScore: displayAwayGoals,
    countedHomeGoals: displayHomeGoals,
    countedAwayGoals: displayAwayGoals,
    winner,
    loser,
    wentOvertime,
    decidedByShootout,
    summary: `${STAGE_LABELS[match.stage]}: ${match.home} ${displayHomeGoals}-${displayAwayGoals} ${match.away} (${suffix})`
  };
}

function buildQualificationBracket() {
  const tournament = getCurrentTournament();
  if (!tournament) {
    return;
  }

  const tables = getGroupedStandings();
  const groupWinners = tournament.groups.map((g) => tables[g][0].team);
  const secondPlace = tournament.groups.map((g) => tables[g][1]);
  secondPlace.sort(compareOverallRows);

  const bestSecond = secondPlace[0].team;
  const directSet = new Set([...groupWinners, bestSecond]);

  const overall = getOverallRanking();

  state.directQuarterSeeds = overall
    .filter((row) => directSet.has(row.team))
    .sort(compareOverallRows)
    .map((row, idx) => ({ team: row.team, seed: idx + 1 }));

  const remaining = overall
    .filter((row) => !directSet.has(row.team))
    .sort(compareOverallRows)
    .map((row, idx) => ({ team: row.team, seed: idx + 5 }));

  const pickBySeed = (seed) => remaining.find((r) => r.seed === seed).team;

  state.bracket.qualification = [
    createMatch("qualification", pickBySeed(5), pickBySeed(12), { seedHome: 5, seedAway: 12 }),
    createMatch("qualification", pickBySeed(6), pickBySeed(11), { seedHome: 6, seedAway: 11 }),
    createMatch("qualification", pickBySeed(7), pickBySeed(10), { seedHome: 7, seedAway: 10 }),
    createMatch("qualification", pickBySeed(8), pickBySeed(9), { seedHome: 8, seedAway: 9 })
  ];
}

function buildWomenQuarterfinals() {
  const tables = getGroupedStandings();
  const groupA = tables.A ? [...tables.A] : [];
  const groupB = tables.B ? [...tables.B] : [];
  const qualifiers = [...groupA, ...groupB.slice(0, 3)];
  qualifiers.sort(compareOverallRows);

  state.directQuarterSeeds = qualifiers.map((row, idx) => ({ team: row.team, seed: idx + 1 }));
  const bySeed = new Map(state.directQuarterSeeds.map((item) => [item.seed, item.team]));

  state.bracket.quarterfinal = [
    createMatch("quarterfinal", bySeed.get(1), bySeed.get(8), { seedHome: 1, seedAway: 8 }),
    createMatch("quarterfinal", bySeed.get(2), bySeed.get(7), { seedHome: 2, seedAway: 7 }),
    createMatch("quarterfinal", bySeed.get(3), bySeed.get(6), { seedHome: 3, seedAway: 6 }),
    createMatch("quarterfinal", bySeed.get(4), bySeed.get(5), { seedHome: 4, seedAway: 5 })
  ];

  const eliminated = groupB.slice(3).map((row) => row.team);
  if (eliminated.includes(state.selectedTeam)) {
    state.userEliminated = true;
    addLog("Your team did not reach quarterfinals and is eliminated after group stage.");
  }
}

function buildQuarterfinals() {
  const qualResults = state.completedMatches
    .filter((m) => m.stage === "qualification")
    .map((m) => ({ team: m.winner, seed: m.winnerSeed }));

  qualResults.sort((a, b) => b.seed - a.seed);

  const direct = [...state.directQuarterSeeds].sort((a, b) => a.seed - b.seed);

  state.bracket.quarterfinal = direct.map((directSeed) => {
    const opponent = qualResults.shift();
    return createMatch("quarterfinal", directSeed.team, opponent.team, {
      seedHome: directSeed.seed,
      seedAway: opponent.seed
    });
  });
}

function buildSemifinals() {
  const winners = state.completedMatches
    .filter((m) => m.stage === "quarterfinal")
    .map((m) => ({ team: m.winner, seed: m.winnerSeed }));

  winners.sort((a, b) => a.seed - b.seed);
  const best = winners[0];
  const worst = winners[winners.length - 1];
  const middle = winners.slice(1, winners.length - 1);

  state.bracket.semifinal = [
    createMatch("semifinal", best.team, worst.team, { seedHome: best.seed, seedAway: worst.seed }),
    createMatch("semifinal", middle[0].team, middle[1].team, { seedHome: middle[0].seed, seedAway: middle[1].seed })
  ];
}

function buildMedalGames() {
  const semifinals = state.completedMatches.filter((m) => m.stage === "semifinal");
  const winners = semifinals.map((m) => ({ team: m.winner, seed: m.winnerSeed })).sort((a, b) => a.seed - b.seed);
  const losers = semifinals.map((m) => ({ team: m.loser, seed: m.loserSeed })).sort((a, b) => a.seed - b.seed);

  state.bracket.bronze = [
    createMatch("bronze", losers[0].team, losers[1].team, { seedHome: losers[0].seed, seedAway: losers[1].seed })
  ];

  state.bracket.gold = [
    createMatch("gold", winners[0].team, winners[1].team, { seedHome: winners[0].seed, seedAway: winners[1].seed })
  ];
}

function getGroupedStandings() {
  const tournament = getCurrentTournament();
  const map = {};
  if (!tournament) {
    return map;
  }

  tournament.groups.forEach((group) => {
    map[group] = tournament.teams.filter((t) => t.group === group).map((team) => ({
      team: team.name,
      group,
      gp: 0,
      w: 0,
      otw: 0,
      otl: 0,
      l: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      pts: 0
    }));
  });

  const byTeam = new Map();
  Object.values(map).flat().forEach((row) => byTeam.set(row.team, row));

  state.completedMatches
    .filter((match) => match.stage === "group")
    .forEach((match) => {
      const home = byTeam.get(match.home);
      const away = byTeam.get(match.away);

      home.gp += 1;
      away.gp += 1;

      home.gf += match.countedHomeGoals;
      home.ga += match.countedAwayGoals;
      away.gf += match.countedAwayGoals;
      away.ga += match.countedHomeGoals;

      if (!match.wentOvertime) {
        if (match.winner === match.home) {
          home.w += 1;
          home.pts += 3;
          away.l += 1;
        } else {
          away.w += 1;
          away.pts += 3;
          home.l += 1;
        }
      } else {
        if (match.winner === match.home) {
          home.otw += 1;
          home.pts += 2;
          away.otl += 1;
          away.pts += 1;
        } else {
          away.otw += 1;
          away.pts += 2;
          home.otl += 1;
          home.pts += 1;
        }
      }
    });

  tournament.groups.forEach((group) => {
    map[group].forEach((row) => {
      row.gd = row.gf - row.ga;
    });

    map[group].sort((a, b) => compareGroupRows(a, b, group));
  });

  return map;
}

function compareGroupRows(a, b, group) {
  if (b.pts !== a.pts) {
    return b.pts - a.pts;
  }

  if (b.gd !== a.gd) {
    return b.gd - a.gd;
  }

  if (b.gf !== a.gf) {
    return b.gf - a.gf;
  }

  const head = headToHeadEdge(a.team, b.team, group);
  if (head !== 0) {
    return head;
  }

  return a.team.localeCompare(b.team);
}

function compareOverallRows(a, b) {
  if (b.pts !== a.pts) {
    return b.pts - a.pts;
  }

  if (b.gd !== a.gd) {
    return b.gd - a.gd;
  }

  if (b.gf !== a.gf) {
    return b.gf - a.gf;
  }

  if (a.group === b.group) {
    const head = headToHeadEdge(a.team, b.team, a.group);
    if (head !== 0) {
      return head;
    }
  }

  return a.team.localeCompare(b.team);
}

function headToHeadEdge(teamA, teamB, group) {
  const games = state.completedMatches.filter(
    (m) =>
      m.stage === "group" &&
      m.group === group &&
      ((m.home === teamA && m.away === teamB) || (m.home === teamB && m.away === teamA))
  );

  if (!games.length) {
    return 0;
  }

  let ptsA = 0;
  let ptsB = 0;
  let gdA = 0;
  let gfA = 0;

  games.forEach((m) => {
    const teamAHome = m.home === teamA;
    const goalsA = teamAHome ? m.countedHomeGoals : m.countedAwayGoals;
    const goalsB = teamAHome ? m.countedAwayGoals : m.countedHomeGoals;

    gdA += goalsA - goalsB;
    gfA += goalsA;

    if (!m.wentOvertime) {
      if (m.winner === teamA) {
        ptsA += 3;
      } else {
        ptsB += 3;
      }
    } else if (m.winner === teamA) {
      ptsA += 2;
      ptsB += 1;
    } else {
      ptsA += 1;
      ptsB += 2;
    }
  });

  if (ptsA !== ptsB) {
    return ptsB - ptsA;
  }

  if (gdA !== 0) {
    return gdA > 0 ? -1 : 1;
  }

  if (gfA !== 0) {
    return gfA > 0 ? -1 : 1;
  }

  return 0;
}

function getOverallRanking() {
  const grouped = getGroupedStandings();
  const all = Object.values(grouped).flat();
  all.sort(compareOverallRows);
  return all;
}

function renderStandings() {
  const tournament = getCurrentTournament();
  const tables = getGroupedStandings();
  dom.standingsTables.innerHTML = "";

  if (!tournament) {
    dom.standingsTables.innerHTML = "<p class=\"no-mode\">Choose Men's or Women's to display standings.</p>";
    return;
  }

  tournament.groups.forEach((group) => {
    const section = document.createElement("section");
    section.className = "table-wrap";

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    thead.innerHTML = "<tr><th><span class=\"th-team-label\"><span class=\"flag-icon\">🏳️</span><span>Team</span></span></th><th>GP</th><th>W</th><th>OTW</th><th>OTL</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>PTS</th></tr>";
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    tables[group].forEach((row) => {
      const tr = document.createElement("tr");
      if (row.team === state.selectedTeam) {
        tr.classList.add("user-row");
      }
      tr.innerHTML = `<td>${formatTeamNameHTML(row.team, "team-cell")}</td><td>${row.gp}</td><td>${row.w}</td><td>${row.otw}</td><td>${row.otl}</td><td>${row.l}</td><td>${row.gf}</td><td>${row.ga}</td><td>${row.gd}</td><td>${row.pts}</td>`;
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    section.appendChild(table);
    dom.standingsTables.appendChild(section);
  });
}

function renderBracket() {
  const tournament = getCurrentTournament();
  const rounds = [];

  if (state.directQuarterSeeds.length) {
    const seedLabel = tournament && tournament.progression === "women" ? "Quarterfinal Seeds" : "Direct to QF";
    rounds.push([
      seedLabel,
      state.directQuarterSeeds.map((s) => ({
        home: `${s.seed}. ${formatTeamName(s.team)}`,
        away: tournament && tournament.progression === "women" ? "Qualified" : "Quarterfinal berth"
      }))
    ]);
  }

  if (state.bracket.qualification.length) {
    rounds.push(["Qualification", state.bracket.qualification]);
  }

  rounds.push(["Quarterfinal", state.bracket.quarterfinal]);
  rounds.push(["Semifinal", state.bracket.semifinal]);
  rounds.push(["Bronze", state.bracket.bronze]);
  rounds.push(["Gold", state.bracket.gold]);

  let html = "";

  rounds.forEach(([title, matches]) => {
    if (!matches.length) {
      return;
    }

    html += `<div class=\"bracket-round\"><strong>${title}:</strong><br/>`;
    matches.forEach((match) => {
      const result = state.completedMatches.find((m) => m.id === match.id);

      if (!result) {
        const homeLabel = formatSeededTeamLabel(match.home);
        const awayLabel = match.away === "Qualified" || match.away === "Quarterfinal berth" ? match.away : formatSeededTeamLabel(match.away);
        html += `${homeLabel} vs ${awayLabel}<br/>`;
        return;
      }

      const extra = result.decidedByShootout ? " SO" : result.wentOvertime ? " OT" : "";
      html += `${formatTeamName(result.home)} ${result.homeScore}-${result.awayScore} ${formatTeamName(result.away)}${extra}<br/>`;
    });
    html += "</div>";
  });

  if (!html) {
    html = "Bracket appears after group stage.";
  }

  dom.bracketView.innerHTML = html;
}

function renderCurrentMatch() {
  const next = state.pendingMatches[0];

  if (!state.started) {
    const tournamentHint = getCurrentTournament()
      ? "Start the tournament to load the schedule."
      : "Select Men's or Women's first, then pick your team.";
    dom.currentMatchCard.innerHTML = `
      <p class="match-stage">${tournamentHint}</p>
      <div class="matchup"><span class="team">-</span><span class="vs">vs</span><span class="team">-</span></div>
    `;
    dom.playBtn.disabled = true;
    dom.simBtn.disabled = true;
    return;
  }

  if (!next) {
    const medals = state.medals || {};
    dom.currentMatchCard.innerHTML = `
      <p class="match-stage">Tournament complete</p>
      <div class="podium-board">
        <div class="podium-slot podium-silver">
          <p class="podium-medal">Silver</p>
          <p class="podium-team">${medals.silver ? formatTeamNameHTML(medals.silver, "team-inline") : "TBD"}</p>
          <div class="podium-step">2</div>
        </div>
        <div class="podium-slot podium-gold">
          <p class="podium-medal">Gold</p>
          <p class="podium-team">${medals.gold ? formatTeamNameHTML(medals.gold, "team-inline") : "TBD"}</p>
          <div class="podium-step">1</div>
        </div>
        <div class="podium-slot podium-bronze">
          <p class="podium-medal">Bronze</p>
          <p class="podium-team">${medals.bronze ? formatTeamNameHTML(medals.bronze, "team-inline") : "TBD"}</p>
          <div class="podium-step">3</div>
        </div>
      </div>
    `;
    dom.playBtn.disabled = true;
    dom.simBtn.disabled = true;
    return;
  }

  const roundTag = next.stage === "group" ? `Group ${next.group} - Round ${next.round}` : STAGE_LABELS[next.stage];

  dom.currentMatchCard.innerHTML = `
    <p class="match-stage">${roundTag}</p>
    <div class="matchup"><span class="team">${formatTeamNameHTML(next.home, "team-inline")}</span><span class="vs">vs</span><span class="team">${formatTeamNameHTML(next.away, "team-inline")}</span></div>
  `;

  const userGame = isUserMatch(next) && !state.userEliminated;
  dom.playBtn.disabled = !userGame;
  dom.simBtn.disabled = false;
}

function refreshUI() {
  dom.phaseChip.textContent = state.phase === "not_started" ? "Waiting" : state.phase.replace("_", " ");
  if (state.phase === "complete") {
    updateMedalChip();
  }
  renderCurrentMatch();
  renderStandings();
  renderBracket();
}

function addLog(message) {
  const li = document.createElement("li");
  li.textContent = decorateTeamNames(message);
  const userTeam = state.selectedTeam;
  if (userTeam && (message.includes(userTeam) || message.startsWith("You "))) {
    li.classList.add("team-log");
  }
  dom.eventLog.prepend(li);

  while (dom.eventLog.children.length > 80) {
    dom.eventLog.removeChild(dom.eventLog.lastChild);
  }
}

function getTeam(name) {
  const tournament = getCurrentTournament();
  if (!tournament) {
    return null;
  }
  return tournament.teams.find((team) => team.name === name);
}

function getCountryFlag(teamName) {
  const isoByTeam = {
    "Canada": "CA",
    "Czechia": "CZ",
    "Switzerland": "CH",
    "France": "FR",
    "Sweden": "SE",
    "Finland": "FI",
    "Slovakia": "SK",
    "Italy": "IT",
    "United States": "US",
    "Germany": "DE",
    "Latvia": "LV",
    "Denmark": "DK",
    "Japan": "JP"
  };

  const code = isoByTeam[teamName];
  if (!code) {
    return "";
  }

  const first = 127397 + code.charCodeAt(0);
  const second = 127397 + code.charCodeAt(1);
  return String.fromCodePoint(first, second);
}

function formatTeamName(teamName) {
  if (!teamName) {
    return "";
  }
  const flag = getCountryFlag(teamName);
  return flag ? `${flag} ${teamName}` : teamName;
}

function formatTeamNameHTML(teamName, wrapperClass = "team-inline") {
  if (!teamName) {
    return "<span class=\"team-inline\">-</span>";
  }
  const flag = getCountryFlag(teamName);
  if (!flag) {
    return `<span class="${wrapperClass}"><span class="team-name-text">${teamName}</span></span>`;
  }
  return `<span class="${wrapperClass}"><span class="flag-icon">${flag}</span><span class="team-name-text">${teamName}</span></span>`;
}

function formatSeededTeamLabel(label) {
  if (!label) {
    return "";
  }
  const match = label.match(/^(\d+)\.\s(.+)$/);
  if (!match) {
    return formatTeamName(label);
  }
  return `${match[1]}. ${formatTeamName(match[2])}`;
}

function getAllTeamNames() {
  const names = new Set();
  Object.values(TOURNAMENTS).forEach((tournament) => {
    tournament.teams.forEach((team) => names.add(team.name));
  });
  return [...names];
}

function decorateTeamNames(text) {
  if (!text) {
    return text;
  }
  let output = text;
  const names = getAllTeamNames().sort((a, b) => b.length - a.length);
  names.forEach((name) => {
    const flagged = formatTeamName(name);
    output = output.replaceAll(name, flagged);
  });
  return output;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function poisson(lambda) {
  const limit = Math.exp(-lambda);
  let k = 0;
  let p = 1;

  while (p > limit && k < 12) {
    k += 1;
    p *= Math.random();
  }

  return Math.max(0, k - 1);
}

function ratingWinProbability(ratingA, ratingB) {
  const spread = ratingA - ratingB;
  return clamp(0.5 + spread * 0.012, 0.2, 0.8);
}

function runArcadeMatch(match) {
  return new Promise((resolve) => {
    const game = new HockeyArcade(match, resolve);
    game.start();
  });
}

class HockeyArcade {
  constructor(match, onFinish) {
    this.match = match;
    this.onFinish = onFinish;
    this.canvas = dom.rinkCanvas;
    this.ctx = this.canvas.getContext("2d");

    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.goalTop = this.height / 2 - 82;
    this.goalBottom = this.height / 2 + 82;
    this.centerY = this.height / 2;
    this.leftGoalX = 8;
    this.rightGoalX = this.width - 8;
    this.darkBlueLeft = this.width * 0.37;
    this.darkBlueRight = this.width * 0.63;
    this.playerBounds = { minX: 38, maxX: this.width - 38, minY: 38, maxY: this.height - 38 };

    this.timer = 75;
    this.lastTs = null;
    this.running = false;
    this.faceoffDelay = 0;
    this.lastMinuteWarned = false;
    this.warningTimer = 0;
    this.gameOverPending = false;
    this.gameOverHold = 0;

    this.userIsHome = state.selectedTeam === match.home;
    this.userSide = this.userIsHome ? "left" : "right";
    this.aiSide = this.userSide === "left" ? "right" : "left";

    const opponent = this.userIsHome ? match.away : match.home;
    this.sideTeams = {
      left: this.userSide === "left" ? state.selectedTeam : opponent,
      right: this.userSide === "right" ? state.selectedTeam : opponent
    };

    this.sideScores = { left: 0, right: 0 };
    this.homeSide = this.userIsHome ? this.userSide : this.aiSide;
    this.awaySide = this.homeSide === "left" ? "right" : "left";
    this.teamRatings = new Map((getCurrentTournament()?.teams || []).map((team) => [team.name, team.rating]));
    this.teamBadges = this.buildTeamBadges();
    this.zoneEdges = {
      leftBlue: this.darkBlueLeft,
      rightBlue: this.darkBlueRight,
      center: this.width / 2
    };
    this.puckOwnership = {
      carrierId: null,
      lastSide: null,
      lastCarrierId: null,
      turnoverPulse: 0
    };

    this.players = [
      ...this.createLineup("left", this.sideTeams.left, this.userSide === "left"),
      ...this.createLineup("right", this.sideTeams.right, this.userSide === "right")
    ];
    this.userSkater = this.players.find((player) => player.isUser);

    this.puck = { x: this.width / 2, y: this.height / 2, r: 11, vx: 0, vy: 0, spin: 0 };
    this.boardStuck = {
      timer: 0,
      anchorX: this.width / 2,
      anchorY: this.height / 2
    };
    this.scrumKickCooldown = 0;
    this.goalSignal = { side: null, timer: 0 };
    this.audioCtx = null;

    this.keys = {};
    this.pointer = { active: false, x: this.width / 2, y: this.height / 2 };

    this.onKeyDown = (e) => {
      const key = e.key.toLowerCase();
      this.keys[key] = true;
      if (key.startsWith("arrow") || key === "shift" || key === " ") {
        e.preventDefault();
      }
    };

    this.onKeyUp = (e) => {
      this.keys[e.key.toLowerCase()] = false;
    };

    this.onPointerMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.width / rect.width;
      const scaleY = this.height / rect.height;
      this.pointer.active = true;
      this.pointer.x = clamp((e.clientX - rect.left) * scaleX, 40, this.width - 40);
      this.pointer.y = clamp((e.clientY - rect.top) * scaleY, 40, this.height - 40);
    };

    this.onPointerLeave = () => {
      this.pointer.active = false;
    };
  }

  buildTeamBadges() {
    return {
      "Canada": {
        code: "CAN",
        kits: {
          home: { primary: "#d61f26", secondary: "#ffffff", text: "#102033" },
          away: { primary: "#ffffff", secondary: "#d61f26", text: "#8d1118" },
          alt: { primary: "#7f1118", secondary: "#ffe7e9", text: "#1a1a1a" }
        }
      },
      "Czechia": {
        code: "CZE",
        kits: {
          home: { primary: "#1f4eaa", secondary: "#ffffff", text: "#0c1b33" },
          away: { primary: "#ffffff", secondary: "#d62839", text: "#0f2550" },
          alt: { primary: "#d62839", secondary: "#f1f5ff", text: "#2a0f14" }
        }
      },
      "Switzerland": {
        code: "SUI",
        kits: {
          home: { primary: "#d01d2a", secondary: "#ffffff", text: "#112033" },
          away: { primary: "#ffffff", secondary: "#d01d2a", text: "#8a1119" },
          alt: { primary: "#7a1119", secondary: "#ffd7db", text: "#1c1012" }
        }
      },
      "France": {
        code: "FRA",
        kits: {
          home: { primary: "#1749a5", secondary: "#ffffff", text: "#0c1a33" },
          away: { primary: "#ffffff", secondary: "#1749a5", text: "#12397f" },
          alt: { primary: "#d22f3e", secondary: "#ffffff", text: "#1f0f14" }
        }
      },
      "Japan": {
        code: "JPN",
        kits: {
          home: { primary: "#ffffff", secondary: "#cb1f2a", text: "#7f141c" },
          away: { primary: "#cb1f2a", secondary: "#ffffff", text: "#18263c" },
          alt: { primary: "#1d2738", secondary: "#ffe7ea", text: "#f7fbff" }
        }
      },
      "Sweden": {
        code: "SWE",
        kits: {
          home: { primary: "#1551a6", secondary: "#f3c41b", text: "#0d1b33" },
          away: { primary: "#f3c41b", secondary: "#1551a6", text: "#142138" },
          alt: { primary: "#0e2e61", secondary: "#9bd0ff", text: "#eaf5ff" }
        }
      },
      "Finland": {
        code: "FIN",
        kits: {
          home: { primary: "#ffffff", secondary: "#1956af", text: "#133a78" },
          away: { primary: "#1956af", secondary: "#ffffff", text: "#0d1933" },
          alt: { primary: "#0f346f", secondary: "#dcefff", text: "#f2f8ff" }
        }
      },
      "Slovakia": {
        code: "SVK",
        kits: {
          home: { primary: "#1e58ad", secondary: "#ffffff", text: "#0c1d39" },
          away: { primary: "#ffffff", secondary: "#1e58ad", text: "#1a4690" },
          alt: { primary: "#d42d3c", secondary: "#f2f6ff", text: "#2a1014" }
        }
      },
      "Italy": {
        code: "ITA",
        kits: {
          home: { primary: "#1c5fb7", secondary: "#ffffff", text: "#0f1e33" },
          away: { primary: "#ffffff", secondary: "#149647", text: "#155f35" },
          alt: { primary: "#149647", secondary: "#f1fff5", text: "#103322" }
        }
      },
      "United States": {
        code: "USA",
        kits: {
          home: { primary: "#1a4ba4", secondary: "#ffffff", text: "#102033" },
          away: { primary: "#ffffff", secondary: "#1a4ba4", text: "#123878" },
          alt: { primary: "#be1f2f", secondary: "#e8f0ff", text: "#2b1016" }
        }
      },
      "Germany": {
        code: "GER",
        kits: {
          home: { primary: "#151515", secondary: "#d14f43", text: "#f5d66e" },
          away: { primary: "#f7f1d7", secondary: "#151515", text: "#141414" },
          alt: { primary: "#c2372e", secondary: "#f8d351", text: "#2b1210" }
        }
      },
      "Latvia": {
        code: "LAT",
        kits: {
          home: { primary: "#7b1f2a", secondary: "#ffffff", text: "#142033" },
          away: { primary: "#ffffff", secondary: "#7b1f2a", text: "#5e171f" },
          alt: { primary: "#5f1620", secondary: "#ffe8ea", text: "#251012" }
        }
      },
      "Denmark": {
        code: "DEN",
        kits: {
          home: { primary: "#c62828", secondary: "#ffffff", text: "#142033" },
          away: { primary: "#ffffff", secondary: "#c62828", text: "#7d1818" },
          alt: { primary: "#8f1b1b", secondary: "#ffeaea", text: "#231010" }
        }
      }
    };
  }

  getKitProfile(teamName, side) {
    const buildFallback = (name) => ({
      code: name.slice(0, 3).toUpperCase(),
      kits: {
        home: { primary: "#2c5ca6", secondary: "#ffffff", text: "#11213a" },
        away: { primary: "#ffffff", secondary: "#2c5ca6", text: "#22467f" },
        alt: { primary: "#3f4f66", secondary: "#dce7ff", text: "#122038" }
      }
    });

    const profile = this.teamBadges[teamName] || buildFallback(teamName);
    if (!this.sideKitMap) {
      const leftProfile = this.teamBadges[this.sideTeams.left] || buildFallback(this.sideTeams.left);
      const rightProfile = this.teamBadges[this.sideTeams.right] || buildFallback(this.sideTeams.right);
      this.sideKitMap = { left: "home", right: "away" };
      const leftHome = leftProfile.kits.home.primary;
      const rightAway = rightProfile.kits.away.primary;
      const rightAlt = rightProfile.kits.alt.primary;

      if (this.colorDistance(leftHome, rightAway) < 95) {
        this.sideKitMap.right = this.colorDistance(leftHome, rightAlt) > 95 ? "alt" : "away";
      }
    }

    const kitName = this.sideKitMap[side] || (side === "left" ? "home" : "away");
    const kit = profile.kits[kitName] || profile.kits.home;
    return { code: profile.code, ...kit };
  }

  colorDistance(hexA, hexB) {
    const a = this.hexToRgb(hexA);
    const b = this.hexToRgb(hexB);
    return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
  }

  hexToRgb(hex) {
    const clean = hex.replace("#", "");
    const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
    const int = parseInt(full, 16);
    return {
      r: (int >> 16) & 255,
      g: (int >> 8) & 255,
      b: int & 255
    };
  }

  getTeamRating(teamName) {
    return this.teamRatings.get(teamName) || 82;
  }

  buildPlayerAttributes(teamName, role, position, isUser) {
    const teamRating = this.getTeamRating(teamName);
    const base = clamp((teamRating - 75) / 20, 0, 1);
    const jitter = () => (Math.random() - 0.5) * 4;
    const roleBoost =
      role === "G"
        ? { reaction: 8, balance: 7, awareness: 7, stickhandling: -4, shooting: -16, passing: -6, speed: -10, accel: -12 }
        : role === "D"
          ? { awareness: 6, checking: 7, strength: 6, shooting: -2, passing: 2, speed: -3, accel: -1 }
          : position === "C"
            ? { awareness: 6, passing: 5, stickhandling: 4, reaction: 3, endurance: 4 }
            : { speed: 4, accel: 4, shooting: 3, stickhandling: 3 };

    const ratingStat = (baseValue, key) => clamp(baseValue + base * 18 + (roleBoost[key] || 0) + jitter(), 50, 99);
    const attrs = {
      speed: ratingStat(64, "speed"),
      accel: ratingStat(63, "accel"),
      agility: ratingStat(62, "agility"),
      edge: ratingStat(62, "agility"),
      stickhandling: ratingStat(60, "stickhandling"),
      passing: ratingStat(60, "passing"),
      shotPower: ratingStat(59, "shooting"),
      shotAccuracy: ratingStat(60, "shooting"),
      checking: ratingStat(58, "checking"),
      strength: ratingStat(59, "strength"),
      balance: ratingStat(60, "balance"),
      awareness: ratingStat(61, "awareness"),
      endurance: ratingStat(62, "endurance"),
      reaction: ratingStat(60, "reaction"),
      discipline: ratingStat(61, "discipline")
    };

    if (isUser) {
      attrs.reaction = clamp(attrs.reaction + 5, 50, 99);
      attrs.stickhandling = clamp(attrs.stickhandling + 4, 50, 99);
    }

    return attrs;
  }

  statScale(stat, low = 0.75, high = 1.25) {
    return low + ((clamp(stat, 0, 100) / 100) * (high - low));
  }

  createLineup(side, team, userSide) {
    const formation = [
      { role: "G", slot: 1, x: 76, y: this.height * 0.5 },
      { role: "F", slot: 2, x: 386, y: this.height * 0.5 }
    ];

    return formation.map((spot) => {
      const isGoalie = spot.role === "G";
      const position =
        spot.role === "G"
          ? "G"
          : spot.role === "D"
            ? spot.slot === 1
              ? "D1"
              : "D2"
            : spot.slot === 1
              ? "LW"
            : spot.slot === 2
                ? "C"
                : "RW";
      const isUser = userSide && spot.role === "F" && spot.slot === 2;
      const x = side === "left" ? spot.x : this.width - spot.x;
      const y = spot.y;
      const attributes = this.buildPlayerAttributes(team, spot.role, position, isUser);
      const topSpeed = (spot.role === "G" ? 186 : 228) * this.statScale(attributes.speed, 0.9, 1.33);
      const accel = (spot.role === "G" ? 420 : 560) * this.statScale(attributes.accel, 0.82, 1.34);
      const decel = (spot.role === "G" ? 450 : 620) * this.statScale(attributes.balance, 0.85, 1.25);
      const turnRate = (spot.role === "G" ? 5.8 : 8.6) * this.statScale(attributes.agility, 0.82, 1.28);
      const pivotRate = (spot.role === "G" ? 4.8 : 7.2) * this.statScale(attributes.edge, 0.8, 1.3);
      const recoverRate = 0.14 * this.statScale(attributes.endurance, 0.85, 1.3);
      const drainRate = 0.21 * this.statScale(100 - attributes.endurance, 0.82, 1.24);

      return {
        id: `${side}-${spot.role}-${spot.slot}`,
        team,
        side,
        role: spot.role,
        position,
        slot: spot.slot,
        isUser,
        x,
        y,
        homeX: x,
        homeY: y,
        vx: 0,
        vy: 0,
        headingX: side === "left" ? 1 : -1,
        headingY: 0,
        speed: topSpeed,
        topSpeed,
        accel,
        decel,
        turnRate,
        pivotRate,
        recoverRate,
        drainRate,
        stamina: 1,
        fatigue: 0,
        balanceState: 1,
        attributes,
        state: "support_puck",
        stateTime: 0,
        decisionCooldown: 0,
        intent: null,
        r: isGoalie ? 22 : 17,
        shotCooldown: 0,
        passCooldown: 0,
        pokeCooldown: 0,
        stun: 0,
        checkWindow: 0,
        checkCooldown: 0,
        possessionTime: 0
      };
    });
  }

  start() {
    dom.gameModal.classList.remove("hidden");
    dom.gameModal.setAttribute("aria-hidden", "false");
    dom.gameTitle.textContent = `${formatTeamName(this.match.home)} vs ${formatTeamName(this.match.away)}`;

    this.resetFaceoff(true);

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    this.canvas.addEventListener("pointermove", this.onPointerMove);
    this.canvas.addEventListener("pointerdown", this.onPointerMove);
    this.canvas.addEventListener("pointerleave", this.onPointerLeave);
    this.canvas.addEventListener("pointercancel", this.onPointerLeave);

    this.running = true;
    requestAnimationFrame((ts) => this.loop(ts));
  }

  stop() {
    this.running = false;
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerdown", this.onPointerMove);
    this.canvas.removeEventListener("pointerleave", this.onPointerLeave);
    this.canvas.removeEventListener("pointercancel", this.onPointerLeave);

    dom.gameModal.classList.add("hidden");
    dom.gameModal.setAttribute("aria-hidden", "true");

    this.onFinish({
      homeScore: this.sideScores[this.homeSide],
      awayScore: this.sideScores[this.awaySide]
    });
  }

  loop(ts) {
    if (!this.running) {
      return;
    }

    if (!this.lastTs) {
      this.lastTs = ts;
    }

    const dt = Math.min((ts - this.lastTs) / 1000, 0.033);
    this.lastTs = ts;

    if (this.warningTimer > 0) {
      this.warningTimer = Math.max(0, this.warningTimer - dt);
    }

    if (this.gameOverPending) {
      this.gameOverHold -= dt;
      dom.gameClock.textContent = "FINAL";
      dom.gameScore.textContent = `${formatTeamName(this.match.home)} ${this.getHomeScore()} - ${this.getAwayScore()} ${formatTeamName(this.match.away)}`;
      this.draw();
      if (this.gameOverHold <= 0) {
        this.stop();
        return;
      }
      requestAnimationFrame((nextTs) => this.loop(nextTs));
      return;
    }

    if (this.faceoffDelay > 0) {
      this.faceoffDelay -= dt;
      this.draw();
      requestAnimationFrame((nextTs) => this.loop(nextTs));
      return;
    }

    this.timer -= dt;
    if (!this.lastMinuteWarned && this.timer <= 60 && this.timer > 0) {
      this.lastMinuteWarned = true;
      this.warningTimer = 2.8;
      addLog("Final minute warning: push for the win.");
    }
    if (this.timer <= 0) {
      this.timer = 0;
      this.gameOverPending = true;
      this.gameOverHold = 10;
      dom.gameClock.textContent = "FINAL";
      dom.gameScore.textContent = `${formatTeamName(this.match.home)} ${this.getHomeScore()} - ${this.getAwayScore()} ${formatTeamName(this.match.away)}`;
      this.draw();
      requestAnimationFrame((nextTs) => this.loop(nextTs));
      return;
    }

    this.update(dt);
    this.draw();
    requestAnimationFrame((nextTs) => this.loop(nextTs));
  }

  update(dt) {
    this.tickTimers(dt);
    this.updatePossessionPulse(dt);
    this.updateUserSkater(dt);
    this.updateAIPlayers(dt);
    this.applyTeamSpacing(dt);
    this.resolveSkaterCollisions();
    this.handleStickChecks();
    this.handleBodyChecks();
    this.handlePuckInteractions(dt);
    this.updatePuck(dt);
    this.checkGoal();
    this.handleBoardStuck(dt);

    dom.gameClock.textContent = `${Math.ceil(this.timer)}s`;
    dom.gameScore.textContent = `${formatTeamName(this.match.home)} ${this.getHomeScore()} - ${this.getAwayScore()} ${formatTeamName(this.match.away)}`;
  }

  tickTimers(dt) {
    this.scrumKickCooldown = Math.max(0, this.scrumKickCooldown - dt);
    this.goalSignal.timer = Math.max(0, this.goalSignal.timer - dt);
    this.players.forEach((player) => {
      player.shotCooldown = Math.max(0, player.shotCooldown - dt);
      player.passCooldown = Math.max(0, player.passCooldown - dt);
      player.pokeCooldown = Math.max(0, player.pokeCooldown - dt);
      player.stun = Math.max(0, player.stun - dt);
      player.stateTime += dt;
      player.decisionCooldown = Math.max(0, player.decisionCooldown - dt);

      const speedRatio = clamp(Math.hypot(player.vx, player.vy) / Math.max(1, player.topSpeed), 0, 1.35);
      const effortLoad = clamp((speedRatio - 0.28) / 0.75, 0, 1);
      const stunLoad = player.stun > 0 ? 0.5 : 0;
      player.stamina = clamp(player.stamina - player.drainRate * (effortLoad + stunLoad) * dt, 0.2, 1);
      if (effortLoad < 0.08 && player.stun <= 0) {
        player.stamina = clamp(player.stamina + player.recoverRate * dt, 0.2, 1);
      }
      if (player.checkWindow > 0) {
        player.stamina = clamp(player.stamina - 0.09 * dt, 0.2, 1);
      }
      player.fatigue = 1 - player.stamina;
      const balanceRecovery = 0.76 * this.statScale(player.attributes.balance, 0.82, 1.2) * dt;
      player.balanceState = clamp(player.balanceState + balanceRecovery, 0.15, 1);
      if (player.isUser) {
        player.checkCooldown = Math.max(0, player.checkCooldown - dt);
        player.checkWindow = Math.max(0, player.checkWindow - dt);
      }
    });
  }

  updatePossessionPulse(dt) {
    this.puckOwnership.turnoverPulse = Math.max(0, this.puckOwnership.turnoverPulse - dt);
  }

  isShootPressed() {
    return !!(this.keys[" "] || this.keys.space || this.keys.spacebar);
  }

  handleBoardStuck(dt) {
    if (this.faceoffDelay > 0 || this.getPuckCarrier()) {
      this.resetBoardStuckTracker();
      return;
    }

    const nearBoards =
      this.puck.x < this.puck.r + 10 ||
      this.puck.x > this.width - this.puck.r - 10 ||
      this.puck.y < this.puck.r + 10 ||
      this.puck.y > this.height - this.puck.r - 10;
    if (!nearBoards) {
      this.resetBoardStuckTracker();
      return;
    }

    const speed = Math.hypot(this.puck.vx, this.puck.vy);
    if (speed > 62) {
      this.resetBoardStuckTracker();
      return;
    }

    const drift = Math.hypot(this.puck.x - this.boardStuck.anchorX, this.puck.y - this.boardStuck.anchorY);
    if (drift > 22) {
      this.boardStuck.timer = 0;
      this.boardStuck.anchorX = this.puck.x;
      this.boardStuck.anchorY = this.puck.y;
      return;
    }

    this.boardStuck.timer += dt;
    if (this.boardStuck.timer < 5) {
      return;
    }

    const faceoffSpot = this.getNearestFaceoffSpot(this.puck.x, this.puck.y);
    this.resetFaceoff(false, faceoffSpot);
  }

  resetBoardStuckTracker() {
    this.boardStuck.timer = 0;
    this.boardStuck.anchorX = this.puck.x;
    this.boardStuck.anchorY = this.puck.y;
  }

  updateUserSkater(dt) {
    const user = this.userSkater;
    if (!user) {
      return;
    }

    let xInput = 0;
    let yInput = 0;

    if (this.keys.arrowup) {
      yInput -= 1;
    }
    if (this.keys.arrowdown) {
      yInput += 1;
    }
    if (this.keys.arrowleft) {
      xInput -= 1;
    }
    if (this.keys.arrowright) {
      xInput += 1;
    }

    if (this.keys.shift && user.checkCooldown <= 0 && user.stun <= 0) {
      let directionX = xInput;
      let directionY = yInput;

      if (directionX === 0 && directionY === 0) {
        if (this.pointer.active) {
          directionX = this.pointer.x - user.x;
          directionY = this.pointer.y - user.y;
        }
      }
      if (directionX === 0 && directionY === 0) {
        directionX = this.puck.x - user.x;
        directionY = this.puck.y - user.y;
      }

      const checkDir = unitVector(directionX, directionY);
      user.vx += checkDir.x * 250;
      user.vy += checkDir.y * 250;
      user.headingX = checkDir.x;
      user.headingY = checkDir.y;
      user.checkWindow = 0.24;
      user.checkCooldown = 1.15;
      user.stamina = clamp(user.stamina - 0.04, 0.2, 1);
    }

    let intentDirX = 0;
    let intentDirY = 0;
    let effort = 0;
    if (xInput !== 0 || yInput !== 0) {
      const dir = unitVector(xInput, yInput);
      intentDirX = dir.x;
      intentDirY = dir.y;
      effort = 1;
      this.pointer.active = false;
    } else if (this.pointer.active) {
      const dx = this.pointer.x - user.x;
      const dy = this.pointer.y - user.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 2) {
        const dir = unitVector(dx, dy);
        intentDirX = dir.x;
        intentDirY = dir.y;
        effort = clamp(dist / 180, 0.35, 1);
      }
    }

    if (user.checkWindow > 0) {
      effort = Math.max(effort, 0.94);
    }
    this.applySkatingModel(user, { x: intentDirX, y: intentDirY }, effort, dt);
  }

  updateAIPlayers(dt) {
    const carrier = this.getPuckCarrier();
    this.players.forEach((player) => {
      if (player.isUser) {
        return;
      }

      const context = {
        carrier,
        teamHasPuck: carrier ? carrier.side === player.side : false,
        opponentHasPuck: carrier ? carrier.side !== player.side : false,
        zone: this.getZoneForSide(player.side, this.puck.x)
      };
      const nextState = this.selectAIState(player, context);
      if (nextState !== player.state) {
        player.state = nextState;
        player.stateTime = 0;
      }
      const intent = this.getAIIntent(player, context);
      player.intent = intent;
      this.applySkatingModel(player, { x: intent.dirX, y: intent.dirY }, intent.effort, dt);
    });
  }

  applyTeamSpacing(dt) {
    const minimumGap = 46;
    const softGap = 78;
    const scale = clamp(dt * 60, 0.4, 1.8);

    for (let i = 0; i < this.players.length; i += 1) {
      const a = this.players[i];
      if (a.role === "G") {
        continue;
      }
      for (let j = i + 1; j < this.players.length; j += 1) {
        const b = this.players[j];
        if (b.role === "G" || a.side !== b.side) {
          continue;
        }

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        if (dist > softGap) {
          continue;
        }

        const nx = dx / dist;
        const ny = dy / dist;
        if (dist < minimumGap) {
          const overlap = (minimumGap - dist) / minimumGap;
          const impulse = 180 * overlap * scale;
          a.vx -= nx * impulse;
          a.vy -= ny * impulse;
          b.vx += nx * impulse;
          b.vy += ny * impulse;
          continue;
        }

        // Mild teammate repulsion to keep shape and avoid bunching around the puck.
        const softOverlap = (softGap - dist) / (softGap - minimumGap);
        const nearPuck = distance(a, this.puck) < 140 || distance(b, this.puck) < 140;
        const softImpulse = (nearPuck ? 78 : 44) * softOverlap * scale;
        a.vx -= nx * softImpulse;
        a.vy -= ny * softImpulse;
        b.vx += nx * softImpulse;
        b.vy += ny * softImpulse;
      }
    }
  }

  applySkatingModel(player, desiredDir, effort, dt) {
    const prevX = player.x;
    const prevY = player.y;
    const hasInput = effort > 0.01 && (Math.abs(desiredDir.x) > 0.001 || Math.abs(desiredDir.y) > 0.001);
    const normalized = hasInput ? unitVector(desiredDir.x, desiredDir.y) : { x: player.headingX, y: player.headingY };
    const fatigueMod = 1 - player.fatigue * 0.42;
    const stunMod = player.stun > 0 ? 0.45 : 1;
    const turnStep = player.turnRate * (0.62 + 0.38 * player.stamina) * stunMod * dt;
    if (hasInput) {
      const heading = rotateVectorToward({ x: player.headingX, y: player.headingY }, normalized, turnStep);
      player.headingX = heading.x;
      player.headingY = heading.y;
    }

    const heading = { x: player.headingX, y: player.headingY };
    const facingDot = hasInput ? dot2(heading, normalized) : 1;
    const backwardFactor = facingDot < 0 ? 0.54 : 1;
    const targetSpeed = hasInput ? player.topSpeed * effort * fatigueMod * backwardFactor : 0;
    const targetVel = hasInput ? { x: normalized.x * targetSpeed, y: normalized.y * targetSpeed } : { x: 0, y: 0 };
    const accelStep = (hasInput ? player.accel : player.decel) * fatigueMod * stunMod * dt;
    const dvX = targetVel.x - player.vx;
    const dvY = targetVel.y - player.vy;
    const dvMag = Math.hypot(dvX, dvY);
    if (dvMag > 0.001) {
      const take = Math.min(accelStep, dvMag);
      player.vx += (dvX / dvMag) * take;
      player.vy += (dvY / dvMag) * take;
    }

    const speedNow = Math.hypot(player.vx, player.vy);
    if (hasInput && speedNow > player.topSpeed * 0.55) {
      const velDir = unitVector(player.vx, player.vy);
      const turnAngle = Math.acos(clamp(dot2(velDir, normalized), -1, 1));
      if (turnAngle > 1.04) {
        const hardTurn = clamp((turnAngle - 1.04) / 1.45, 0, 1);
        const brake = player.decel * (0.18 + hardTurn * 0.34) * dt;
        const speed = Math.hypot(player.vx, player.vy);
        if (speed > 0.001) {
          const ratio = clamp((speed - brake) / speed, 0, 1);
          player.vx *= ratio;
          player.vy *= ratio;
          player.balanceState = clamp(player.balanceState - hardTurn * 0.03, 0.15, 1);
        }
      }
    }

    const glide = hasInput ? 0.996 : 0.986;
    player.vx *= glide;
    player.vy *= glide;
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    this.limitPlayerToRink(player);
    player.vx = (player.x - prevX) / Math.max(dt, 0.001);
    player.vy = (player.y - prevY) / Math.max(dt, 0.001);
  }

  getPuckCarrier() {
    if (!this.puckOwnership.carrierId) {
      return null;
    }
    return this.players.find((player) => player.id === this.puckOwnership.carrierId) || null;
  }

  setPuckCarrier(player) {
    const previousSide = this.puckOwnership.lastSide;
    this.puckOwnership.carrierId = player.id;
    this.puckOwnership.lastCarrierId = player.id;
    this.puckOwnership.lastSide = player.side;
    if (previousSide && previousSide !== player.side) {
      this.puckOwnership.turnoverPulse = 0.8;
    }
  }

  clearPuckCarrier() {
    this.puckOwnership.carrierId = null;
  }

  getZoneForSide(side, x) {
    if (side === "left") {
      if (x < this.zoneEdges.leftBlue) {
        return "defensive";
      }
      if (x > this.zoneEdges.rightBlue) {
        return "offensive";
      }
      return "neutral";
    }

    if (x > this.zoneEdges.rightBlue) {
      return "defensive";
    }
    if (x < this.zoneEdges.leftBlue) {
      return "offensive";
    }
    return "neutral";
  }

  getAttackDirection(side) {
    return side === "left" ? 1 : -1;
  }

  getOwnNetX(side) {
    return side === "left" ? this.leftGoalX + 28 : this.rightGoalX - 28;
  }

  getOpponentNetX(side) {
    return side === "left" ? this.rightGoalX - 8 : this.leftGoalX + 8;
  }

  getSlotTarget(side) {
    return { x: side === "left" ? 160 : this.width - 160, y: this.centerY };
  }

  getClosestSkater(side, point, includeGoalie = false) {
    let closest = null;
    let best = Infinity;
    this.players.forEach((player) => {
      if (player.side !== side) {
        return;
      }
      if (!includeGoalie && player.role === "G") {
        return;
      }
      const d = distance(player, point);
      if (d < best) {
        best = d;
        closest = player;
      }
    });
    return closest;
  }

  selectAIState(player, context) {
    if (player.role === "G") {
      return "goalie";
    }
    if (context.carrier && context.carrier.id === player.id) {
      return "carry_puck";
    }
    if (player.decisionCooldown > 0) {
      return player.state;
    }

    const states = [
      "pressure_puck",
      "support_puck",
      "defend_lane",
      "defend_netfront",
      "backcheck",
      "cycle_support",
      "forecheck",
      "hold_blue"
    ];
    let bestState = states[0];
    let bestScore = -Infinity;
    states.forEach((stateName) => {
      const score = this.scoreActionUtility(player, context, stateName);
      if (score > bestScore) {
        bestScore = score;
        bestState = stateName;
      }
    });

    player.decisionCooldown = 0.18 + Math.random() * 0.12;
    return bestState;
  }

  scoreActionUtility(player, context, action) {
    const distToPuck = distance(player, this.puck);
    const carrier = context.carrier;
    const teamHasPuck = context.teamHasPuck;
    const oppHasPuck = context.opponentHasPuck;
    const isClosest = this.getClosestSkater(player.side, this.puck)?.id === player.id;
    const lanePenalty = Math.abs(player.y - player.homeY) / this.height;
    const transition = this.puckOwnership.turnoverPulse;

    if (action === "pressure_puck") {
      if (teamHasPuck) {
        return -2;
      }
      let score = 0.72 - distToPuck / 420;
      if (isClosest) {
        score += 0.45;
      }
      if (carrier && carrier.side !== player.side) {
        score += 0.3 - distance(player, carrier) / 500;
      }
      score += transition * (oppHasPuck ? 0.25 : 0);
      if (player.role === "D" && context.zone === "offensive") {
        score -= 0.24;
      }
      return score;
    }

    if (action === "support_puck") {
      if (!teamHasPuck) {
        return -1;
      }
      const carrierDist = carrier ? distance(player, carrier) : distToPuck;
      let score = 0.58 - Math.abs(carrierDist - 120) / 260;
      score += 0.2 - lanePenalty * 0.4;
      score += transition * 0.12;
      if (player.position === "C") {
        score += 0.15;
      }
      return score;
    }

    if (action === "defend_lane") {
      if (!oppHasPuck) {
        return -0.5;
      }
      let score = context.zone === "neutral" ? 0.62 : 0.28;
      if (player.role === "D") {
        score += 0.24;
      }
      score += transition * (oppHasPuck ? 0.16 : -0.08);
      score -= lanePenalty * 0.28;
      return score;
    }

    if (action === "defend_netfront") {
      if (!oppHasPuck || context.zone !== "defensive") {
        return -0.8;
      }
      let score = 0.4;
      if (player.role === "D") {
        score += 0.38;
      }
      if (player.position === "C") {
        score += 0.2;
      }
      score += transition * 0.12;
      return score;
    }

    if (action === "backcheck") {
      if (!oppHasPuck) {
        return -0.7;
      }
      const behindPuck = (this.puck.x - player.x) * this.getAttackDirection(player.side) > 0;
      return 0.2 + (behindPuck ? 0.42 : 0) + (context.zone === "offensive" ? 0.2 : 0) + transition * 0.14;
    }

    if (action === "cycle_support") {
      if (!teamHasPuck || context.zone !== "offensive") {
        return -0.9;
      }
      return 0.28 + (player.role === "F" ? 0.25 : -0.08);
    }

    if (action === "forecheck") {
      if (teamHasPuck || context.zone !== "offensive") {
        return -0.6;
      }
      return player.role === "F" ? 0.42 : 0.1;
    }

    if (action === "hold_blue") {
      if (player.role !== "D") {
        return -1;
      }
      if (!teamHasPuck || context.zone !== "offensive") {
        return -0.45;
      }
      return 0.55;
    }

    return 0;
  }

  getAIIntent(player, context) {
    if (player.role === "G") {
      const netX = this.getOwnNetX(player.side);
      const yTarget = clamp(this.puck.y, this.goalTop + 12, this.goalBottom - 12);
      const threatDist = Math.abs(this.puck.x - netX);
      return {
        dirX: netX + (player.side === "left" ? 14 : -14) - player.x,
        dirY: (threatDist < 220 ? yTarget : this.centerY) - player.y,
        effort: threatDist < 220 ? 0.86 : 0.52
      };
    }

    if (player.state === "carry_puck") {
      const attackDir = this.getAttackDirection(player.side);
      const target = {
        x: clamp(player.x + attackDir * 120, this.playerBounds.minX, this.playerBounds.maxX),
        y: clamp(player.homeY + (this.centerY - player.homeY) * 0.15, this.playerBounds.minY, this.playerBounds.maxY)
      };
      return { dirX: target.x - player.x, dirY: target.y - player.y, effort: 0.94 };
    }

    const anchor = this.getSystemAnchor(player, context);
    if (player.state === "pressure_puck") {
      const threat = context.carrier && context.carrier.side !== player.side ? context.carrier : this.puck;
      const forceWideY = threat.y < this.centerY ? this.height * 0.2 : this.height * 0.8;
      return {
        dirX: threat.x - player.x,
        dirY: threat.y + (forceWideY - threat.y) * 0.18 - player.y,
        effort: 1
      };
    }

    if (player.state === "defend_netfront") {
      const slot = this.getSlotTarget(player.side);
      return { dirX: slot.x - player.x, dirY: slot.y - player.y, effort: 0.78 };
    }

    if (player.state === "defend_lane") {
      const laneX = this.getOwnNetX(player.side) + this.getAttackDirection(player.side) * 130;
      const laneY = clamp(this.puck.y * 0.6 + player.homeY * 0.4, this.playerBounds.minY, this.playerBounds.maxY);
      return { dirX: laneX - player.x, dirY: laneY - player.y, effort: 0.76 };
    }

    if (player.state === "backcheck") {
      const trackX = this.puck.x - this.getAttackDirection(player.side) * 70;
      const trackY = clamp(this.puck.y * 0.68 + player.homeY * 0.32, this.playerBounds.minY, this.playerBounds.maxY);
      return { dirX: trackX - player.x, dirY: trackY - player.y, effort: 0.96 };
    }

    if (player.state === "hold_blue") {
      const x = player.side === "left" ? this.zoneEdges.rightBlue - 10 : this.zoneEdges.leftBlue + 10;
      return { dirX: x - player.x, dirY: anchor.y - player.y, effort: 0.64 };
    }

    if (player.state === "forecheck") {
      const targetX = this.puck.x - this.getAttackDirection(player.side) * 36;
      return { dirX: targetX - player.x, dirY: this.puck.y - player.y, effort: 0.9 };
    }

    return { dirX: anchor.x - player.x, dirY: anchor.y - player.y, effort: 0.68 };
  }

  getSystemAnchor(player, context) {
    const teamHasPuck = context.teamHasPuck;
    const zone = context.zone;
    const puckInfluenceX = (this.puck.x - this.width / 2) * 0.1;
    const puckInfluenceY = (this.puck.y - this.centerY) * 0.18;
    const anchor = { x: player.homeX, y: player.homeY };

    if (teamHasPuck) {
      if (zone === "offensive") {
        if (player.role === "D") {
          anchor.x = player.side === "left" ? this.zoneEdges.rightBlue - 24 : this.zoneEdges.leftBlue + 24;
          anchor.y = player.homeY + puckInfluenceY * 0.45;
        } else if (player.position === "C") {
          anchor.x = this.width / 2 + this.getAttackDirection(player.side) * 170;
          anchor.y = this.centerY + puckInfluenceY * 0.35;
        } else {
          anchor.x = this.width / 2 + this.getAttackDirection(player.side) * 230;
          anchor.y = player.homeY + puckInfluenceY * 0.65;
        }
      } else if (zone === "neutral") {
        anchor.x = player.homeX + puckInfluenceX * 0.7;
        anchor.y = player.homeY + puckInfluenceY * 0.45;
      } else {
        anchor.x = player.homeX + this.getAttackDirection(player.side) * 34;
        anchor.y = player.position === "C" ? this.centerY : player.homeY + puckInfluenceY * 0.32;
      }
    } else if (zone === "defensive") {
      if (player.role === "D") {
        const slot = this.getSlotTarget(player.side);
        anchor.x = slot.x + (player.position === "D1" ? -12 : 12) * this.getAttackDirection(player.side);
        anchor.y = this.centerY + (player.position === "D1" ? -54 : 54);
      } else if (player.position === "C") {
        const slot = this.getSlotTarget(player.side);
        anchor.x = slot.x + this.getAttackDirection(player.side) * 48;
        anchor.y = this.centerY + (this.puck.y - this.centerY) * 0.25;
      } else {
        anchor.x = this.getOwnNetX(player.side) + this.getAttackDirection(player.side) * 150;
        anchor.y = player.homeY + (this.puck.y - player.homeY) * 0.35;
      }
    } else if (zone === "neutral") {
      anchor.x = player.homeX + puckInfluenceX * 0.45;
      anchor.y = player.homeY + puckInfluenceY * 0.2;
    } else {
      anchor.x = player.homeX - this.getAttackDirection(player.side) * 20;
      anchor.y = player.homeY;
    }

    anchor.x = clamp(anchor.x, this.playerBounds.minX, this.playerBounds.maxX);
    anchor.y = clamp(anchor.y, this.playerBounds.minY, this.playerBounds.maxY);
    return anchor;
  }

  getDefenseXBounds(side) {
    if (side === "left") {
      return {
        minX: 52,
        maxX: this.zoneEdges.rightBlue + 16
      };
    }

    return {
      minX: this.zoneEdges.leftBlue - 16,
      maxX: this.width - 52
    };
  }

  limitPlayerToRink(player) {
    if (player.role === "G") {
      const minX = player.side === "left" ? 42 : this.width - 126;
      const maxX = player.side === "left" ? 126 : this.width - 42;
      player.x = clamp(player.x, minX, maxX);
      player.y = clamp(player.y, this.goalTop - 45, this.goalBottom + 45);
      return;
    }

    player.x = clamp(player.x, this.playerBounds.minX, this.playerBounds.maxX);
    if (player.role === "F") {
      player.y = clamp(player.y, this.playerBounds.minY, this.playerBounds.maxY);
      return;
    }

    if (player.role === "D") {
      const xBounds = this.getDefenseXBounds(player.side);
      player.x = clamp(player.x, xBounds.minX, xBounds.maxX);
      player.y = clamp(player.y, this.playerBounds.minY, this.playerBounds.maxY);
      return;
    }

    player.y = clamp(player.y, this.playerBounds.minY, this.playerBounds.maxY);
  }

  resolveSkaterCollisions() {
    for (let i = 0; i < this.players.length; i += 1) {
      for (let j = i + 1; j < this.players.length; j += 1) {
        const a = this.players[i];
        const b = this.players[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const minDist = a.r + b.r;
        const dist = Math.hypot(dx, dy) || 0.001;
        if (dist >= minDist) {
          continue;
        }

        const overlap = minDist - dist;
        const nx = dx / dist;
        const ny = dy / dist;
        const pushA = b.role === "G" ? 0.2 : 0.5;
        const pushB = a.role === "G" ? 0.2 : 0.5;
        a.x -= nx * overlap * pushA;
        a.y -= ny * overlap * pushA;
        b.x += nx * overlap * pushB;
        b.y += ny * overlap * pushB;
        this.limitPlayerToRink(a);
        this.limitPlayerToRink(b);

        const rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
        if (rel > 0) {
          const impulse = rel * 0.52;
          a.vx -= nx * impulse;
          a.vy -= ny * impulse;
          b.vx += nx * impulse;
          b.vy += ny * impulse;
        }
      }
    }
  }

  handleStickChecks() {
    const carrier = this.getPuckCarrier();
    if (!carrier) {
      return;
    }
    const defenders = this.players
      .filter((player) => player.side !== carrier.side && player.role !== "G" && player.pokeCooldown <= 0 && player.stun <= 0)
      .sort((a, b) => distance(a, carrier) - distance(b, carrier));
    for (let i = 0; i < defenders.length; i += 1) {
      const defender = defenders[i];
      const toCarrier = { x: carrier.x - defender.x, y: carrier.y - defender.y };
      const dist = Math.hypot(toCarrier.x, toCarrier.y);
      if (dist > defender.r + carrier.r + 18) {
        continue;
      }
      const dir = unitVector(toCarrier.x, toCarrier.y);
      const facing = dot2({ x: defender.headingX, y: defender.headingY }, dir);
      if (facing < 0.18) {
        continue;
      }
      const defenderScore = defender.attributes.reaction * 0.45 + defender.attributes.checking * 0.25 + defender.balanceState * 30;
      const carrierScore = carrier.attributes.stickhandling * 0.5 + carrier.attributes.balance * 0.25 + carrier.stamina * 26;
      const chance = clamp(0.14 + (defenderScore - carrierScore) / 180, 0.06, 0.68);
      defender.pokeCooldown = 0.48;
      if (Math.random() > chance) {
        continue;
      }
      this.clearPuckCarrier();
      carrier.possessionTime = 0;
      this.puck.x = carrier.x + dir.x * (carrier.r + this.puck.r + 2);
      this.puck.y = carrier.y + dir.y * (carrier.r + this.puck.r + 2);
      this.puck.vx = dir.x * (250 + defender.attributes.checking * 1.5) + defender.vx * 0.2;
      this.puck.vy = dir.y * (250 + defender.attributes.checking * 1.5) + defender.vy * 0.2;
      defender.pokeCooldown = 0.9;
      break;
    }
  }

  handleBodyChecks() {
    const user = this.userSkater;
    if (user.checkWindow > 0 && user.stun <= 0) {
      const opponents = this.players
        .filter((player) => player.side !== user.side && player.role !== "G")
        .sort((a, b) => distance(a, user) - distance(b, user));
      for (let i = 0; i < opponents.length; i += 1) {
        if (this.tryBodyCheck(user, opponents[i], 1.18)) {
          break;
        }
      }
    }

    const carrier = this.getPuckCarrier();
    if (!carrier) {
      return;
    }
    this.players.forEach((checker) => {
      if (checker.isUser || checker.side === carrier.side || checker.role === "G") {
        return;
      }
      if (checker.checkCooldown > 0 || checker.stun > 0 || checker.state !== "pressure_puck") {
        return;
      }
      const dist = distance(checker, carrier);
      if (dist > checker.r + carrier.r + 12) {
        return;
      }
      this.tryBodyCheck(checker, carrier, 1);
    });
  }

  tryBodyCheck(checker, target, boost) {
    const toTarget = { x: target.x - checker.x, y: target.y - checker.y };
    const dist = Math.hypot(toTarget.x, toTarget.y) || 0.001;
    if (dist > checker.r + target.r + 10) {
      return false;
    }

    const normal = { x: toTarget.x / dist, y: toTarget.y / dist };
    const heading = { x: checker.headingX, y: checker.headingY };
    const angleQuality = dot2(heading, normal);
    const closingSpeed = dot2({ x: checker.vx - target.vx, y: checker.vy - target.vy }, normal);
    if (angleQuality < 0.2 || closingSpeed < 30) {
      checker.vx -= normal.x * 48;
      checker.vy -= normal.y * 48;
      if (checker.isUser) {
        checker.checkWindow = 0;
      }
      checker.checkCooldown = 0.45;
      return false;
    }

    const impactBase = checker.attributes.checking * 0.88 + checker.attributes.strength * 0.58;
    const resistance = target.attributes.balance * 0.9 + target.attributes.strength * 0.56;
    const balanceEdge = checker.balanceState - target.balanceState * 0.45;
    const impact = impactBase * (0.58 + closingSpeed / 250) * checker.stamina * boost + balanceEdge * 18;
    const delta = impact - resistance;
    const hitPower = clamp(130 + delta * 2.3, 120, 560);

    target.vx += normal.x * hitPower;
    target.vy += normal.y * hitPower;
    target.balanceState = clamp(target.balanceState - clamp(hitPower / 720, 0.1, 0.45), 0.12, 1);
    target.stun = Math.max(target.stun, clamp(0.18 + hitPower / 900, 0.18, 0.78));
    checker.vx -= normal.x * 58;
    checker.vy -= normal.y * 58;
    checker.balanceState = clamp(checker.balanceState - 0.06, 0.15, 1);
    checker.checkCooldown = checker.isUser ? 1.12 : 1.55;
    if (checker.isUser) {
      checker.checkWindow = 0;
    }

    const carrier = this.getPuckCarrier();
    if (carrier && carrier.id === target.id) {
      this.clearPuckCarrier();
      this.puck.x = target.x + normal.x * (target.r + this.puck.r + 3);
      this.puck.y = target.y + normal.y * (target.r + this.puck.r + 3);
      this.puck.vx = target.vx * 0.35 + normal.x * clamp(hitPower, 180, 520);
      this.puck.vy = target.vy * 0.35 + normal.y * clamp(hitPower, 180, 520);
      target.possessionTime = 0;
    }

    const fromBehind = dot2({ x: target.headingX, y: target.headingY }, normal) > 0.5;
    const nearBoards = target.y < 42 || target.y > this.height - 42;
    const penaltyRisk = fromBehind ? 0.12 : 0.04;
    if ((fromBehind || nearBoards) && Math.random() < penaltyRisk * (1.05 - checker.attributes.discipline / 120)) {
      checker.stun = Math.max(checker.stun, 0.6);
      checker.checkCooldown = Math.max(checker.checkCooldown, 2.2);
    }
    return true;
  }

  handlePuckInteractions(dt) {
    const carrier = this.getPuckCarrier();
    if (carrier) {
      carrier.possessionTime += dt;
      this.updateCarriedPuck(carrier);
      this.evaluateCarrierDecision(carrier);
    } else {
      this.resolveLoosePuckTouches();
      this.attemptLoosePuckPickup();
    }

    const speed = Math.hypot(this.puck.vx, this.puck.vy);
    if (speed > 980) {
      const limiter = 980 / speed;
      this.puck.vx *= limiter;
      this.puck.vy *= limiter;
    }
  }

  resolveLoosePuckTouches() {
    let touchCarrier = null;
    let touchCarrierScore = 0.32;

    this.players.forEach((player) => {
      const dx = this.puck.x - player.x;
      const dy = this.puck.y - player.y;
      const dist = Math.hypot(dx, dy) || 0.001;
      const minDist = player.r + this.puck.r + 2;
      if (dist > minDist) {
        return;
      }
      const nx = dx / dist;
      const ny = dy / dist;
      this.puck.x = player.x + nx * minDist;
      this.puck.y = player.y + ny * minDist;
      const contact = player.role === "G" ? 80 : 105;
      const rel = (player.vx - this.puck.vx) * nx + (player.vy - this.puck.vy) * ny;
      const impulse = contact + Math.max(0, rel * 0.65);
      this.puck.vx += nx * impulse;
      this.puck.vy += ny * impulse;
      this.ensurePuckEscapesBoards();

      if (player.role !== "G" && player.stun <= 0) {
        const controlScore = this.getTouchPossessionScore(player, nx, ny);
        if (controlScore > touchCarrierScore) {
          touchCarrierScore = controlScore;
          touchCarrier = player;
        }
      }
    });

    if (touchCarrier && !this.getPuckCarrier()) {
      this.setPuckCarrier(touchCarrier);
      touchCarrier.possessionTime = 0;
      this.puck.vx *= 0.18;
      this.puck.vy *= 0.18;
    }
  }

  getTouchPossessionScore(player, nx, ny) {
    const facing = clamp((dot2({ x: player.headingX, y: player.headingY }, { x: nx, y: ny }) + 1) / 2, 0, 1);
    const speedPenalty = clamp(Math.hypot(player.vx, player.vy) / Math.max(1, player.topSpeed), 0, 1) * 0.24;
    const pressureDist = this.getNearestOpponentDistance(player);
    const pressurePenalty = pressureDist < 75 ? (75 - pressureDist) / 190 : 0;
    const skill = (
      player.attributes.stickhandling * 0.48 +
      player.attributes.reaction * 0.22 +
      player.attributes.balance * 0.2
    ) / 100;
    return 0.24 + facing * 0.24 + skill * 0.42 + player.stamina * 0.12 - speedPenalty - pressurePenalty;
  }

  ensurePuckEscapesBoards() {
    const margin = this.puck.r + 9;
    const inGoalY = this.puck.y > this.goalTop && this.puck.y < this.goalBottom;
    const nearLeft = !inGoalY && this.puck.x <= margin;
    const nearRight = !inGoalY && this.puck.x >= this.width - margin;
    const nearTop = this.puck.y <= margin;
    const nearBottom = this.puck.y >= this.height - margin;
    if (!(nearLeft || nearRight || nearTop || nearBottom)) {
      return;
    }

    if (nearLeft) {
      this.puck.vx = Math.max(this.puck.vx, 170);
    }
    if (nearRight) {
      this.puck.vx = Math.min(this.puck.vx, -170);
    }
    if (nearTop) {
      this.puck.vy = Math.max(this.puck.vy, 130);
    }
    if (nearBottom) {
      this.puck.vy = Math.min(this.puck.vy, -130);
    }
  }

  attemptLoosePuckPickup() {
    let best = null;
    let bestScore = 0.36;
    this.players.forEach((player) => {
      if (player.stun > 0) {
        return;
      }
      const score = this.getPuckPickupScore(player);
      if (score > bestScore) {
        bestScore = score;
        best = player;
      }
    });
    if (!best) {
      return;
    }
    this.setPuckCarrier(best);
    best.possessionTime = 0;
    this.puck.vx *= 0.25;
    this.puck.vy *= 0.25;
  }

  getPuckPickupScore(player) {
    const toPuck = { x: this.puck.x - player.x, y: this.puck.y - player.y };
    const dist = Math.hypot(toPuck.x, toPuck.y);
    const controlRadius = player.r + this.puck.r + 14;
    if (dist > controlRadius) {
      return 0;
    }
    const dir = unitVector(toPuck.x, toPuck.y);
    const heading = { x: player.headingX, y: player.headingY };
    const facing = clamp((dot2(heading, dir) + 1) / 2, 0, 1);
    const speedPenalty = clamp(Math.hypot(player.vx, player.vy) / Math.max(1, player.topSpeed), 0, 1) * 0.35;
    const nearestOpponent = this.players
      .filter((opponent) => opponent.side !== player.side)
      .reduce((best, opponent) => Math.min(best, distance(opponent, player)), 999);
    const pressurePenalty = nearestOpponent < 70 ? (70 - nearestOpponent) / 210 : 0;
    const skill = (player.attributes.stickhandling * 0.55 + player.attributes.reaction * 0.2) / 100;
    const base = 1 - dist / controlRadius;
    return base * 0.46 + facing * 0.22 + skill * 0.3 - speedPenalty - pressurePenalty + player.balanceState * 0.08;
  }

  updateCarriedPuck(carrier) {
    const stickOffset = carrier.r + this.puck.r + 3;
    this.puck.x = carrier.x + carrier.headingX * stickOffset;
    this.puck.y = carrier.y + carrier.headingY * stickOffset;
    this.puck.vx = carrier.vx + carrier.headingX * 22;
    this.puck.vy = carrier.vy + carrier.headingY * 22;
  }

  evaluateCarrierDecision(carrier) {
    if (carrier.shotCooldown > 0 || carrier.passCooldown > 0) {
      return;
    }

    const shot = this.evaluateShotChance(carrier);
    const pass = this.findBestPassOption(carrier);
    const pressure = this.getNearestOpponentDistance(carrier) < 62;

    if (carrier.role === "G") {
      if (pass && pass.score > 0.3) {
        this.executePass(carrier, pass);
      } else if (carrier.possessionTime > 0.42) {
        this.executeShot(carrier, { score: 0.2, type: "slap", traffic: 0 });
      }
      return;
    }

    if (carrier.isUser) {
      if (this.isShootPressed() && carrier.possessionTime > 0.04) {
        this.executeShot(carrier, {
          score: Math.max(shot.score, 0.7),
          type: "slap",
          traffic: shot.traffic
        });
      }
      return;
    }

    if (shot.score > 0.72 && (!pass || shot.score > pass.score + 0.1)) {
      this.executeShot(carrier, shot);
      return;
    }
    if (pass && pass.score > 0.44) {
      this.executePass(carrier, pass);
      return;
    }
    if (pressure && shot.score > 0.42) {
      this.executeShot(carrier, shot);
    }
  }

  evaluateShotChance(carrier) {
    const netX = this.getOpponentNetX(carrier.side);
    const dx = netX - carrier.x;
    const dy = this.centerY - carrier.y;
    const dist = Math.hypot(dx, dy);
    const angleFactor = 1 - clamp(Math.abs(dy) / 230, 0, 1);
    const distanceFactor = 1 - clamp((dist - 90) / 450, 0, 1);
    const traffic = this.countShotLaneTraffic(carrier);
    const goalie = this.players.find((player) => player.side !== carrier.side && player.role === "G");
    const goalieOffset = goalie ? clamp(Math.abs(goalie.y - this.centerY) / 90, 0, 1) : 0;
    const fatiguePenalty = carrier.fatigue * 0.26;
    const speedPenalty = clamp(Math.hypot(carrier.vx, carrier.vy) / carrier.topSpeed, 0, 1) * 0.22;
    const score = clamp(
      distanceFactor * 0.36 +
        angleFactor * 0.28 +
        this.statScale(carrier.attributes.shotAccuracy, 0.12, 0.3) -
        traffic * 0.32 -
        fatiguePenalty -
        speedPenalty +
        goalieOffset * 0.08,
      0,
      1
    );

    let type = "wrist";
    if (dist > 295) {
      type = "slap";
    } else if (this.getNearestOpponentDistance(carrier) < 56) {
      type = "snap";
    }
    if (carrier.possessionTime < 0.16 && dist < 230) {
      type = "one_timer";
    }
    return { score, type, traffic };
  }

  countShotLaneTraffic(carrier) {
    const net = { x: this.getOpponentNetX(carrier.side), y: this.centerY };
    let traffic = 0;
    this.players.forEach((player) => {
      if (player.side === carrier.side || player.role === "G") {
        return;
      }
      const info = distanceToSegment(player, carrier, net);
      if (info.t > 0 && info.t < 1) {
        const reach = player.r + 12;
        if (info.distance < reach) {
          traffic += (1 - info.distance / reach) * 0.22;
        }
      }
    });
    return clamp(traffic, 0, 1.2);
  }

  findBestPassOption(carrier) {
    const teammates = this.players.filter((player) => player.side === carrier.side && player.id !== carrier.id && player.role !== "G");
    let best = null;
    teammates.forEach((target) => {
      const dist = distance(carrier, target);
      if (dist < 50 || dist > 420) {
        return;
      }
      const laneRisk = this.getLaneInterceptionRisk(carrier, target);
      const laneOpen = 1 - laneRisk;
      const readiness = clamp(
        dot2(
          { x: target.headingX, y: target.headingY },
          unitVector(this.getOpponentNetX(target.side) - target.x, this.centerY - target.y)
        ) * 0.5 + 0.5,
        0,
        1
      );
      const tactical = clamp(1 - Math.abs(target.y - this.centerY) / 260, 0, 1) * 0.35 +
        clamp(Math.abs(this.getOpponentNetX(carrier.side) - target.x) / this.width, 0, 1) * 0.4;
      const spacing = 1 - Math.abs(dist - 170) / 230;
      const score = laneOpen * 0.5 + readiness * 0.18 + tactical * 0.2 + spacing * 0.12;
      if (!best || score > best.score) {
        const type = dist < 110 ? "soft" : laneRisk < 0.28 ? "hard" : "lead";
        const lead = type === "lead" ? 0.28 : 0.14;
        best = {
          target,
          type,
          score,
          aimX: target.x + target.vx * lead,
          aimY: target.y + target.vy * lead
        };
      }
    });
    return best;
  }

  getLaneInterceptionRisk(from, to) {
    let risk = 0;
    this.players.forEach((opponent) => {
      if (opponent.side === from.side || opponent.role === "G") {
        return;
      }
      const info = distanceToSegment(opponent, from, to);
      if (info.t <= 0 || info.t >= 1) {
        return;
      }
      const reach = opponent.r + 10 + opponent.attributes.reaction * 0.06;
      if (info.distance < reach) {
        const timing = 1 - info.t;
        risk += (1 - info.distance / reach) * (0.45 + timing * 0.4);
      }
    });
    return clamp(risk, 0, 1.2);
  }

  executePass(carrier, option) {
    const aim = { x: option.aimX, y: option.aimY };
    const dir = unitVector(aim.x - this.puck.x, aim.y - this.puck.y);
    const speed =
      option.type === "soft"
        ? 360
        : option.type === "hard"
          ? 560
          : option.type === "lead"
            ? 470
            : 430;
    this.clearPuckCarrier();
    this.puck.vx = dir.x * speed + carrier.vx * 0.28;
    this.puck.vy = dir.y * speed + carrier.vy * 0.28;
    carrier.passCooldown = option.type === "soft" ? 0.18 : 0.24;
    carrier.shotCooldown = 0.12;
    carrier.possessionTime = 0;
  }

  executeShot(carrier, shot) {
    const goalie = this.players.find((player) => player.side !== carrier.side && player.role === "G");
    const netX = this.getOpponentNetX(carrier.side);
    const goalieBias = goalie ? clamp((this.centerY - goalie.y) / 2.3, -56, 56) : 0;
    const pressure = this.getNearestOpponentDistance(carrier) < 60 ? 1 : 0;
    const fatiguePenalty = carrier.fatigue * 0.4;
    const speedPenalty = clamp(Math.hypot(carrier.vx, carrier.vy) / carrier.topSpeed, 0, 1) * 0.24;
    const trafficPenalty = shot.traffic * 0.3;
    const accuracy =
      this.statScale(carrier.attributes.shotAccuracy, 0.7, 1.08) * (1 - fatiguePenalty - speedPenalty - trafficPenalty);
    const spread =
      shot.type === "slap"
        ? 80
        : shot.type === "one_timer"
          ? 58
          : shot.type === "snap"
            ? 68
            : 62;
    const targetY = this.centerY + goalieBias + (Math.random() - 0.5) * spread * (2 - clamp(accuracy, 0.35, 1.2));
    const dir = unitVector(netX - this.puck.x, targetY - this.puck.y);
    const powerBase =
      shot.type === "slap" ? 770 : shot.type === "one_timer" ? 720 : shot.type === "snap" ? 680 : 620;
    const power = powerBase * this.statScale(carrier.attributes.shotPower, 0.8, 1.2) * (0.82 + carrier.stamina * 0.18);
    this.clearPuckCarrier();
    this.puck.vx = dir.x * power + carrier.vx * 0.32;
    this.puck.vy = dir.y * power + carrier.vy * 0.32;
    carrier.shotCooldown = shot.type === "slap" ? 0.45 : 0.3;
    carrier.passCooldown = 0.16;
    carrier.possessionTime = 0;
  }

  getNearestOpponentDistance(player) {
    let minDist = Infinity;
    this.players.forEach((opponent) => {
      if (opponent.side === player.side) {
        return;
      }
      minDist = Math.min(minDist, distance(player, opponent));
    });
    return minDist;
  }

  updatePuck(dt) {
    const carrier = this.getPuckCarrier();
    if (carrier) {
      this.puck.x = clamp(this.puck.x, this.puck.r, this.width - this.puck.r);
      this.puck.y = clamp(this.puck.y, this.puck.r, this.height - this.puck.r);
      return;
    }

    this.puck.x += this.puck.vx * dt;
    this.puck.y += this.puck.vy * dt;
    this.puck.vx *= 0.992;
    this.puck.vy *= 0.992;
    const minBoardRebound = 130;

    if (this.puck.y < this.puck.r) {
      this.puck.y = this.puck.r;
      this.puck.vy = Math.max(Math.abs(this.puck.vy) * 0.9, minBoardRebound);
      this.puck.vx += (Math.random() - 0.5) * 34;
    }

    if (this.puck.y > this.height - this.puck.r) {
      this.puck.y = this.height - this.puck.r;
      this.puck.vy = -Math.max(Math.abs(this.puck.vy) * 0.9, minBoardRebound);
      this.puck.vx += (Math.random() - 0.5) * 34;
    }

    const inGoalY = this.puck.y > this.goalTop && this.puck.y < this.goalBottom;
    if (!inGoalY) {
      if (this.puck.x < this.puck.r) {
        this.puck.x = this.puck.r;
        this.puck.vx = Math.max(Math.abs(this.puck.vx) * 0.9, minBoardRebound);
        this.puck.vy += (Math.random() - 0.5) * 34;
      }
      if (this.puck.x > this.width - this.puck.r) {
        this.puck.x = this.width - this.puck.r;
        this.puck.vx = -Math.max(Math.abs(this.puck.vx) * 0.9, minBoardRebound);
        this.puck.vy += (Math.random() - 0.5) * 34;
      }
    }

    const speed = Math.hypot(this.puck.vx, this.puck.vy);
    const nearBoards = this.puck.x < this.puck.r + 7 || this.puck.x > this.width - this.puck.r - 7 || this.puck.y < this.puck.r + 7 || this.puck.y > this.height - this.puck.r - 7;
    if (nearBoards && speed < 110) {
      const toCenter = unitVector(this.width / 2 - this.puck.x, this.height / 2 - this.puck.y);
      this.puck.vx += toCenter.x * 210;
      this.puck.vy += toCenter.y * 210;
    }

    this.applyBoardEscapeForce(dt);
  }

  applyBoardEscapeForce(dt) {
    const margin = this.puck.r + 12;
    const inGoalY = this.puck.y > this.goalTop && this.puck.y < this.goalBottom;
    const left = inGoalY ? 1 : this.puck.x - margin;
    const right = inGoalY ? 1 : this.width - margin - this.puck.x;
    const top = this.puck.y - margin;
    const bottom = this.height - margin - this.puck.y;
    const nearBoard = left < 0 || right < 0 || top < 0 || bottom < 0;
    if (!nearBoard) {
      return;
    }

    let nx = 0;
    let ny = 0;
    if (left < 0) {
      nx += 1;
    }
    if (right < 0) {
      nx -= 1;
    }
    if (top < 0) {
      ny += 1;
    }
    if (bottom < 0) {
      ny -= 1;
    }

    const inward = unitVector(nx, ny);
    const nearCorner = (left < 0 || right < 0) && (top < 0 || bottom < 0);
    const nearbySkaters = this.players.filter((player) => player.role !== "G" && distance(player, this.puck) < 58);
    const leftNearCount = nearbySkaters.filter((player) => player.side === "left").length;
    const rightNearCount = nearbySkaters.filter((player) => player.side === "right").length;
    const cornerScrum = nearCorner && leftNearCount === 1 && rightNearCount === 1;

    if (cornerScrum && this.scrumKickCooldown <= 0) {
      const hardKick = 410;
      const tangentDir = unitVector(-inward.y, inward.x);
      const tangentKick = (Math.random() < 0.5 ? -1 : 1) * 150;
      this.puck.vx += inward.x * hardKick + tangentDir.x * tangentKick;
      this.puck.vy += inward.y * hardKick + tangentDir.y * tangentKick;
      this.scrumKickCooldown = 0.35;
    }

    const inwardSpeed = dot2({ x: this.puck.vx, y: this.puck.vy }, inward);
    const maxPenetration = Math.max(-left, -right, -top, -bottom, 0);
    const escapeBase = (cornerScrum ? 300 : 185) + maxPenetration * (cornerScrum ? 23 : 16);
    if (inwardSpeed < escapeBase) {
      const boost = (escapeBase - inwardSpeed) * (0.65 + Math.min(dt * 9, 0.35));
      this.puck.vx += inward.x * boost;
      this.puck.vy += inward.y * boost;
    }

    // Add slight tangential energy so the puck slides out of corners instead of pinning.
    const tangent = { x: -inward.y, y: inward.x };
    const tangentSpeed = dot2({ x: this.puck.vx, y: this.puck.vy }, tangent);
    if (Math.abs(tangentSpeed) < (cornerScrum ? 105 : 55)) {
      const tangentKick = (Math.random() < 0.5 ? -1 : 1) * (cornerScrum ? 120 : 70);
      this.puck.vx += tangent.x * tangentKick;
      this.puck.vy += tangent.y * tangentKick;
    }

    if (!inGoalY) {
      this.puck.x = clamp(this.puck.x, this.puck.r + 1, this.width - this.puck.r - 1);
    }
    this.puck.y = clamp(this.puck.y, this.puck.r + 1, this.height - this.puck.r - 1);
  }

  checkGoal() {
    const inGoalY = this.puck.y > this.goalTop && this.puck.y < this.goalBottom;
    if (!inGoalY) {
      return;
    }

    if (this.puck.x < this.leftGoalX) {
      this.registerGoal("right");
    }

    if (this.puck.x > this.rightGoalX) {
      this.registerGoal("left");
    }
  }

  registerGoal(sideScored) {
    this.triggerGoalCelebration(sideScored);
    this.sideScores[sideScored] += 1;
    this.resetFaceoff(false, { x: this.width / 2, y: this.height / 2 });
  }

  triggerGoalCelebration(sideScored) {
    const scoredNetSide = sideScored === "left" ? "right" : "left";
    this.goalSignal.side = scoredNetSide;
    this.goalSignal.timer = 1.7;
    this.playGoalHorn();
  }

  playGoalHorn() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      return;
    }
    if (!this.audioCtx) {
      this.audioCtx = new AudioCtx();
    }
    const ctx = this.audioCtx;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);

    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    oscA.type = "sawtooth";
    oscB.type = "square";
    oscA.frequency.setValueAtTime(168, now);
    oscB.frequency.setValueAtTime(126, now);
    oscA.frequency.linearRampToValueAtTime(152, now + 0.9);
    oscB.frequency.linearRampToValueAtTime(114, now + 0.9);
    oscA.connect(gain);
    oscB.connect(gain);
    oscA.start(now);
    oscB.start(now);
    oscA.stop(now + 0.95);
    oscB.stop(now + 0.95);
  }

  getFaceoffSpots() {
    const endLineOffset = 84;
    const faceoffX = endLineOffset + 118;
    const rightFaceoffX = this.width - faceoffX;
    const topFaceoffY = this.height * 0.24;
    const bottomFaceoffY = this.height * 0.76;
    return [
      { x: this.width / 2, y: this.height / 2 },
      { x: faceoffX, y: topFaceoffY },
      { x: rightFaceoffX, y: topFaceoffY },
      { x: faceoffX, y: bottomFaceoffY },
      { x: rightFaceoffX, y: bottomFaceoffY }
    ];
  }

  getNearestFaceoffSpot(x, y) {
    const spots = this.getFaceoffSpots();
    let best = spots[0];
    let bestDist = Infinity;
    spots.forEach((spot) => {
      const d = Math.hypot(x - spot.x, y - spot.y);
      if (d < bestDist) {
        bestDist = d;
        best = spot;
      }
    });
    return best;
  }

  setupSkatersForFaceoff(spot) {
    const laneYByPosition = {
      LW: -52,
      C: 0,
      RW: 52,
      D1: -92,
      D2: 92
    };
    this.players.forEach((player) => {
      if (player.role === "G") {
        player.x = player.homeX;
        player.y = player.homeY;
      } else {
        const sideOffsetDir = player.side === "left" ? -1 : 1;
        const xOffset = player.position === "C" ? 38 : player.role === "D" ? 92 : 66;
        const yOffset = laneYByPosition[player.position] || 0;
        player.x = clamp(spot.x + sideOffsetDir * xOffset, this.playerBounds.minX, this.playerBounds.maxX);
        player.y = clamp(spot.y + yOffset, this.playerBounds.minY, this.playerBounds.maxY);
      }
      const towardDot = unitVector(spot.x - player.x, spot.y - player.y);
      player.headingX = towardDot.x;
      player.headingY = towardDot.y;
      player.vx = 0;
      player.vy = 0;
      player.stun = 0;
      player.shotCooldown = 0;
      player.passCooldown = 0;
      player.pokeCooldown = 0;
      player.checkCooldown = 0;
      player.checkWindow = 0;
      player.balanceState = 1;
      player.possessionTime = 0;
      player.state = "support_puck";
      player.stateTime = 0;
      player.decisionCooldown = 0;
      this.limitPlayerToRink(player);
    });
  }

  resetFaceoff(initial, spot = null) {
    const faceoffSpot = spot || { x: this.width / 2, y: this.height / 2 };
    this.setupSkatersForFaceoff(faceoffSpot);

    this.clearPuckCarrier();
    this.puckOwnership.lastSide = null;
    this.puckOwnership.lastCarrierId = null;
    this.puckOwnership.turnoverPulse = 0;
    this.puck.x = faceoffSpot.x;
    this.puck.y = faceoffSpot.y;
    this.puck.vx = (Math.random() - 0.5) * 40;
    this.puck.vy = (Math.random() - 0.5) * 40;
    this.scrumKickCooldown = 0;
    this.resetBoardStuckTracker();
    this.faceoffDelay = initial ? 0.6 : 0.95;
  }

  getHomeScore() {
    return this.sideScores[this.homeSide];
  }

  getAwayScore() {
    return this.sideScores[this.awaySide];
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    this.drawRink();

    const sorted = [...this.players].sort((a, b) => (a.role === "G" ? -1 : 0) - (b.role === "G" ? -1 : 0));
    sorted.forEach((player) => this.drawPlayer(player));

    ctx.fillStyle = "#1f2631";
    ctx.beginPath();
    ctx.arc(this.puck.x, this.puck.y, this.puck.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#47596a";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (this.gameOverPending) {
      this.drawFinalOverlay();
    }

    ctx.fillStyle = "rgba(25, 47, 71, 0.8)";
    ctx.font = "700 16px Titillium Web";
    let centerText = "";
    if (this.gameOverPending) {
      centerText = "FINAL SCORE";
    } else if (this.faceoffDelay > 0) {
      centerText = "FACEOFF";
    } else if (this.warningTimer > 0) {
      centerText = "FINAL MINUTE";
    }
    if (centerText) {
      const textWidth = ctx.measureText(centerText).width;
      ctx.fillText(centerText, this.width / 2 - textWidth / 2, 36);
    }

    if (!this.gameOverPending) {
      const checkText = this.userSkater.checkCooldown <= 0 ? "SHIFT CHECK: READY" : `SHIFT CHECK: ${this.userSkater.checkCooldown.toFixed(1)}s`;
      ctx.fillStyle = "rgba(22, 45, 67, 0.9)";
      ctx.font = "700 13px Titillium Web";
      ctx.fillText(checkText, 24, 28);
    }
  }

  drawFinalOverlay() {
    const ctx = this.ctx;
    const w = 440;
    const h = 170;
    const x = this.width / 2 - w / 2;
    const y = this.height / 2 - h / 2;

    ctx.fillStyle = "rgba(50, 58, 69, 0.56)";
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.beginPath();
    roundedRectPath(ctx, x, y, w, h, 16);
    ctx.fillStyle = "rgba(11, 23, 37, 0.92)";
    ctx.fill();
    ctx.strokeStyle = "rgba(170, 205, 236, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#d6ecff";
    ctx.font = "700 18px Titillium Web";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("FINAL SCORE", this.width / 2, y + 36);

    ctx.fillStyle = "#ffe796";
    ctx.font = "700 28px Titillium Web";
    const scoreText = `${formatTeamName(this.match.home)} ${this.getHomeScore()} - ${this.getAwayScore()} ${formatTeamName(this.match.away)}`;
    ctx.fillText(scoreText, this.width / 2, y + 86);

    ctx.fillStyle = "rgba(174, 206, 233, 0.95)";
    ctx.font = "700 14px Titillium Web";
    const remaining = Math.max(1, Math.ceil(this.gameOverHold));
    ctx.fillText(`Returning to tournament in ${remaining}s`, this.width / 2, y + 130);
  }

  drawRink() {
    const ctx = this.ctx;
    const inset = 6;
    const cornerRadius = 38;
    const endLineOffset = 84;
    const faceoffRadius = 44;
    const leftFaceoffX = endLineOffset + 118;
    const rightFaceoffX = this.width - leftFaceoffX;
    const topFaceoffY = this.height * 0.24;
    const bottomFaceoffY = this.height * 0.76;
    const neutralDotOffsetX = 132;
    const neutralDotOffsetY = 118;

    ctx.fillStyle = "#e7edf2";
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.beginPath();
    roundedRectPath(ctx, inset, inset, this.width - inset * 2, this.height - inset * 2, cornerRadius);
    ctx.fillStyle = "#edf2f6";
    ctx.fill();

    ctx.strokeStyle = "#e33845";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.strokeStyle = "#e33845";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(endLineOffset, inset);
    ctx.lineTo(endLineOffset, this.height - inset);
    ctx.moveTo(this.width - endLineOffset, inset);
    ctx.lineTo(this.width - endLineOffset, this.height - inset);
    ctx.stroke();

    ctx.strokeStyle = "#646db8";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(this.darkBlueLeft, inset);
    ctx.lineTo(this.darkBlueLeft, this.height - inset);
    ctx.moveTo(this.darkBlueRight, inset);
    ctx.lineTo(this.darkBlueRight, this.height - inset);
    ctx.stroke();

    ctx.strokeStyle = "#e33845";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(this.width / 2, inset);
    ctx.lineTo(this.width / 2, this.height - inset);
    ctx.stroke();

    ctx.strokeStyle = "#646db8";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(this.width / 2, this.height / 2, 64, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#3457b7";
    ctx.beginPath();
    ctx.arc(this.width / 2, this.height / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#e65060";
    ctx.lineWidth = 2.4;
    ctx.strokeRect(0, this.goalTop, 14, this.goalBottom - this.goalTop);
    ctx.strokeRect(this.width - 14, this.goalTop, 14, this.goalBottom - this.goalTop);
    this.drawGoalLight();

    ctx.fillStyle = "rgba(102, 112, 189, 0.35)";
    ctx.beginPath();
    ctx.moveTo(endLineOffset, this.centerY - 20);
    ctx.arc(endLineOffset, this.centerY, 20, -Math.PI / 2, Math.PI / 2, false);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(this.width - endLineOffset, this.centerY - 20);
    ctx.arc(this.width - endLineOffset, this.centerY, 20, -Math.PI / 2, Math.PI / 2, true);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#e33845";
    [
      [this.width / 2 - neutralDotOffsetX, this.centerY - neutralDotOffsetY],
      [this.width / 2 + neutralDotOffsetX, this.centerY - neutralDotOffsetY],
      [this.width / 2 - neutralDotOffsetX, this.centerY + neutralDotOffsetY],
      [this.width / 2 + neutralDotOffsetX, this.centerY + neutralDotOffsetY]
    ].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    [
      [leftFaceoffX, topFaceoffY],
      [rightFaceoffX, topFaceoffY],
      [leftFaceoffX, bottomFaceoffY],
      [rightFaceoffX, bottomFaceoffY]
    ].forEach(([x, y]) => {
      ctx.strokeStyle = "#e33845";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(x, y, faceoffRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#e33845";
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x - 14, y);
      ctx.lineTo(x - 6, y);
      ctx.moveTo(x + 6, y);
      ctx.lineTo(x + 14, y);
      ctx.moveTo(x, y - 14);
      ctx.lineTo(x, y - 6);
      ctx.moveTo(x, y + 6);
      ctx.lineTo(x, y + 14);
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  drawGoalLight() {
    if (this.goalSignal.timer <= 0 || !this.goalSignal.side) {
      return;
    }

    const ctx = this.ctx;
    const pulse = 0.45 + Math.sin(performance.now() / 90) * 0.2;
    const alpha = clamp(this.goalSignal.timer / 1.7, 0.25, 1) * pulse;
    const x = this.goalSignal.side === "left" ? 26 : this.width - 26;
    const y = this.centerY;
    const radius = 34;

    const glow = ctx.createRadialGradient(x, y, 8, x, y, radius);
    glow.addColorStop(0, `rgba(124, 255, 156, ${0.9 * alpha})`);
    glow.addColorStop(0.5, `rgba(57, 212, 95, ${0.55 * alpha})`);
    glow.addColorStop(1, "rgba(57, 212, 95, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(172, 255, 190, ${0.95 * alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPlayer(player) {
    const badge = this.getKitProfile(player.team, player.side);
    const x = player.x;
    const y = player.y;
    const r = player.r;
    const ctx = this.ctx;

    ctx.fillStyle = badge.primary;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = player.side === "left" ? "#0e2f53" : "#4d1720";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = badge.secondary;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.52, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f7fbff";
    ctx.beginPath();
    ctx.arc(x, y - r * 0.86, r * 0.33, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = badge.text;
    ctx.font = `700 ${Math.max(8, Math.floor(r * 0.43))}px Titillium Web`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badge.code, x, y + 0.6);

    ctx.fillStyle = "rgba(255, 255, 255, 0.84)";
    ctx.font = `700 ${Math.max(8, Math.floor(r * 0.45))}px Titillium Web`;
    ctx.fillText(player.position || player.role, x, y + r * 0.97);

    if (player.isUser) {
      ctx.strokeStyle = "#ffd86a";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(x, y, r + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (player.checkWindow > 0) {
      ctx.strokeStyle = "rgba(255, 216, 106, 0.9)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, r + 9, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (player.stun > 0) {
      ctx.strokeStyle = "rgba(255, 93, 93, 0.82)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, r + 6, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function unitVector(x, y) {
  const mag = Math.hypot(x, y) || 1;
  return { x: x / mag, y: y / mag };
}

function dot2(a, b) {
  return a.x * b.x + a.y * b.y;
}

function rotateVectorToward(current, target, maxAngle) {
  const cur = unitVector(current.x, current.y);
  const tgt = unitVector(target.x, target.y);
  const curAngle = Math.atan2(cur.y, cur.x);
  const tgtAngle = Math.atan2(tgt.y, tgt.x);
  const delta = normalizeAngle(tgtAngle - curAngle);
  const step = clamp(delta, -maxAngle, maxAngle);
  return { x: Math.cos(curAngle + step), y: Math.sin(curAngle + step) };
}

function normalizeAngle(value) {
  let angle = value;
  while (angle > Math.PI) {
    angle -= Math.PI * 2;
  }
  while (angle < -Math.PI) {
    angle += Math.PI * 2;
  }
  return angle;
}

function distanceToSegment(point, a, b) {
  const abX = b.x - a.x;
  const abY = b.y - a.y;
  const abLen2 = abX * abX + abY * abY || 1;
  const t = clamp(((point.x - a.x) * abX + (point.y - a.y) * abY) / abLen2, 0, 1);
  const projX = a.x + abX * t;
  const projY = a.y + abY * t;
  return { distance: Math.hypot(point.x - projX, point.y - projY), t };
}

function roundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
}

init();
