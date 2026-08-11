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

      AppShortcut(
          intent: StopTripIntent(),
          phrases: [
              "Stop my trip in \(.applicationName)",
              "Stop the trip in \(.applicationName)",
              "End my trip in \(.applicationName)"
          ],
          shortTitle: "Stop Trip",
          systemImageName: "stop.circle.fill"
      )
    
    AppShortcut(
        intent: CancelTripIntent(),
        phrases: [
            "Cancel my trip in \(.applicationName)",
            "Cancel the trip in \(.applicationName)",
            "Discard my trip in \(.applicationName)"
        ],
        shortTitle: "Cancel Trip",
        systemImageName: "xmark.circle.fill"
    )
  }
}
