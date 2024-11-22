import * as Comlink from "comlink";
import * as Rust from "../moq-worker/dist";
export * from "../moq-worker/dist";

export class Api {
	async watch(addr: string): Promise<Rust.Watch & Comlink.ProxyMarked> {
		return Comlink.proxy(new Rust.Watch(addr));
	}
}

// Signal that we're done loading the WASM module.
postMessage("loaded");

// Technically, there's a race condition here...
Comlink.expose(new Api());
