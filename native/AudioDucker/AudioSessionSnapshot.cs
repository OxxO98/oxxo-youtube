using NAudio.CoreAudioApi;

namespace AudioDucker;

internal sealed class AudioSessionSnapshot
{
    public required string Key { get; init; }
    public required AudioSessionControl Session { get; init; }
    public required float BaselineVolume { get; set; }
    public required float LastObservedVolume { get; set; }
}
