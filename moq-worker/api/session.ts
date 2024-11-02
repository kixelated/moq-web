import { Room } from ".";
import { request } from "../rpc";

let sessions = 0;

export interface SessionConfig {
	addr: string;
}

export class Session {
	id: number;

	private constructor(id: number) {
		this.id = id;
	}

	static async connect(config: SessionConfig): Promise<Session> {
		const id = sessions++;
		await request({
			session: {
				id,
				config,
			},
		});
		return new Session(id);
	}

	async close(): Promise<void> {
		await request({
			close: this.id,
		});
	}

	async announced(): Promise<string> {
		return "todo";
	}

	async room(name: string): Promise<Room> {
		return new Room(this, name);
	}
}
