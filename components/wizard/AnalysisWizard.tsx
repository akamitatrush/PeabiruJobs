"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";

const STEPS = [
  "Boas-vindas",
  "Currículo",
  "LinkedIn",
  "Cargo-alvo",
  "Vaga específica",
  "Arquivos complementares",
  "Revisão",
] as const;

const PROCESSING_MESSAGES = [
  "Lendo seus materiais profissionais.",
  "Analisando aderência ao cargo-alvo.",
  "Identificando pontos fortes e lacunas.",
  "Gerando recomendações priorizadas.",
  "Criando seu plano de evolução.",
];

const ACCEPTED_RESUME = ".pdf,.doc,.docx,.txt";

export interface WizardInitialData {
  originalAnalysisId: string;
  targetRole: string;
  targetArea: string | null;
  targetSeniority: string | null;
}

interface UploadedFile {
  file: File;
  url?: string;
}

async function readTextIfPlain(file: File): Promise<string | null> {
  if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
    try {
      return await file.text();
    } catch {
      return null;
    }
  }
  return null;
}

export function AnalysisWizard({ initial }: { initial?: WizardInitialData }) {
  const router = useRouter();
  const { toast } = useToast();
  const isReanalysis = Boolean(initial);

  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState(
    PROCESSING_MESSAGES[0]
  );
  const [stepError, setStepError] = useState<string | null>(null);

  // Etapa 2 — Currículo
  const [resumeFile, setResumeFile] = useState<UploadedFile | null>(null);
  const [resumeText, setResumeText] = useState("");

  // Etapa 3 — LinkedIn
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinFile, setLinkedinFile] = useState<UploadedFile | null>(null);
  const [linkedinText, setLinkedinText] = useState("");

  // Etapa 4 — Cargo-alvo
  const [targetRole, setTargetRole] = useState(initial?.targetRole ?? "");
  const [targetArea, setTargetArea] = useState(initial?.targetArea ?? "");
  const [targetSeniority, setTargetSeniority] = useState(
    initial?.targetSeniority ?? ""
  );
  const [wantsSuggestions, setWantsSuggestions] = useState(false);

  // Etapa 5 — Vaga específica (opcional)
  const [jobUrl, setJobUrl] = useState("");
  const [jobText, setJobText] = useState("");
  const [jobFile, setJobFile] = useState<UploadedFile | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobCompany, setJobCompany] = useState("");

  // Etapa 6 — Complementares (opcional)
  const [extraFiles, setExtraFiles] = useState<UploadedFile[]>([]);
  const [extraText, setExtraText] = useState("");

  const processingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (processingTimer.current) clearInterval(processingTimer.current);
    };
  }, []);

  const progress = useMemo(
    () => ((step + 1) / STEPS.length) * 100,
    [step]
  );

  function next() {
    setStepError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setStepError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  function validateAndNext() {
    if (step === 1 && !resumeFile && !resumeText.trim()) {
      setStepError(
        "Envie um arquivo de currículo ou cole o texto para continuar."
      );
      return;
    }
    if (
      step === 3 &&
      !wantsSuggestions &&
      !targetRole.trim()
    ) {
      setStepError(
        "Informe o cargo-alvo ou marque a opção de receber sugestões."
      );
      return;
    }
    next();
  }

  async function uploadFile(
    supabase: ReturnType<typeof createClient>,
    userId: string,
    file: File
  ): Promise<string | null> {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${userId}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage
      .from("documents")
      .upload(path, file);
    if (error) {
      console.error("Falha no upload:", error.message);
      return null;
    }
    return path;
  }

  async function handleSubmit() {
    setProcessing(true);
    let messageIndex = 0;
    processingTimer.current = setInterval(() => {
      messageIndex = (messageIndex + 1) % PROCESSING_MESSAGES.length;
      setProcessingMessage(PROCESSING_MESSAGES[messageIndex]);
    }, 2600);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão expirada. Faça login novamente.");

      // Uploads (os arquivos ficam salvos no Storage e vinculados à análise)
      const documents: Array<{
        document_type: string;
        file_url?: string;
        raw_text?: string;
      }> = [];

      let resumeTextFinal = resumeText.trim() || null;
      if (resumeFile) {
        const path = await uploadFile(supabase, user.id, resumeFile.file);
        const plain = await readTextIfPlain(resumeFile.file);
        if (plain && !resumeTextFinal) resumeTextFinal = plain;
        if (path) {
          documents.push({ document_type: "resume", file_url: path });
        }
      }

      let linkedinTextFinal = linkedinText.trim() || null;
      if (linkedinFile) {
        const path = await uploadFile(supabase, user.id, linkedinFile.file);
        const plain = await readTextIfPlain(linkedinFile.file);
        if (plain && !linkedinTextFinal) linkedinTextFinal = plain;
        if (path) {
          documents.push({ document_type: "linkedin_pdf", file_url: path });
        }
      }

      let jobTextFinal = jobText.trim() || null;
      if (jobFile) {
        const path = await uploadFile(supabase, user.id, jobFile.file);
        const plain = await readTextIfPlain(jobFile.file);
        if (plain && !jobTextFinal) jobTextFinal = plain;
        if (path) {
          documents.push({ document_type: "job_description", file_url: path });
        }
      }
      if (jobUrl.trim()) {
        documents.push({
          document_type: "job_description",
          file_url: jobUrl.trim(),
        });
      }

      let extraTextFinal = extraText.trim() || null;
      for (const item of extraFiles) {
        const path = await uploadFile(supabase, user.id, item.file);
        const plain = await readTextIfPlain(item.file);
        if (plain) {
          extraTextFinal = [extraTextFinal, plain].filter(Boolean).join("\n\n");
        }
        if (path) {
          documents.push({
            document_type: "complementary_file",
            file_url: path,
          });
        }
      }

      const effectiveRole = wantsSuggestions
        ? targetRole.trim() || "Explorar opções de cargo (quero sugestões)"
        : targetRole.trim();

      const response = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: isReanalysis
            ? `Reanálise — ${effectiveRole}`
            : `Análise — ${effectiveRole}`,
          target_role: effectiveRole,
          target_area: targetArea.trim() || null,
          target_seniority: targetSeniority.trim() || null,
          resume_text: resumeTextFinal,
          linkedin_url: linkedinUrl.trim() || null,
          linkedin_text: linkedinTextFinal,
          job_description_text: jobTextFinal,
          job_title: jobTitle.trim() || null,
          job_company: jobCompany.trim() || null,
          complementary_files_text: extraTextFinal,
          documents,
          original_analysis_id: initial?.originalAnalysisId ?? null,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Falha ao gerar a análise.");
      }

      const { id } = await response.json();
      router.push(`/analise/${id}`);
    } catch (error) {
      if (processingTimer.current) clearInterval(processingTimer.current);
      setProcessing(false);
      toast(
        error instanceof Error ? error.message : "Falha ao gerar a análise.",
        "error"
      );
    }
  }

  // ---------- Etapa 8: processamento ----------
  if (processing) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
        <Spinner className="h-10 w-10 text-brand-600" />
        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Gerando sua análise
        </h2>
        <p className="animate-fade-in mt-3 text-sm text-slate-500" key={processingMessage}>
          {processingMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Barra de progresso */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span>
            Etapa {step + 1} de {STEPS.length}
          </span>
          <span>{STEPS[step]}</span>
        </div>
        <ProgressBar value={progress} />
      </div>

      <Card className="animate-fade-in" key={step}>
        {/* Etapa 1 — Boas-vindas */}
        {step === 0 ? (
          <div className="py-6 text-center">
            <h1 className="text-2xl font-semibold text-slate-900">
              {isReanalysis
                ? "Vamos reanalisar seu posicionamento"
                : "Vamos analisar seu posicionamento profissional"}
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-500">
              {isReanalysis
                ? "Envie seus materiais atualizados para comparar a evolução em relação à análise anterior."
                : "Envie seus materiais para receber recomendações personalizadas sobre currículo, LinkedIn, aderência a vagas e plano de evolução."}
            </p>
            <Button size="lg" className="mt-8" onClick={next}>
              Começar
            </Button>
          </div>
        ) : null}

        {/* Etapa 2 — Currículo */}
        {step === 1 ? (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Seu currículo
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Envie o arquivo (PDF, DOC, DOCX ou TXT) ou cole o texto abaixo.
              </p>
            </div>

            <div>
              <Label htmlFor="resume-file">Upload de currículo</Label>
              <Input
                id="resume-file"
                type="file"
                accept={ACCEPTED_RESUME}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setResumeFile(file ? { file } : null);
                }}
              />
              {resumeFile ? (
                <p className="mt-1.5 text-xs text-emerald-600">
                  Arquivo selecionado: {resumeFile.file.name}
                </p>
              ) : null}
            </div>

            <div>
              <Label
                htmlFor="resume-text"
                hint="recomendado para a melhor análise"
              >
                Ou cole o texto do currículo
              </Label>
              <Textarea
                id="resume-text"
                rows={8}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Cole aqui o conteúdo do seu currículo…"
              />
              <p className="mt-1.5 text-xs text-slate-400">
                Para arquivos PDF/DOC, colar o texto garante que a análise leia
                todo o conteúdo.
              </p>
            </div>
          </div>
        ) : null}

        {/* Etapa 3 — LinkedIn */}
        {step === 2 ? (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Seu LinkedIn
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Informe o link público, envie o PDF exportado ou cole o texto
                do perfil.
              </p>
            </div>

            <div>
              <Label htmlFor="linkedin-url">Link público do LinkedIn</Label>
              <Input
                id="linkedin-url"
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/seu-perfil"
              />
            </div>

            <div>
              <Label htmlFor="linkedin-file">
                Upload de PDF exportado do LinkedIn
              </Label>
              <Input
                id="linkedin-file"
                type="file"
                accept=".pdf,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setLinkedinFile(file ? { file } : null);
                }}
              />
              {linkedinFile ? (
                <p className="mt-1.5 text-xs text-emerald-600">
                  Arquivo selecionado: {linkedinFile.file.name}
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="linkedin-text">Ou cole o texto do perfil</Label>
              <Textarea
                id="linkedin-text"
                rows={6}
                value={linkedinText}
                onChange={(e) => setLinkedinText(e.target.value)}
                placeholder="Cole aqui o título, resumo e experiências do seu LinkedIn…"
              />
            </div>
          </div>
        ) : null}

        {/* Etapa 4 — Cargo-alvo */}
        {step === 3 ? (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Cargo-alvo
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Para onde você quer direcionar sua carreira?
              </p>
            </div>

            <div>
              <Label htmlFor="target-role">Cargo-alvo desejado</Label>
              <Input
                id="target-role"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Ex.: Analista Administrativo, Product Designer…"
                disabled={wantsSuggestions && !targetRole}
              />
            </div>

            <div>
              <Label htmlFor="target-area">Área de interesse</Label>
              <Input
                id="target-area"
                value={targetArea}
                onChange={(e) => setTargetArea(e.target.value)}
                placeholder="Ex.: Administração, Tecnologia, Atendimento…"
              />
            </div>

            <div>
              <Label htmlFor="target-seniority">Senioridade desejada</Label>
              <Select
                id="target-seniority"
                value={targetSeniority}
                onChange={(e) => setTargetSeniority(e.target.value)}
              >
                <option value="">Selecione…</option>
                <option value="Estágio">Estágio</option>
                <option value="Júnior">Júnior</option>
                <option value="Pleno">Pleno</option>
                <option value="Sênior">Sênior</option>
                <option value="Especialista">Especialista</option>
                <option value="Coordenação">Coordenação</option>
                <option value="Gerência">Gerência</option>
              </Select>
            </div>

            <label className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={wantsSuggestions}
                onChange={(e) => setWantsSuggestions(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Não sei qual cargo buscar. Quero receber sugestões.
            </label>
          </div>
        ) : null}

        {/* Etapa 5 — Vaga específica */}
        {step === 4 ? (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Vaga específica{" "}
                <span className="text-sm font-normal text-slate-400">
                  (opcional)
                </span>
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Se você tem uma vaga em vista, adicione para receber um
                diagnóstico de aderência específico.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="job-title">Nome da vaga</Label>
                <Input
                  id="job-title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Ex.: Assistente Administrativo"
                />
              </div>
              <div>
                <Label htmlFor="job-company">Empresa</Label>
                <Input
                  id="job-company"
                  value={jobCompany}
                  onChange={(e) => setJobCompany(e.target.value)}
                  placeholder="Ex.: Empresa XYZ"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="job-url">Link da vaga</Label>
              <Input
                id="job-url"
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>

            <div>
              <Label htmlFor="job-text" hint="recomendado">
                Texto da vaga
              </Label>
              <Textarea
                id="job-text"
                rows={6}
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Cole aqui a descrição completa da vaga…"
              />
            </div>

            <div>
              <Label htmlFor="job-file">
                Ou envie um PDF/arquivo com a descrição
              </Label>
              <Input
                id="job-file"
                type="file"
                accept={ACCEPTED_RESUME}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setJobFile(file ? { file } : null);
                }}
              />
              {jobFile ? (
                <p className="mt-1.5 text-xs text-emerald-600">
                  Arquivo selecionado: {jobFile.file.name}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Etapa 6 — Arquivos complementares */}
        {step === 5 ? (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Arquivos complementares{" "}
                <span className="text-sm font-normal text-slate-400">
                  (opcional)
                </span>
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Certificados, cartas de recomendação, projetos, apresentações,
                evidências de resultado ou produções acadêmicas.
              </p>
            </div>

            <div>
              <Label htmlFor="extra-files">Enviar arquivos</Label>
              <Input
                id="extra-files"
                type="file"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []).map(
                    (file) => ({ file })
                  );
                  setExtraFiles((prev) => [...prev, ...files]);
                }}
              />
              {extraFiles.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {extraFiles.map((item, index) => (
                    <li
                      key={`${item.file.name}-${index}`}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600"
                    >
                      <span className="truncate">{item.file.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setExtraFiles((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        className="ml-2 text-slate-400 hover:text-rose-500"
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div>
              <Label htmlFor="extra-text">
                Ou descreva evidências e conquistas relevantes
              </Label>
              <Textarea
                id="extra-text"
                rows={4}
                value={extraText}
                onChange={(e) => setExtraText(e.target.value)}
                placeholder="Ex.: certificado em Excel avançado (2024), reconhecimento por organização de processo interno…"
              />
            </div>
          </div>
        ) : null}

        {/* Etapa 7 — Revisão */}
        {step === 6 ? (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Revisão
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Confira o que será analisado antes de gerar o resultado.
              </p>
            </div>

            <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              <ReviewRow
                label="Currículo"
                value={
                  resumeFile
                    ? resumeFile.file.name
                    : resumeText.trim()
                      ? "Texto colado"
                      : "Não enviado"
                }
                ok={Boolean(resumeFile || resumeText.trim())}
              />
              <ReviewRow
                label="LinkedIn"
                value={
                  [
                    linkedinUrl.trim() ? "Link" : null,
                    linkedinFile ? "PDF" : null,
                    linkedinText.trim() ? "Texto colado" : null,
                  ]
                    .filter(Boolean)
                    .join(" + ") || "Não enviado"
                }
                ok={Boolean(
                  linkedinUrl.trim() || linkedinFile || linkedinText.trim()
                )}
              />
              <ReviewRow
                label="Cargo-alvo"
                value={
                  wantsSuggestions && !targetRole.trim()
                    ? "Quero receber sugestões"
                    : targetRole.trim() || "Não informado"
                }
                ok
              />
              <ReviewRow
                label="Vaga específica"
                value={
                  jobText.trim() || jobUrl.trim() || jobFile
                    ? [jobTitle.trim(), jobCompany.trim()]
                        .filter(Boolean)
                        .join(" · ") || "Adicionada"
                    : "Não adicionada"
                }
                ok
              />
              <ReviewRow
                label="Arquivos complementares"
                value={
                  extraFiles.length > 0
                    ? `${extraFiles.length} arquivo(s)`
                    : extraText.trim()
                      ? "Descrição adicionada"
                      : "Nenhum"
                }
                ok
              />
            </dl>

            <p className="text-xs leading-relaxed text-slate-400">
              O PeabiruJobs não inventa experiências nem promete contratação.
              A análise é baseada apenas nos materiais que você enviou.
            </p>
          </div>
        ) : null}

        {/* Navegação */}
        {step > 0 ? (
          <div className="mt-8 space-y-3">
            {stepError ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {stepError}
              </p>
            ) : null}
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={back}>
                Voltar
              </Button>
              {step === 4 ? (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={next}>
                    Pular por enquanto
                  </Button>
                  <Button onClick={next}>Adicionar vaga</Button>
                </div>
              ) : step === 6 ? (
                <Button size="lg" onClick={handleSubmit}>
                  Gerar análise
                </Button>
              ) : (
                <Button onClick={validateAndNext}>Continuar</Button>
              )}
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className="text-sm font-medium text-slate-600">{label}</dt>
      <dd
        className={`truncate text-sm ${ok ? "text-slate-800" : "text-amber-600"}`}
      >
        {value}
      </dd>
    </div>
  );
}
