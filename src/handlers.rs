use crate::{
    db::{Exercise, Reps},
    state::AppState,
};
use davisjr::prelude::*;
use include_dir::{include_dir, Dir};
use sqlx::SqlitePool;

static REACT_APP: Dir = include_dir!("react_app/build");
const INDEX_FILE: &str = "index.html";

async fn get_db(app: &App<AppState, NoState>) -> SqlitePool {
    app.state().await.unwrap().lock().await.db().await
}

pub(crate) async fn serve_files(
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

pub(crate) async fn list_exercises(
    req: Request<Body>,
    _resp: Option<Response<Body>>,
    _params: Params,
    app: App<AppState, NoState>,
    _state: NoState,
) -> HTTPResult<NoState> {
    let exercises: Vec<Exercise> = sqlx::query_as("select id, name from exercises order by id")
        .fetch_all(&get_db(&app).await)
        .await?;

    let body = serde_json::to_string(&exercises)?;

    Ok((
        req,
        Some(
            Response::builder()
                .status(200)
                .body(Body::from(hyper::body::to_bytes(body).await?))
                .unwrap(),
        ),
        NoState {},
    ))
}

pub(crate) async fn post_exercise(
    mut req: Request<Body>,
    _resp: Option<Response<Body>>,
    _params: Params,
    app: App<AppState, NoState>,
    _state: NoState,
) -> HTTPResult<NoState> {
    let exercise: Exercise = serde_json::from_slice(&hyper::body::to_bytes(req.body_mut()).await?)?;

    sqlx::query("insert into exercises (name) values (?)")
        .bind(exercise.name)
        .execute(&get_db(&app).await)
        .await?;

    Ok((
        req,
        Some(Response::builder().status(200).body(Body::empty()).unwrap()),
        NoState {},
    ))
}

pub(crate) async fn post_reps(
    mut req: Request<Body>,
    _resp: Option<Response<Body>>,
    _params: Params,
    app: App<AppState, NoState>,
    _state: NoState,
) -> HTTPResult<NoState> {
    let reps: Reps = serde_json::from_slice(&hyper::body::to_bytes(req.body_mut()).await?)?;

    sqlx::query("insert into reps (exercise_id, count) values (?, ?)")
        .bind(reps.exercise_id)
        .bind(reps.count)
        .execute(&get_db(&app).await)
        .await?;

    Ok((
        req,
        Some(Response::builder().status(200).body(Body::empty()).unwrap()),
        NoState {},
    ))
}

pub(crate) async fn exercise_log(
    req: Request<Body>,
    _resp: Option<Response<Body>>,
    _params: Params,
    app: App<AppState, NoState>,
    _state: NoState,
) -> HTTPResult<NoState> {
    let reps: Vec<Reps> = sqlx::query_as("select * from reps order by date DESC")
        .fetch_all(&get_db(&app).await)
        .await?;

    let body = serde_json::to_string(&reps)?;

    Ok((
        req,
        Some(
            Response::builder()
                .status(200)
                .body(Body::from(hyper::body::to_bytes(body).await?))
                .unwrap(),
        ),
        NoState {},
    ))
}
