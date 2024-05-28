"use client";

import { CreateForm } from "./_components/create-form";

interface CreateProjectProps {
  params: {
    username: string;
  }
}

const CreateProject = ({
  params
}: CreateProjectProps) => {
  return (
    <div className="flex justify-center">
      <CreateForm
        username={params.username}
      />
    </div>
  );
}
export default CreateProject;