use wasm_bindgen::prelude::*;

use moq_karp::moq_transfork;
use web_sys::OffscreenCanvas;

#[wasm_bindgen(getter_with_clone)]
pub struct WatchConfig {
    pub room: String,
    pub name: String,

    pub render: Option<OffscreenCanvas>,
}

#[wasm_bindgen]
impl WatchConfig {
    #[wasm_bindgen(constructor)]
    pub fn new(room: String, name: String) -> WatchConfig {
        WatchConfig {
            room,
            name,
            render: None,
        }
    }
}

#[wasm_bindgen]
pub struct Watch {
    session: moq_transfork::Session,
}

impl Watch {
    pub fn new(session: moq_transfork::Session, config: WatchConfig) -> Self {
        Self { session }
    }
}
