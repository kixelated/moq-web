mod audio;
mod video;

use audio::*;
use tokio::sync::watch;
use video::*;

use moq_karp::{
    consume::{Broadcast, Resumable},
    moq_transfork,
};
use wasm_bindgen::prelude::*;

use wasm_bindgen_futures::spawn_local;
use web_sys::OffscreenCanvas;

use crate::{Error, Result, Session};

#[derive(Debug, Default)]
struct Controls {
    paused: bool,
    volume: f64,
    canvas: Option<OffscreenCanvas>,
    close: bool,
}

#[derive(Debug, Default)]
struct Status {
    // TODO
}

#[wasm_bindgen]
pub struct Watch {
    controls: watch::Sender<Controls>,
    status: watch::Receiver<Status>,
}

#[wasm_bindgen]
impl Watch {
    #[wasm_bindgen(constructor)]
    pub fn new(session: Session, path: Vec<String>) -> Self {
        let controls = watch::channel(Controls::default());
        let status = watch::channel(Status::default());

        let path = moq_transfork::Path::new(path);
        let session = session.inner().clone();
        let resumable = Resumable::new(session, path);

        let mut backend = WatchBackend {
            resumable,
            broadcast: None,
            controls: controls.1,
            status: status.0,
        };

        spawn_local(async move {
            if let Err(err) = backend.run().await {
                tracing::error!(?err, "backend error");
            }
        });

        Self {
            controls: controls.0,
            status: status.1,
        }
    }

    /*
    pub async fn load(&mut self) -> Result<()> {
        let broadcast = self.resumable.broadcast().await.ok_or(Error::Offline)?;
        self.broadcast = Some(broadcast);
        Ok(())
    }
    */

    pub fn render(&mut self, canvas: Option<OffscreenCanvas>) {
        self.controls.send_modify(|controls| {
            controls.canvas = canvas;
        });
    }

    pub fn pause(&mut self, paused: bool) {
        self.controls.send_modify(|controls| {
            controls.paused = paused;
        });
    }

    pub fn volume(&mut self, value: f64) {
        self.controls.send_modify(|controls| {
            controls.volume = value;
        });
    }

    pub fn close(&mut self) {
        self.controls.send_modify(|controls| {
            controls.close = true;
        });
    }

    pub async fn closed(&self) {
        self.status.clone().wait_for(|_| false).await;
    }
}

struct WatchBackend {
    resumable: Resumable,
    broadcast: Option<Broadcast>,

    controls: watch::Receiver<Controls>,
    status: watch::Sender<Status>,
}

impl WatchBackend {
    async fn run(&mut self) -> Result<()> {
        loop {
            tokio::select! {
                Some(broadcast) = self.resumable.broadcast() => {
                    self.broadcast = Some(broadcast);
                }
                changed = self.controls.changed() => {
                    if changed.is_err() {
                        return Ok(());
                    }

                    let controls = self.controls.borrow_and_update();
                },
                else => return Ok(()),
            }
        }
    }
}
