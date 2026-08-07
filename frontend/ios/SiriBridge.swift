//
//  SiriBridge.swift
//  frontend
//
//  Created by AlexJames on 8/7/26.
//


import Foundation
import React

@objc(SiriBridge)
class SiriBridge: NSObject {

    @objc(getPendingTrip:rejecter:)
    func getPendingTrip(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {

        let defaults = UserDefaults(
            suiteName: "group.com.karlsonworks.deduckly"
        )

        guard
            let platform = defaults?.string(forKey: "pending_platform"),
            defaults?.bool(forKey: "start_trip") == true
        else {
            resolve(nil)
            return
        }

        defaults?.removeObject(forKey: "pending_platform")
        defaults?.removeObject(forKey: "start_trip")

        resolve([
            "platform": platform
        ])
    }

    @objc
    static func requiresMainQueueSetup() -> Bool {
        false
    }
}
