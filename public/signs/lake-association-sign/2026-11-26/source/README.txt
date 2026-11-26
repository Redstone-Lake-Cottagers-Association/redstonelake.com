Lake Association Sign - draft, November 26, 2026
Redstone Area Lakes Association (RALA)
=================================================

Size: 68 in wide x 40 in tall (landscape), square corners, no bleed.

What's in this folder
  lake-association-sign.html   the sign itself, laid out in inches
  emblem.svg                   the lake-scene emblem (vector)
  Oswald-Variable.ttf          the typeface (free, SIL Open Font License - see OFL.txt)

Look at it
  Open lake-association-sign.html in Google Chrome. At full size it is 68 inches wide,
  so add ?px=14 to the end of the address to see the whole sign on screen, e.g.
    file:///.../lake-association-sign.html?px=14

Change the wording
  Open lake-association-sign.html in any text editor (TextEdit in plain-text mode is fine)
  and change the words between the tags:
    Redstone Area / Lakes Association   the two name lines
    redstonelakes.ca                     the web address
    Bitter ... Little Redstone           the lake names (the &bull; are the red dots)
  The name is sized automatically to fill its space, so longer or shorter words still fit.
  Sizes and positions are in inches near the top (CSS) and at the bottom (script).

Make a print file
  Easiest: open the .html in Chrome (no ?px), Print, Destination "Save as PDF",
  Margins "None", tick "Background graphics". The page size comes out at 68 x 40 in.

  For a sign shop that wants the text converted to outlines (from Terminal, in this
  folder, with Ghostscript installed):
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
      --allow-file-access-from-files --virtual-time-budget=8000 --no-pdf-header-footer \
      --print-to-pdf="$PWD/sign.pdf" "file://$PWD/lake-association-sign.html"
    gs -q -dSAFER -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -dNoOutputFonts \
      -sColorConversionStrategy=RGB -sOutputFile=sign-print.pdf sign.pdf

Design notes
  - Black on white for reading at driving speed; rust frame and rule match the emblem ring.
  - Capital letters: name 3.5 in tall, web address 2.8 in, lake names 2.5 in.
  - Lake names as on redstonelakes.ca, including "Long (Tedious)".

When you save a new version, put it in a new dated folder next to this one so the
history stays intact, and add it to the Signs page on the website.
