import { useState } from "react";
import {
  FaSearch,
  FaHotel,
  FaUmbrellaBeach,
  FaCar,
  FaStar,
} from "react-icons/fa";

import {
  searchTravelOffers,
  type TravelOffer,
} from "../service/travelOfferService";

export default function TravelOffers() {
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [interests, setInterests] = useState("");

  const [offers, setOffers] = useState<TravelOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buscarOfertas = async () => {
    if (!destination.trim()) {
      setError("Escribe un destino.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await searchTravelOffers({
        destination: destination.trim(),
        budget: budget
          ? Number(budget)
          : undefined,
        interests: interests
          ? interests
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
      });

      setOffers(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron obtener las ofertas."
      );
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (category: string) => {
    if (category === "hotel") {
      return <FaHotel />;
    }

    if (category === "transfer") {
      return <FaCar />;
    }

    return <FaUmbrellaBeach />;
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Buscar ofertas
          </h1>

          <p className="mt-2 text-slate-500">
            Encuentra servicios disponibles para crear
            una propuesta de viaje.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Destino
              </label>

              <input
                type="text"
                value={destination}
                onChange={(e) =>
                  setDestination(e.target.value)
                }
                placeholder="Ej. Punta Cana"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Presupuesto
              </label>

              <input
                type="number"
                value={budget}
                onChange={(e) =>
                  setBudget(e.target.value)
                }
                placeholder="Ej. 3000"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Intereses
              </label>

              <input
                type="text"
                value={interests}
                onChange={(e) =>
                  setInterests(e.target.value)
                }
                placeholder="playa, romántico, excursiones"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

          </div>

          <button
            onClick={buscarOfertas}
            disabled={loading}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            <FaSearch />

            {loading
              ? "Buscando..."
              : "Buscar ofertas"}
          </button>

          {error && (
            <p className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        {offers.length > 0 && (
          <div className="mt-8">

            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Ofertas encontradas
                </h2>

                <p className="text-sm text-slate-500">
                  {offers.length} servicios disponibles
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
                >

                  <div className="h-40 bg-slate-100 flex items-center justify-center text-3xl text-slate-400">
                    {getIcon(offer.category)}
                  </div>

                  <div className="p-5">

                    <div className="flex items-start justify-between gap-3">

                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          {offer.category}
                        </p>

                        <h3 className="mt-1 font-bold text-slate-900">
                          {offer.name}
                        </h3>
                      </div>

                      {offer.rating && (
                        <div className="flex items-center gap-1 text-sm text-amber-500">
                          <FaStar />

                          {offer.rating}
                        </div>
                      )}

                    </div>

                    {offer.description && (
                      <p className="mt-3 text-sm text-slate-500 line-clamp-3">
                        {offer.description}
                      </p>
                    )}

                    <div className="mt-5 flex items-end justify-between">

                      <div>
                        <p className="text-xs text-slate-400">
                          Desde
                        </p>

                        <p className="text-xl font-bold text-slate-900">
                          {offer.price !== null
                            ? `${offer.currency} ${offer.price}`
                            : "Consultar"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-slate-400">
                          Score
                        </p>

                        <p className="font-semibold text-slate-700">
                          {offer.score}
                        </p>
                      </div>

                    </div>

                    {offer.providers?.name && (
                      <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                        Proveedor:{" "}
                        {offer.providers.name}
                      </div>
                    )}

                  </div>
                </div>
              ))}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}