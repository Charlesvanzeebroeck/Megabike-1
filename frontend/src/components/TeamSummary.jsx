import React, { useState, useEffect } from "react";
import { getAllRaces } from "../services/api";

export default function TeamSummary({ me, team, onEdit, isPublic, hideRiders, hideRidersMessage, initialRaceId = "ALL" }) {
  const [selectedRaceId, setSelectedRaceId] = useState(initialRaceId);

  useEffect(() => {
    setSelectedRaceId(initialRaceId);
  }, [initialRaceId]);

  const [availableRaces, setAvailableRaces] = useState([]);

  useEffect(() => {
    async function fetchRaces() {
      if (!team?.season) return;
      try {
        const allRaces = await getAllRaces(team.season);
        const today = new Date().toISOString().slice(0, 10);
        // Show races that have already happened (up to today)
        const pastRaces = allRaces.filter(r => r.race_date <= today);
        setAvailableRaces(pastRaces);
      } catch (err) {
        console.error("Failed to load races", err);
      }
    }
    fetchRaces();
  }, [team?.season]);

  // Helper to determine the points to display for a given rider based on selection
  const getDisplayPoints = (rider) => {
    if (selectedRaceId === "ALL") {
      return rider.points ?? 0;
    }
    const raceResult = (rider.race_results || []).find(r => r.race_id === selectedRaceId);
    return raceResult ? raceResult.points_awarded : 0;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {team?.teamName ?? "Votre équipe"}
            </h2>
            <div className="text-sm text-slate-600">
              {isPublic ? (
                `Manager : ${team?.ownerName ?? "utilisateur"}`
              ) : (
                `Connecté en tant que : ${me?.displayName ?? me?.id ?? "utilisateur"}`
              )}
            </div>
          </div>
          {onEdit && (
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
              onClick={onEdit}
            >
              Modifier l'équipe
            </button>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Points
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {team?.points ?? 0}
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Coût total
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {team?.totalPrice ?? 0}
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Saison
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {team?.season ?? "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Coureurs</h3>

          {!hideRiders && availableRaces.length > 0 && (
            <select
              value={selectedRaceId}
              onChange={(e) => setSelectedRaceId(e.target.value)}
              className="w-full sm:w-auto rounded-md border-slate-300 py-1.5 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Toutes les courses</option>
              {availableRaces.map((race) => (
                <option key={race.id} value={race.id}>
                  {race.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {hideRiders ? (
          <div className="p-8 text-center text-slate-500">
            <p>{hideRidersMessage || "La composition de l'équipe est masquée."}</p>
          </div>
        ) : (
          <div className="mt-3 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Coureur</th>
                  <th className="py-2 pr-4 text-right">Points</th>
                  <th className="py-2 pr-4 text-right">Coût</th>
                </tr>
              </thead>
              <tbody>
                {[...(team?.riders ?? [])]
                  .sort((a, b) => getDisplayPoints(b) - getDisplayPoints(a))
                  .map((r, idx) => (
                    <tr key={`${r.rider_name}-${idx}`} className="border-b border-slate-100">
                      <td className="py-2 pr-4 align-middle">{idx + 1}</td>
                      <td className="py-2 pr-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                            {r.photo_url ? (
                              <img src={r.photo_url} alt={r.rider_name} className="h-full w-full object-cover object-top" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-400">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                              </div>
                            )}
                          </div>
                          <span className="font-medium">{r.rider_name}</span>
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-right align-middle font-medium text-slate-700">
                        {getDisplayPoints(r)}
                      </td>
                      <td className="py-2 pr-4 text-right align-middle text-slate-500">{r.price ?? 0}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
        {!hideRiders && !isPublic && (
          <div className="mt-3 text-xs text-slate-500">
            Cette équipe sera verrouillée après le 27/02/2026.
          </div>
        )}
      </div>
    </div>
  );
}


