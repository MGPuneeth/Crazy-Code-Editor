"use client";

import React, { useEffect, useState, useRef } from "react";
import type { TemplateFolder } from "@/modules/playground/lib/path-to-json";
import { transformToWebContainerFormat } from "../hooks/transformer";
import { WebContainer } from "@webcontainer/api";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import TerminalComponent from "./terminal";

interface WebContainerPreviewProps {
  templateData: TemplateFolder;
  serverUrl: string;
  error: string;
  isLoading: boolean;
  instance: WebContainer | null;
  writeFileSync: (path: string, content: string) => Promise<void>;
  forceResetup?: boolean;
}

const WebContainerPreview = ({
  templateData,
  serverUrl,
  error,
  isLoading,
  instance,
  writeFileSync,
  forceResetup = false,
}: WebContainerPreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loadingState, setLoadingState] = useState({
    // Different phases of setting up the state of the preview
    transforming: false,
    mounting: false,
    installing: false,
    starting: false,
    ready: false,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;
  const [setUpError, setSetupError] = useState<string | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isSetupInProgress, setIsSetupInProgress] = useState(false);

  const terminalRef = useRef<any>(null);

  useEffect(() => {
    if (forceResetup) {
      setIsSetupComplete(false);
      setIsSetupInProgress(false);
      setPreviewUrl("");
      setCurrentStep(0);
      setLoadingState({
        transforming: false,
        mounting: false,
        installing: false,
        starting: false,
        ready: false,
      });
    }
  }, [forceResetup]);

  useEffect(() => {
    async function setupContainer() {
      if (!instance || isSetupComplete || isSetupInProgress) return;

      try {
        setIsSetupInProgress(true);
        setSetupError(null);

        try {
          const packageJsonExists = await instance.fs.readFile(
            "package.json",
            "utf-8"
          );

          if (packageJsonExists) {
            // Implement terminal logic
            if (terminalRef.current?.writeToTerminal) {
              terminalRef.current.writeToTerminal(
                "🔄 Reconnecting to existing WebContainer session...\r\n"
              );
            }

            instance.on("server-ready", (port: number, url: string) => {
              //terminal logic
              if (terminalRef.current?.writeToTerminal) {
                terminalRef.current.writeToTerminal(
                  `🌐 Reconnected to server at ${url}\r\n`
                );
              }

              setPreviewUrl(url);
              setLoadingState((prev) => ({
                ...prev,
                starting: false,
                ready: true,
              }));
            });

            setCurrentStep(4);
            setLoadingState((prev) => ({ ...prev, starting: true }));

            return;
          }
        } catch (error) {}

        // Transforming data

        setLoadingState((prev) => ({ ...prev, transforming: true }));
        setCurrentStep(1);

        //Terminal logic
        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(
            `🔄️ Tansforming template data\r\n`
          );
        }

        //@ts-ignore
        const transformedFiles = transformToWebContainerFormat(templateData);

        //mounting
        setLoadingState((prev) => ({
          ...prev,
          transforming: false,
          mounting: true,
        }));

        setCurrentStep(2);

        //Terminal logic
        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(
            ` 📁 Mounting files to terminal\r\n`
          );
        }

        await instance.mount(transformedFiles);

        //Terminal logic
        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(
            `✅ File mounted successfully\r\n`
          );
        }

        //installing-dependencies
        setLoadingState((prev) => ({
          ...prev,
          mounting: false,
          installing: true,
        }));
        setCurrentStep(3);

        //terminal logic
        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(`📦 Installing dependencies\r\n`);
        }

        const installProcess = await instance.spawn("npm", ["install"]);

        //real time installing process preview
        //Streaming data
        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              //terminal logic
              if (terminalRef.current?.writeToTerminal) {
                terminalRef.current.writeToTerminal(data);
              }
            },
          })
        );

        const installExitCode = await installProcess.exit;

        if (installExitCode !== 0) {
          throw new Error(
            `Failed to install dependencies. Exit code ${installExitCode}`
          );
        }

        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(
            `✅ Dependencies installed successfully\r\n`
          );
        }

        //Starting server phase

        setLoadingState((prev) => ({
          ...prev,
          installing: false,
          starting: true,
        }));

        setCurrentStep(4);

        //Terminal logic

        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(
            ` 🚀 Starting development server\r\n`
          );
        }

        const startProcess = await instance.spawn("npm", ["run", "start"]);

        instance.on("server-ready", (port: number, url: string) => {
          // terminal logic

          if (terminalRef.current?.writeToTerminal) {
            terminalRef.current.writeToTerminal(
              ` 🌐 Server ready at: ${url}\r\n`
            );
          }
          setPreviewUrl(url);
          setLoadingState((prev) => ({
            ...prev,
            starting: false,
            ready: true,
          }));

          setIsSetupComplete(true);
          setIsSetupInProgress(false);
        });

        //Start process output

        startProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              // terminal logic
              if (terminalRef.current?.writeToTerminal) {
                terminalRef.current.writeToTerminal(data);
              }
            },
          })
        );
      } catch (err) {
        console.error("Error setting up container: ", err);
        const errorMessage = err instanceof Error ? err.message : String(err);

        //terminal logic
        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(`❌ Error: ${errorMessage}\r\n`);
        }
        setSetupError(errorMessage);
        setIsSetupInProgress(false);
        setLoadingState({
          transforming: false,
          mounting: false,
          installing: false,
          starting: false,
          ready: false,
        });
      }
    }

    setupContainer();
  }, [instance, templateData, isSetupInProgress, isSetupComplete]);

  useEffect(() => {
    return () => {};
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md p-6 rounded-lg bg-gray-50 dark:bg-gray-900">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <h3 className="text-lg font-medium">Initializing WebContainer</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Setting up the environment for you project...
          </p>
        </div>
      </div>
    );
  }

  if (error || setUpError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-lg max-w-md">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="h-5 w-5" />
            <h3 className="font-semibold">Error</h3>
          </div>
          <p className="text-sm">{error || setUpError}</p>
        </div>
      </div>
    );
  }

  const getStepIcon = (stepIndex: number) => {
    if (stepIndex < currentStep) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (stepIndex === currentStep) {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    } else {
      return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepText = (stepIndex: number, label: string) => {
    const isActive = stepIndex === currentStep;
    const isComplete = stepIndex < currentStep;

    return (
      <span
        className={`text-sm font-medium ${
          isComplete
            ? "text-green-600"
            : isActive
            ? "text-blue-600"
            : "text-gray-500"
        }`}
      >
        {label}
      </span>
    );
  };

  return (
    <div className="h-full w-full flex flex-col">
      {!previewUrl ? (
        <div className="h-full flex flex-col">
          <div className="w-full max-w-md p-6 m-5 rounded-lg bg-white dark:bg-zinc-800 shadow-sm mx-auto">
            <Progress
              value={(currentStep / totalSteps) * 100}
              className="h-2 mb-6"
            />

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                {getStepIcon(1)}
                {getStepText(1, "Transforming template data")}
              </div>
              <div className="flex items-center gap-3">
                {getStepIcon(2)}
                {getStepText(2, "Mounting files")}
              </div>
              <div className="flex items-center gap-3">
                {getStepIcon(3)}
                {getStepText(3, "Installing dependencies")}
              </div>
              <div className="flex items-center gap-3">
                {getStepIcon(4)}
                {getStepText(4, "Starting development server")}
              </div>
            </div>
          </div>

          {/* Terminal */}
          <div className="flex-1 p-4">
            <TerminalComponent
              ref={terminalRef}
              webContainerInstance={instance}
              theme="dark"
              className="h-full"
            />
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          {/* Preview */}
          <div className="flex-1">
            <iframe
              src={previewUrl}
              className="w-full h-full border-none"
              title="WebContainer Preview"
            />
          </div>

          {/* Terminal at bottom when preview is ready */}
          <div className="h-64 border-t">
            <TerminalComponent
              ref={terminalRef}
              webContainerInstance={instance}
              theme="dark"
              className="h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WebContainerPreview;
