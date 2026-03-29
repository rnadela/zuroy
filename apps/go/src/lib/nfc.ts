import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

export async function initNfc(): Promise<boolean> {
  try {
    await NfcManager.start();
    return true;
  } catch {
    return false;
  }
}

export async function readNdefText(): Promise<string | null> {
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);
    const tag = await NfcManager.getTag();
    if (tag?.ndefMessage?.[0]) {
      const record = tag.ndefMessage[0];
      if (Ndef.isType(record, Ndef.TNF_WELL_KNOWN, Ndef.RTD_TEXT)) {
        return Ndef.text.decodePayload(new Uint8Array(record.payload as number[]));
      }
    }
    return null;
  } catch {
    return null;
  } finally {
    NfcManager.cancelTechnologyRequest().catch(() => {});
  }
}
