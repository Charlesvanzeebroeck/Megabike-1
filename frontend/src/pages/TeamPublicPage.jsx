import React from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { getTeamById, REVEAL_DATE, getAuthToken, parseJwt } from "../services/api";
import { debugLog } from "../services/debug";
import TeamSummary from "../components/TeamSummary";

export default function TeamPublicPage() {
    const { teamId } = useParams();
    const location = useLocation();
    const initialRaceId = location.state?.initialRaceId || "ALL";
    const [team, setTeam] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await getTeamById(teamId);
                if (!mounted) return;
                setTeam(res);
                debugLog("Public team loaded", res);
            } catch (e) {
                if (!mounted) return;
                setError("Échec du chargement de l'équipe.");
                debugLog("Public team error", e?.message ?? e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [teamId]);

    const isRevealOK = team && (
        team.season < 2026 ||
        new Date() >= new Date(REVEAL_DATE) ||
        (getAuthToken() && parseJwt(getAuthToken())?.sub === team.userId)
    );

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-end gap-4">
                <Link className="text-sm text-blue-700 hover:underline" to="/leaderboard">
                    ← Retour au classement
                </Link>
            </div>

            {loading ? <div className="text-sm text-slate-600">Chargement...</div> : null}
            {error ? <div className="text-sm text-red-700">{error}</div> : null}

            {!loading && !error && team ? (
                <TeamSummary
                    team={team}
                    isPublic={true}
                    hideRiders={!isRevealOK}
                    hideRidersMessage="La composition de l'équipe est masquée jusqu'au début de la saison (28/02/2026)."
                    initialRaceId={initialRaceId}
                />
            ) : null}
        </div>
    );
}


