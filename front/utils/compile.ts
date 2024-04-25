import { compile, createFileManager } from '@noir-lang/noir_wasm';
import { CompiledCircuit } from '@noir-lang/types';

async function compileCircuit(operation: string) {
  if (operation != "work" && operation != "change") {
    throw new Error("Invalid operation")
  }
  const fm = createFileManager('/');
  const main = (await fetch(new URL(`../circuits/${operation}/src/main.nr`, import.meta.url)))
    .body as ReadableStream<Uint8Array>;
  const nargoToml = (await fetch(new URL(`../circuits/${operation}/Nargo.toml`, import.meta.url)))
    .body as ReadableStream<Uint8Array>;

  fm.writeFile('./src/main.nr', main);
  fm.writeFile('./Nargo.toml', nargoToml);
  const result = await compile(fm);
  if (!('program' in result)) {
    throw new Error('Compilation failed');
  }
  return result.program as CompiledCircuit;
}


export async function getCircuit(operation?: string) {
  const fm = createFileManager('/');
  if (!operation) {
    const main = (await fetch(new URL(`../circuit/src/main.nr`, import.meta.url)))
      .body as ReadableStream<Uint8Array>;
    const nargoToml = (await fetch(new URL(`../circuit/Nargo.toml`, import.meta.url)))
      .body as ReadableStream<Uint8Array>;

    fm.writeFile('./src/main.nr', main);
    fm.writeFile('./Nargo.toml', nargoToml);
    const result = await compile(fm);
    if (!('program' in result)) {
      throw new Error('Compilation failed');
    }
    return result.program as CompiledCircuit;
  }
  return await compileCircuit(operation!)
}
