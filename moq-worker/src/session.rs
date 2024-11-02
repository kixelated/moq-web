use wasm_bindgen::prelude::*;

use moq_karp::moq_transfork;
use url::Url;

use super::*;

#[wasm_bindgen(getter_with_clone)]
pub struct SessionConfig {
    pub addr: String,
}

#[wasm_bindgen]
impl SessionConfig {
    #[wasm_bindgen(constructor)]
    pub fn new(addr: String) -> SessionConfig {
        SessionConfig { addr }
    }
}

#[wasm_bindgen]
pub struct Session {
    inner: moq_transfork::Session,
}

#[wasm_bindgen]
impl Session {
    pub async fn connect(config: SessionConfig) -> Result<Self, JsValue> {
        let url = Url::parse(&config.addr).unwrap();
        let session = web_transport_wasm::Session::connect(url).await.unwrap();
        let session = moq_transfork::Session::connect(session.into())
            .await
            .unwrap();

        Ok(Self { inner: session })
    }

    pub fn close(self) {
        self.inner.close(moq_transfork::Error::Cancel);
    }

    pub fn publish(&self, config: PublishConfig) -> Result<Publish, JsValue> {
        Ok(Publish::new(self.inner.clone(), config))
    }

    pub fn watch(&self, config: WatchConfig) -> Result<Watch, JsValue> {
        Ok(Watch::new(self.inner.clone(), config))
    }
}
