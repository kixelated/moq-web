import type { FromWorker, Request } from "./message";

let worker: Worker | null = null;
const pending = new Map<number, (err: Error | null) => void>();
let transaction = 0;

export function init() {
	if (worker) {
		return;
	}

	worker = new Worker(new URL("./worker.ts", import.meta.url));
	worker.addEventListener("message", (e: MessageEvent) => {
		const msg = e.data as FromWorker;
		try {
			recv(msg);
		} catch (err) {
			console.warn("error processing message", err, msg);
		}
	});
}

function recv(msg: FromWorker): void {
	const response = msg.response;
	const announced = msg.announced;

	if (response) {
		const done = pending.get(response.transaction);
		if (done) {
			pending.delete(response.transaction);
			done(response.err ? response.err : null);
		}
	}

	if (announced) {
		// TODO: handle announced
	}
}

export async function request(request: Request): Promise<void> {
	const to = { transaction: transaction++, request };

	return new Promise((resolve, reject) => {
		pending.set(to.transaction, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});

		if (worker) {
			worker.postMessage(to, [to.request]);
		} else {
			reject(new Error("worker not initialized"));
		}
	});
}
