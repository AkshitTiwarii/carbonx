"use client";
import { useEffect, useMemo, useRef, useState } from "react";


type Inputs = {
  electricityKWh: number; // monthly
  naturalGasTherms: number; // monthly
  petrolLiters: number; // monthly
  dieselLiters: number; // monthly
  carKm: number; // monthly
  shortFlights: number; // per year
  longFlights: number; // per year
};

const DEFAULT_INPUTS: Inputs = {
  electricityKWh: 450,
  naturalGasTherms: 60,
  petrolLiters: 80,
  dieselLiters: 0,
  carKm: 600,
  shortFlights: 2,
  longFlights: 0,
};

// Simple factors (approximate, tCO2e per unit)
const FACTORS = {
  electricityKWh: 0.000415, // 0.415 kg per kWh
  naturalGasTherms: 0.0053, // 5.3 kg per therm
  petrolLiters: 0.00231, // 2.31 kg per liter
  dieselLiters: 0.00268, // 2.68 kg per liter
  carKm: 0.000171, // 171 g per km
  shortFlight: 0.3, // per passenger
  longFlight: 1.1, // per passenger
};

function formatTons(t: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(t);
}

function formatUSD(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function CalculatorPage() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);
  const [price, setPrice] = useState(15); // USD per credit
  const [scopeSplit, setScopeSplit] = useState({ s1: 0.45, s2: 0.25, s3: 0.3 });

  const totals = useMemo(() => {
    const monthlyTons =
      inputs.electricityKWh * FACTORS.electricityKWh +
      inputs.naturalGasTherms * FACTORS.naturalGasTherms +
      inputs.petrolLiters * FACTORS.petrolLiters +
      inputs.dieselLiters * FACTORS.dieselLiters +
      inputs.carKm * FACTORS.carKm;
    const flightsTons =
      inputs.shortFlights * FACTORS.shortFlight + inputs.longFlights * FACTORS.longFlight;

    const annualTons = monthlyTons * 12 + flightsTons;
    const s1 = annualTons * scopeSplit.s1;
    const s2 = annualTons * scopeSplit.s2;
    const s3 = Math.max(annualTons - s1 - s2, 0);
    const credits = annualTons; // 1 credit = 1 tCO2e
    const cost = credits * price;
    return { monthlyTons, annualTons, flightsTons, s1, s2, s3, credits, cost };
  }, [inputs, price, scopeSplit]);

  const handleChange = (key: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value || 0);
    setInputs(prev => ({ ...prev, [key]: isFinite(v) ? v : 0 }));
  };

  const reset = () => setInputs(DEFAULT_INPUTS);

  // Tiny forecast line chart (no deps)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const w = (c.width = c.clientWidth * devicePixelRatio);
    const h = (c.height = c.clientHeight * devicePixelRatio);
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const months = 12;
    const base = totals.annualTons / 12;
    // assume 1% improvement per month with offsets
    const data = Array.from({ length: months }, (_, i) => base * Math.pow(0.99, i));
    const min = Math.min(...data) * 0.96;
    const max = Math.max(...data) * 1.04;

    // clear
    ctx.clearRect(0, 0, w, h);

    // grid
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = ((h / devicePixelRatio) * i) / 4;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w / devicePixelRatio, y);
      ctx.stroke();
    }

    // line
    ctx.strokeStyle = "#34d399"; // emerald-400
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (months - 1)) * (w / devicePixelRatio - 6) + 3;
      const y = (1 - (v - min) / (max - min)) * (h / devicePixelRatio - 6) + 3;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, h / devicePixelRatio);
    grad.addColorStop(0, "rgba(52, 211, 153, 0.25)");
    grad.addColorStop(1, "rgba(52, 211, 153, 0.02)");
    ctx.fillStyle = grad;
    ctx.lineTo(w / devicePixelRatio - 3, h / devicePixelRatio - 3);
    ctx.lineTo(3, h / devicePixelRatio - 3);
    ctx.closePath();
    ctx.fill();
  }, [totals.annualTons]);

  // Export summary (copy JSON)
  const exportSummary = async () => {
    const summary = {
      inputs,
      totals: {
        annualTons: Number(totals.annualTons.toFixed(2)),
        credits: Number(totals.credits.toFixed(2)),
        cost: Number(totals.cost.toFixed(0)),
        scope: {
          s1: Number(totals.s1.toFixed(2)),
          s2: Number(totals.s2.toFixed(2)),
          s3: Number(totals.s3.toFixed(2)),
        },
      },
      price,
    };
    await navigator.clipboard.writeText(JSON.stringify(summary, null, 2));
    alert("Summary copied to clipboard");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Carbon Credit Calculator</h1>
        <div className="flex gap-2">
          <button onClick={exportSummary} className="px-3 py-2 text-sm rounded-lg text-white bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:opacity-90 transition">Export</button>
          <button onClick={reset} className="px-3 py-2 text-sm rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition">Reset</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Inputs */}
        <section className="lg:col-span-2 rounded-xl border border-zinc-800 bg-black/40 backdrop-blur p-4">
          <h2 className="text-base font-medium mb-3">Inputs (monthly unless noted)</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Electricity (kWh)">
              <NumberInput value={inputs.electricityKWh} min={0} step={10} onChange={handleChange("electricityKWh")} />
            </Field>
            <Field label="Natural Gas (therms)">
              <NumberInput value={inputs.naturalGasTherms} min={0} step={5} onChange={handleChange("naturalGasTherms")} />
            </Field>
            <Field label="Petrol (liters)">
              <NumberInput value={inputs.petrolLiters} min={0} step={5} onChange={handleChange("petrolLiters")} />
            </Field>
            <Field label="Diesel (liters)">
              <NumberInput value={inputs.dieselLiters} min={0} step={5} onChange={handleChange("dieselLiters")} />
            </Field>
            <Field label="Car Travel (km)">
              <NumberInput value={inputs.carKm} min={0} step={10} onChange={handleChange("carKm")} />
            </Field>
            <Field label="Short flights / year">
              <NumberInput value={inputs.shortFlights} min={0} step={1} onChange={handleChange("shortFlights")} />
            </Field>
            <Field label="Long flights / year">
              <NumberInput value={inputs.longFlights} min={0} step={1} onChange={handleChange("longFlights")} />
            </Field>
          </div>

          <div className="mt-5 rounded-lg border border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">Carbon price (USD/credit)</span>
              <span className="text-sm font-medium">{price} USD</span>
            </div>
            <input
              type="range"
              min={5}
              max={150}
              step={1}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full h-2 mt-3 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>

          <p className="mt-4 text-xs text-zinc-400">
            Estimates use public emission factors and are for guidance only. 1 credit = 1 tCO₂e.
          </p>
        </section>

        {/* Results */}
        <aside className="rounded-xl border border-zinc-800 bg-black/40 backdrop-blur p-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-zinc-200 mb-2">Annual emissions</h3>
            <div className="text-3xl font-bold tracking-tight">{formatTons(totals.annualTons)} <span className="text-base font-medium text-zinc-400">tCO₂e</span></div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Stat label="Scope 1" value={formatTons(totals.s1)} />
            <Stat label="Scope 2" value={formatTons(totals.s2)} />
            <Stat label="Scope 3" value={formatTons(totals.s3)} />
          </div>

          <div className="rounded-lg border border-zinc-800 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-zinc-300">Credits required</span>
              <span className="text-lg font-semibold">{formatTons(totals.credits)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">Estimated cost</span>
              <span className="text-lg font-semibold text-emerald-300">{formatUSD(totals.cost)}</span>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-300">12‑month forecast</span>
              <span className="text-xs text-zinc-500">assumes ~1% monthly reduction</span>
            </div>
            <div className="h-28">
              <canvas ref={canvasRef} className="w-full h-full" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-zinc-400">{label}</div>
      {children}
    </label>
  );
}

function NumberInput({ value, onChange, min = 0, step = 1 }: { value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min?: number; step?: number }) {
  return (
    <input
      type="number"
      value={Number.isFinite(value) ? value : 0}
      onChange={onChange}
      min={min}
      step={step}
      className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
    />
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 p-3">
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
