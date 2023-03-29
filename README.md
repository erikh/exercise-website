## Exercise Website

I needed an app to track my daily exercise and keep me honest.

This uses [davisjr](https://github.com/erikh/davisjr) to serve a react
application which posts to a database. It could serve as an example application
for that toolkit.

### Development

Type `make run`. A `cargo install --path .` will bundle the whole website into
the binary, so it can be served by e.g. a container with ease. It does not need
`nginx` or any other supporting infrastructure.

### Author

Erik Hollensbe <erik+github@hollensbe.org>

### License

MIT
