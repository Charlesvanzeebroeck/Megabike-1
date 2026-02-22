import React, { useMemo } from "react";
import RiderSelectionModal from "./RiderSelectionModal";
import { debugLog } from "../services/debug";

const DEFAULT_SLOTS = 12;
const BUDGET = 11000;

export default function TeamBuilder({ onSubmit, isSubmitting, season, initialTeam, apiError }) {
    const [teamName, setTeamName] = React.useState(initialTeam?.teamName || "");
    const [activeSlot, setActiveSlot] = React.useState(null);
    const [slots, setSlots] = React.useState(() => {
        if (initialTeam?.riders) {
            const filled = [...initialTeam.riders];
            while (filled.length < DEFAULT_SLOTS) filled.push(null);
            return filled.slice(0, DEFAULT_SLOTS);
        }
        return Array(DEFAULT_SLOTS).fill(null);
    });
    const [validationError, setValidationError] = React.useState(null);

    // Optimized calculation
    const { total, remaining } = useMemo(() => {
        const t = slots.reduce((sum, r) => sum + (r?.price ?? r?.points ?? 0), 0);
        return { total: t, remaining: BUDGET - t };
    }, [slots]);

    function setSlot(index, rider) {
        const next = [...slots];
        next[index] = rider;
        setSlots(next);
        // Clear error on change
        if (validationError) setValidationError(null);
    }

    function validate() {
        if (teamName.trim().length < 2) return "Le nom de l'équipe est requis.";
        // Relaxed validation: check if at least one rider is picked
        const pickedRiders = slots.filter(Boolean);
        if (pickedRiders.length === 0) return "Veuillez choisir au moins un coureur.";

        const names = pickedRiders.map((s) => s?.rider_name);
        const unique = new Set(names);
        if (unique.size !== names.length) return "Chaque coureur doit être unique.";
        if (total > BUDGET) return `Budget dépassé de ${Math.abs(remaining)}.`;
        return null;
    }

    const isUpdate = !!initialTeam;
    // Show either local validation error or API error passed down
    const error = validationError || apiError;

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold">{isUpdate ? "Mettre à jour votre équipe" : "Créer votre équipe"}</h2>
                    <p className="text-sm text-slate-600">
                        Budget : {BUDGET}. {isUpdate ? "Vous pouvez mettre à jour jusqu'à la date limite." : "Créez votre équipe une fois."}
                    </p>
                </div>
                <div className="text-sm">
                    <span className="text-slate-500">Restant : </span>
                    <span className={remaining < 0 ? "font-semibold text-red-700" : "font-semibold text-slate-900"}>
                        {remaining}
                    </span>
                </div>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700">
                    Nom de l'équipe
                </label>
                <input
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="ex. Équipe Gilbert"
                />
            </div>

            <div className="mt-5 space-y-3">
                {slots.map((r, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="text-xs font-bold text-slate-400 sm:w-8 text-center bg-slate-200 rounded-full h-6 w-6 flex items-center justify-center">
                            {idx + 1}
                        </div>

                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            {!r ? (
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => setActiveSlot(idx)}
                                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-medium text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all disabled:opacity-50"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                    Ajouter un coureur
                                </button>
                            ) : (
                                <div className="flex flex-1 items-center justify-between w-full bg-white border border-slate-200 p-2 rounded-lg shadow-sm group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                                            {r.photo_url ? (
                                                <img src={r.photo_url} alt={r.rider_name} className="h-full w-full object-cover object-top" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 leading-tight">{r.rider_name}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                <span>{r.team_name}</span>
                                                {r.nationality && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                        <span>{r.nationality}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="font-bold border border-slate-100 bg-slate-50 px-2 py-1 rounded text-slate-700">{r.price ?? r.points ?? 0}</span>
                                        {!isSubmitting && (
                                            <button
                                                type="button"
                                                onClick={() => setSlot(idx, null)}
                                                className="text-slate-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <RiderSelectionModal
                isOpen={activeSlot !== null}
                onClose={() => setActiveSlot(null)}
                // We pass the maximum budget so users can't pick riders they can't afford
                maxBudget={remaining > 0 ? remaining : 0}
                season={season}
                onSelect={(rider) => {
                    if (activeSlot !== null) {
                        setSlot(activeSlot, rider);
                        setActiveSlot(null);
                    }
                }}
            />

            {error ? <div className="mt-4 text-sm text-red-700 font-medium">{error}</div> : null}

            <div className="mt-5 flex gap-3">
                <button
                    type="button"
                    disabled={isSubmitting}
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-slate-800 transition-colors"
                    onClick={() => {
                        const msg = validate();
                        setValidationError(msg);
                        if (msg) return;

                        const payload = {
                            teamName: teamName.trim(),
                            riders: slots.filter(Boolean).map((r) => ({
                                id: r.id,
                                rider_name: r.rider_name,
                            })),
                        };
                        debugLog("Submitting team", payload);
                        onSubmit?.(payload);
                    }}
                >
                    {isSubmitting ? "Enregistrement..." : (isUpdate ? "Mettre à jour l'équipe" : "Créer l'équipe")}
                </button>
            </div>
        </div>
    );
}
