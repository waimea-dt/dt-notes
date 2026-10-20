# Digital Signature Test

## Default (no tamper)

<digital-sig></digital-sig>

## Custom filename

<digital-sig file="contract.pdf"></digital-sig>

## Tamper scenario

<digital-sig tamper></digital-sig>

## Custom filename + tamper

<digital-sig file="grades.csv" tamper></digital-sig>

## Single Tag (no closing tag)

<digital-sig file="report.pdf">

Text after the tag should still appear below the widget.
