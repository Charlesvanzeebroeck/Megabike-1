import { getSupabase, getAuthToken, setAuthToken, parseJwt } from "./supabaseClient";
import * as MockApi from "./mockApi";
import { debugLog } from "./debug";

// Re-export common auth helpers for components
export { getAuthToken, setAuthToken, parseJwt };

// --- CONFIG ---
const OFFLINE_MODE = process.env.REACT_APP_OFFLINE === "true";
export const LOCK_DATE = "2026-02-27T00:00:00+01:00";
export const REVEAL_DATE = "2026-02-27T00:00:00+01:00";

// --- API FUNCTIONS ---

// 1. Auth: Calls Serverless Function /api/verify-code
export async function verifyAccessCode(accessCode) {
  if (OFFLINE_MODE) return MockApi.mockLogin(accessCode);

  try {
    const res = await fetch("/api/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessCode }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "La connexion a échoué");
    }

    const data = await res.json();
    setAuthToken(data.token); // Update the client immediately
    return data; // { token, user: { id, displayName... } }
  } catch (err) {
    debugLog("verifyAccessCode error", err);
    throw err;
  }
}

// 2. User Profile: Supabase Direct
export async function getMe() {
  if (OFFLINE_MODE) return MockApi.mockGetMe();

  const token = getAuthToken();
  if (!token) throw new Error("Non authentifié");

  const jwt = parseJwt(token);
  if (!jwt || !jwt.sub) throw new Error("Jeton invalide");

  const userId = jwt.sub;

  const { data, error } = await getSupabase()
    .from("users")
    .select("id, display_name, profile_image_url")
    .eq("id", userId)
    .single();

  if (error) {
    debugLog("getMe error", error);
    if (error.code === "PGRST116" || error.code === "401" || error.message?.includes("JWT")) {
      console.error("CRITICAL AUTH ERROR:", error);
      console.warn("Retaining token for debugging purposes.");
    }
    throw error;
  }

  return {
    id: data.id,
    displayName: data.display_name,
    profileImageUrl: data.profile_image_url
  };
}

export async function updateMe(payload) {
  if (OFFLINE_MODE) return MockApi.mockUpdateMe(payload);

  const token = getAuthToken();
  if (!token) throw new Error("Non authentifié");
  const jwt = parseJwt(token);
  if (!jwt || !jwt.sub) throw new Error("Jeton invalide");
  const userId = jwt.sub;

  const updates = {};
  if (payload.displayName) updates.display_name = payload.displayName;
  if (payload.profileImageUrl !== undefined) updates.profile_image_url = payload.profileImageUrl;

  const { data, error } = await getSupabase()
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    displayName: data.display_name,
    profileImageUrl: data.profile_image_url
  };
}


// 3. Races: Public Read
export async function getLatestRace() {
  if (OFFLINE_MODE) return MockApi.mockLatestRace();

  const today = new Date().toISOString().slice(0, 10);

  // Latest race
  const { data: race, error: raceErr } = await getSupabase()
    .from("races")
    .select("id, name, race_date")
    .lte("race_date", today)
    .order("race_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (raceErr) throw raceErr;
  if (!race) return null;

  // Results
  const { data: results, error: resErr } = await getSupabase()
    .from("race_results")
    .select("rank, points_awarded, riders(rider_name, team_name, photo_url)")
    .eq("race_id", race.id)
    .order("rank", { ascending: true })
    .limit(50);

  if (resErr) throw resErr;

  return {
    name: race.name,
    date: race.race_date,
    results: (results || []).map(r => ({
      rider: r.riders?.rider_name,
      team: r.riders?.team_name ?? "",
      photo_url: r.riders?.photo_url,
      points: r.points_awarded,
      rank: r.rank
    }))
  };
}

export async function getNextRace() {
  if (OFFLINE_MODE) return MockApi.mockNextRace();

  const today = new Date().toISOString().slice(0, 10);
  const { data: race, error } = await getSupabase()
    .from("races")
    .select("id, name, race_date")
    .gt("race_date", today)
    .order("race_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!race) return null;

  return {
    name: race.name,
    date: race.race_date
  };
}


// 4. Teams & Leaderboard
export async function getMyTeam(season = 2026) {
  if (OFFLINE_MODE) return MockApi.mockMyTeam(season);

  const token = getAuthToken();
  if (!token) return null;
  const jwt = parseJwt(token);
  if (!jwt || !jwt.sub) return null;
  const userId = jwt.sub;

  const { data: team, error } = await getSupabase()
    .from("teams")
    .select("*")
    .eq("user_id", userId)
    .eq("season_year", season)
    .maybeSingle();

  if (error) throw error;
  if (!team) return null;

  const { data: teamRiders } = await getSupabase()
    .from("team_riders")
    .select(`
      slot,
      riders (
        id, rider_name, team_name, nationality, active, photo_url,
        rider_prices(season_year, price),
        rider_points(season_year, points)
      )
    `)
    .eq("team_id", team.id);

  return {
    id: team.id,
    teamName: team.team_name,
    totalPrice: team.total_cost,
    points: team.points,
    season: team.season_year,
    riders: (teamRiders || []).map(tr => {
      const r = tr.riders;
      const priceObj = r.rider_prices?.find(p => p.season_year === season);
      const pointsObj = r.rider_points?.find(p => p.season_year === season);

      return {
        id: r.id,
        rider_name: r.rider_name,
        team_name: r.team_name,
        nationality: r.nationality,
        active: r.active,
        photo_url: r.photo_url,
        price: priceObj ? priceObj.price : 0,
        points: pointsObj ? pointsObj.points : 0
      };
    })
  };
}

// Helper to check lock date
function checkLockDate() {
  const now = new Date();
  const lock = new Date(LOCK_DATE);
  if (now > lock) {
    throw new Error("La création/mise à jour d'équipe est verrouillée pour cette saison.");
  }
}

export async function createMyTeam(payload, season = 2026) {
  if (OFFLINE_MODE) return; // Mocks don't persist
  checkLockDate();

  const token = getAuthToken();
  if (!token) throw new Error("Non authentifié");
  const jwt = parseJwt(token);
  if (!jwt || !jwt.sub) throw new Error("Jeton invalide");
  const userId = jwt.sub;

  const riderIds = payload.riders.map(r => r.id).filter(Boolean);

  const { data: dbRiders, error: ridersFetchErr } = await getSupabase()
    .from("riders")
    .select(`id, rider_name, rider_prices(season_year, price)`)
    .in("id", riderIds);

  if (ridersFetchErr) throw ridersFetchErr;

  let totalCost = 0;
  const riderInserts = [];
  const riderMap = new Map(dbRiders.map(r => [r.id, r]));

  for (let i = 0; i < payload.riders.length; i++) {
    const inputRider = payload.riders[i];
    const dbRider = riderMap.get(inputRider.id);
    if (!dbRider) throw new Error(`Coureur non trouvé : ${inputRider.rider_name}`);

    const priceObj = dbRider.rider_prices?.find(p => p.season_year === season);
    const price = priceObj ? priceObj.price : 0;
    totalCost += price;

    riderInserts.push({
      rider_id: dbRider.id,
      slot: i + 1,
    });
  }

  const { data: team, error: teamErr } = await getSupabase()
    .from("teams")
    .insert({
      user_id: userId,
      team_name: payload.teamName,
      season_year: season,
      total_cost: totalCost,
      points: 0
    })
    .select()
    .single();

  if (teamErr) throw teamErr;

  const finalRiderInserts = riderInserts.map(r => ({ ...r, team_id: team.id }));
  const { error: ridersErr } = await getSupabase().from("team_riders").insert(finalRiderInserts);
  if (ridersErr) throw ridersErr;

  return team;
}

export async function updateMyTeam(teamId, payload, season = 2026) {
  if (OFFLINE_MODE) return;
  checkLockDate();

  const token = getAuthToken();
  if (!token) throw new Error("Non authentifié");

  const riderIds = payload.riders.map(r => r.id).filter(Boolean);
  const { data: dbRiders, error: ridersFetchErr } = await getSupabase()
    .from("riders")
    .select(`id, rider_name, rider_prices(season_year, price)`)
    .in("id", riderIds);

  if (ridersFetchErr) throw ridersFetchErr;

  let totalCost = 0;
  const riderInserts = [];
  const riderMap = new Map(dbRiders.map(r => [r.id, r]));

  for (let i = 0; i < payload.riders.length; i++) {
    const inputRider = payload.riders[i];
    const dbRider = riderMap.get(inputRider.id);
    if (!dbRider) throw new Error(`Coureur non trouvé : ${inputRider.rider_name}`);

    const priceObj = dbRider.rider_prices?.find(p => p.season_year === season);
    totalCost += (priceObj ? priceObj.price : 0);

    riderInserts.push({
      team_id: teamId,
      rider_id: dbRider.id,
      slot: i + 1,
    });
  }

  const { error: teamErr } = await getSupabase()
    .from("teams")
    .update({
      team_name: payload.teamName,
      total_cost: totalCost,
    })
    .eq("id", teamId);

  if (teamErr) throw teamErr;

  const { error: delErr } = await getSupabase()
    .from("team_riders")
    .delete()
    .eq("team_id", teamId);

  if (delErr) throw delErr;

  const { error: insErr } = await getSupabase()
    .from("team_riders")
    .insert(riderInserts);

  if (insErr) throw insErr;

  return { id: teamId, total_cost: totalCost };
}

export async function getCurrentLeaderboard(season = 2026) {
  if (OFFLINE_MODE) return MockApi.mockLeaderboard();

  const { data, error } = await getSupabase()
    .from("teams")
    .select("id, team_name, points, users(display_name)")
    .eq("season_year", season)
    .order("points", { ascending: false })
    .limit(200);

  if (error) throw error;

  return {
    teams: data.map(t => ({
      id: t.id,
      teamName: t.team_name,
      points: t.points,
      ownerName: t.users?.display_name
    }))
  };
}

export async function getTeamById(teamId, season = 2026) {
  if (OFFLINE_MODE) return null;

  const { data: team, error } = await getSupabase()
    .from("teams")
    .select("*, users(display_name)")
    .eq("id", teamId)
    .single();

  if (error) return null;

  const { data: teamRiders } = await getSupabase()
    .from("team_riders")
    .select(`
      slot,
      riders (
        id, rider_name, team_name, nationality, active, photo_url,
        rider_prices(season_year, price),
        rider_points(season_year, points)
      )
    `)
    .eq("team_id", team.id);

  return {
    id: team.id,
    userId: team.user_id,
    teamName: team.team_name,
    ownerName: team.users?.display_name,
    points: team.points,
    totalPrice: team.total_cost,
    season: team.season_year,
    riders: (teamRiders || []).map(tr => {
      const r = tr.riders;
      const priceObj = r.rider_prices?.find(p => p.season_year === team.season_year);
      const pointsObj = r.rider_points?.find(p => p.season_year === team.season_year);

      return {
        id: r.id,
        rider_name: r.rider_name,
        team_name: r.team_name,
        nationality: r.nationality,
        active: r.active,
        photo_url: r.photo_url,
        price: priceObj ? priceObj.price : 0,
        points: pointsObj ? pointsObj.points : 0
      };
    })
  };
}

export async function searchRiders(filters = {}, season = 2026) {
  if (OFFLINE_MODE) return [];

  const { query, team, minPrice = 0, maxPrice, limit = 50 } = filters;

  // Fetch active riders in two pages to work around Supabase's 1000-row default limit
  let queryBuilder = getSupabase()
    .from("riders")
    .select(`
      id, rider_name, team_name, nationality, active, photo_url,
      rider_prices(season_year, price)
    `)
    .eq("active", true)
    .order("rider_name", { ascending: true });

  // Apply text search
  if (query && query.length >= 2) {
    queryBuilder = queryBuilder.ilike("rider_name", `%${query}%`);
  }

  // Apply exact matches
  if (team) {
    queryBuilder = queryBuilder.eq("team_name", team);
  }

  // Fetch in two pages to get all ~1570 active riders
  const [page1, page2] = await Promise.all([
    queryBuilder.range(0, 999),
    queryBuilder.range(1000, 1999)
  ]);

  if (page1.error) {
    debugLog("searchRiders error (page1)", page1.error);
    return [];
  }

  const allData = [...(page1.data || []), ...(page2.data || [])];

  // Process and map prices
  let results = allData.map(r => {
    const priceObj = r.rider_prices?.find(p => p.season_year === season);
    return {
      id: r.id,
      rider_name: r.rider_name,
      team_name: r.team_name,
      nationality: r.nationality,
      active: r.active,
      photo_url: r.photo_url,
      price: priceObj ? priceObj.price : 0
    };
  });

  // Apply price range filters
  results = results.filter(r => r.price >= minPrice);
  if (maxPrice !== undefined && maxPrice !== null) {
    results = results.filter(r => r.price <= maxPrice);
  }

  // Sort by price
  if (filters.sortOrder === "asc") {
    results.sort((a, b) => a.price - b.price);
  } else {
    results.sort((a, b) => b.price - a.price);
  }

  // Apply limit
  return results.slice(0, limit);
}

export async function getFilterOptions(season = 2026) {
  if (OFFLINE_MODE) return { teams: [] };

  try {
    // Fetch all active riders to extract unique teams
    // In a real app with huge data, this might be a dedicated RPC or view
    const { data, error } = await getSupabase()
      .from("riders")
      .select("team_name")
      .eq("active", true);

    if (error) throw error;

    const teams = [...new Set(data.map(d => d.team_name).filter(Boolean))].sort();

    return { teams };
  } catch (error) {
    debugLog("getFilterOptions error", error);
    return { teams: [] };
  }
}

export async function getHistory() {
  if (OFFLINE_MODE) return MockApi.mockHistory();
  await getSupabase().from("seasons").select("*").order("season_year", { ascending: false });
  return { podium: [], mostTitles: [] }; // placeholder
}

export async function getAllRaces(season = 2026) {
  if (OFFLINE_MODE) return [];

  const startYear = `${season}-01-01`;
  const endYear = `${season}-12-31`;

  const { data: races, error } = await getSupabase()
    .from("races")
    .select("id, name, race_date")
    .gte("race_date", startYear)
    .lte("race_date", endYear)
    .order("race_date", { ascending: true }); // chronological order for dropdown

  if (error) throw error;
  return races || [];
}

export async function getRaceLeaderboard(raceId, season = 2026) {
  if (OFFLINE_MODE) return [];

  // 1. Fetch race results
  const { data: raceResults, error: rrErr } = await getSupabase()
    .from("race_results")
    .select("rider_id, points_awarded")
    .eq("race_id", raceId);

  if (rrErr) throw rrErr;
  if (!raceResults || raceResults.length === 0) return [];

  // 2. Fetch all teams for the season (to map riders to teams)
  // Optimization: In a real app with many users, we would filter teams that actually have these riders,
  // or use a DB view. For now, fetch all active teams for the season.
  const { data: teams, error: teamErr } = await getSupabase()
    .from("teams")
    .select("id, team_name, users(display_name)")
    .eq("season_year", season);

  if (teamErr) throw teamErr;

  // 3. Fetch team_riders for these teams
  const { data: teamRiders, error: trErr } = await getSupabase()
    .from("team_riders")
    .select("team_id, rider_id")
    .in("team_id", teams.map(t => t.id));

  if (trErr) throw trErr;

  // 4. Calculate points
  const riderPoints = {}; // riderId -> points
  for (const res of raceResults) {
    riderPoints[res.rider_id] = res.points_awarded;
  }

  const teamScores = []; // [{ team, points }]

  for (const team of teams) {
    // Find riders for this team
    const riders = teamRiders.filter(tr => tr.team_id === team.id);
    let score = 0;
    for (const tr of riders) {
      score += (riderPoints[tr.rider_id] || 0);
    }

    if (score > 0) {
      teamScores.push({
        id: team.id,
        teamName: team.team_name,
        ownerName: team.users?.display_name,
        points: score
      });
    }
  }

  // Sort by points desc
  teamScores.sort((a, b) => b.points - a.points);
  return teamScores;
}