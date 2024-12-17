export function Footer({ result }: { result: boolean }) {
  return (
    <div className={`text-center py-4 text-[#F5B700]/50 text-sm
      ${result ? 'mb-20 md:mb-0' : 'mb-0'}`}>
      © {new Date().getFullYear()} François Chevalier
    </div>
  );
} 