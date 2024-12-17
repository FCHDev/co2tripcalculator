"use client";

import { FormEvent } from 'react';
import { useCalculator } from '../hooks/useCalculator';
import { useForm } from '../hooks/useForm';
import { useScrollPosition } from '../hooks/useScrollPosition';
import { Header } from './Header';
import { SearchForm } from './SearchForm';
import { Results } from './Results';
import { Footer } from './Footer';
import { Banner } from './Banner';

export default function CarbonCalculator() {
  const { calculate, loading, error, result, reset } = useCalculator();
  const {
    departCity,
    setDepartCity,
    arrivalCity,
    setArrivalCity,
    isRoundTrip,
    setIsRoundTrip,
    cabinClass,
    setCabinClass,
    resetForm,
    capitalizeCity,
  } = useForm();

  const scrollProgress = useScrollPosition();

  const handleReset = () => {
    resetForm();
    reset();
  };

  const calculateCarbonFootprint = async (e: FormEvent) => {
    e.preventDefault();
    await calculate(
      capitalizeCity(departCity),
      capitalizeCity(arrivalCity),
      cabinClass,
      isRoundTrip
    );
  };

  return (
    <div className="min-h-screen bg-primary md:py-2 md:px-2 relative">
      <div className="fixed top-0 left-0 right-0 h-1 bg-accent/10 z-50">
        <div 
          className="h-full bg-accent" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-3xl mx-auto relative h-full">
        <Banner />
        <div className="md:backdrop-blur-xl md:bg-primary/30 md:rounded-xl md:shadow-2xl md:p-8 
                      p-0 space-y-4 md:space-y-6 md:border md:border-accent/20">
          <Header />
          
          <SearchForm
            departCity={departCity}
            setDepartCity={setDepartCity}
            arrivalCity={arrivalCity}
            setArrivalCity={setArrivalCity}
            isRoundTrip={isRoundTrip}
            setIsRoundTrip={setIsRoundTrip}
            cabinClass={cabinClass}
            setCabinClass={setCabinClass}
            onSubmit={calculateCarbonFootprint}
            loading={loading}
          />

          {error && (
            <div className="bg-warning/10 text-warning p-4 rounded-xl border border-warning/20 backdrop-blur-sm">
              {error}
            </div>
          )}

          {result && (
            <Results 
              result={result} 
              isRoundTrip={isRoundTrip}
              cabinClass={cabinClass}
            />
          )}

          {result && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#353036] 
                          border-t border-[#F5B700]/20 md:relative md:p-0 md:bg-transparent 
                          md:border-0">
              <div className="container mx-auto px-4 max-w-3xl">
                <button
                  onClick={handleReset}
                  type="button"
                  className="w-full py-4 rounded-xl font-medium text-base
                            bg-accent text-[#353036]"
                >
                  Nouvelle recherche
                </button>
              </div>
            </div>
          )}

          <Footer result={!!result} />
        </div>
      </div>
    </div>
  );
} 