use crate::migrations::Migrations;
use anyhow::Result;
use davisjr::prelude::*;
use include_dir::{include_dir, Dir};
use sqlx::{migrate::MigrateDatabase, Sqlite, SqlitePool};

static DB_MIGRATIONS: Dir = include_dir!("./migrations");

#[derive(Debug, Clone, Default)]
pub(crate) struct AppState {
    db: Option<SqlitePool>,
}

impl AppState {
    pub(crate) async fn new(db: &str) -> Result<Self> {
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

    pub(crate) async fn db(&self) -> SqlitePool {
        self.db.clone().unwrap()
    }
}

impl TransientState for AppState {
    fn initial() -> Self {
        Default::default()
    }
}
