#![allow(dead_code)]
use serde_derive::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub(crate) struct Exercise {
    pub(crate) id: Option<u32>,
    pub(crate) name: String,
}

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub(crate) struct Reps {
    pub(crate) id: Option<u32>,
    pub(crate) exercise_id: u32,
    pub(crate) count: u32,
    pub(crate) date: chrono::DateTime<chrono::Local>,
}

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub(crate) struct Done {
    pub(crate) exercise_id: u32,
    pub(crate) reps_id: u32,
    pub(crate) count: u32,
    pub(crate) date: chrono::DateTime<chrono::Local>,
}
