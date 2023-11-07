use include_dir::Dir;
use sqlx::migrate::{MigrationSource, MigrationType};
use std::borrow::Cow;

#[derive(Debug, Clone)]
pub(crate) struct Migrations<'a>(pub(crate) Dir<'a>);

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
                    .map(|x| x.path().as_os_str().to_str().unwrap().to_string().clone())
                    .collect::<Vec<String>>();

            let mut v = Vec::new();
            for (i, s) in contents.iter().enumerate() {
                v.push(sqlx::migrate::Migration::new(
                    i.try_into().unwrap(),
                    Cow::Owned(filenames[i].clone()),
                    MigrationType::Simple,
                    Cow::Owned(s.clone()),
                ));
            }
            Ok(v)
        })
    }
}
