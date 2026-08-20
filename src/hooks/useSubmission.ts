"use client";

import { useEffect, useState } from "react";
import { getSubmission } from "@/services/submissions.service";
import type { Submission } from "@/types/submission.types";

export function useSubmission(uid: string | undefined) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    getSubmission(uid)
      .then(setSubmission)
      .catch(() => setError("Erro ao carregar dados da submissão."))
      .finally(() => setLoading(false));
  }, [uid]);

  const refresh = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const data = await getSubmission(uid);
      setSubmission(data);
    } finally {
      setLoading(false);
    }
  };

  return { submission, loading, error, refresh };
}
