import type { Room } from ".";
import { request } from "../rpc";

export interface WatchConfig {
	render: OffscreenCanvas;
	audio: boolean;
}

export class Watch {
	room: Room;
	name: string;

	constructor(room: Room, name: string) {
		this.room = room;
		this.name = name;
	}
}
