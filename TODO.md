

about DMARC:
Read the aggregate reports sent to dmarc@operation-ground-support.org. Every source sending as your domain should be Google and passing.
Check one Donorbox receipt's From: line.
If it's an @donorbox.org address: Donorbox isn't affected.
If it's an @operation-ground-support.org address: Donorbox needs its own DKIM key or SPF entry before you tighten DMARC. Otherwise your donation receipts will start landing in spam.
If both are clean, change the TXT record at _dmarc in Squarespace DNS to: v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@operation-ground-support.org; fo=1 This is reversible in minutes. About a month later, if nothing broke, move to p=reject.


- need more for thanksgiving event
- we will have headshots for the board members, fill up the empty space by putting images to the right of bios
- make sure no cruft appears in the HTML of the final site
- probably have a lawyer or someone check the licenses I had Claude generate. "LICENSE-CONTENT still mentions needs lists and drop-off instructions".
- Double check that our claims about "Partner:"s are all OK
- As a final step, make sure our Spanish pages all correspond with the English ones. We should probably have a Spanish speaker make sure that the connotations are accurate, paraphrase as needed.
- the Van picture will eventually be replaced



