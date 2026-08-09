using NAudio.CoreAudioApi;
using NAudio.CoreAudioApi.Interfaces;

namespace AudioDucker;

internal sealed class AudioDuckingService : IDisposable
{
    private const float DefaultDuckLevel = 0.25f;
    private const float Epsilon = 0.002f;
    private readonly object sync = new();
    private readonly Action<object> writeEvent;
    private readonly Dictionary<string, AudioSessionSnapshot> snapshots = new();
    private readonly HashSet<int> excludedProcessIds = new();
    private readonly Timer monitorTimer;
    private float duckLevel = DefaultDuckLevel;
    private bool isDucking;
    private bool disposed;

    internal AudioDuckingService(Action<object> writeEvent)
    {
        this.writeEvent = writeEvent;
        excludedProcessIds.Add(Environment.ProcessId);
        monitorTimer = new Timer(_ => MonitorSessions(), null, Timeout.Infinite, Timeout.Infinite);
    }

    internal void Configure(float? requestedDuckLevel, IEnumerable<int>? requestedExcludedProcessIds)
    {
        lock (sync)
        {
            if (requestedDuckLevel is not null)
            {
                duckLevel = Math.Clamp(requestedDuckLevel.Value, 0.01f, 1f);
            }

            excludedProcessIds.Clear();
            excludedProcessIds.Add(Environment.ProcessId);
            if (requestedExcludedProcessIds is not null)
            {
                foreach (var processId in requestedExcludedProcessIds.Where(id => id > 0))
                {
                    excludedProcessIds.Add(processId);
                }
            }
        }
    }

    internal void Duck()
    {
        lock (sync)
        {
            if (disposed)
            {
                return;
            }

            isDucking = true;
            ReconcileSessions();
            monitorTimer.Change(TimeSpan.FromMilliseconds(250), TimeSpan.FromMilliseconds(250));
            writeEvent(new { @event = "ducked", sessionCount = snapshots.Count });
        }
    }

    internal void Restore()
    {
        lock (sync)
        {
            if (!isDucking && snapshots.Count == 0)
            {
                return;
            }

            isDucking = false;
            monitorTimer.Change(Timeout.Infinite, Timeout.Infinite);

            foreach (var snapshot in snapshots.Values)
            {
                TrySetVolume(snapshot.Session, snapshot.BaselineVolume);
                snapshot.Session.Dispose();
            }

            var count = snapshots.Count;
            snapshots.Clear();
            writeEvent(new { @event = "restored", sessionCount = count });
        }
    }

    private void MonitorSessions()
    {
        lock (sync)
        {
            if (!isDucking || disposed)
            {
                return;
            }

            try
            {
                DetectUserVolumeChanges();
                ReconcileSessions();
            }
            catch (Exception error)
            {
                writeEvent(new { @event = "warning", message = error.Message });
            }
        }
    }

    private void DetectUserVolumeChanges()
    {
        foreach (var snapshot in snapshots.Values)
        {
            try
            {
                var current = snapshot.Session.SimpleAudioVolume.Volume;
                if (Math.Abs(current - snapshot.LastObservedVolume) <= Epsilon)
                {
                    continue;
                }

                // The Windows mixer displays the currently ducked value. Treat an external
                // change as the user's desired ducked value and derive the new restore level.
                snapshot.BaselineVolume = Math.Clamp(current / duckLevel, 0f, 1f);
                snapshot.LastObservedVolume = current;
                writeEvent(new
                {
                    @event = "baselineChanged",
                    session = snapshot.Key,
                    baselineVolume = snapshot.BaselineVolume,
                });
            }
            catch
            {
                // Expired sessions are removed during reconciliation.
            }
        }
    }

    private void ReconcileSessions()
    {
        using var enumerator = new MMDeviceEnumerator();
        using var device = enumerator.GetDefaultAudioEndpoint(DataFlow.Render, Role.Multimedia);
        var sessions = device.AudioSessionManager.Sessions;
        var liveKeys = new HashSet<string>();

        for (var index = 0; index < sessions.Count; index++)
        {
            var session = sessions[index];
            try
            {
                var processId = (int)session.GetProcessID;
                var key = CreateSessionKey(session, processId);

                if (!ShouldDuck(session, processId))
                {
                    session.Dispose();
                    continue;
                }

                liveKeys.Add(key);
                if (snapshots.ContainsKey(key))
                {
                    session.Dispose();
                    continue;
                }

                var originalVolume = session.SimpleAudioVolume.Volume;
                var targetVolume = Math.Clamp(originalVolume * duckLevel, 0f, 1f);
                session.SimpleAudioVolume.Volume = targetVolume;
                snapshots[key] = new AudioSessionSnapshot
                {
                    Key = key,
                    Session = session,
                    BaselineVolume = originalVolume,
                    LastObservedVolume = targetVolume,
                };
            }
            catch
            {
                session.Dispose();
            }
        }

        foreach (var expiredKey in snapshots.Keys.Where(key => !liveKeys.Contains(key)).ToArray())
        {
            var snapshot = snapshots[expiredKey];
            TrySetVolume(snapshot.Session, snapshot.BaselineVolume);
            snapshot.Session.Dispose();
            snapshots.Remove(expiredKey);
        }
    }

    private bool ShouldDuck(AudioSessionControl session, int processId)
    {
        return processId > 0
            && !excludedProcessIds.Contains(processId)
            && !session.IsSystemSoundsSession
            && session.State == AudioSessionState.AudioSessionStateActive;
    }

    private static string CreateSessionKey(AudioSessionControl session, int processId)
    {
        var identifier = session.GetSessionIdentifier;
        return $"{processId}:{identifier}";
    }

    private static void TrySetVolume(AudioSessionControl session, float volume)
    {
        try
        {
            session.SimpleAudioVolume.Volume = Math.Clamp(volume, 0f, 1f);
        }
        catch
        {
            // A session may disappear before restoration.
        }
    }

    public void Dispose()
    {
        lock (sync)
        {
            if (disposed)
            {
                return;
            }

            Restore();
            disposed = true;
            monitorTimer.Dispose();
        }
    }
}
