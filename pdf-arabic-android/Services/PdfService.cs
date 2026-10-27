using Microsoft.JSInterop;

namespace ArabicPdfBlazor.Services;

/// <summary>
/// Calls the EJ2 PDF JavaScript module through JS interop, then saves/opens the result.
/// </summary>
public class PdfService
{
    private const string FileName = "ArabicSample.pdf";

    public async Task<string> GenerateAndSaveAsync(IJSRuntime js, string? text = null, int fontSize = 13)
    {
        await using var module = await js.InvokeAsync<IJSObjectReference>("import", "./js/pdf-generator.js");
        var base64 = await module.InvokeAsync<string>("generateArabicPdf", text, fontSize);
        var bytes = Convert.FromBase64String(base64);

        var path = Path.Combine(FileSystem.Current.AppDataDirectory, FileName);
        await File.WriteAllBytesAsync(path, bytes);
        return path;
    }

    public async Task<string> GetDefaultTextAsync(IJSRuntime js)
    {
        await using var module = await js.InvokeAsync<IJSObjectReference>("import", "./js/pdf-generator.js");
        return await module.InvokeAsync<string>("getDefaultArabicText");
    }

    /// <summary>Opens the PDF in an installed viewer (via FileProvider), or falls back to the share sheet.</summary>
    public async Task OpenAsync(string path)
    {
#if ANDROID
        try
        {
            var context = Android.App.Application.Context;
            var file = new Java.IO.File(path);
            var uri = AndroidX.Core.Content.FileProvider.GetUriForFile(
                context, $"{context.PackageName}.fileprovider", file)!;

            var intent = new Android.Content.Intent(Android.Content.Intent.ActionView);
            intent.SetDataAndType(uri, "application/pdf");
            intent.AddFlags(Android.Content.ActivityFlags.GrantReadUriPermission |
                            Android.Content.ActivityFlags.NewTask);
            context.StartActivity(intent);
            return;
        }
        catch (Android.Content.ActivityNotFoundException)
        {
            // No PDF viewer installed - fall through to share.
        }
#endif
        await ShareAsync(path);
    }

    public Task ShareAsync(string path) =>
        Share.Default.RequestAsync(new ShareFileRequest
        {
            Title = "Arabic PDF",
            File = new ShareFile(path, "application/pdf")
        });
}
