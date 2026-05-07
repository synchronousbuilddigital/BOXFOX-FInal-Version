$excel = New-Object -ComObject Excel.Application
$wb = $excel.Workbooks.Open((Get-Location).Path + '\NQ v2.8 (2).xlsx')
$ws = $wb.Sheets(1)

Write-Host "Sheet: $($ws.Name)"
Write-Host "Rows: $($ws.UsedRange.Rows.Count) | Columns: $($ws.UsedRange.Columns.Count)"
Write-Host ""
Write-Host "=== HEADERS ==="
$headers = @()
for($j=1; $j -le $ws.UsedRange.Columns.Count; $j++) {
    $headers += $ws.Cells(1, $j).Value2
    Write-Host -NoNewline "$($ws.Cells(1, $j).Value2) | "
}
Write-Host ""
Write-Host ""
Write-Host "=== FIRST 10 DATA ROWS ==="
for($i=2; $i -le [System.Math]::Min(11, $ws.UsedRange.Rows.Count); $i++) {
    for($j=1; $j -le [System.Math]::Min(15, $ws.UsedRange.Columns.Count); $j++) {
        Write-Host -NoNewline "$($ws.Cells($i, $j).Value2) | "
    }
    Write-Host ""
}

$wb.Close()
$excel.Quit()
