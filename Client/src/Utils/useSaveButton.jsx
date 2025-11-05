import { useState } from "react";

export function useSaveButton() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAction = async (saveFn) => {
    if (isSaving) return; 
    setIsSaving(true);
    try {
      await saveFn();
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, handleSaveAction };
}
