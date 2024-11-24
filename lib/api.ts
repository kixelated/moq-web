import * as Comlink from "comlink";
import type * as Rust from "./worker";

const worker = new Worker(new URL("./worker", import.meta.url));

// Not 100% if this is the best solution, but Comlink was silently failing.
// We wait until the worker is fully initialized before we return the proxy.
export const init: Promise<Comlink.Remote<Rust.Api>> = new Promise(
	(resolve) => {
		worker.onmessage = (event) => {
			worker.onmessage = null;
			const proxy: Comlink.Remote<Rust.Api> = Comlink.wrap(worker);
			resolve(proxy);
		};
	},
);
