import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { fromByteArray } from "base64-js";

export async function saveFile(
  bytes: ArrayBuffer,
  filename: string,
  mimeType: string
) {
  const uri = FileSystem.cacheDirectory + filename;

  const base64 = fromByteArray(new Uint8Array(bytes));

  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await Sharing.shareAsync(uri, {
    mimeType,
    dialogTitle: "Export Report",
  });
}