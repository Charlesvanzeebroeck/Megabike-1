import React from "react";

// Points data from ingest/megabike_rules.py
const POINTS_DATA = [
    { rank: 1, cat0: 240, cat1: 200, cat2: 150 },
    { rank: 2, cat0: 150, cat1: 125, cat2: 85 },
    { rank: 3, cat0: 120, cat1: 100, cat2: 70 },
    { rank: 4, cat0: 100, cat1: 80, cat2: 55 },
    { rank: 5, cat0: 85, cat1: 70, cat2: 45 },
    { rank: 6, cat0: 75, cat1: 60, cat2: 40 },
    { rank: 7, cat0: 65, cat1: 50, cat2: 35 },
    { rank: 8, cat0: 55, cat1: 45, cat2: 30 },
    { rank: 9, cat0: 50, cat1: 40, cat2: 25 },
    { rank: 10, cat0: 45, cat1: 35, cat2: 20 },
    { rank: 11, cat0: 40, cat1: 30, cat2: 16 },
    { rank: 12, cat0: 35, cat1: 25, cat2: 14 },
    { rank: 13, cat0: 30, cat1: 20, cat2: 12 },
    { rank: 14, cat0: 28, cat1: 18, cat2: 10 },
    { rank: 15, cat0: 26, cat1: 16, cat2: 9 },
    { rank: 16, cat0: 24, cat1: 14, cat2: 8 },
    { rank: 17, cat0: 22, cat1: 12, cat2: 7 },
    { rank: 18, cat0: 20, cat1: 10, cat2: 6 },
    { rank: 19, cat0: 18, cat1: 9, cat2: 5 },
    { rank: 20, cat0: 16, cat1: 8, cat2: 4 },
    { rank: 21, cat0: 14, cat1: 7, cat2: 3 },
    { rank: 22, cat0: 13, cat1: 6, cat2: 2 },
    { rank: 23, cat0: 12, cat1: 5, cat2: 2 },
    { rank: 24, cat0: 11, cat1: 4, cat2: 2 },
    { rank: 25, cat0: 10, cat1: 3, cat2: 2 },
    { rank: 26, cat0: 9, cat1: 3, cat2: 2 },
    { rank: 27, cat0: 8, cat1: 3, cat2: 2 },
    { rank: 28, cat0: 7, cat1: 3, cat2: 2 },
    { rank: 29, cat0: 6, cat1: 3, cat2: 2 },
    { rank: 30, cat0: 5, cat1: 3, cat2: 2 },
];

export default function RulesPage() {
    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <h1 className="mb-6 text-2xl font-bold text-slate-900">Règles et Barème des Points</h1>

            <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-slate-800">Fonctionnement</h2>
                <div className="space-y-2 text-slate-600">
                    <p>
                        Vous devez composer une équipe de coureurs cyclistes en respectant le budget alloué.
                    </p>
                    <p>
                        Les points sont attribués en fonction du classement de vos coureurs sur les courses réelles.
                        Le nombre de points dépend de la catégorie de la course (Monument, World Tour, ou 1.Pro).
                    </p>
                    <div className="mt-4 rounded-md bg-amber-50 p-4 text-sm text-amber-900 border border-amber-200">
                        <strong>Important :</strong> La composition des équipes sera verrouillée la veille de la première course,
                        c'est-à-dire le <strong>27 février à minuit</strong>.
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                    <h2 className="font-semibold text-slate-800">Barème des Points</h2>
                    <p>Si un coureur abandone une course, il n'aura pas de points.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-center w-20">Place</th>
                                <th className="px-6 py-3 font-semibold text-right text-amber-900 bg-amber-50/50">Monument</th>
                                <th className="px-6 py-3 font-semibold text-right text-blue-900 bg-blue-50/50">W-Tour</th>
                                <th className="px-6 py-3 font-semibold text-right text-slate-900 bg-slate-50">1.Pro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {POINTS_DATA.map((row) => (
                                <tr key={row.rank} className="hover:bg-slate-50">
                                    <td className="px-6 py-2 text-center font-medium text-slate-500">{row.rank}e</td>
                                    <td className="px-6 py-2 text-right font-medium text-amber-700 bg-amber-50/30">{row.cat0}</td>
                                    <td className="px-6 py-2 text-right font-medium text-blue-700 bg-blue-50/30">{row.cat1}</td>
                                    <td className="px-6 py-2 text-right text-slate-600">{row.cat2}</td>
                                </tr>
                            ))}
                            <tr className="bg-slate-50/50">
                                <td className="px-6 py-2 text-center text-xs text-slate-400">31+</td>
                                <td className="px-6 py-2 text-right text-xs text-amber-700/50 bg-amber-50/30">5</td>
                                <td className="px-6 py-2 text-right text-xs text-blue-700/50 bg-blue-50/30">3</td>
                                <td className="px-6 py-2 text-right text-xs text-slate-500">2</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
