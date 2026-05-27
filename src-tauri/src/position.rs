use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub struct WindowPosition {
    pub x: i32,
    pub y: i32,
}

pub fn load(path: &Path) -> Option<WindowPosition> {
    let content = fs::read_to_string(path).ok()?;
    serde_json::from_str(&content).ok()
}

pub fn save(path: &Path, pos: &WindowPosition) -> Result<(), Box<dyn std::error::Error>> {
    let content = serde_json::to_string(pos)?;
    fs::write(path, content)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn load_returns_none_for_missing_file() {
        let path = std::env::temp_dir().join("pomodoro_test_missing.json");
        let _ = fs::remove_file(&path);
        let result = load(&path);
        assert!(result.is_none());
    }

    #[test]
    fn save_and_load_roundtrip() {
        let path = std::env::temp_dir().join("pomodoro_test_roundtrip.json");
        let _ = fs::remove_file(&path);
        let pos = WindowPosition { x: 100, y: 200 };
        save(&path, &pos).unwrap();
        let loaded = load(&path).unwrap();
        assert_eq!(loaded, pos);
        let _ = fs::remove_file(&path);
    }

    #[test]
    fn load_returns_none_for_corrupt_json() {
        let path = std::env::temp_dir().join("pomodoro_test_corrupt.json");
        fs::write(&path, "not valid json").unwrap();
        let result = load(&path);
        assert!(result.is_none());
        let _ = fs::remove_file(&path);
    }
}
