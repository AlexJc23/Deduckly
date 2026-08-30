export type PlatformName =
  | "uber_eats"
  | "spark"
  | "doordash"
  | "lyft"
  | "uber"
  | "grubhub"
  | "instacart"
  | "amazon_flex"
  | "shipt"
  | "other"
  | "personal";

export const platformIcons: Record<
  PlatformName,
  any
> = {
  uber_eats: require("../../assets/platform-icons/uber_eats.png"),
  spark: require("../../assets/platform-icons/spark.png"),
  doordash: require("../../assets/platform-icons/doordash.png"),
  lyft: require("../../assets/platform-icons/lyft.png"),
  uber: require("../../assets/platform-icons/uber.png"),
  grubhub: require("../../assets/platform-icons/grubhub.png"),
  instacart: require("../../assets/platform-icons/instacart.png"),
  amazon_flex: require("../../assets/platform-icons/amazon_flex.png"),
  shipt: require("../../assets/platform-icons/shipt.png"),
  other: require("../../assets/platform-icons/other.png"),
  personal: require("../../assets/platform-icons/personal.png"),
};