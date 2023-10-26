use anyhow::Result;
use davisjr::prelude::*;
use include_dir::{include_dir, Dir};
use sqlx::SqlitePool;
use tracing::{debug, info, Level};
use tracing_subscriber::FmtSubscriber;

static REACT_APP: Dir = include_dir!("react_app/build");
const INDEX_FILE: &str = "index.html";
const DB_FILENAME: &str = "exercise.db";

#[derive(Debug, Clone, Default)]
#[allow(dead_code)]
struct AppState {
    db: Option<SqlitePool>,
}

impl AppState {
    async fn new(db: &str) -> Result<Self> {
        // FIXME create db if necessary
        Ok(Self {
            db: Some(SqlitePool::connect(&format!("sqlite://{}", db)).await?),
        })
    }
}

impl TransientState for AppState {
    fn initial() -> Self {
        Default::default()
    }
}

async fn log_serve(
    req: Request<Body>,
    _resp: Option<Response<Body>>,
    _params: Params,
    _app: App<AppState, NoState>,
    _state: NoState,
) -> HTTPResult<NoState> {
    let path = req.uri().path();
    info!("Requesting: {}", path);

    Ok((req, None, NoState {}))
}

async fn serve(
    req: Request<Body>,
    _resp: Option<Response<Body>>,
    params: Params,
    _app: App<AppState, NoState>,
    _state: NoState,
) -> HTTPResult<NoState> {
    let path = match params.get("*") {
        Some(path) => path,
        None => INDEX_FILE,
    };

    let file = match REACT_APP.get_file(path) {
        Some(file) => file,
        None => REACT_APP.get_file(INDEX_FILE).unwrap(),
    };

    debug!("Fetching file: {}", path);

    let body = Body::from(file.contents());
    Ok((
        req,
        Some(Response::builder().status(200).body(body).unwrap()),
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
    app.get("/*", compose_handler!(log_serve, serve)).unwrap();
    app.serve("0.0.0.0:3000").await
}
