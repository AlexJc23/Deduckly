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

    @objc(getPendingStop:rejecter:)
    func getPendingStop(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        let defaults = UserDefaults(
            suiteName: "group.com.karlsonworks.deduckly"
        )

        let shouldStop = defaults?.bool(forKey: "stop_trip") == true

        defaults?.removeObject(forKey: "stop_trip")

        resolve(shouldStop)
    }

    @objc
    static func requiresMainQueueSetup() -> Bool {
        false
    }
  
  @objc(getPendingCancel:rejecter:)
  func getPendingCancel(
      _ resolve: @escaping RCTPromiseResolveBlock,
      rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
      let defaults = UserDefaults(
          suiteName: "group.com.karlsonworks.deduckly"
      )

      let shouldCancel = defaults?.bool(forKey: "cancel_trip") == true

      defaults?.removeObject(forKey: "cancel_trip")

      resolve(shouldCancel)
  }
}
