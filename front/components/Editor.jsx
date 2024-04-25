import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ViewDocument from "./ViewDocument";

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
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Stats</h2>
        <p>
          Characters count:{" "}
          {characters.typed + characters.pasted - characters.deleted}
        </p>
        <p>Characters typed: {characters.typed}</p>
        <p>Characters pasted: {characters.pasted}</p>
        <p>Characters deleted: {characters.deleted}</p>
      </div>
      <div className="mt-4">
        <ViewDocument data={value} />
      </div>
    </div>
  );
}
