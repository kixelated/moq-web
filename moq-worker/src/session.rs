use wasm_bindgen::prelude::*;

use moq_karp::moq_transfork::{self, web_transport};
use url::Url;

use crate::{Error, Publish, Result, Watch};

#[wasm_bindgen]
#[derive(Clone)]
pub struct Session {
    inner: moq_transfork::Session,
}

#[wasm_bindgen]
impl Session {
    pub async fn connect(addr: &str) -> Result<Self> {
        let url = Url::parse(addr).map_err(|_| Error::InvalidUrl)?;
        if url.scheme() != "https" {
            return Err(Error::InvalidUrl);
        }

        let session = web_transport::wasm::Session::build(url.clone())
            .allow_pooling(false)
            .congestion_control(web_transport::wasm::CongestionControl::LowLatency)
            .require_unreliable(true);

        // TODO Unfortunately, WebTransport doesn't work correctly with self-signed certificates.
        // Until that gets fixed, we need to perform a HTTP request to fetch the certificate hashes.
        let session = match url.host_str() {
            Some("localhost") => {
                let fingerprint = Self::fingerprint(&url).await?;
                session.server_certificate_hashes(vec![fingerprint])
            }
            _ => session,
        };

        let session = session.connect().await?;
        let session = moq_transfork::Session::connect(session.into()).await?;

        Ok(Self { inner: session })
    }

    async fn fingerprint(url: &Url) -> Result<Vec<u8>> {
        let mut fingerprint = url.clone();
        fingerprint.set_path("fingerprint");

        let resp = gloo_net::http::Request::get(fingerprint.as_str())
            .send()
            .await?;

        let body = resp.text().await?;
        let fingerprint = hex::decode(body.trim()).map_err(|_| Error::InvalidFingerprint)?;

        Ok(fingerprint)
    }

    pub fn close(self) {
        self.inner.close(moq_transfork::Error::Cancel);
    }

    pub async fn watch(&self, config: WatchConfig) -> Result<Watch> {
        Watch::load(self.clone(), config).await
    }

    pub async fn publish(&self, config: PublishConfig) -> Result<Publish> {
        Ok(Publish::new(self.clone(), config))
    }

    pub(super) fn inner(&self) -> &moq_transfork::Session {
        &self.inner
    }
}
