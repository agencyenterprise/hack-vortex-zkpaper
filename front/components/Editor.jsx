import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function Editor() {
  const [value, setValue] = useState("");
  const [characters, setCharacters] = useState({
    typed: 0,
    pasted: 0,
    deleted: 0,
  });

  const onChange = (e, c, d) => {
    setValue(e);

    for (let key in c.ops) {
      if (c.ops[key].insert) {
        if (c.ops[key].insert.length < 3) {
          setCharacters({
            ...characters,
            typed: characters.typed + c.ops[key].insert.length,
          });
        } else {
          setCharacters({
            ...characters,
            pasted: characters.pasted + c.ops[key].insert.length,
          });
        }
      } else if (c.ops[key].delete) {
        setCharacters({
          ...characters,
          deleted: characters.deleted + c.ops[key].delete,
        });
      }
    }
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
