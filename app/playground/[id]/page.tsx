"use client";

import { usePlayground } from "@/modules/playground/hooks/use-playground";
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

  return <div>Params: {id}</div>;
};

export default MainPlaygroundPage;
