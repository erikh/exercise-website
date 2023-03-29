use davisjr::prelude::*;
use include_dir::{include_dir, Dir};
use tracing::{info, Level};
use tracing_subscriber::FmtSubscriber;

static REACT_APP: Dir = include_dir!("react_app/build");
const INDEX_FILE: &str = "index.html";

async fn serve(
    req: Request<Body>,
    _resp: Option<Response<Body>>,
    params: Params,
    _app: App<(), NoState>,
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

    info!("Requesting path: {}", path);

    let body = Body::from(file.contents_utf8().unwrap());
    Ok((
        req,
        Some(Response::builder().status(200).body(body).unwrap()),
        NoState {},
    ))
}

#[tokio::main]
async fn main() -> Result<(), ServerError> {
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::TRACE)
        .finish();

    tracing::subscriber::set_global_default(subscriber).expect("setting default subscriber failed");

    let mut app = App::new();
    app.get("/*", compose_handler!(serve)).unwrap();
    app.serve("0.0.0.0:3000").await
}
