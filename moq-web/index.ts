import * as Comlink from "comlink";
import type * as Work from "./worker";

const worker = new Worker(new URL("./worker.ts", import.meta.url));
const root: Comlink.Remote<Work.Root> = Comlink.wrap(worker);

export class Session {
	#inner: Comlink.Remote<Work.Session>;

	constructor(inner: Comlink.Remote<Work.Session>) {
		this.#inner = inner;
	}

	static async connect(addr: string): Promise<Session> {
		const session = await root.connect(addr);
		return new Session(session);
	}

	async watch(name: string[]): Promise<Watch> {
		const watch = await this.#inner.watch(name);
		return new Watch(watch);
	}

	async publish(name: string[]): Promise<Publish> {
		const publish = await this.#inner.publish(name);
		return new Publish(publish);
	}

	async close() {
		await this.#inner.close();
	}

	async closed() {
		await this.#inner.closed();
	}
}

export class Watch {
	#inner: Comlink.Remote<Work.Watch>;

	constructor(inner: Comlink.Remote<Work.Watch>) {
		this.#inner = inner;
	}

	async pause(value: boolean) {
		await this.#inner.pause(value);
	}

	async volume(value: number) {
		await this.#inner.volume(value);
	}

	async render(value: HTMLCanvasElement | OffscreenCanvas) {
		const canvas =
			value instanceof HTMLCanvasElement
				? value.transferControlToOffscreen()
				: value;

		await this.#inner.render(Comlink.transfer(canvas, [canvas]));
	}

	async close() {
		await this.#inner.close();
	}

	async closed() {
		await this.#inner.closed();
	}
}

export class Publish {
	#inner: Comlink.Remote<Work.Publish>;

	constructor(inner: Comlink.Remote<Work.Publish>) {
		this.#inner = inner;
	}

	async render(value: HTMLCanvasElement | OffscreenCanvas) {
		const canvas =
			value instanceof HTMLCanvasElement
				? value.transferControlToOffscreen()
				: value;

		await this.#inner.render(Comlink.transfer(canvas, [canvas]));
	}

	async close() {
		await this.#inner.close();
	}

	async closed() {
		await this.#inner.closed();
	}
}
