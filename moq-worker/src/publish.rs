use wasm_bindgen::prelude::*;

use moq_karp::moq_transfork;
use web_sys::OffscreenCanvas;

#[wasm_bindgen(getter_with_clone)]
pub struct PublishConfig {
    pub room: String,
    pub name: String,
    pub render: Option<OffscreenCanvas>,
}

#[wasm_bindgen]
impl PublishConfig {
    #[wasm_bindgen(constructor)]
    pub fn new(room: String, name: String) -> PublishConfig {
        PublishConfig {
            room,
            name,
            render: None,
        }
    }
}

#[wasm_bindgen]
pub struct Publish {
    session: moq_transfork::Session,
}

impl Publish {
    pub fn new(session: moq_transfork::Session, config: PublishConfig) -> Self {
        Self { session }
    }
}
