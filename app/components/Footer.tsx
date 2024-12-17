export function Footer({ result }: FooterProps) {
  return (
    <footer className={`text-center text-xs text-secondary/60 space-y-2 
                     ${result ? 'pb-24 md:pb-0' : ''}`}>
      <p>
        Calculateur basé sur la méthodologie de l&apos;ADEME
      </p>
      <p>
        Développé avec ❤️ par{' '}
        <a 
          href="https://github.com/FCHDev" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-secondary hover:text-secondary/80 transition-colors duration-200"
        >
          @FCHDev
        </a>
      </p>
    </footer>
  );
} 