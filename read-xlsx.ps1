Add-Type -AssemblyName System.IO.Compression.FileSystem
$path = 'C:\Users\CASA\Downloads\materiais_unidade_CPI_7_2026-06-14.xlsx'
$zip = [System.IO.Compression.ZipFile]::OpenRead($path)
$entry = $zip.GetEntry('xl/worksheets/sheet1.xml')
if ($entry) {
    $reader = New-Object System.IO.StreamReader($entry.Open())
    $xml = $reader.ReadToEnd()
    $reader.Close()
    Write-Output "=== Sheet1 XML (first 10000 chars) ==="
    Write-Output $xml.Substring(0, [Math]::Min(10000, $xml.Length))
}
$zip.Dispose()