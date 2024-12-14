"use client";

import { useRef, useEffect } from "react";

export default function Video() {
	const ref = useRef<MoqVideoElement | null>(null);

	useEffect(() => {
		import("@kixelated/moq/video").then(({ default: MoqVideoElement }) => {
			const video = new MoqVideoElement();
			video.src = "https://relay.quic.video/demo/bbb";
			video.autoplay = true;
			ref.current?.appendChild(video);
		});
	}, []);

	return <div ref={ref} />;
}
