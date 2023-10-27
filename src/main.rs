use anyhow::Result;
use davisjr::prelude::*;
use include_dir::{include_dir, Dir};
use sqlx::{
    migrate::{MigrateDatabase, MigrationSource, MigrationType},
    Sqlite, SqlitePool,
};
use std::borrow::Cow;
use tracing::{debug, info, Level};
use tracing_subscriber::FmtSubscriber;

static REACT_APP: Dir = include_dir!("react_app/build");
const INDEX_FILE: &str = "index.html";

static DB_MIGRATIONS: Dir = include_dir!("./migrations");
const DB_FILENAME: &str = "exercise.db";

#[derive(Debug, Clone)]
struct Migrations<'a>(Dir<'a>);

impl<'s> MigrationSource<'s> for Migrations<'s> {
    fn resolve(
        self,
    ) -> futures::future::BoxFuture<
        's,
        std::result::Result<Vec<sqlx::migrate::Migration>, sqlx::error::BoxDynError>,
    > {
        let s = self.clone();

        Box::pin(async move {
            let contents =
                s.0.files()
                    .map(|x| x.contents_utf8().unwrap().to_string().clone())
                    .collect::<Vec<String>>();

            let filenames =
                s.0.files()
                    .map(|x| {
                        x.path()
                            .as_os_str()
                            .clone()
                            .to_str()
                            .unwrap()
                            .to_string()
                            .clone()
                    })
                    .collect::<Vec<String>>();

            let mut v = Vec::new();
            let mut i: usize = 0;
            for s in contents {
                v.push(sqlx::migrate::Migration::new(
                    i.try_into().unwrap(),
                    Cow::Owned(filenames[i].clone()),
                    MigrationType::Simple,
                    Cow::Owned(s.clone()),
                ));
                i += 1;
            }
            Ok(v)
        })
    }
}

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
