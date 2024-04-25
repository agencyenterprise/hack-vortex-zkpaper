export const setup = async () => {
    await Promise.all([
        import("@noir-lang/noirc_abi").then(module =>
            module.default(new URL("@noir-lang/noirc_abi/web/noirc_abi_wasm_bg.wasm", import.meta.url).toString())
        ),
        import("@noir-lang/acvm_js").then(module =>
            module.default(new URL("@noir-lang/acvm_js/web/acvm_js_bg.wasm", import.meta.url).toString())
        )
    ]);
}