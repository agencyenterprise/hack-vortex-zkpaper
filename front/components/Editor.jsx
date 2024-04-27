import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import { addLocalDocument } from "../services/index";
import { useSDK } from "@thirdweb-dev/react"



export default function Editor(props) {
  const { documentName } = props;
  const [value, setValue] = useState("");
  const [pubKey, setPubKey] = useState("");
  const sdk = useSDK();

  useEffect(() => {
    const timer = setInterval(async () => {
      // Use the current value from the ref
      await addLocalDocument(value, documentName, pubKey, characters.typed, characters.pasted);
    }, 5000);
    return () => clearInterval(timer);
  }, [documentName, pubKey, value]);
  useEffect(() => {
    const getPubKey = async () => {
      try {
        const { publicKey } = await sdk.wallet.getPublicKey();
        setPubKey(publicKey);
        console.log(publicKey);
      } catch (e) {
        console.error(e);
      }
    };
    getPubKey();
  }, [])

  const [characters, setCharacters] = useState({
    typed: 0,
    pasted: 0,
    deleted: 0,
  });

  const onChange = async (e, c, d) => {
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
            pasted: characters.pasted + c.ops[key].pasted.length,
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
