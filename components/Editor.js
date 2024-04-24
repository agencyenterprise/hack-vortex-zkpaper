import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import "react-quill/dist/quill.snow.css";

export default function Editor() {
  const [value, setValue] = useState("");

  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false }),
    []
  );

  const onChange = (e, c, d) => {
    console.log(e, c, d);
    setValue(e);
  };

  return (
    <div className="max-w-3xl m-auto">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
