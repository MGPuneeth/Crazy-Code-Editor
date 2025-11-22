import React from "react";
import AddNewButton from "@/modules/dashboard/components/AddNewButton";
import AddNewRepo from "@/modules/dashboard/components/AddNewRepo";
import { getAllPlaygroundForUser } from "@/modules/dashboard/actions";
import EmptyState from "@/modules/dashboard/components/empty-state";
import ProjectTable from "@/modules/dashboard/components/ProjectTable";
const Page = async () => {
  const playgrounds = await getAllPlaygroundForUser();

  return (
    <div className="flex flex-col justify-start items-center min-h-screen mx-auto max-w-7xl px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <AddNewButton />
        <AddNewRepo />
      </div>

      <div className="mt-10 flex flex-col justify-center items-center w-full">
        {playgrounds && playgrounds.length === 0 ? (
          <EmptyState />
        ) : (
          <ProjectTable
            projects={playgrounds || []}
            onDeleteProject={() => {}}
            onDuplicarwProject={() => {}}
          />
        )}
      </div>
    </div>
  );
};

export default Page;
