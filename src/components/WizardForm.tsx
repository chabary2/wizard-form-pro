import { useState, useCallback } from "react";
import { ChevronRight, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const YOUTUBE_URL = "https://www.youtube.com/playlist?list=REPLACE_ME";

const STEPS = [
  {
    title: "Identificação",
    subtitle: "Conte um pouco sobre você.",
    fields: [
      { name: "nome", label: "Nome completo", type: "text", required: true },
      { name: "idade", label: "Idade", type: "number", required: true },
    ],
  },
  {
    title: "Contato",
    subtitle: "Como podemos falar com você.",
    fields: [
      { name: "instagram", label: "@ do Instagram", type: "text", required: true, placeholder: "@seuuser" },
      { name: "whatsapp", label: "WhatsApp com DDD", type: "tel", required: true, placeholder: "(11) 99999-9999" },
    ],
  },
  {
    title: "Negócio",
    subtitle: "Informações sobre sua empresa.",
    fields: [
      {
        name: "tipoEmpresa", label: "Tipo de empresa", type: "select", required: true,
        options: ["Infoprodutor", "Agência", "Prestador de serviços", "E-commerce", "Negócio local", "Outro"],
      },
      {
        name: "tempoOperacao", label: "Tempo de operação", type: "select", required: true,
        options: ["Menos de 6 meses", "6 meses a 1 ano", "1–3 anos", "Mais de 3 anos"],
      },
    ],
  },
  {
    title: "Números",
    subtitle: "Um retrato rápido dos seus números.",
    fields: [
      {
        name: "faturamento", label: "Faturamento médio mensal", type: "select",
        options: ["Ainda não vendo", "Até R$5 mil", "R$5–20 mil", "R$20–50 mil", "R$50–100 mil", "Acima de R$100 mil"],
      },
      {
        name: "margem", label: "Margem média", type: "select",
        options: ["Não sei", "Menos de 10%", "10–20%", "20–30%", "Acima de 30%"],
      },
    ],
  },
  {
    title: "Diagnóstico",
    subtitle: "Onde está travando hoje.",
    fields: [
      {
        name: "gargalo", label: "Principal gargalo", type: "select", required: true,
        options: ["Falta de leads", "Baixa conversão", "Falta de previsibilidade", "Operação desorganizada", "Escala travada", "Dependência de indicações", "Outro"],
      },
      { name: "maiorDor", label: "Maior dor", type: "textarea", required: true },
    ],
  },
  {
    title: "Objetivo",
    subtitle: "Para onde você quer levar isso.",
    fields: [
      { name: "meta", label: "Meta para os próximos 6 meses", type: "textarea", required: true },
      {
        name: "investimento", label: "Investimento para escalar", type: "select",
        options: ["Nada no momento", "Até R$1.000", "R$1.000–R$5.000", "R$5.000+ se houver retorno claro"],
      },
    ],
  },
];

type FormData = Record<string, string>;

const WizardForm = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(() => {
    try {
      const saved = localStorage.getItem("wizard-data");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animating, setAnimating] = useState(false);

  const totalSteps = STEPS.length;
  const progress = Math.round(((step + 1) / totalSteps) * 100);

  const updateField = useCallback((name: string, value: string) => {
    setData(prev => {
      const next = { ...prev, [name]: value };
      try { localStorage.setItem("wizard-data", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const currentStep = STEPS[step];

  const isStepValid = () => {
    if (!currentStep) return false;
    return currentStep.fields.every(f => !f.required || (data[f.name] && data[f.name].trim() !== ""));
  };

  const goNext = async () => {
    if (!isStepValid()) return;
    if (step === totalSteps - 1) {
      setSending(true);
      try {
        await fetch("/api/send", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
});
      } catch (e) {
        console.error("Email send error:", e);
      }
      setSending(false);
      setAnimating(true);
      setDirection("next");
      setTimeout(() => { setDone(true); setAnimating(false); }, 280);
      return;
    }
    setDirection("next");
    setAnimating(true);
    setTimeout(() => { setStep(s => s + 1); setAnimating(false); }, 280);
  };

  const inputClasses =
    "w-full h-11 px-3.5 rounded-xl text-sm outline-none transition-all duration-200 " +
    "placeholder:text-[var(--text-subtle)]";

  const inputStyle = {
    background: "var(--input-bg)",
    border: "1px solid var(--input-border)",
    color: "var(--text-primary)",
  };

  const renderField = (field: any) => {
    if (field.type === "select") {
      return (
        <select
          key={field.name}
          value={data[field.name] || ""}
          onChange={e => updateField(field.name, e.target.value)}
          className={inputClasses + " appearance-none cursor-pointer"}
          style={inputStyle}
        >
          <option value="" disabled>Selecione</option>
          {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }
    if (field.type === "textarea") {
      return (
        <textarea
          key={field.name}
          value={data[field.name] || ""}
          onChange={e => updateField(field.name, e.target.value)}
          className={inputClasses + " min-h-[88px] py-3 resize-none"}
          style={inputStyle}
          rows={3}
        />
      );
    }
    return (
      <input
        key={field.name}
        type={field.type}
        value={data[field.name] || ""}
        onChange={e => updateField(field.name, e.target.value)}
        placeholder={field.placeholder || ""}
        className={inputClasses}
        style={inputStyle}
      />
    );
  };

  const cardContent = done ? (
    <div className="text-center py-4">
      <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
        Acesso liberado.
      </h2>
      <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
        Clique abaixo para assistir o treinamento no YouTube.
      </p>
      <a
        href={YOUTUBE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full h-12 rounded-xl font-semibold text-sm transition-colors duration-200"
        style={{ background: "var(--btn-bg)", color: "#0b0f14" }}
        onMouseEnter={e => (e.currentTarget.style.background = "var(--btn-hover)")}
        onMouseLeave={e => (e.currentTarget.style.background = "var(--btn-bg)")}
      >
        Abrir playlist do YouTube
        <ExternalLink size={16} />
      </a>
    </div>
  ) : (
    <>
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
        {currentStep.title}
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        {currentStep.subtitle}
      </p>

      <div className="space-y-4">
        {currentStep.fields.map(field => (
          <div key={field.name}>
            <label className="block text-xs font-semibold mb-1.5 tracking-wide" style={{ color: "var(--text-primary)" }}>
              {field.label}
            </label>
            {renderField(field)}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={goNext}
          disabled={!isStepValid() || sending}
          className="flex items-center justify-center gap-2 w-full h-12 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-40"
          style={{ background: "var(--btn-bg)", color: "#0b0f14" }}
          onMouseEnter={e => { if (isStepValid() && !sending) e.currentTarget.style.background = "var(--btn-hover)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--btn-bg)"; }}
        >
          {sending ? (
            <><Loader2 size={16} className="animate-spin" /> Enviando...</>
          ) : step === totalSteps - 1 ? "Enviar" : "Próximo Passo"}
          {!sending && <ChevronRight size={16} />}
        </button>
      </div>
    </>
  );

  return (
    <div className="w-full max-w-[540px]" style={{ width: "min(540px, 92vw)" }}>
      {/* Progress */}
      {!done && (
        <div className="mb-6 mx-auto" style={{ maxWidth: 360 }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: "var(--text-subtle)" }}>
              PROGRESSO
            </span>
            <span className="text-[10px] font-medium" style={{ color: "var(--text-subtle)" }}>
              {progress}%
            </span>
          </div>
          <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "var(--progress-track)" }}>
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, background: "var(--progress-fill)" }}
            />
          </div>
        </div>
      )}

      {/* Card */}
      <div
        className="rounded-2xl p-7 backdrop-blur-md"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          boxShadow: "var(--glass-shadow)",
          borderRadius: 20,
        }}
      >
        <div
          className={`transition-all duration-[280ms] ease-in-out ${
            animating
              ? direction === "next"
                ? "opacity-0 translate-x-4"
                : "opacity-0 -translate-x-4"
              : "opacity-100 translate-x-0"
          }`}
        >
          {cardContent}
        </div>
      </div>
    </div>
  );
};

export default WizardForm;
