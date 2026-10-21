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

  try {
    await FileSystem.writeAsStringAsync(uri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await Sharing.shareAsync(uri, {
      mimeType,
      dialogTitle: "Export Report",
    });
  } finally {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  }
}

export async function purgeCachedReports() {
  if (!FileSystem.cacheDirectory) return;
  for (const filename of ['Deduckly_Report.pdf', 'Deduckly_Report.csv']) {
    await FileSystem.deleteAsync(FileSystem.cacheDirectory + filename, { idempotent: true });
  }
}