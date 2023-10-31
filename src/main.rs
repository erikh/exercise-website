mod db;
mod handlers;
mod migrations;
mod state;

use crate::{handlers::*, state::AppState};
use anyhow::Result;
use davisjr::prelude::*;
use tracing::Level;
use tracing_subscriber::FmtSubscriber;

const DB_FILENAME: &str = "exercise.db";

#[tokio::main]
async fn main() -> Result<(), ServerError> {
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::INFO)
        .finish();

    tracing::subscriber::set_global_default(subscriber).expect("setting default subscriber failed");

    let state = AppState::new(DB_FILENAME)
        .await
        .map_err(|x| ServerError::from(format!("{}", x)))?;
    let mut app = App::with_state(state);
    app.post("/input/exercise", compose_handler!(post_exercise))?;
    app.get("/*", compose_handler!(serve_files))?;
    app.serve("0.0.0.0:3000").await
}
