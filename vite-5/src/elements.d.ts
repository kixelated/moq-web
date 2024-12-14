import type MoqVideo from "@kixelated/moq/video";

type CustomElement<T> = Partial<T & DOMAttributes<T> & { children: unknown }>;

declare global {
	namespace JSX {
		interface IntrinsicElements {
			"moq-video": CustomElement<MoqVideo>;
		}
	}
}
