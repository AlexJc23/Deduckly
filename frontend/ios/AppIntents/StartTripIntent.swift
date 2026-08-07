//
//  StartTripIntent.swift
//  frontend
//
//  Created by AlexJames on 8/5/26.
//

import AppIntents

struct StartTripIntent: AppIntent {

    static var title: LocalizedStringResource = "Start Trip"

    static var description = IntentDescription(
        "Start a new Deduckly trip."
    )

    @available(iOS 26.0, *)
    static var supportedModes: IntentModes {
        .foreground(.deferred)
    }

    @available(iOS, introduced: 16, deprecated: 26)
    static var openAppWhenRun: Bool = true

    @Parameter(
        title: "Platform",
        requestValueDialog: IntentDialog("Which platform?")
    )
    var platform: TripPlatform

    static var parameterSummary: some ParameterSummary {
        Summary("Start a \(\.$platform) trip")
    }

    @MainActor
    func perform() async throws -> some IntentResult {

        let defaults = UserDefaults(
            suiteName: "group.com.karlsonworks.deduckly"
        )

        defaults?.set(platform.rawValue, forKey: "pending_platform")
        defaults?.set(true, forKey: "start_trip")

        return .result()
    }
}
