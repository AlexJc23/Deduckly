//
//  StopTripIntent.swift
//  frontend
//
//  Created by AlexJames on 8/7/26.
//

import AppIntents

struct StopTripIntent: AppIntent {

    static var title: LocalizedStringResource = "Stop Trip"

    static var description = IntentDescription(
        "Stop and save the current Deduckly trip."
    )

    @available(iOS 26.0, *)
    static var supportedModes: IntentModes {
        .foreground(.deferred)
    }

    @available(iOS, introduced: 16, deprecated: 26)
    static var openAppWhenRun: Bool = true

    static var parameterSummary: some ParameterSummary {
        Summary("Stop my trip")
    }

    @MainActor
    func perform() async throws -> some IntentResult {

        try await requestConfirmation(
            actionName: .continue,
            dialog: IntentDialog(
                "Are you sure you want to stop and save your trip?"
            )
        )

        let defaults = UserDefaults(
            suiteName: "group.com.karlsonworks.deduckly"
        )

        defaults?.set(true, forKey: "stop_trip")

        return .result()
    }
}
