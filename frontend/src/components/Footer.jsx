import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <span>Megabike Fantasy · Saison {year}</span>
          <Link to="/history" className="hover:underline">Historique</Link>
        </div>
      </div>
    </footer>
  );
}


