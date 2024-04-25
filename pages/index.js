import Editor from "@/components/Editor";
import Header from "@/components/Header";
import { useEffect } from "react";
import { generateWorkProof } from "./utils/zk/proof_of_work";
import { setup } from "./utils/zk/setup";
export default function Home() {
  useEffect(() => {
    setup().then(j => generateWorkProof({ num_writes: 2, num_pastes: 1 }).then(v => {
      console.log(v)
    }))

  })
  return (
    <main>
      <Header />
      <Editor />
    </main>
  );
}
