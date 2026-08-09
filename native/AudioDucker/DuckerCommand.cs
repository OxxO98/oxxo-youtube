namespace AudioDucker;

internal sealed class DuckerCommand
{
    public string Command { get; init; } = string.Empty;
    public float? DuckLevel { get; init; }
    public int[]? ExcludedProcessIds { get; init; }
}
