use crate::Error;

pub struct Audio {
    broadcast: moq_karp::consume::Broadcast,
}

impl Audio {
    pub fn new() -> Self {
        Self { broadcast }
    }

    pub async fn run(self) -> Result<(), Error> {
        let audio = match self.broadcast.catalog().audio.first() {
            Some(track) => track,
            None => return Ok(()),
        };

        tracing::info!("fetching audio track: {:?}", audio);
        let mut track = self.broadcast.audio(&audio.track.name)?;

        while let Some(frame) = track.read().await? {
            tracing::debug!(?frame, "audio frame");
        }

        Ok(())
    }
}
