import * as Comlink from "comlink";
import type * as Rust from "./worker";

import { init } from "./api";

export class Watch {
	#inner: Promise<Comlink.Remote<Rust.Watch>>;

	constructor(addr: string) {
		this.#inner = init.then((api) => api.watch(addr));
	}

	async pause(value: boolean) {
		await (await this.#inner).pause(value);
	}

	async volume(value: number) {
		await (await this.#inner).volume(value);
	}

	async render(value: HTMLCanvasElement | OffscreenCanvas) {
		const canvas =
			value instanceof HTMLCanvasElement
				? value.transferControlToOffscreen()
				: value;

		await (await this.#inner).render(Comlink.transfer(canvas, [canvas]));
	}

	async close() {
		await (await this.#inner).close();
	}

	async closed() {
		await (await this.#inner).closed();
	}
}
