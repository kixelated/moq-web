import * as Comlink from "comlink";
import * as Rust from "../moq-worker/dist";

export class Root {
	async connect(addr: string): Promise<Session & Comlink.ProxyMarked> {
		const session = new Session(await Rust.Session.connect(addr));
		return Comlink.proxy(session);
	}
}

export class Session {
	#inner?: Rust.Session;

	constructor(inner: Rust.Session) {
		this.#inner = inner;
		this.closed().then(() => this.close());
	}

	#session(): Rust.Session {
		if (!this.#inner) {
			throw new Error("closed");
		}
		return this.#inner;
	}

	async watch(path: string[]): Promise<Watch & Comlink.ProxyMarked> {
		const watch = await this.#session().watch(path);
		return Comlink.proxy(new Watch(watch));
	}

	async publish(path: string[]): Promise<Publish & Comlink.ProxyMarked> {
		const publish = await this.#session().publish(path);
		return Comlink.proxy(new Publish(publish));
	}

	close() {
		this.#session().close();
		this.#inner?.free();
		this.#inner = undefined;
	}

	async closed() {
		await this.#inner?.closed();
	}
}

export class Watch {
	#inner?: Rust.Watch;

	constructor(inner: Rust.Watch) {
		this.#inner = inner;
		this.closed().then(() => this.close());
	}

	#unwrap(): Rust.Watch {
		if (!this.#inner) {
			throw new Error("closed");
		}
		return this.#inner;
	}

	pause(value: boolean) {
		this.#unwrap().pause(value);
	}

	volume(value: number) {
		this.#unwrap().volume(value);
	}

	render(canvas?: OffscreenCanvas) {
		this.#unwrap().render(canvas);
	}

	close() {
		this.#unwrap().close();
		this.#inner?.free();
		this.#inner = undefined;
	}

	async closed() {
		await this.#inner?.closed();
	}
}

export class Publish {
	#inner?: Rust.Publish;

	constructor(inner: Rust.Publish) {
		this.#inner = inner;
		this.closed().then(() => this.close());
	}

	#unwrap(): Rust.Publish {
		if (!this.#inner) {
			throw new Error("closed");
		}
		return this.#inner;
	}

	pause(value: boolean) {
		this.#unwrap().pause(value);
	}

	volume(value: number) {
		this.#unwrap().volume(value);
	}

	render(canvas?: OffscreenCanvas) {
		this.#unwrap().render(canvas);
	}

	close() {
		this.#unwrap().close();
		this.#inner?.free();
		this.#inner = undefined;
	}

	async closed() {
		await this.#inner?.closed();
	}
}

Comlink.expose(new Root());
