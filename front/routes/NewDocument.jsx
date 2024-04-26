import React from "react";
import Editor from "../components/Editor";
import { Button } from "../components/ui/button";
const Documents = () => {
  const [documentName, setDocumentName] = React.useState("");

  return (
    <div className="max-w-5xl m-auto flex flex-col items-center text-white">
      <div>
        <div>
          <input
            type="text"
            placeholder="Untitled Document"
            className=" bg-primary text-white p-4 rounded-lg"
          />
          {documentName}
        </div>
        <div>
          <Button variant={"secondary"}>Import</Button>
          <Button variant={"secondary"}>Export</Button>
          <Button variant={"secondary"}>Share</Button>
          <Button variant={"secondary"}>New</Button>
        </div>
        <Editor />
      </div>
    </div>
  );
};

export default Documents;
