//
//  CancelTripIntent.swift
//  frontend
//
//  Created by AlexJames on 8/8/26.
//

import AppIntents

struct CancelTripIntent: AppIntent {

    static var title: LocalizedStringResource = "Cancel Trip"

    static var description = IntentDescription(
        "Cancel the current Deduckly trip without saving it."
    )

    @available(iOS 26.0, *)
    static var supportedModes: IntentModes {
        .foreground(.deferred)
    }

    @available(iOS, introduced: 16, deprecated: 26)
    static var openAppWhenRun: Bool = true

    @MainActor
    func perform() async throws -> some IntentResult {

        try await requestConfirmation(
            actionName: .continue,
            dialog: IntentDialog(
                "Are you sure you want to cancel this trip? It won't be saved."
            )
        )

        let defaults = UserDefaults(
            suiteName: "group.com.karlsonworks.deduckly"
        )

        defaults?.set(true, forKey: "cancel_trip")

        return .result()
    }
}
