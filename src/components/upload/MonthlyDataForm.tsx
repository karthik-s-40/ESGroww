"use client";

import { useState } from "react";
import { saveMonthlyData } from "@/actions/upload.actions";

export default function MonthlyDataForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    const data = {
      organizationId: "cmoyejxqn0000nvzcpobm30i4",

      month: formData.get("month"),
      year: formData.get("year"),

      electricityKwh: formData.get("electricityKwh"),
      renewableKwh: formData.get("renewableKwh"),
      dgDieselLitres: formData.get("dgDieselLitres"),

      waterKl: formData.get("waterKl"),
      recycledWaterKl: formData.get("recycledWaterKl"),

      totalWasteKg: formData.get("totalWasteKg"),
      recycledWasteKg: formData.get("recycledWasteKg"),
    };

    const result = await saveMonthlyData(data);

    console.log(result);

    setLoading(false);

    alert("Monthly ESG data saved!");
  }

  return (
    <form
      action={handleSubmit}
      className="grid grid-cols-2 gap-4"
    >
      <input
        name="month"
        placeholder="Month"
        className="border p-3 rounded-xl"
      />

      <input
        name="year"
        placeholder="Year"
        className="border p-3 rounded-xl"
      />

      <input
        name="electricityKwh"
        placeholder="Electricity kWh"
        className="border p-3 rounded-xl"
      />

      <input
        name="renewableKwh"
        placeholder="Renewable kWh"
        className="border p-3 rounded-xl"
      />

      <input
        name="dgDieselLitres"
        placeholder="DG Diesel Litres"
        className="border p-3 rounded-xl"
      />

      <input
        name="waterKl"
        placeholder="Water KL"
        className="border p-3 rounded-xl"
      />

      <input
        name="recycledWaterKl"
        placeholder="Recycled Water KL"
        className="border p-3 rounded-xl"
      />

      <input
        name="totalWasteKg"
        placeholder="Total Waste KG"
        className="border p-3 rounded-xl"
      />

      <input
        name="recycledWasteKg"
        placeholder="Recycled Waste KG"
        className="border p-3 rounded-xl"
      />

      <button
        type="submit"
        className="bg-emerald-600 text-white rounded-xl p-3"
      >
        {loading ? "Saving..." : "Save ESG Data"}
      </button>
    </form>
  );
}