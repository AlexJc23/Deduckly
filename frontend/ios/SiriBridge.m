#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(SiriBridge, NSObject)

RCT_EXTERN_METHOD(
    getPendingTrip:(RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject
)

@end