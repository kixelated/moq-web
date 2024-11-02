import * as Rust from "../dist";
import type * as Msg from "./message";

const sessions = new Map<number, Rust.Session>();

addEventListener("message", async (e: MessageEvent) => {
	const msg = e.data as Msg.ToWorker;
	const req = msg.request;

	try {
		if (req.session) {
			await session(req.session);
		} else if (req.watch) {
			watch(req.watch);
		} else if (req.publish) {
			publish(req.publish);
		}
	} catch (err) {
		postMessage({ transaction: msg.transaction, err });
	} finally {
		postMessage({ transaction: msg.transaction });
	}
});

async function session(msg: Msg.Session) {
	if (sessions.has(msg.id)) {
		throw new Error(`session already exists: ${msg.id}`);
	}

	const config = new Rust.SessionConfig(msg.config.addr);
	const session = await Rust.Session.connect(config);
	sessions.set(msg.id, session);
}

function watch(msg: Msg.Watch) {
	const session = sessions.get(msg.session);
	if (!session) {
		throw new Error(`session not found: ${msg.session}`);
	}

	const config = new Rust.WatchConfig(msg.room, msg.name);
	config.render = msg.config.render;

	session.watch(config);
}

function publish(msg: Msg.Publish) {
	const session = sessions.get(msg.session);
	if (!session) {
		throw new Error(`session not found: ${msg.session}`);
	}

	const config = new Rust.PublishConfig(msg.room, msg.name);
	config.render = msg.config.render;
	session.publish(config);
}
