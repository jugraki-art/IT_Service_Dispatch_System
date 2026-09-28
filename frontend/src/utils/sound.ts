// Audio playback has been removed per system specification.
class SoundManager {
  public enabled = false;
  playAlertTone() {}
  playDispatchChime() {}
  playSuccessChime() {}
}

export const sound = new SoundManager();
