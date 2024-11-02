import type { Room } from ".";
import { request } from "../rpc";

export interface PublishConfig {
	render?: OffscreenCanvas;
	audio: boolean;
}

export class Publish {
	room: Room;
	name: string;

	constructor(room: Room, name: string) {
		this.room = room;
		this.name = name;
	}
}
