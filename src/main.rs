mod db;
mod migrations;

use self::{db::Exercise, migrations::Migrations};
use anyhow::Result;
use davisjr::prelude::*;
use include_dir::{include_dir, Dir};
use sqlx::{migrate::MigrateDatabase, Sqlite, SqlitePool};
use tracing::Level;
use tracing_subscriber::FmtSubscriber;

static REACT_APP: Dir = include_dir!("react_app/build");
const INDEX_FILE: &str = "index.html";

static DB_MIGRATIONS: Dir = include_dir!("./migrations");
const DB_FILENAME: &str = "exercise.db";

#[derive(Debug, Clone, Default)]
#[allow(dead_code)]
struct AppState {
    db: Option<SqlitePool>,
}

impl AppState {
    async fn new(db: &str) -> Result<Self> {
        let url = format!("sqlite://{}", db);
        match Sqlite::create_database(&url).await {
            _ => {}
        }

        let db = SqlitePool::connect(&url).await?;
        sqlx::migrate::Migrator::new(Migrations(DB_MIGRATIONS.clone()))
            .await?
            .run(&db)
            .await?;
        Ok(Self { db: Some(db) })
    }
}

impl TransientState for AppState {
    fn initial() -> Self {
        Default::default()
    }
}

async fn serve_files(
    req: Request<Body>,
    _resp: Option<Response<Body>>,
    params: Params,
    _app: App<AppState, NoState>,
    _state: NoState,
) -> HTTPResult<NoState> {
    let path = params.get("*");

    let file = if let Some(path) = path {
        match REACT_APP.get_file(path) {
            Some(file) => file,
            None => REACT_APP.get_file(INDEX_FILE).unwrap(),
        }
    } else {
        REACT_APP.get_file(INDEX_FILE).unwrap()
    };

    let body = Body::from(file.contents());
    Ok((
        req,
        Some(Response::builder().status(200).body(body).unwrap()),
        NoState {},
    ))
}

async fn post_exercise(
    mut req: Request<Body>,
    _resp: Option<Response<Body>>,
    _params: Params,
    app: App<AppState, NoState>,
    _state: NoState,
) -> HTTPResult<NoState> {
    let exercise: Exercise = serde_json::from_slice(&hyper::body::to_bytes(req.body_mut()).await?)?;

    sqlx::query!(
        "insert into exercises (id, name) values (?, ?)",
        exercise.id,
        exercise.name
    )
    .execute(&app.state().await.unwrap().lock().await.db.clone().unwrap())
    .await?;

    Ok((
        req,
        Some(Response::builder().status(200).body(Body::empty()).unwrap()),
        NoState {},
    ))
}

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
