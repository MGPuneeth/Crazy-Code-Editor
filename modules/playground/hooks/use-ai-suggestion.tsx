import { currentUser } from "@/modules/auth/actions";
import { useEffect, useState, useCallback } from "react";

interface AISuggestionState {
  suggestion: string | null;
  isLoading: boolean;
  position: { line: number; column: number } | null;
  decoration: string[];
  isEnabled: boolean;
}

interface UseAiSuggestionReturn extends AISuggestionState {
  toggleEnabled: () => void;
  fetchSuggestion: (type: string, editor: any) => Promise<void>;
  acceptSuggestion: (editor: any, monaco: any) => void;
  rejectSuggestion: (editor: any) => void;
  clearSuggestion: (editor: any) => void;
}

export const useAiSuggestion = (): UseAiSuggestionReturn => {
  const [state, setState] = useState<AISuggestionState>({
    suggestion: null,
    isLoading: false,
    position: null,
    decoration: [],
    isEnabled: true,
  });

  const toggleEnabled = useCallback(() => {
    setState((prev) => ({ ...prev, isEnabled: !prev.isEnabled }));
  }, []);

  const fetchSuggestion = useCallback(async (type: string, editor: any) => {
    if (!editor) return;

    const model = editor.getModel();
    const cursorPosition = editor.getPosition();

    if (!model || !cursorPosition) return;

    // Check if AI is enabled before proceeding
    let isEnabled = false;
    setState((currentState) => {
      isEnabled = currentState.isEnabled;
      return currentState;
    });

    if (!isEnabled) return;

    // Set loading state
    setState((currentState) => {
      return { ...currentState, isLoading: true };
    });

    try {
      const payload = {
        fileContent: model.getValue(),
        cursorLine: cursorPosition.lineNumber - 1,
        cursorColumn: cursorPosition.column - 1,
        suggestionType: type,
      };

      console.log("Fetching suggestion with payload:", payload);

      const response = await fetch("/api/code-completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Suggestion API response:", response);

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      console.log("Suggestion data received:", data);

      if (data.suggestion && data.suggestion.trim()) {
        const suggestionText = data.suggestion.trim();
        console.log("Setting suggestion:", suggestionText);
        setState((prev) => ({
          ...prev,
          suggestion: suggestionText,
          position: {
            line: cursorPosition.lineNumber,
            column: cursorPosition.column,
          },
          isLoading: false,
        }));
      } else {
        console.log("No suggestion received from API");
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Error fetching code suggestion:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const acceptSuggestion = useCallback((editor: any, monaco: any) => {
    console.log("🎯 acceptSuggestion hook called - clearing state");
    
    // Just clear the state, the editor component already handled the insertion
    setState((currentState) => {
      if (currentState.decoration.length > 0 && editor) {
        try {
          editor.deltaDecorations(currentState.decoration, []);
          console.log("🗑️ Decorations cleared");
        } catch (err) {
          console.error("Error clearing decorations:", err);
        }
      }

      return {
        ...currentState,
        suggestion: null,
        position: null,
        decoration: [],
      };
    });
  }, []);

  const rejectSuggestion = useCallback((editor: any) => {
    setState((currentState) => {
      if (editor && currentState.decoration.length > 0) {
        editor.deltaDecorations(currentState.decoration, []);
      }

      return {
        ...currentState,
        suggestion: null,
        position: null,
        decoration: [],
      };
    });
  }, []);

  const clearSuggestion = useCallback((editor: any) => {
    setState((currentState) => {
      if (editor && currentState.decoration.length > 0) {
        editor.deltaDecorations(currentState.decoration, []);
      }

      return {
        ...currentState,
        suggestion: null,
        position: null,
        decoration: [],
      };
    });
  }, []);

  return {
    ...state,
    toggleEnabled,
    fetchSuggestion,
    acceptSuggestion,
    rejectSuggestion,
    clearSuggestion,
  };
};
