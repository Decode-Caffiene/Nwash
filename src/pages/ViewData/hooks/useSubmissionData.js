import { useCallback, useRef, useState } from "react";
import {
  acceptFormSubmission,
  getFormData,
  rejectFormSubmission,
} from "../../../api/formApi";

export function useSubmissionData() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ message, type, id: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getFormData();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.message)
          ? data.message
          : [];
      setSubmissions(list);
    } catch (err) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to load submissions.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Step 1: clicking Accept/Reject opens the confirmation modal
  const requestAction = useCallback((id, action, wsucName, userEmail, e) => {
    e.stopPropagation();
    setConfirmModal({ id, action, wsucName, userEmail });
  }, []);

  // Step 2: user confirmed in modal — run the API call
  const confirmAction = useCallback(
    async (reason) => {
      const { id, action, wsucName, userEmail } = confirmModal;

      setActionLoading((prev) => ({ ...prev, [id]: action }));
      setConfirmModal(null);

      try {
        if (action === "accepted") {
          await acceptFormSubmission(id, userEmail);
        } else {
          await rejectFormSubmission(id, reason, userEmail);
        }

        setSubmissions((prev) =>
          prev.map((s) =>
            (s._id ?? s.id) === id ? { ...s, Status: action, status: action } : s,
          ),
        );

        if (action === "accepted") {
          showToast(`${wsucName} has been accepted successfully.`, "success");
        } else {
          showToast(`${wsucName} has been rejected.`, "info");
        }
      } catch (err) {
        showToast(
          err?.response?.data?.message ?? "Action failed. Please try again.",
          "error",
        );
      } finally {
        setActionLoading((prev) => ({ ...prev, [id]: undefined }));
      }
    },
    [confirmModal, showToast],
  );

  return {
    submissions,
    loading,
    error,
    fetchData,
    toast,
    setToast,
    confirmModal,
    setConfirmModal,
    actionLoading,
    requestAction,
    confirmAction,
  };
}
