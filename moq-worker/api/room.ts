import { Watch, Publish } from ".";
import type { Session, WatchConfig, PublishConfig } from ".";

import { request } from "../rpc";

export class Room {
	session: Session;
	name: string;

	constructor(session: Session, name: string) {
		this.session = session;
		this.name = name;
	}

	async announced(): Promise<string> {
		return "todo";
	}

	async watch(name: string, config: WatchConfig): Promise<Watch> {
		return new Watch(this, name);
	}

	async publish(name: string, config: PublishConfig): Promise<Publish> {
		return new Publish(this, name);
	}
}
