export function Banner() {
  return (
    <div className="relative py-8 md:py-12">
      <div className="relative max-w-3xl mx-auto text-center px-4">
        <div className="inline-block">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent to-accent/70 
                         bg-clip-text text-transparent pb-2">
            Calculateur CO₂
          </h1>
          <div className="h-0.5 bg-gradient-to-r from-accent/0 via-accent to-accent/0" />
        </div>
        <p className="mt-4 text-accent/70 text-lg md:text-xl">
          Calculez l'empreinte carbone de vos voyages en avion
        </p>
      </div>
    </div>
  );
} 