use wasm_bindgen::prelude::*;

use web_sys::OffscreenCanvas;

use crate::Session;

#[wasm_bindgen]
pub struct Publish {
    session: Session,
}

#[wasm_bindgen]
impl Publish {
    #[wasm_bindgen(constructor)]
    pub fn new(addr: &str) -> Self {
        Self { session }
    }

    pub fn pause(&mut self, value: bool) {}

    pub fn volume(&mut self, value: f64) {}

    pub fn blind(&mut self, value: bool) {}
}
