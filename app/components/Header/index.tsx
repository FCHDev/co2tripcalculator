import { COLORS } from '../../constants';

export function Header() {
  return (
    <div className="sticky top-0 z-10 bg-primary p-4 md:p-0 md:static 
                    border-b border-accent/10 md:border-none backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-4xl font-bold tracking-tight text-secondary">
            Où va-t-on ?
          </h1>
          <p className="text-sm md:text-base text-secondary/80">
            Estimez l&apos;empreinte carbone de votre voyage
          </p>
        </div>
        <div className="md:hidden">
          <span className="text-2xl">✈️</span>
        </div>
      </div>
    </div>
  );
} 