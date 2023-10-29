## Exercise Website

I needed an app to track my daily exercise and keep me honest.

This uses [davisjr](https://github.com/erikh/davisjr) to serve a
binary-embedded react application which posts to a database. It could serve as
an example application for that toolkit.

### Development

First off, make sure your node environment is in order. `cd react_app && npm i`
is probably a good first step, and if things still break a `npm i --global
react-scripts` will probably get you the last mile.

Type `make`. A `cargo install --path .` will bundle the whole website into the
binary, so it can be served by e.g. a container with ease, but it does not
compile the react payload without typing `make`. Eventually I will write a
proper `build.rs` for it. The resulting binary does not need `nginx` or any
other supporting infrastructure unless you want to manipulate the transport
somehow. It just listens on port 3000, making it great for container workloads.

The application provides no authentication or authorization control.

### Author

Erik Hollensbe <erik+github@hollensbe.org>

### License

MIT
