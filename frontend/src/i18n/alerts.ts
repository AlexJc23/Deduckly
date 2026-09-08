import { Alert, type AlertButton, type AlertOptions } from "react-native";
import { translate } from "./core";
export function localizedAlert(title: string, message?: string, buttons?: AlertButton[], options?: AlertOptions) {
  Alert.alert(translate(title), message ? translate(message) : message,
    buttons?.map(button => ({ ...button, text: button.text ? translate(button.text) : button.text })), options);
}
