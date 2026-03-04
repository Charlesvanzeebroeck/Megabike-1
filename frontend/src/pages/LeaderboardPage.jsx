import React from "react";
import { Link } from "react-router-dom";
import { useSeason } from "../context/SeasonContext";
import { getCurrentLeaderboard, getAllRaces, getRaceLeaderboard } from "../services/api";
import { debugLog } from "../services/debug";

import SeasonSelector from "../components/SeasonSelector";

export default function LeaderboardPage() {
    const { season } = useSeason();
    const [tab, setTab] = React.useState("general"); // "general" | "races"

    // Data states
    const [rows, setRows] = React.useState([]); // General leaderboard rows
    const [races, setRaces] = React.useState([]); // List of races
    const [selectedRaceId, setSelectedRaceId] = React.useState(null);
    const [raceRows, setRaceRows] = React.useState([]); // Race specific leaderboard
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Initial load for General or Races list
    React.useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);

                if (tab === "general") {
                    const res = await getCurrentLeaderboard(season);
                    if (!mounted) return;
                    setRows(Array.isArray(res?.teams) ? res.teams : Array.isArray(res) ? res : []);
                    debugLog("Leaderboard loaded", res);
                } else {
                    // Load race list
                    const res = await getAllRaces(season);
                    if (!mounted) return;
                    setRaces(res);

                    // Select first available (past) race by default if none selected
                    // or just let user select.
                    // Let's try to select the latest past race.
                    const pastRaces = res.filter(r => new Date(r.race_date) <= new Date());
                    if (pastRaces.length > 0) {
                        const lastRace = pastRaces[pastRaces.length - 1]; // sorted asc in API
                        setSelectedRaceId(lastRace.id);
                    } else if (res.length > 0) {
                        setSelectedRaceId(res[0].id); // Fallback to first even if future
                    }
                    debugLog("Races loaded", res);
                }
            } catch (e) {
                if (!mounted) return;
                setError("Échec du chargement des données.");
                debugLog("Leaderboard error", e?.message ?? e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [season, tab]);

    // Fetch specific race leaderboard when selectedRaceId changes
    React.useEffect(() => {
        if (tab !== "races" || !selectedRaceId) return;

        let mounted = true;
        (async () => {
            try {
                setLoading(true); // small loading for table
                const res = await getRaceLeaderboard(selectedRaceId, season);
                if (!mounted) return;
                setRaceRows(res);
                debugLog("Race leaderboard loaded", res);
            } catch (e) {
                console.error(e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [selectedRaceId, season, tab]);

    const isFuture = (dateStr) => {
        return new Date(dateStr) > new Date();
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Classement ({season})</h1>
                    <p className="mt-1 text-slate-600">
                        Classement de la saison {season}.
                    </p>
                </div>
                <SeasonSelector />
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200">
                <button
                    className={`pb-2 text-sm font-medium ${tab === "general"
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-slate-500 hover:text-slate-700"
                        }`}
                    onClick={() => setTab("general")}
                >
                    Général
                </button>
                <button
                    className={`pb-2 text-sm font-medium ${tab === "races"
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-slate-500 hover:text-slate-700"
                        }`}
                    onClick={() => setTab("races")}
                >
                    Par Course
                </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                {tab === "races" && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Sélectionner une course</label>
                        <select
                            className="block w-full max-w-md rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                            value={selectedRaceId || ""}
                            onChange={(e) => setSelectedRaceId(e.target.value)}
                        >
                            <option value="" disabled>Sélectionnez une course...</option>
                            {races.map(r => (
                                <option
                                    key={r.id}
                                    value={r.id}
                                    disabled={isFuture(r.race_date)}
                                >
                                    {r.name} ({new Date(r.race_date).toLocaleDateString()}) {isFuture(r.race_date) ? "(À venir)" : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {loading ? <div className="text-sm text-slate-600">Chargement...</div> : null}
                {error ? <div className="text-sm text-red-700">{error}</div> : null}

                {!loading && !error ? (
                    <div className="overflow-auto">
                        {tab === "general" ? (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-left text-slate-500">
                                        <th className="py-2 pr-4">Rang</th>
                                        <th className="py-2 pr-4">Équipe</th>
                                        <th className="py-2 pr-4 text-right">Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((t, idx) => (
                                        <tr
                                            key={`${t.id ?? t.team_name ?? t.teamName ?? "team"}-${idx}`}
                                            className="border-b border-slate-100"
                                        >
                                            <td className="py-2 pr-4">{idx + 1}</td>
                                            <td className="py-2 pr-4">
                                                <div>
                                                    {t.id ? (
                                                        <Link
                                                            className="block text-blue-700 hover:underline"
                                                            to={`/team/${t.id}`}
                                                        >
                                                            {t.team_name ?? t.teamName}
                                                        </Link>
                                                    ) : (
                                                        <div className="block">
                                                            {t.team_name ?? t.teamName}
                                                        </div>
                                                    )}
                                                    {t.ownerName ? (
                                                        <div className="text-xs text-slate-500">
                                                            {t.ownerName}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className="py-2 pr-4 text-right">{t.points ?? 0}</td>
                                        </tr>
                                    ))}
                                    {rows.length === 0 ? (
                                        <tr>
                                            <td className="py-4 text-sm text-slate-600" colSpan={3}>
                                                Pas encore d'équipes.
                                            </td>
                                        </tr>
                                    ) : null}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-left text-slate-500">
                                        <th className="py-2 pr-4">Rang</th>
                                        <th className="py-2 pr-4">Équipe</th>
                                        <th className="py-2 pr-4 text-right">Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {raceRows.map((t, idx) => (
                                        <tr
                                            key={`${t.id ?? t.teamName}-${idx}`}
                                            className="border-b border-slate-100"
                                        >
                                            <td className="py-2 pr-4">{idx + 1}</td>
                                            <td className="py-2 pr-4">
                                                <div>
                                                    <Link
                                                        className="block text-blue-700 hover:underline"
                                                        to={`/team/${t.id}`}
                                                        state={{ initialRaceId: selectedRaceId }}
                                                    >
                                                        {t.teamName}
                                                    </Link>
                                                    {t.ownerName ? (
                                                        <div className="text-xs text-slate-500">
                                                            {t.ownerName}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className="py-2 pr-4 text-right">{t.points ?? 0}</td>
                                        </tr>
                                    ))}
                                    {raceRows.length === 0 ? (
                                        <tr>
                                            <td className="py-4 text-sm text-slate-600" colSpan={3}>
                                                {selectedRaceId ? "Aucun point attribué pour cette course pour le moment." : "Sélectionnez une course pour voir les résultats."}
                                            </td>
                                        </tr>
                                    ) : null}
                                </tbody>
                            </table>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
}


