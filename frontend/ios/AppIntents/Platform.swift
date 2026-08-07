//
//  StartTripIntent.swift
//  frontend
//
//  Created by AlexJames on 8/5/26.
//


import AppIntents

enum TripPlatform: String, CaseIterable, AppEnum {

    case uberEats = "uber_eats"
    case spark = "spark"
    case doordash = "doordash"
    case lyft = "lyft"
    case uber = "uber"
    case grubhub = "grubhub"
    case instacart = "instacart"
    case amazonFlex = "amazon_flex"
    case shipt = "shipt"
    case other = "other"
    case personal = "personal"

    static var typeDisplayRepresentation = TypeDisplayRepresentation(
        name: "Platform"
    )

    static var caseDisplayRepresentations: [TripPlatform: DisplayRepresentation] = [
        .uberEats: .init(title: "Uber Eats"),
        .spark: .init(title: "Spark"),
        .doordash: .init(title: "DoorDash"),
        .lyft: .init(title: "Lyft"),
        .uber: .init(title: "Uber"),
        .grubhub: .init(title: "Grubhub"),
        .instacart: .init(title: "Instacart"),
        .amazonFlex: .init(title: "Amazon Flex"),
        .shipt: .init(title: "Shipt"),
        .other: .init(title: "Other"),
        .personal: .init(title: "Personal")
    ]
}
