import type { SessionConfig, PublishConfig, WatchConfig } from "..";

// main -> worker
export interface ToWorker {
	transaction: number;
	request: Request;
}

export interface Request {
	session?: Session;
	publish?: Publish;
	watch?: Watch;
	close?: number;
}

// worker -> main
export interface FromWorker {
	response?: Response;
	announced?: Announced;
}

export interface Response {
	transaction: number;
	err?: Error;
}

export interface Session {
	id: number;
	config: SessionConfig;
}

export interface Publish {
	session: number;
	room: string;
	name: string;
	config: PublishConfig;
}

export interface Watch {
	session: number;
	room: string;
	name: string;
	config: WatchConfig;
}

export interface Announced {
	session: number;
	room: string;
	name: string;
	status: "active" | "ended";
}
