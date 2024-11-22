use crate::{Error, Result};

mod renderer;
use renderer::*;
use wasm_bindgen_futures::spawn_local;

#[derive(Clone)]
pub struct Video {}

impl Video {
    pub fn new(
        broadcast: moq_karp::consume::Broadcast,
        canvas: web_sys::OffscreenCanvas,
    ) -> Result<Option<Self>> {
        let video = match broadcast.catalog().video.first() {
            Some(track) => track,
            None => return Ok(None),
        };

        let (decoder, decoded) = web_codecs::video::decoder();

        tracing::info!("configuring video decoder: {:?}", video.codec);

        let mut config = web_codecs::video::DecoderConfig::new(video.codec.to_string())
            .coded_dimensions(video.resolution.width as _, video.resolution.height as _)
            .latency_optimized();

        if !video.description.is_empty() {
            config = config.description(video.description.clone().into());
        }

        decoder.configure(&config)?;

        tracing::info!("fetching video track: {:?}", video);
        let track = broadcast.video(&video.track.name)?;

        spawn_local(async move {
            tokio::select! {
                Err(err) = run_decoder(track, decoder) => tracing::error!(?err, "video decoder error"),
                Err(err) = run_renderer(canvas, decoded) => tracing::error!(?err, "video renderer error"),
                else => (),
            };
        });

        Ok(Some(Self {}))
    }

    pub async fn enable(&mut self, value: bool) {
        // TODO
    }

    pub async fn pause(&mut self, value: bool) {
        // TODO
    }

    pub async fn closed(&mut self) -> Result<()> {
        // TODO
        Ok(())
    }
}

async fn run_decoder(
    mut track: moq_karp::consume::Track,
    decoder: web_codecs::video::Decoder,
) -> Result<()> {
    while let Some(frame) = track.read().await? {
        let frame = web_codecs::video::EncodedFrame {
            payload: frame.payload,
            timestamp: frame.timestamp.as_micros() as _,
            keyframe: frame.keyframe,
        };
        decoder.decode(frame)?;
    }

    Ok(())
}

async fn run_renderer(
    canvas: web_sys::OffscreenCanvas,
    mut decoded: web_codecs::video::Decoded,
) -> Result<()> {
    let mut renderer = Renderer::new(canvas);

    while let Some(frame) = decoded.next().await? {
        renderer.push(frame);
    }

    Ok(())
}
