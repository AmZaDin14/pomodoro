use tauri::{
    menu::{MenuBuilder, MenuItem, MenuItemBuilder, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager,
};

struct PauseResumeItem(MenuItem<tauri::Wry>);

#[tauri::command]
fn set_tray_phase(state: tauri::State<PauseResumeItem>, phase: String) {
    let text = match phase.as_str() {
        "running" => "Pause",
        _ => "Resume",
    };
    let _ = state.0.set_text(text);
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![set_tray_phase])
        .setup(|app| {
            let pause_resume =
                MenuItemBuilder::with_id("pause_resume", "Pause").build(app)?;
            let skip = MenuItemBuilder::with_id("skip", "Skip").build(app)?;
            let stop = MenuItemBuilder::with_id("stop", "Stop").build(app)?;
            let quit = MenuItemBuilder::with_id("quit", "Quit").build(app)?;
            let separator = PredefinedMenuItem::separator(app)?;

            let menu = MenuBuilder::new(app)
                .items(&[&pause_resume, &skip, &stop, &separator, &quit])
                .build()?;

            TrayIconBuilder::with_id("main")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "pause_resume" => {
                        let _ = app.emit("tray:pause_resume", ());
                    }
                    "skip" => {
                        let _ = app.emit("tray:skip", ());
                    }
                    "stop" => {
                        let _ = app.emit("tray:stop", ());
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            app.manage(PauseResumeItem(pause_resume));

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
