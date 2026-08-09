using System.Text.Json;

namespace AudioDucker;

internal static class Program
{
    private static readonly object OutputLock = new();

    private static async Task<int> Main()
    {
        using var service = new AudioDuckingService(WriteEvent);

        AppDomain.CurrentDomain.ProcessExit += (_, _) => service.Restore();
        Console.CancelKeyPress += (_, eventArgs) =>
        {
            eventArgs.Cancel = true;
            service.Restore();
        };

        WriteEvent(new { @event = "ready" });

        string? line;
        while ((line = await Console.In.ReadLineAsync()) is not null)
        {
            if (string.IsNullOrWhiteSpace(line))
            {
                continue;
            }

            try
            {
                var command = JsonSerializer.Deserialize<DuckerCommand>(line, JsonOptions.Default)
                    ?? throw new InvalidOperationException("Empty command");

                switch (command.Command)
                {
                    case "configure":
                        service.Configure(command.DuckLevel, command.ExcludedProcessIds);
                        WriteEvent(new { @event = "configured" });
                        break;
                    case "duck":
                        service.Duck();
                        break;
                    case "restore":
                        service.Restore();
                        break;
                    case "shutdown":
                        service.Restore();
                        WriteEvent(new { @event = "shutdown" });
                        return 0;
                    default:
                        throw new InvalidOperationException($"Unknown command: {command.Command}");
                }
            }
            catch (Exception error)
            {
                WriteEvent(new { @event = "error", message = error.Message });
            }
        }

        service.Restore();
        return 0;
    }

    private static void WriteEvent(object payload)
    {
        lock (OutputLock)
        {
            Console.WriteLine(JsonSerializer.Serialize(payload, JsonOptions.Default));
        }
    }
}

internal static class JsonOptions
{
    internal static readonly JsonSerializerOptions Default = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
    };
}
