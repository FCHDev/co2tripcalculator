import { useState } from 'react';
import { CabinClass } from '../types';

export function useForm() {
  const [departCity, setDepartCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [cabinClass, setCabinClass] = useState<CabinClass>('ECONOMY');

  const resetForm = () => {
    setDepartCity('');
    setArrivalCity('');
    setIsRoundTrip(false);
    setCabinClass('ECONOMY');
  };

  const capitalizeCity = (city: string) => {
    return city
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return {
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
  };
} 