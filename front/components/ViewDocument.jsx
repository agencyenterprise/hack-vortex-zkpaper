import React from "react";
export default function ViewDocument({ data }) {
  return (
    <div className="max-w-3xl m-auto p-4 rounded-md bg-secondary">
      <div dangerouslySetInnerHTML={{ __html: data }} />
    </div>
  );
}
