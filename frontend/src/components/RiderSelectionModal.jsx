import React, { useState, useEffect } from "react";
import { searchRiders, getFilterOptions } from "../services/api";

export default function RiderSelectionModal({ isOpen, onClose, onSelect, season, maxBudget }) {
    const [query, setQuery] = useState("");
    const [team, setTeam] = useState("");
    const [sortOrder, setSortOrder] = useState(""); // "" means default (desc), or "asc"

    // Price range state
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(maxBudget);

    const [riders, setRiders] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filterOptions, setFilterOptions] = useState({ teams: [] });

    // Fetch filter options on mount
    useEffect(() => {
        if (!isOpen) return;
        getFilterOptions(season).then(opts => setFilterOptions({ teams: opts.teams }));
    }, [isOpen, season]);

    // Reset maxPrice and minPrice when modal opens
    useEffect(() => {
        if (isOpen) {
            setMaxPrice(maxBudget > 10000 ? maxBudget : 10000); // Default to a reasonable max if budget is low
            setMinPrice(0);
        }
    }, [maxBudget, isOpen]);

    // Debounced Search
    useEffect(() => {
        if (!isOpen) return;

        const fetchRiders = async () => {
            setLoading(true);
            try {
                const results = await searchRiders({
                    query: query.trim(),
                    team,
                    sortOrder: sortOrder || "desc",
                    minPrice,
                    maxPrice
                }, season);
                setRiders(results);
            } catch (error) {
                console.error("Error fetching riders", error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchRiders, 300); // 300ms debounce
        return () => clearTimeout(timeoutId);
    }, [query, team, sortOrder, minPrice, maxPrice, isOpen, season]);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-900">Choisir un coureur</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-slate-200 bg-white space-y-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher par nom..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            value={team}
                            onChange={(e) => setTeam(e.target.value)}
                        >
                            <option value="">Toutes les équipes</option>
                            {filterOptions.teams.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>

                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                        >
                            <option value="">Prix (Décroissant)</option>
                            <option value="asc">Prix (Croissant)</option>
                        </select>

                        <div className="flex flex-col justify-center gap-1">
                            <span className="text-xs text-slate-500 font-medium pl-1">Fourchette de prix</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    max={maxPrice}
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(parseInt(e.target.value) || 0)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
                                    placeholder="Min"
                                />
                                <span className="text-slate-400 text-xs font-bold">-</span>
                                <input
                                    type="number"
                                    min={minPrice}
                                    max={maxBudget > 10000 ? maxBudget : 10000}
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(parseInt(e.target.value) || 0)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
                                    placeholder="Max"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-50 p-2">
                    {loading ? (
                        <div className="flex justify-center items-center py-10 opacity-50">
                            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        </div>
                    ) : riders.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            Aucun coureur trouvé avec ces critères.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-2">
                            {riders.map((r) => (
                                <button
                                    key={r.id}
                                    onClick={() => onSelect(r)}
                                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-left group"
                                >
                                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                                        {r.photo_url ? (
                                            <img src={r.photo_url} alt={r.rider_name} className="h-full w-full object-cover object-top" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">{r.rider_name}</div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                            <span className="truncate max-w-[100px]">{r.team_name}</span>
                                            {r.nationality && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span>{r.nationality}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end pl-2">
                                        <span className="font-black text-slate-800 text-lg">{r.price}</span>
                                    </div>
                                    {/* Quick add icon */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
