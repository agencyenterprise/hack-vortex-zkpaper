import React from "react";
import ViewDocument from "../components/ViewDocument";

const doc = {
  name: "Untitled Document",
  content: "<p>test <i>italic</i> <b>bold</b></p>",
};

const ViewDocumentPage = () => {
  return (
    <div className="text-white">
      <h1 className="text-center pt-4 pb-8 text-2xl">{doc.name}</h1>
      <ViewDocument data={doc.content} />
    </div>
  );
};

export default ViewDocumentPage;
