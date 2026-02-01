"use client";

import { useCallback, useEffect, useState } from "react";
import MarkdownEditor from "@/components/MarkdownEditor";
import MarkdownPreview from "@/components/MarkdownPreview";
import PatchStack from "@/components/PatchStack";
import VibePanel from "@/components/VibePanel";
import type { PatchSummary } from "@/lib/diff/types";

interface DocWorkspaceProps {
  docId: string;
}

interface DocumentResponse {
  id: string;
  title: string;
  content_md: string;
}

export default function DocWorkspace({ docId }: DocWorkspaceProps) {
  const [documentTitle, setDocumentTitle] = useState("Loading...");
  const [content, setContent] = useState("");
  const [intent, setIntent] = useState("");
  const [patch, setPatch] = useState<PatchSummary | null>(null);
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [candidateMd, setCandidateMd] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [lastSnapshotId, setLastSnapshotId] = useState<string | null>(null);

  const loadDocument = useCallback(async () => {
    const res = await fetch(`/api/documents/${docId}`);
    if (!res.ok) {
      return;
    }
    const data = (await res.json()) as { document: DocumentResponse };
    setDocumentTitle(data.document.title);
    setContent(data.document.content_md);
  }, [docId]);

  useEffect(() => {
    void loadDocument();
  }, [loadDocument]);

  const requestPatch = async (base: string, candidate: string, summary: string, proposal: string) => {
    const diffRes = await fetch("/api/patch/diff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doc_id: docId,
        base_md: base,
        candidate_md: candidate,
        summary,
        proposal_id: proposal,
        intent
      })
    });
    if (!diffRes.ok) {
      return;
    }
    const diffData = (await diffRes.json()) as {
      patch: PatchSummary;
      needs_regen: boolean;
    };
    if (diffData.needs_regen) {
      await handleGenerate();
      return;
    }
    setPatch(diffData.patch);
    setNotice(null);
  };

  const handleGenerate = async () => {
    const proposalRes = await fetch("/api/proposal/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doc_id: docId,
        content_md: content,
        intent
      })
    });
    if (!proposalRes.ok) {
      return;
    }
    const proposalData = (await proposalRes.json()) as {
      proposal: { id: string; summary: string; candidate_md: string; base_hash: string };
    };
    setProposalId(proposalData.proposal.id);
    setCandidateMd(proposalData.proposal.candidate_md);
    await requestPatch(
      content,
      proposalData.proposal.candidate_md,
      proposalData.proposal.summary,
      proposalData.proposal.id
    );
  };

  const handleUpdateBlock = (blockKey: string, updates: Record<string, boolean>) => {
    if (!patch) {
      return;
    }
    setPatch({
      ...patch,
      blocks: patch.blocks.map((block) => {
        if (block.block_key !== blockKey || !block.sentences) {
          return block;
        }
        return {
          ...block,
          sentences: block.sentences.map((sentence) =>
            updates[sentence.id] === undefined
              ? sentence
              : { ...sentence, accept: updates[sentence.id] }
          )
        };
      })
    });
  };

  const handleUpdateWhole = (blockKey: string, accept: boolean) => {
    if (!patch) {
      return;
    }
    setPatch({
      ...patch,
      blocks: patch.blocks.map((block) =>
        block.block_key === blockKey
          ? {
              ...block,
              accept
            }
          : block
      )
    });
  };

  const handleApply = async () => {
    if (!patch || !proposalId) {
      return;
    }
    const acceptance: Record<string, Record<string, boolean>> = {};
    const wholeAcceptance: Record<string, boolean> = {};
    patch.blocks.forEach((block) => {
      if (block.mode === "sentence" && block.sentences) {
        acceptance[block.block_key] = Object.fromEntries(
          block.sentences.map((sentence) => [
            sentence.id,
            sentence.accept ?? false
          ])
        );
      } else if (block.mode === "whole") {
        wholeAcceptance[block.block_key] = block.accept ?? false;
      }
    });
    const res = await fetch("/api/patch/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doc_id: docId,
        patch_id: patch.id,
        current_md: content,
        acceptance,
        whole_acceptance: wholeAcceptance
      })
    });
    if (res.status === 409) {
      setNotice("内容已更新，正在重新比对…");
      if (candidateMd && proposalId) {
        await requestPatch(content, candidateMd, patch.summary, proposalId);
      }
      return;
    }
    if (!res.ok) {
      return;
    }
    const data = (await res.json()) as { new_md: string; snapshot_id: string };
    setContent(data.new_md);
    setPatch(null);
    setLastSnapshotId(data.snapshot_id);
    setNotice(null);
  };

  const handleReject = () => {
    setPatch(null);
  };

  const handleAcceptAll = () => {
    if (!patch) {
      return;
    }
    setPatch({
      ...patch,
      blocks: patch.blocks.map((block) => {
        if (block.mode === "sentence" && block.sentences) {
          return {
            ...block,
            sentences: block.sentences.map((sentence) => ({
              ...sentence,
              accept: true
            }))
          };
        }
        return { ...block, accept: true };
      })
    });
  };

  const handleRejectAll = () => {
    if (!patch) {
      return;
    }
    setPatch({
      ...patch,
      blocks: patch.blocks.map((block) => {
        if (block.mode === "sentence" && block.sentences) {
          return {
            ...block,
            sentences: block.sentences.map((sentence) => ({
              ...sentence,
              accept: false
            }))
          };
        }
        return { ...block, accept: false };
      })
    });
  };

  const handleRevert = async () => {
    if (!lastSnapshotId) {
      return;
    }
    const res = await fetch("/api/patch/revert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doc_id: docId, snapshot_id: lastSnapshotId })
    });
    if (!res.ok) {
      return;
    }
    const data = (await res.json()) as { content_md: string };
    setContent(data.content_md);
    setLastSnapshotId(null);
  };

  const handleExport = async (type: "md" | "pdf") => {
    const res = await fetch(`/api/export/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doc_id: docId })
    });
    if (!res.ok) {
      return;
    }
    const data = (await res.json()) as { download_url: string };
    window.location.href = data.download_url;
  };

  const handleContentChange = async (value: string) => {
    setContent(value);
    await fetch(`/api/documents/${docId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content_md: value })
    });
    if (patch && candidateMd && proposalId) {
      setNotice("内容已更新，正在重新比对…");
      await requestPatch(value, candidateMd, patch.summary, proposalId);
    }
  };

  return (
    <main className="page page--workspace">
      <header className="workspace__header">
        <h1>{documentTitle}</h1>
        <div className="workspace__header-actions">
          {lastSnapshotId && (
            <button onClick={handleRevert}>Revert last apply</button>
          )}
          <button onClick={() => handleExport("md")}>Export MD</button>
          <button onClick={() => handleExport("pdf")}>Export PDF</button>
          <a href="/">Back to documents</a>
        </div>
      </header>
      {notice && <div className="workspace__notice">{notice}</div>}
      <section className="workspace__body">
        <div className="workspace__editor">
          <MarkdownEditor value={content} onChange={handleContentChange} />
        </div>
        <div className="workspace__preview">
          <MarkdownPreview content={content} />
        </div>
        <aside className="workspace__side">
          <VibePanel
            intent={intent}
            onIntentChange={setIntent}
            onGenerate={handleGenerate}
          />
          <PatchStack
            patch={patch}
            onApply={handleApply}
            onReject={handleReject}
            onUpdateBlock={handleUpdateBlock}
            onUpdateWhole={handleUpdateWhole}
            onAcceptAll={handleAcceptAll}
            onRejectAll={handleRejectAll}
          />
        </aside>
      </section>
    </main>
  );
}
