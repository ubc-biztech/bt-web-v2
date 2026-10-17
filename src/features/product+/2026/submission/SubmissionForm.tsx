import { useEffect, useRef, useState } from "react";
import SubmissionView from "./SubmissionView";
import {
  errorMessage,
  errorStatus,
  getSubmission,
  saveSubmission,
  uploadSubmissionPdf,
  type SubmissionSnapshot,
} from "./api";
import {
  MAX_PDF_BYTES,
  validateSubmission,
  youtubeVideoId,
  type SubmissionFields,
  type SubmissionErrors,
  type SubmissionNotice,
  type SubmissionPhase,
  type SubmissionTeam,
} from "./submission";

export default function SubmissionForm({
  team,
  snapshot,
  onSnapshot,
  onAccessLost,
}: {
  team: SubmissionTeam;
  snapshot: SubmissionSnapshot;
  onSnapshot: (snapshot: SubmissionSnapshot) => void;
  onAccessLost: () => void;
}) {
  const [saved, setSaved] = useState(snapshot.submission);
  const [draftFields, setFields] = useState<
    Omit<SubmissionFields, "team_name" | "member_names">
  >(
    () =>
      snapshot.submission ?? {
        project_title: "",
        video_url: "",
        prd_path: "",
      },
  );
  // Team identity is managed on My Team, never by submission edits or snapshots.
  const fields: SubmissionFields = {
    ...draftFields,
    team_name: team.team_name,
    member_names: team.members.map((member) => member.name),
  };
  const [editing, setEditing] = useState(!snapshot.submission);
  const [file, setFile] = useState<File | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [phase, setPhase] = useState<SubmissionPhase>("idle");
  const [errors, setErrors] = useState<SubmissionErrors>({});
  const [notice, setNotice] = useState<SubmissionNotice | null>(null);
  const [rejectedFile, setRejectedFile] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [openingPdf, setOpeningPdf] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [now, setNow] = useState(Date.now);
  const [forceClosed, setForceClosed] = useState(false);
  const submitting = useRef(false);
  const uploadedFile = useRef<{ file: File; path: string } | null>(null);
  const serverSubmission = useRef(snapshot.submission);
  const mounted = useRef(true);
  const fileSelection = useRef(0);
  const [checkingFile, setCheckingFile] = useState(false);
  const deadline = Date.parse(snapshot.submission_deadline);
  const locked =
    forceClosed ||
    !snapshot.can_edit ||
    !Number.isFinite(deadline) ||
    now >= deadline;

  useEffect(() => {
    const previous = serverSubmission.current;
    const next = snapshot.submission;
    if (next === previous || submitting.current || !next) return;
    serverSubmission.current = next;
    setSaved(next);
    setFields((current) => {
      if (locked) return next;
      return {
        project_title:
          (current.project_title ?? "") === (previous?.project_title ?? "")
            ? next.project_title
            : current.project_title,
        video_url:
          current.video_url === (previous?.video_url ?? "")
            ? next.video_url
            : current.video_url,
        prd_path: next.prd_path,
      };
    });
  }, [snapshot.submission, phase, locked]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = window.setInterval(tick, 1000);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", tick);
    };
  }, []);
  useEffect(() => {
    if (!file) {
      setLocalUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setLocalUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => {
    if (!notice || notice.tone !== "success") return;
    const timer = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (!celebrate) return;
    const timer = window.setTimeout(() => setCelebrate(false), 2400);
    return () => window.clearTimeout(timer);
  }, [celebrate]);
  useEffect(() => {
    if (!locked) return;
    fileSelection.current++;
    setCheckingFile(false);
    setFile(null);
    uploadedFile.current = null;
    setRejectedFile(null);
    setUploadError(null);
    setEditing(false);
    setErrors({});
    if (saved) setFields(saved);
  }, [locked, saved]);

  function handleError(error: unknown) {
    if (!mounted.current) return;
    const message = errorMessage(error);
    if (errorStatus(error) === 403 && /closed|deadline/i.test(message)) {
      setForceClosed(true);
      setNotice({
        tone: "error",
        message: "The submission deadline has passed.",
      });
    } else if (errorStatus(error) === 403 || errorStatus(error) === 401) {
      onAccessLost();
    } else {
      setNotice({ tone: "error", message });
    }
  }

  function change(next: SubmissionFields) {
    if (locked || submitting.current || checkingFile) return;
    setFields(next);
    setEditing(true);
    setNotice(null);
    setErrors((previous) => ({
      ...previous,
      team_name: next.team_name.trim() ? undefined : previous.team_name,
      project_title: next.project_title?.trim()
        ? undefined
        : previous.project_title,
      member_names: next.member_names.every((name) => name.trim())
        ? undefined
        : previous.member_names,
      video_url: youtubeVideoId(next.video_url)
        ? undefined
        : previous.video_url,
    }));
  }

  async function chooseFile(next: File) {
    if (locked || submitting.current) return;
    const selection = ++fileSelection.current;
    setCheckingFile(true);
    try {
      const header = new TextDecoder().decode(
        await next.slice(0, 8).arrayBuffer(),
      );
      if (
        !mounted.current ||
        selection !== fileSelection.current ||
        Date.now() >= deadline
      )
        return;
      if (
        (next.type && next.type !== "application/pdf") ||
        !/\.pdf$/i.test(next.name) ||
        next.size > MAX_PDF_BYTES ||
        next.size < 8 ||
        !/^%PDF-\d\.\d/.test(header)
      ) {
        setRejectedFile(next.name);
        return;
      }
      setFile(next);
      uploadedFile.current = null;
      setRejectedFile(null);
      setUploadError(null);
      setErrors((previous) => ({ ...previous, prd_path: undefined }));
      setEditing(true);
      setNotice(null);
    } catch {
      if (mounted.current)
        setNotice({
          tone: "error",
          message: "Couldn’t read that file. Please choose it again.",
        });
    } finally {
      if (mounted.current && selection === fileSelection.current)
        setCheckingFile(false);
    }
  }

  async function submit(uploadOnly = false) {
    if (locked || submitting.current || checkingFile) return;
    if (uploadOnly && !file) return;
    if (Date.now() >= deadline) {
      setForceClosed(true);
      setNotice({
        tone: "error",
        message: "The submission deadline has passed.",
      });
      return;
    }
    if (!uploadOnly) {
      const validation = validateSubmission(
        fields,
        !!file || !!fields.prd_path,
      );
      setErrors(validation);
      if (Object.keys(validation).length) return;
    }
    submitting.current = true;
    setNotice(null);
    setRejectedFile(null);
    setUploadError(null);
    let uploading = !!file && uploadedFile.current?.file !== file;
    try {
      let path = fields.prd_path;
      if (file) {
        if (uploadedFile.current?.file === file) {
          path = uploadedFile.current.path;
        } else {
          setPhase("uploading");
          path = await uploadSubmissionPdf(file);
          if (!mounted.current || Date.now() >= deadline) return;
          uploadedFile.current = { file, path };
        }
      }
      if (!mounted.current) return;
      if (uploadOnly) {
        setErrors((previous) => ({ ...previous, prd_path: undefined }));
        setEditing(true);
        return;
      }
      uploading = false;
      setPhase("saving");
      const result = await saveSubmission({ ...fields, prd_path: path });
      if (!mounted.current) return;
      setSaved(result);
      serverSubmission.current = result;
      setFields(result);
      setFile(null);
      uploadedFile.current = null;
      setEditing(false);
      setCelebrate(saved === null);
      setNotice({
        tone: "success",
        message: "Your submission has been saved.",
      });
      onSnapshot({ ...snapshot, submission: result });
    } catch (error) {
      uploadedFile.current = null;
      if (
        mounted.current &&
        uploading &&
        ![401, 403].includes(errorStatus(error) ?? 0)
      ) {
        setUploadError("Upload failed. Check your connection and try again.");
      }
      handleError(error);
    } finally {
      submitting.current = false;
      if (mounted.current) setPhase("idle");
    }
  }

  async function openPdf() {
    if (openingPdf) return;
    if (localUrl && !locked) {
      window.open(localUrl, "_blank", "noopener,noreferrer");
      return;
    }
    // Open synchronously to retain the click's popup permission, then request a fresh signed URL.
    const tab = window.open("about:blank", "_blank");
    if (!tab) {
      setNotice({
        tone: "error",
        message: "Allow pop-ups to open your PDF, then try again.",
      });
      return;
    }
    tab.opener = null;
    setOpeningPdf(true);
    try {
      const fresh = await getSubmission();
      if (!mounted.current) {
        tab.close();
        return;
      }
      onSnapshot(fresh);
      if (fresh.submission && fresh.submission.team_code !== team.team_code) {
        onAccessLost();
        tab.close();
        return;
      }
      if (!fresh.submission?.prd_view_url)
        throw new Error(
          "The PDF is no longer available. Refresh your submission and try again.",
        );
      tab.location.replace(fresh.submission.prd_view_url);
    } catch (error) {
      tab.close();
      handleError(error);
    } finally {
      if (mounted.current) setOpeningPdf(false);
    }
  }

  return (
    <SubmissionView
      team={team}
      fields={fields}
      saved={saved}
      deadline={snapshot.submission_deadline}
      locked={locked}
      editing={editing}
      phase={phase}
      checkingFile={checkingFile}
      errors={errors}
      notice={notice}
      celebrate={celebrate}
      pdfName={
        file?.name ?? (fields.prd_path ? (saved?.prd_filename ?? "PRD") : null)
      }
      rejectedFile={rejectedFile}
      uploadError={uploadError}
      openingPdf={openingPdf}
      onChange={change}
      onEdit={() => {
        if (!locked) setEditing(true);
      }}
      onFile={(next) => void chooseFile(next)}
      onSubmit={() => void submit()}
      onRetryUpload={() => void submit(true)}
      onOpenPdf={() => void openPdf()}
      onNotice={setNotice}
      onVideoBlur={() => {
        if (!locked && fields.video_url.trim())
          setErrors((previous) => ({
            ...previous,
            video_url: validateSubmission(fields, true).video_url,
          }));
      }}
    />
  );
}
