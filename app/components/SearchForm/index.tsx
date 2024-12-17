import { FormEvent } from 'react';
import { CabinClass } from '../../types';
import { COLORS } from '../../constants';

interface SearchFormProps {
  departCity: string;
  setDepartCity: (city: string) => void;
  arrivalCity: string;
  setArrivalCity: (city: string) => void;
  isRoundTrip: boolean;
  setIsRoundTrip: (isRoundTrip: boolean) => void;
  cabinClass: CabinClass;
  setCabinClass: (cabinClass: CabinClass) => void;
  onSubmit: (e: FormEvent) => void;
  loading: boolean;
}

export function SearchForm({
  departCity,
  setDepartCity,
  arrivalCity,
  setArrivalCity,
  isRoundTrip,
  setIsRoundTrip,
  cabinClass,
  setCabinClass,
  onSubmit,
  loading
}: SearchFormProps) {

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(e);
  };

  const handleCityInput = (value: string, setter: (value: string) => void) => {
    const formattedValue = value
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    setter(formattedValue);
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 md:px-0 space-y-4 md:space-y-6">
      <div className="space-y-3 sm:space-y-4">
        <div className="group">
          <label className="block text-base sm:text-sm font-medium text-secondary mb-1">
            Ville de départ
          </label>
          <div className="relative">
            <input
              type="text"
              value={departCity}
              onChange={(e) => handleCityInput(e.target.value, setDepartCity)}
              className="w-full px-4 py-4 sm:py-3 text-base rounded-xl border border-accent/20 
                        bg-primary/50 focus:border-accent focus:ring-2 focus:ring-accent/50 
                        transition-all duration-300 text-secondary placeholder-secondary/30 
                        backdrop-blur-sm pl-10"
              placeholder="Paris, France"
              required
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent/50">
              📍
            </span>
          </div>
        </div>

        <div className="group">
          <label className="block text-base sm:text-sm font-medium text-secondary mb-1">
            Ville d&apos;arrivée
          </label>
          <div className="relative">
            <input
              type="text"
              value={arrivalCity}
              onChange={(e) => handleCityInput(e.target.value, setArrivalCity)}
              className="w-full px-4 py-4 sm:py-3 text-base rounded-xl border border-accent/20 
                        bg-primary/50 focus:border-accent focus:ring-2 focus:ring-accent/50 
                        transition-all duration-300 text-secondary placeholder-secondary/30 
                        backdrop-blur-sm pl-10"
              placeholder="New York, États-Unis"
              required
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent/50">
              📍
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Classe de voyage
            </label>
            <select
              value={cabinClass}
              onChange={(e) => setCabinClass(e.target.value as CabinClass)}
              className="w-full px-4 py-3 rounded-xl border border-accent/20 
                        bg-primary/50 focus:border-accent focus:ring-2 
                        focus:ring-accent/50 transition-all duration-300 
                        text-secondary backdrop-blur-sm"
            >
              <option value="ECONOMY" className="bg-primary text-secondary">Économique</option>
              <option value="BUSINESS" className="bg-primary text-secondary">Affaires</option>
              <option value="FIRST" className="bg-primary text-secondary">Première</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="roundTrip"
              checked={isRoundTrip}
              onChange={(e) => setIsRoundTrip(e.target.checked)}
              className="w-4 h-4 rounded border-accent/20 
                        bg-primary/50 focus:ring-2 focus:ring-accent/50 
                        text-secondary"
            />
            <label htmlFor="roundTrip" className="ml-2 text-sm font-medium text-secondary">
              Calculer pour un aller-retour
            </label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent text-primary py-4 sm:py-3 px-6 
                  text-lg sm:text-base rounded-xl font-medium focus:outline-none 
                  focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 
                  focus:ring-offset-primary transition-all duration-300 
                  disabled:opacity-50 disabled:cursor-not-allowed transform 
                  hover:scale-[1.02] active:scale-[0.98] hover:bg-accent/90"
      >
        {loading ? 'Calcul en cours...' : '✈️ Décollage ! ✈️'}
      </button>
    </form>
  );
} 