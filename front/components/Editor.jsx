import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import { addLocalDocument, getDocumentById } from "../services/index";
import { useSDK } from "@thirdweb-dev/react"
import { aesDecryptMessage, decryptWithWallet } from "../utils/encryption";
import { useNavigate } from "react-router";



export default function Editor(props) {
  const { documentName, id, setTitle } = props;
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState("");
  const [pubKey, setPubKey] = useState("");
  const sdk = useSDK();
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setInterval(async () => {
      // Use the current value from the ref
      await addLocalDocument(value, documentName, pubKey, characters.typed + characters.pasted + characters.deleted, 0, id);
    }, 1000);
    return () => clearInterval(timer);
  }, [documentName, pubKey, value]);
  useEffect(() => {
    hasDocument()
  }, [])
  const hasDocument = async () => {
    try {
      setLoading(true)
      const document = await getDocumentById(id)
      if (!document) {
        return navigate("/")
      }
      console.log(document)
      const { receiverPublicKey, secretKey, document: retrievedDocument } = document
      console.log(document)
      const title = retrievedDocument.documentTitle
      const plainSecret = await decryptWithWallet(secretKey, receiverPublicKey);
      if (retrievedDocument.content) {
        console.log(retrievedDocument.content)
        const content = aesDecryptMessage(retrievedDocument.content, plainSecret)
        console.log(content)
        setValue(content)
        setTitle(title)
      }
      setLoading(false)
    } catch (e) {
      console.error(e);
      setLoading(false);
    }


  }

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
    <div className="m-auto p-4  bg-secondary">
      {!loading && <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
      />}
    </div>
  );
}
