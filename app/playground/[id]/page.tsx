"use client";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { TemplateFileTree } from "@/modules/playground/components/playground-explorer";
import { usePlayground } from "@/modules/playground/hooks/use-playground";
import { Separator } from "@radix-ui/react-separator";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { useParams } from "next/navigation";
import React from "react";

const MainPlaygroundPage = () => {
  const { id } = useParams<{ id: string }>();

  const {
    playgroundData,
    templateData,
    isLoading,
    error,
    loadPlaygruond,
    saveTemplateData,
  } = usePlayground(id);

  console.log("TemplateData: ", templateData);
  console.log("playgroundData: ", playgroundData);

  const activeFile = "sample.txt";

  return (
    <TooltipProvider>
      <>
        <TemplateFileTree
          data={templateData!}
          onFileSelect={() => {}}
          selectedFile={activeFile}
          title="File Explorer"
          onAddFile={() => {}}
          onAddFolder={() => {}}
          onDeleteFile={() => {}}
          onDeleteFolder={() => {}}
          onRenameFile={() => {}}
          onRenameFolder={() => {}}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="ml-1" />
            <Separator orientation="vertical" className="mr-2 h4" />
          </header>

          <div className="flex flex-1 items-center gap-2">
            <div className="flex flex-col flex-1">
              <h1 className="text-sm font-medium">
                {playgroundData?.title || "Code Playground"}
              </h1>
            </div>
          </div>
        </SidebarInset>
      </>
    </TooltipProvider>
  );
};

export default MainPlaygroundPage;
