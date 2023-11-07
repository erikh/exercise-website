run: react
	cargo run

react:
	cd react_app && npm run build

clean:
	rm -f exercise.db*

docker: react
	docker build -t exercise-website .
