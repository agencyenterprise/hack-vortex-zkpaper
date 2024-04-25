import React, { useState } from "react";
import { useOffChainVerification } from "../hooks/useOffChainVerification.jsx";
import { useProofGeneration } from "../hooks/useProofGeneration.jsx";
import Editor from "./Editor.jsx";
import Header from "./Header.jsx";
import ViewDocument from "./ViewDocument.jsx";

function Component() {
  const [input, setInput] = useState<
    { num_writes: string; num_pastes: string } | undefined
  >();
  const { noir, proofData } = useProofGeneration(input, "work");
  useOffChainVerification(noir, proofData);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const elements = e.currentTarget.elements;
    if (!elements) return;

    const x = elements.namedItem("x") as HTMLInputElement;
    const y = elements.namedItem("y") as HTMLInputElement;

    setInput({ num_writes: x.value, num_pastes: y.value });
  };

  return (
    <main>
      <Header />
      <Editor />
      <ViewDocument />
      <form
        className="container"
        onSubmit={submit}
      >
        <h1>Example starter</h1>
        <h2>This circuit checks that x and y are different (yey!)</h2>
        <p>Try it!</p>
        <input
          name="x"
          type="text"
          className="border-black border"
        />
        <input
          name="y"
          type="text"
          className="border-black border"
        />
        <button
          type="submit"
          className="bg-blue-500"
        >
          Calculate proof
        </button>
      </form>
    </main>
  );
}

export default Component;
