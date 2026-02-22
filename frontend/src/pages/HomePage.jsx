import React from "react";
import { Link } from "react-router-dom";
import { useSeason } from "../context/SeasonContext";
import { useTeamData } from "../hooks/useTeamData";
import "../styles/HomePage.css";
import philippeGilbertImage from "../assets/philippe_gilbert_bi20b6.webp";
import { debugLog } from "../services/debug";
import { getLatestRace, getNextRace } from "../services/api";

const HomePage = () => {
    const { season } = useSeason();
    const { team, loading: teamLoading, loadTeam } = useTeamData(season);

    const [latestRace, setLatestRace] = React.useState(null);
    const [nextRace, setNextRace] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        loadTeam();
    }, [loadTeam]);

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);

                if (!mounted) return;
                const [latest, next] = await Promise.all([
                    getLatestRace(),
                    getNextRace(),
                ]);
                setLatestRace(latest);
                setNextRace(next);
                debugLog("Home loaded", { latest, next });
            } catch (e) {
                if (!mounted) return;
                setError(e?.message ?? "Failed to load home data");
                debugLog("Home load error", e?.message ?? e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="homepage-container">
            <div className="hero-image">
                <img src={philippeGilbertImage} alt="Philippe Gilbert Victory" />
            </div>

            <h1>MegaBike since 2004...</h1>

            {!teamLoading && !team && (
                <div className="flex justify-center mt-2 mb-8">
                    <Link to="/my-team" className="px-6 py-3 bg-sky-600 text-white font-bold rounded-sm hover:bg-sky-700 transition-colors">
                        Créer votre équipe
                    </Link>
                </div>
            )}

            <div className="content-container">

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Latest Race */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-slate-800">Dernière Course</h2>
                        {loading && <p className="text-slate-500">Chargement...</p>}
                        {error && <p className="text-red-600">{error}</p>}
                        {!loading && !latestRace && (
                            <p className="text-slate-500">Pas encore de résultats de course disponibles.</p>
                        )}
                        {!!latestRace && (
                            <div>
                                <div className="mb-4">
                                    <div className="font-semibold text-slate-900">{latestRace.name}</div>
                                    <div className="text-sm text-slate-500">{latestRace.date}</div>
                                </div>
                                {Array.isArray(latestRace.results) && latestRace.results.length > 0 ? (
                                    <ol className="space-y-3 text-sm mt-3">
                                        {latestRace.results.slice(0, 5).map((row, idx) => (
                                            <li key={idx} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 hover:bg-slate-50 transition-colors px-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-slate-400 w-4">{idx + 1}.</span>
                                                    <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                                                        {row.photo_url ? (
                                                            <img src={row.photo_url} alt={row.rider} className="h-full w-full object-cover object-top" />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-left">
                                                        <span className="font-semibold text-slate-900 block">{row.rider}</span>
                                                        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">{row.team}</span>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{row.points}</span>
                                            </li>
                                        ))}
                                    </ol>
                                ) : (
                                    <p className="text-sm text-slate-500">Pas encore de résultats.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Next Race */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-slate-800">Prochaine Course</h2>
                        {loading && <p className="text-slate-500">Chargement...</p>}
                        {!loading && !nextRace && (
                            <p className="text-slate-500">Aucune course à venir trouvée.</p>
                        )}
                        {!!nextRace && (
                            <div>
                                <div className="text-xl font-bold text-blue-600">{nextRace.name}</div>
                                <div className="mt-2 text-slate-600">{nextRace.date}</div>
                                <div className="mt-4 rounded-md bg-blue-50 p-4 text-sm text-blue-800">
                                    Préparez votre équipe !
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;