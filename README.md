## Exercise Website

I needed an app to track my daily exercise and keep me honest.

This uses [davisjr](https://github.com/erikh/davisjr) to serve a
binary-embedded react application which posts to a database. It could serve as
an example application for that toolkit.

The resulting binary is approximately 7MB with the current release build
settings and only links against libc. It requires no other infrastructure to
function as a web application.

### Development

First off, make sure your node environment is in order. `cd react_app && npm i`
is probably a good first step, and if things still break a `npm i --global
react-scripts` will probably get you the last mile.

Type `make`. A `cargo install --path .` will bundle the whole website into the
binary, so it can be served by e.g. a container with ease, but it does not
compile the react payload without typing `make`. Eventually I will write a
proper `build.rs` for it. The resulting binary does not need `nginx` or any
other supporting infrastructure unless you want to manipulate the transport
somehow. It just listens on port 3000.

The application provides no authentication or authorization control.

The handlers this program implements mimic the `try_files` directive of `nginx`
so that it is compatible with `react-router`'s behavior. What this means is
that in all cases where a filename does not match, it is forwarded to
`/index.html` with the target path appended to it. This way, `react-router` can
route the path with javascript.

### Author

Erik Hollensbe <erik+github@hollensbe.org>

### License

MIT
