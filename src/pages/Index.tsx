import WizardForm from "@/components/WizardForm";

const Index = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{
        background: "radial-gradient(ellipse at center, #131920 0%, #0b0f14 60%, #080b0f 100%)",
      }}
    >
      {/* Brand */}
      <div className="mb-6 text-center">
        <span className="text-xs font-medium tracking-[0.35em] uppercase" style={{ color: "var(--text-secondary)" }}>
          MARCUSPIRES
        </span>
      </div>

      {/* Intro */}
      <p className="text-sm text-center mb-8 max-w-md leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        Responda em menos de 2 minutos e receba acesso ao treinamento gratuito.
      </p>

      {/* Wizard */}
      <WizardForm />

      {/* Footer */}
      <footer className="mt-auto pt-12 pb-6 text-center">
        <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
          © 2026 MarcusPires. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Index;
