import * as Moq from "..";

// Supports a subset of the <video> element API.
// See: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
// Also: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
export class MoqVideo extends HTMLElement implements HTMLVideoElement {
	#session?: Promise<Moq.Session>;
	#watch?: Promise<Moq.Watch>;
	#canvas: OffscreenCanvas;

	// Attributes with getters and setters.
	#width = 0;
	#height = 0;
	#muted = false;
	#paused = true;
	#src = "";
	#volume = 1;

	// These only matter at init
	autoplay = false;
	playsInline = true;
	poster = "";
	currentTime = 0;
	defaultMuted = false;
	preload: "" | "none" | "metadata" | "auto" = "auto";

	// Readonly properties.
	readonly buffered = new TimeRanges();
	readonly currentSrc = "";
	readonly duration = 0;
	readonly ended = false;
	readonly error = null;
	readonly played = new TimeRanges();
	readonly videoHeight = 0;
	readonly videoWidth = 0;

	readonly NETWORK_EMPTY = 0;
	readonly NETWORK_IDLE = 1;
	readonly NETWORK_LOADING = 2;
	readonly NETWORK_NO_SOURCE = 3;
	readonly networkState = this.NETWORK_EMPTY;

	readonly HAVE_NOTHING = 0;
	readonly HAVE_METADATA = 1;
	readonly HAVE_CURRENT_DATA = 2;
	readonly HAVE_FUTURE_DATA = 3;
	readonly HAVE_ENOUGH_DATA = 4;
	readonly readyState = this.HAVE_NOTHING;

	// Currently unsupported readonly properties
	readonly mediaKeys = null;
	readonly remote = new RemotePlayback();
	readonly textTracks = new TextTrackList();
	readonly seekable = new TimeRanges();
	readonly seeking = false;
	readonly sinkId = "";

	// We don't care if this are set.
	disablePictureInPicture = false;
	onenterpictureinpicture = null;
	onleavepictureinpicture = null;
	controls = false;
	crossOrigin = null;
	disableRemotePlayback = true;
	onencrypted = null;
	onwaitingforkey = null;
	preservesPitch = true;

	static get unsupportedAttributes() {
		// Parts of the HTML5 <video> element that we don't support (yet), for documentation mostly.
		return [
			"controls",
			"controlslist",
			"crossorigin",
			"disablepictureinpicture",
			"disableremoteplayback",
			"loop",
			"playsinline",
			"poster",
		];
	}

	static get observedAttributes() {
		return ["src", "height", "muted", "width"];
	}

	// Attributes we only check once on init.
	static get initAttrbiutes() {
		return ["autoplay"];
	}

	constructor() {
		super();

		const shadowRoot = this.attachShadow({ mode: "open" });
		const canvas = document.createElement("canvas");
		shadowRoot.appendChild(canvas);
		this.#canvas = canvas.transferControlToOffscreen();
	}

	connectedCallback() {
		for (const name of MoqVideo.initAttrbiutes.concat(
			...MoqVideo.observedAttributes,
		)) {
			const value = this.getAttribute(name);
			if (value !== null) {
				this.attributeChangedCallback(name, null, this.getAttribute(name));
			}
		}

		if (this.src) {
			this.load();
		}
	}

	attributeChangedCallback(
		name: string,
		oldValue: string | null,
		newValue: string | null,
	) {
		if (oldValue === newValue) {
			return;
		}

		switch (name) {
			case "src":
				this.src = newValue || "";
				break;
			case "height":
				this.height = newValue ? Number.parseInt(newValue) : 0;
				break;
			case "width":
				this.width = newValue ? Number.parseInt(newValue) : 0;
				break;
			case "muted":
				this.muted = newValue !== null;
				break;
			default:
				throw new Error(`Unsupported attribute: ${name}`);
		}
	}

	// Actually supported methods
	load() {
		if (this.#session) {
			this.#session.then((s) => s.close());
		}

		if (this.#watch) {
			this.#watch.then((w) => w.close());
		}

		if (!this.#src) {
			return;
		}

		const src = new URL(this.#src);
		if (src.protocol !== "https:") {
			throw new Error(`Unsupported protocol: ${src.protocol}`);
		}

		if (src.username || src.password) {
			throw new Error("Unsupported username/password");
		}

		const addr = `${src.protocol}//${src.hostname}:${src.port || 443}`;
		const path = src.pathname.split("/").filter((x) => x);

		const paused = !this.autoplay && this.#paused;
		const volume = this.#muted ? 0 : this.#volume;

		this.#session = Moq.Session.connect(addr);
		this.#watch = this.#session
			.then(async (s) => s.watch(path))
			.then(async (w) => {
				// Set the initial state
				await w.pause(paused);
				await w.volume(volume);
				await w.render(this.#canvas);
				return w;
			});
	}

	pause(): void {
		this.#paused = true;
		this.#watch?.then((w) => w.pause(true));
	}

	async play(): Promise<void> {
		this.#paused = false;

		if (!this.#watch) {
			this.load();
		}

		if (this.#watch) {
			const w = await this.#watch;
			await w.pause(false);
		}
	}

	get paused(): boolean {
		return this.#paused;
	}

	// The afformentioned getters and setters.
	get width() {
		return this.#width;
	}

	set width(value: number) {
		if (this.#width === value) {
			return;
		}

		this.#width = value;

		// TODO update DOM
	}

	get height() {
		return this.#height;
	}

	set height(value: number) {
		if (this.#height === value) {
			return;
		}

		this.#height = value;
		// TODO update DOM
	}

	get src() {
		return this.#src;
	}

	set src(value: string) {
		if (this.#src === value) {
			return;
		}

		this.#src = value;
	}

	get muted() {
		return this.#muted;
	}

	set muted(value: boolean) {
		if (this.#muted === value) {
			return;
		}

		this.#muted = value;
		const volume = this.#muted ? 0 : this.#volume;
		this.#watch?.then((w) => w.volume(volume));
	}

	get volume() {
		return this.#volume;
	}

	set volume(value: number) {
		if (this.#volume === value) {
			return;
		}

		this.#volume = value;
		const volume = this.#muted ? 0 : this.#volume;
		this.#watch?.then((w) => w.volume(volume));
	}

	// Attrbutes that will error when changed (unsupported).
	get defaultPlaybackRate() {
		return 1;
	}

	set defaultPlaybackRate(value: number) {
		throw new Error("defaultPlaybackRate not implemented");
	}

	get loop() {
		return false;
	}

	set loop(value: boolean) {
		throw new Error("loop not implemented");
	}

	get playbackRate() {
		return 1;
	}

	set playbackRate(value: number) {
		throw new Error("playbackRate not implemented");
	}

	get srcObject() {
		return null;
	}

	set srcObject(value: MediaStream | MediaSource | Blob | null) {
		throw new Error("srcObject not implemented");
	}

	// Completely unsupported methods
	setMediaKeys(mediaKeys: MediaKeys | null): Promise<void> {
		throw new Error("Method not implemented.");
	}

	setSinkId(sinkId: string): Promise<void> {
		throw new Error("Method not implemented.");
	}

	requestVideoFrameCallback(callback: VideoFrameRequestCallback): number {
		throw new Error("Method not implemented.");
	}

	cancelVideoFrameCallback(handle: number): void {
		throw new Error("Method not implemented.");
	}

	getVideoPlaybackQuality(): VideoPlaybackQuality {
		throw new Error("Method not implemented.");
	}

	requestPictureInPicture(): Promise<PictureInPictureWindow> {
		throw new Error("Method not implemented.");
	}

	addTextTrack(
		kind: TextTrackKind,
		label?: string,
		language?: string,
	): TextTrack {
		throw new Error("Method not implemented.");
	}

	canPlayType(type: string): CanPlayTypeResult {
		throw new Error("Method not implemented.");
	}

	fastSeek(time: number): void {
		throw new Error("Method not implemented.");
	}
}
