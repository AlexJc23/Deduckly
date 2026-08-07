//
//  AppShortcuts.swift
//  frontend
//
//  Created by AlexJames on 8/5/26.
//

import AppIntents

struct DeducklyShortcuts: AppShortcutsProvider {

    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: StartTripIntent(),
            phrases: [
                "Start a trip in \(.applicationName)",
                "Start my trip in \(.applicationName)",
                "Begin a trip in \(.applicationName)"
            ],
            shortTitle: "Start Trip",
            systemImageName: "car.fill"
        )
    }
}
